const express = require('express');
const router = express.Router();
const database = require('../config/database');

// 辅助函数：将数据转换为CSV格式
const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) {
    return headers.join(',') + '\n';
  }

  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || '';
      // 处理包含逗号或引号的值
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return csvHeaders + '\n' + csvRows.join('\n');
};

// 导出研究数据
router.get('/research/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const { format = 'json', type = 'all' } = req.query;
  const db = database.getDB();

  // 根据类型查询不同的研究数据
  let query = '';
  let params = [teacherId];

  if (type === 'publications') {
    query = `
      SELECT * FROM research_outputs
      WHERE teacher_id = ? AND type = 'publication'
      ORDER BY date DESC
    `;
  } else if (type === 'grants') {
    query = `
      SELECT * FROM research_outputs
      WHERE teacher_id = ? AND type = 'grant'
      ORDER BY date DESC
    `;
  } else {
    query = `
      SELECT * FROM research_outputs
      WHERE teacher_id = ?
      ORDER BY date DESC
    `;
  }

  db.all(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (format === 'csv') {
      const headers = ['type', 'title', 'description', 'date', 'impact_factor', 'citation_count', 'funding_amount', 'status', 'url'];
      const csvData = convertToCSV(results, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="research_data_${teacherId}_${type}.csv"`);
      res.send(csvData);
    } else {
      res.json({
        data: results,
        export_info: {
          teacher_id: teacherId,
          type: type,
          exported_at: new Date().toISOString(),
          total_records: results.length
        }
      });
    }
  });
});

// 导出服务数据
router.get('/service/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const { format = 'json' } = req.query;
  const db = database.getDB();

  const query = `
    SELECT * FROM service_contributions
    WHERE teacher_id = ?
    ORDER BY start_date DESC
  `;

  db.all(query, [teacherId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (format === 'csv') {
      const headers = ['type', 'title', 'organization', 'role', 'start_date', 'end_date', 'description', 'workload_hours'];
      const csvData = convertToCSV(results, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="service_data_${teacherId}.csv"`);
      res.send(csvData);
    } else {
      res.json({
        data: results,
        export_info: {
          teacher_id: teacherId,
          type: 'service',
          exported_at: new Date().toISOString(),
          total_records: results.length
        }
      });
    }
  });
});

// 导出专业发展数据
router.get('/professional/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const { format = 'json' } = req.query;
  const db = database.getDB();

  const query = `
    SELECT * FROM professional_development
    WHERE teacher_id = ?
    ORDER BY date_completed DESC
  `;

  db.all(query, [teacherId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (format === 'csv') {
      const headers = ['type', 'title', 'institution', 'date_completed', 'duration_hours', 'certificate_url', 'description'];
      const csvData = convertToCSV(results, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="professional_data_${teacherId}.csv"`);
      res.send(csvData);
    } else {
      res.json({
        data: results,
        export_info: {
          teacher_id: teacherId,
          type: 'professional',
          exported_at: new Date().toISOString(),
          total_records: results.length
        }
      });
    }
  });
});

// 导出职业历程数据
router.get('/career/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const { format = 'json' } = req.query;
  const db = database.getDB();

  const query = `
    SELECT * FROM career_history
    WHERE teacher_id = ?
    ORDER BY start_date DESC
  `;

  db.all(query, [teacherId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (format === 'csv') {
      const headers = ['type', 'title', 'organization', 'start_date', 'end_date', 'description', 'achievement_level'];
      const csvData = convertToCSV(results, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="career_data_${teacherId}.csv"`);
      res.send(csvData);
    } else {
      res.json({
        data: results,
        export_info: {
          teacher_id: teacherId,
          type: 'career',
          exported_at: new Date().toISOString(),
          total_records: results.length
        }
      });
    }
  });
});

