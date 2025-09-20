const express = require('express');
const router = express.Router();
const database = require('../config/database');

// 获取全局统计数据
router.get('/dashboard', (req, res) => {
  const db = database.getDB();
  const { year = 2024 } = req.query;

  // 并行执行多个查询获取统计数据
  const queries = {
    teacherStats: new Promise((resolve, reject) => {
      db.get(`
        SELECT
          COUNT(*) as total_teachers,
          SUM(CASE WHEN position = 'Full Professor' THEN 1 ELSE 0 END) as full_professors,
          SUM(CASE WHEN position = 'Associate Professor' THEN 1 ELSE 0 END) as associate_professors,
          SUM(CASE WHEN position = 'Assistant Professor' THEN 1 ELSE 0 END) as assistant_professors
        FROM teachers
      `, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    }),

    evaluationStats: new Promise((resolve, reject) => {
      db.get(`
        SELECT
          COUNT(*) as total_evaluations,
          AVG(overall_rating) as avg_rating,
          COUNT(DISTINCT teacher_id) as teachers_with_evaluations,
          COUNT(DISTINCT course_id) as courses_evaluated
        FROM student_evaluations
        WHERE year = ?
      `, [year], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    }),

    researchStats: new Promise((resolve, reject) => {
      db.get(`
        SELECT
          COUNT(*) as total_research_outputs,
          SUM(CASE WHEN type = 'publication' THEN 1 ELSE 0 END) as publications,
          SUM(CASE WHEN type = 'grant' THEN 1 ELSE 0 END) as grants,
          SUM(CASE WHEN type = 'grant' THEN funding_amount ELSE 0 END) as total_funding
        FROM research_outputs
        WHERE strftime('%Y', date) = ?
      `, [year], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    }),

    departmentStats: new Promise((resolve, reject) => {
      db.all(`
        SELECT
          t.department,
          COUNT(t.id) as teacher_count,
          AVG(se.overall_rating) as avg_rating,
          COUNT(se.id) as evaluation_count
        FROM teachers t
        LEFT JOIN student_evaluations se ON t.id = se.teacher_id AND se.year = ?
        GROUP BY t.department
        ORDER BY teacher_count DESC
      `, [year], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    })
  };

  Promise.all(Object.values(queries))
    .then(([teacherStats, evaluationStats, researchStats, departmentStats]) => {
      res.json({
        year: parseInt(year),
        summary: {
          teachers: {
            total: teacherStats.total_teachers || 0,
            full_professors: teacherStats.full_professors || 0,
            associate_professors: teacherStats.associate_professors || 0,
            assistant_professors: teacherStats.assistant_professors || 0
          },
          evaluations: {
            total: evaluationStats.total_evaluations || 0,
            average_rating: Math.round((evaluationStats.avg_rating || 0) * 100) / 100,
            teachers_evaluated: evaluationStats.teachers_with_evaluations || 0,
            courses_evaluated: evaluationStats.courses_evaluated || 0
          },
          research: {
            total_outputs: researchStats.total_research_outputs || 0,
            publications: researchStats.publications || 0,
            grants: researchStats.grants || 0,
            total_funding: researchStats.total_funding || 0
          }
        },
        departments: departmentStats.map(dept => ({
          name: dept.department,
          teacher_count: dept.teacher_count,
          avg_rating: dept.avg_rating ? Math.round(dept.avg_rating * 100) / 100 : null,
          evaluation_count: dept.evaluation_count || 0
        }))
      });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

// 获取评分趋势分析
router.get('/trends/ratings', (req, res) => {
  const db = database.getDB();
  const { period = '2_years', department } = req.query;

  let yearLimit = 2;
  if (period === '1_year') yearLimit = 1;
  if (period === '3_years') yearLimit = 3;
  if (period === '5_years') yearLimit = 5;

  let departmentFilter = '';
  const params = [yearLimit];

  if (department) {
    departmentFilter = ' AND t.department = ?';
    params.push(department);
  }

  const query = `
    SELECT
      se.year,
      se.semester,
      AVG(se.overall_rating) as avg_overall,
      AVG(se.teaching_quality) as avg_teaching,
      AVG(se.course_content) as avg_content,
      AVG(se.availability) as avg_availability,
      COUNT(se.id) as evaluation_count
    FROM student_evaluations se
    JOIN teachers t ON se.teacher_id = t.id
    WHERE se.year >= (SELECT MAX(year) FROM student_evaluations) - ?${departmentFilter}
    GROUP BY se.year, se.semester
    ORDER BY se.year, se.semester
  `;

  db.all(query, params, (err, trends) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const formattedTrends = trends.map(trend => ({
      period: `${trend.year} ${trend.semester}`,
      year: trend.year,
      semester: trend.semester,
      metrics: {
        overall_rating: Math.round(trend.avg_overall * 100) / 100,
        teaching_quality: Math.round(trend.avg_teaching * 100) / 100,
        course_content: Math.round(trend.avg_content * 100) / 100,
        availability: Math.round(trend.avg_availability * 100) / 100
      },
      evaluation_count: trend.evaluation_count
    }));

    res.json({
      period: period,
      department: department || 'All Departments',
      data: formattedTrends
    });
  });
});

// 获取同行比较分析
router.get('/peer-comparison', (req, res) => {
  const db = database.getDB();
  const { teacher_id, metric = 'overall_rating', year = 2024 } = req.query;

  if (!teacher_id) {
    return res.status(400).json({ error: 'teacher_id is required' });
  }

  // 验证metric参数
  const validMetrics = ['overall_rating', 'teaching_quality', 'course_content', 'availability'];
  if (!validMetrics.includes(metric)) {
    return res.status(400).json({
      error: `Invalid metric. Must be one of: ${validMetrics.join(', ')}`
    });
  }

  // 获取教师所在部门
  db.get('SELECT department FROM teachers WHERE id = ?', [teacher_id], (err, teacher) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // 获取同部门所有教师的指标数据
    const query = `
      SELECT
        t.id,
        t.name,
        AVG(se.${metric}) as avg_metric,
        COUNT(se.id) as evaluation_count
      FROM teachers t
      JOIN student_evaluations se ON t.id = se.teacher_id
      WHERE t.department = ? AND se.year = ?
      GROUP BY t.id, t.name
      HAVING COUNT(se.id) >= 3
      ORDER BY avg_metric DESC
    `;

    db.all(query, [teacher.department, year], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const currentTeacher = results.find(r => r.id == teacher_id);
      if (!currentTeacher) {
        return res.status(404).json({
          error: 'No sufficient evaluation data found for this teacher'
        });
      }

      // 计算统计信息
      const allScores = results.map(r => r.avg_metric);
      const currentRank = results.findIndex(r => r.id == teacher_id) + 1;
      const percentile = Math.round((1 - (currentRank - 1) / results.length) * 100);

      const stats = {
        mean: allScores.reduce((a, b) => a + b, 0) / allScores.length,
        median: allScores.sort((a, b) => a - b)[Math.floor(allScores.length / 2)],
        min: Math.min(...allScores),
        max: Math.max(...allScores)
      };

      res.json({
        teacher_id: parseInt(teacher_id),
        metric: metric,
        year: parseInt(year),
        department: teacher.department,
        current_teacher: {
          score: Math.round(currentTeacher.avg_metric * 100) / 100,
          rank: currentRank,
          percentile: percentile,
          evaluation_count: currentTeacher.evaluation_count
        },
        department_stats: {
          total_teachers: results.length,
          mean: Math.round(stats.mean * 100) / 100,
          median: Math.round(stats.median * 100) / 100,
          min: Math.round(stats.min * 100) / 100,
          max: Math.round(stats.max * 100) / 100
        },
        peer_data: results.map(r => ({
          teacher_id: r.id,
          name: r.name,
          score: Math.round(r.avg_metric * 100) / 100,
          evaluation_count: r.evaluation_count,
          is_current: r.id == teacher_id
        }))
      });
    });
  });
});

// 获取研究产出分析
router.get('/research-analysis', (req, res) => {
  const db = database.getDB();
  const { department, year, type } = req.query;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (department) {
    whereClause += ' AND t.department = ?';
    params.push(department);
  }
  if (year) {
    whereClause += ' AND strftime("%Y", ro.date) = ?';
    params.push(year);
  }
  if (type) {
    whereClause += ' AND ro.type = ?';
    params.push(type);
  }

  const query = `
    SELECT
      t.id,
      t.name,
      t.department,
      ro.type,
      COUNT(ro.id) as output_count,
      AVG(CASE WHEN ro.type = 'publication' THEN ro.impact_factor END) as avg_impact_factor,
      SUM(CASE WHEN ro.type = 'publication' THEN ro.citation_count ELSE 0 END) as total_citations,
      SUM(CASE WHEN ro.type = 'grant' THEN ro.funding_amount ELSE 0 END) as total_funding
    FROM teachers t
    LEFT JOIN research_outputs ro ON t.id = ro.teacher_id
    ${whereClause}
    GROUP BY t.id, t.name, t.department, ro.type
    ORDER BY output_count DESC
  `;

  db.all(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 按教师聚合数据
    const teacherData = {};
    results.forEach(row => {
      if (!teacherData[row.id]) {
        teacherData[row.id] = {
          teacher_id: row.id,
          name: row.name,
          department: row.department,
          publications: 0,
          grants: 0,
          patents: 0,
          total_citations: 0,
          total_funding: 0,
          avg_impact_factor: 0
        };
      }

      if (row.type === 'publication') {
        teacherData[row.id].publications = row.output_count || 0;
        teacherData[row.id].avg_impact_factor = row.avg_impact_factor || 0;
        teacherData[row.id].total_citations = row.total_citations || 0;
      } else if (row.type === 'grant') {
        teacherData[row.id].grants = row.output_count || 0;
        teacherData[row.id].total_funding = row.total_funding || 0;
      } else if (row.type === 'patent') {
        teacherData[row.id].patents = row.output_count || 0;
      }
    });

    const analysisData = Object.values(teacherData).map(teacher => ({
      ...teacher,
      research_score: calculateResearchScore(teacher),
      avg_impact_factor: Math.round(teacher.avg_impact_factor * 100) / 100
    }));

    // 计算统计摘要
    const summary = {
      total_teachers: analysisData.length,
      total_publications: analysisData.reduce((sum, t) => sum + t.publications, 0),
      total_grants: analysisData.reduce((sum, t) => sum + t.grants, 0),
      total_funding: analysisData.reduce((sum, t) => sum + t.total_funding, 0),
      avg_impact_factor: analysisData.reduce((sum, t) => sum + t.avg_impact_factor, 0) / analysisData.length || 0
    };

    res.json({
      filters: { department, year, type },
      summary: {
        ...summary,
        avg_impact_factor: Math.round(summary.avg_impact_factor * 100) / 100
      },
      data: analysisData.sort((a, b) => b.research_score - a.research_score)
    });
  });
});

// 计算研究评分的辅助函数
function calculateResearchScore(teacher) {
  const publicationScore = teacher.publications * 1.0;
  const impactScore = teacher.avg_impact_factor * 0.5;
  const citationScore = (teacher.total_citations / 100) * 0.3;
  const fundingScore = (teacher.total_funding / 100000) * 1.2;
  const grantScore = teacher.grants * 0.8;

  return Math.round((publicationScore + impactScore + citationScore + fundingScore + grantScore) * 100) / 100;
}

// 获取服务贡献分析
router.get('/service-analysis', (req, res) => {
  const db = database.getDB();
  const { department, active_only = 'false' } = req.query;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (department) {
    whereClause += ' AND t.department = ?';
    params.push(department);
  }
  if (active_only === 'true') {
    whereClause += ' AND (sc.end_date IS NULL OR sc.end_date > date("now"))';
  }

  const query = `
    SELECT
      t.id,
      t.name,
      t.department,
      sc.type,
      COUNT(sc.id) as service_count,
      SUM(sc.workload_hours) as total_hours,
      AVG(sc.workload_hours) as avg_hours_per_service
    FROM teachers t
    LEFT JOIN service_contributions sc ON t.id = sc.teacher_id
    ${whereClause}
    GROUP BY t.id, t.name, t.department, sc.type
    ORDER BY total_hours DESC
  `;

  db.all(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 按教师聚合数据
    const teacherData = {};
    results.forEach(row => {
      if (!teacherData[row.id]) {
        teacherData[row.id] = {
          teacher_id: row.id,
          name: row.name,
          department: row.department,
          committee_services: 0,
          review_services: 0,
          community_services: 0,
          total_hours: 0
        };
      }

      if (row.type === 'committee') {
        teacherData[row.id].committee_services = row.service_count || 0;
      } else if (row.type === 'review') {
        teacherData[row.id].review_services = row.service_count || 0;
      } else if (row.type === 'community') {
        teacherData[row.id].community_services = row.service_count || 0;
      }

      teacherData[row.id].total_hours += row.total_hours || 0;
    });

    const analysisData = Object.values(teacherData).map(teacher => ({
      ...teacher,
      total_services: teacher.committee_services + teacher.review_services + teacher.community_services,
      service_score: calculateServiceScore(teacher)
    }));

    res.json({
      filters: { department, active_only: active_only === 'true' },
      summary: {
        total_teachers: analysisData.length,
        total_services: analysisData.reduce((sum, t) => sum + t.total_services, 0),
        total_hours: analysisData.reduce((sum, t) => sum + t.total_hours, 0),
        avg_hours_per_teacher: analysisData.reduce((sum, t) => sum + t.total_hours, 0) / analysisData.length || 0
      },
      data: analysisData.sort((a, b) => b.service_score - a.service_score)
    });
  });
});

// 计算服务评分的辅助函数
function calculateServiceScore(teacher) {
  const committeeScore = teacher.committee_services * 2.0;
  const reviewScore = teacher.review_services * 1.5;
  const communityScore = teacher.community_services * 1.0;
  const hoursScore = (teacher.total_hours / 50) * 1.0;

  return Math.round((committeeScore + reviewScore + communityScore + hoursScore) * 100) / 100;
}

// 生成自定义报告
router.post('/generate-report', (req, res) => {
  const db = database.getDB();
  const { teacher_ids, metrics, year = 2024, format = 'json' } = req.body;

  if (!teacher_ids || !Array.isArray(teacher_ids) || teacher_ids.length === 0) {
    return res.status(400).json({ error: 'teacher_ids array is required' });
  }

  const validMetrics = ['teaching', 'research', 'service', 'professional_development'];
  const selectedMetrics = metrics || validMetrics;

  // 验证metrics参数
  if (!selectedMetrics.every(m => validMetrics.includes(m))) {
    return res.status(400).json({
      error: `Invalid metrics. Must be subset of: ${validMetrics.join(', ')}`
    });
  }

  const placeholders = teacher_ids.map(() => '?').join(',');
  const reportData = {};

  // 获取基本教师信息
  const teacherQuery = `SELECT * FROM teachers WHERE id IN (${placeholders})`;

  db.all(teacherQuery, teacher_ids, (err, teachers) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const promises = teachers.map(teacher => {
      return new Promise((resolve, reject) => {
        const teacherReport = {
          teacher: teacher,
          metrics: {}
        };

        const metricPromises = [];

        // 教学指标
        if (selectedMetrics.includes('teaching')) {
          metricPromises.push(new Promise((resolveMetric, rejectMetric) => {
            db.get(`
              SELECT
                AVG(overall_rating) as avg_overall,
                AVG(teaching_quality) as avg_teaching,
                COUNT(*) as evaluation_count
              FROM student_evaluations
              WHERE teacher_id = ? AND year = ?
            `, [teacher.id, year], (err, result) => {
              if (err) rejectMetric(err);
              else {
                teacherReport.metrics.teaching = {
                  avg_overall: Math.round((result.avg_overall || 0) * 100) / 100,
                  avg_teaching: Math.round((result.avg_teaching || 0) * 100) / 100,
                  evaluation_count: result.evaluation_count || 0
                };
                resolveMetric();
              }
            });
          }));
        }

        // 研究指标
        if (selectedMetrics.includes('research')) {
          metricPromises.push(new Promise((resolveMetric, rejectMetric) => {
            db.get(`
              SELECT
                COUNT(*) as total_outputs,
                SUM(CASE WHEN type = 'publication' THEN 1 ELSE 0 END) as publications,
                SUM(CASE WHEN type = 'grant' THEN funding_amount ELSE 0 END) as total_funding
              FROM research_outputs
              WHERE teacher_id = ? AND strftime('%Y', date) = ?
            `, [teacher.id, year], (err, result) => {
              if (err) rejectMetric(err);
              else {
                teacherReport.metrics.research = {
                  total_outputs: result.total_outputs || 0,
                  publications: result.publications || 0,
                  total_funding: result.total_funding || 0
                };
                resolveMetric();
              }
            });
          }));
        }

        Promise.all(metricPromises)
          .then(() => resolve(teacherReport))
          .catch(reject);
      });
    });

    Promise.all(promises)
      .then(reports => {
        res.json({
          report_id: `report_${Date.now()}`,
          generated_at: new Date().toISOString(),
          parameters: {
            teacher_count: teacher_ids.length,
            metrics: selectedMetrics,
            year: parseInt(year),
            format: format
          },
          data: reports
        });
      })
      .catch(err => {
        res.status(500).json({ error: err.message });
      });
  });
});

module.exports = router;