// 导出完整教师报告
router.get('/complete-report/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const { format = 'json' } = req.query;
  const db = database.getDB();

  // 查询教师基本信息
  const teacherQuery = 'SELECT * FROM teachers WHERE id = ?';

  db.get(teacherQuery, [teacherId], (err, teacher) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // 并行查询所有相关数据
    const queries = {
      courses: 'SELECT * FROM courses WHERE teacher_id = ? ORDER BY year DESC, semester DESC',
      research: 'SELECT * FROM research_outputs WHERE teacher_id = ? ORDER BY date DESC',
      service: 'SELECT * FROM service_contributions WHERE teacher_id = ? ORDER BY start_date DESC',
      professional: 'SELECT * FROM professional_development WHERE teacher_id = ? ORDER BY date_completed DESC',
      career: 'SELECT * FROM career_history WHERE teacher_id = ? ORDER BY start_date DESC',
      evaluations: `
        SELECT semester, year, AVG(overall_rating) as avg_rating, COUNT(*) as total_evaluations
        FROM student_evaluations
        WHERE teacher_id = ?
        GROUP BY semester, year
        ORDER BY year DESC, semester DESC
      `
    };

    const results = { teacher };
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
      db.all(query, [teacherId], (err, data) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        results[key] = data;
        completedQueries++;

        if (completedQueries === totalQueries) {
          // 所有查询完成，返回结果
          if (format === 'csv') {
            // 对于完整报告，返回JSON格式更合适
            res.json({
              message: 'Complete report is too complex for CSV format. Please use JSON format or export individual sections.',
              available_csv_endpoints: [
                `/api/exports/research/${teacherId}?format=csv`,
                `/api/exports/service/${teacherId}?format=csv`,
                `/api/exports/professional/${teacherId}?format=csv`,
                `/api/exports/career/${teacherId}?format=csv`
              ]
            });
          } else {
            res.json({
              data: results,
              export_info: {
                teacher_id: teacherId,
                type: 'complete_report',
                exported_at: new Date().toISOString(),
                sections: Object.keys(results).filter(key => key !== 'teacher'),
                teacher_name: teacher.name
              }
            });
          }
        }
      });
    });
  });
});

// 导出统计摘要
router.get('/summary/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const { format = 'json' } = req.query;
  const db = database.getDB();

  // 获取各种统计数据
  const statsQueries = [
    {
      name: 'research_stats',
      query: `
        SELECT
          COUNT(*) as total_research,
          COUNT(CASE WHEN type = 'publication' THEN 1 END) as publications,
          COUNT(CASE WHEN type = 'grant' THEN 1 END) as grants,
          SUM(CASE WHEN type = 'grant' THEN funding_amount ELSE 0 END) as total_funding,
          SUM(citation_count) as total_citations
        FROM research_outputs
        WHERE teacher_id = ?
      `
    },
    {
      name: 'service_stats',
      query: `
        SELECT
          COUNT(*) as total_service,
          SUM(workload_hours) as total_hours,
          COUNT(CASE WHEN type = 'committee' THEN 1 END) as committees,
          COUNT(CASE WHEN type = 'review' THEN 1 END) as reviews
        FROM service_contributions
        WHERE teacher_id = ?
      `
    },
    {
      name: 'professional_stats',
      query: `
        SELECT
          COUNT(*) as total_development,
          SUM(duration_hours) as total_hours,
          COUNT(CASE WHEN type = 'certification' THEN 1 END) as certifications,
          COUNT(CASE WHEN type = 'training' THEN 1 END) as trainings
        FROM professional_development
        WHERE teacher_id = ?
      `
    },
    {
      name: 'evaluation_stats',
      query: `
        SELECT
          AVG(overall_rating) as avg_overall_rating,
          AVG(teaching_quality) as avg_teaching_quality,
          AVG(course_content) as avg_course_content,
          AVG(availability) as avg_availability,
          COUNT(*) as total_evaluations
        FROM student_evaluations
        WHERE teacher_id = ?
      `
    }
  ];

  const summary = {};
  let completedQueries = 0;

  statsQueries.forEach(({ name, query }) => {
    db.get(query, [teacherId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      summary[name] = result;
      completedQueries++;

      if (completedQueries === statsQueries.length) {
        if (format === 'csv') {
          // 将统计数据转换为平面结构用于CSV
          const flatData = [{
            teacher_id: teacherId,
            total_research: summary.research_stats.total_research || 0,
            publications: summary.research_stats.publications || 0,
            grants: summary.research_stats.grants || 0,
            total_funding: summary.research_stats.total_funding || 0,
            total_citations: summary.research_stats.total_citations || 0,
            total_service: summary.service_stats.total_service || 0,
            service_hours: summary.service_stats.total_hours || 0,
            committees: summary.service_stats.committees || 0,
            reviews: summary.service_stats.reviews || 0,
            professional_development: summary.professional_stats.total_development || 0,
            professional_hours: summary.professional_stats.total_hours || 0,
            certifications: summary.professional_stats.certifications || 0,
            trainings: summary.professional_stats.trainings || 0,
            avg_overall_rating: summary.evaluation_stats.avg_overall_rating || 0,
            avg_teaching_quality: summary.evaluation_stats.avg_teaching_quality || 0,
            avg_course_content: summary.evaluation_stats.avg_course_content || 0,
            avg_availability: summary.evaluation_stats.avg_availability || 0,
            total_evaluations: summary.evaluation_stats.total_evaluations || 0
          }];

          const headers = Object.keys(flatData[0]);
          const csvData = convertToCSV(flatData, headers);

          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="summary_${teacherId}.csv"`);
          res.send(csvData);
        } else {
          res.json({
            data: summary,
            export_info: {
              teacher_id: teacherId,
              type: 'summary',
              exported_at: new Date().toISOString()
            }
          });
        }
      }
    });
  });
});

module.exports = router;