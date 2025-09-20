const express = require('express');
const router = express.Router();
const database = require('../config/database');

// 获取评价列表
router.get('/', (req, res) => {
  const db = database.getDB();
  const { teacher_id, course_id, semester, year, page = 1, limit = 20 } = req.query;

  let query = `
    SELECT se.*,
           t.name as teacher_name,
           c.course_name,
           c.course_code
    FROM student_evaluations se
    JOIN teachers t ON se.teacher_id = t.id
    LEFT JOIN courses c ON se.course_id = c.id
    WHERE 1=1
  `;
  const params = [];

  // 添加过滤条件
  if (teacher_id) {
    query += ' AND se.teacher_id = ?';
    params.push(teacher_id);
  }
  if (course_id) {
    query += ' AND se.course_id = ?';
    params.push(course_id);
  }
  if (semester) {
    query += ' AND se.semester = ?';
    params.push(semester);
  }
  if (year) {
    query += ' AND se.year = ?';
    params.push(year);
  }

  // 添加分页
  const offset = (page - 1) * limit;
  query += ' ORDER BY se.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, evaluations) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM student_evaluations se WHERE 1=1';
    const countParams = params.slice(0, -2); // 移除limit和offset参数

    // 重新添加过滤条件到计数查询
    let paramIndex = 0;
    if (teacher_id) {
      countQuery += ' AND se.teacher_id = ?';
      paramIndex++;
    }
    if (course_id) {
      countQuery += ' AND se.course_id = ?';
      paramIndex++;
    }
    if (semester) {
      countQuery += ' AND se.semester = ?';
      paramIndex++;
    }
    if (year) {
      countQuery += ' AND se.year = ?';
      paramIndex++;
    }

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        data: evaluations,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: countResult.total,
          total_pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// 获取特定评价详情
router.get('/:id', (req, res) => {
  const db = database.getDB();
  const evaluationId = req.params.id;

  const query = `
    SELECT se.*,
           t.name as teacher_name,
           t.department,
           c.course_name,
           c.course_code,
           c.enrollment
    FROM student_evaluations se
    JOIN teachers t ON se.teacher_id = t.id
    LEFT JOIN courses c ON se.course_id = c.id
    WHERE se.id = ?
  `;

  db.get(query, [evaluationId], (err, evaluation) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    res.json({ data: evaluation });
  });
});

// 提交新的评价
router.post('/', (req, res) => {
  const db = database.getDB();
  const {
    course_id,
    teacher_id,
    semester,
    year,
    overall_rating,
    teaching_quality,
    course_content,
    availability,
    comments
  } = req.body;

  // 验证必填字段
  if (!teacher_id || !semester || !year || !overall_rating) {
    return res.status(400).json({
      error: 'Missing required fields: teacher_id, semester, year, overall_rating'
    });
  }

  // 验证评分范围
  const ratings = [overall_rating, teaching_quality, course_content, availability].filter(r => r !== undefined);
  if (ratings.some(rating => rating < 1 || rating > 5)) {
    return res.status(400).json({
      error: 'Ratings must be between 1 and 5'
    });
  }

  const query = `
    INSERT INTO student_evaluations
    (course_id, teacher_id, semester, year, overall_rating, teaching_quality, course_content, availability, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [course_id, teacher_id, semester, year, overall_rating,
                teaching_quality, course_content, availability, comments], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: 'Evaluation submitted successfully',
      evaluation_id: this.lastID
    });
  });
});

// 获取教师评价趋势数据
router.get('/trends/:teacher_id', (req, res) => {
  const db = database.getDB();
  const teacherId = req.params.teacher_id;
  const { metric = 'overall_rating', period = '2_years' } = req.query;

  // 验证metric参数
  const validMetrics = ['overall_rating', 'teaching_quality', 'course_content', 'availability'];
  if (!validMetrics.includes(metric)) {
    return res.status(400).json({
      error: `Invalid metric. Must be one of: ${validMetrics.join(', ')}`
    });
  }

  // 计算时间范围
  let yearLimit = 2;
  if (period === '1_year') yearLimit = 1;
  if (period === '3_years') yearLimit = 3;
  if (period === '5_years') yearLimit = 5;

  const query = `
    SELECT
      year,
      semester,
      AVG(${metric}) as avg_rating,
      COUNT(*) as evaluation_count,
      MIN(${metric}) as min_rating,
      MAX(${metric}) as max_rating
    FROM student_evaluations
    WHERE teacher_id = ?
      AND year >= (SELECT MAX(year) FROM student_evaluations WHERE teacher_id = ?) - ?
    GROUP BY year, semester
    ORDER BY year, semester
  `;

  db.all(query, [teacherId, teacherId, yearLimit], (err, trends) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 格式化数据
    const formattedTrends = trends.map(trend => ({
      period: `${trend.year} ${trend.semester}`,
      year: trend.year,
      semester: trend.semester,
      avg_rating: Math.round(trend.avg_rating * 100) / 100,
      min_rating: trend.min_rating,
      max_rating: trend.max_rating,
      evaluation_count: trend.evaluation_count
    }));

    res.json({
      teacher_id: parseInt(teacherId),
      metric: metric,
      period: period,
      data: formattedTrends
    });
  });
});

// 获取同行比较数据
router.get('/peer-comparison/:teacher_id', (req, res) => {
  const db = database.getDB();
  const teacherId = req.params.teacher_id;
  const { department, year = 2024 } = req.query;

  // 首先获取目标教师的信息
  db.get('SELECT department FROM teachers WHERE id = ?', [teacherId], (err, teacher) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const comparisonDepartment = department || teacher.department;

    // 获取同部门教师的平均评分
    const query = `
      SELECT
        t.id,
        t.name,
        t.department,
        AVG(se.overall_rating) as avg_overall,
        AVG(se.teaching_quality) as avg_teaching,
        AVG(se.course_content) as avg_content,
        AVG(se.availability) as avg_availability,
        COUNT(se.id) as total_evaluations
      FROM teachers t
      JOIN student_evaluations se ON t.id = se.teacher_id
      WHERE t.department = ? AND se.year = ?
      GROUP BY t.id, t.name, t.department
      HAVING COUNT(se.id) >= 5
      ORDER BY avg_overall DESC
    `;

    db.all(query, [comparisonDepartment, year], (err, peerData) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // 计算统计信息
      const currentTeacher = peerData.find(p => p.id == teacherId);
      const otherTeachers = peerData.filter(p => p.id != teacherId);

      if (!currentTeacher) {
        return res.status(404).json({
          error: 'No evaluation data found for this teacher in the specified year'
        });
      }

      // 计算排名和百分位
      const overallRatings = peerData.map(p => p.avg_overall).sort((a, b) => b - a);
      const currentRank = overallRatings.findIndex(rating => rating <= currentTeacher.avg_overall) + 1;
      const percentile = Math.round((1 - (currentRank - 1) / overallRatings.length) * 100);

      // 计算部门统计
      const departmentStats = {
        total_teachers: peerData.length,
        avg_overall: Math.round(otherTeachers.reduce((sum, p) => sum + p.avg_overall, 0) / otherTeachers.length * 100) / 100,
        avg_teaching: Math.round(otherTeachers.reduce((sum, p) => sum + p.avg_teaching, 0) / otherTeachers.length * 100) / 100,
        avg_content: Math.round(otherTeachers.reduce((sum, p) => sum + p.avg_content, 0) / otherTeachers.length * 100) / 100,
        avg_availability: Math.round(otherTeachers.reduce((sum, p) => sum + p.avg_availability, 0) / otherTeachers.length * 100) / 100
      };

      res.json({
        teacher: {
          id: currentTeacher.id,
          name: currentTeacher.name,
          department: currentTeacher.department,
          metrics: {
            overall_rating: Math.round(currentTeacher.avg_overall * 100) / 100,
            teaching_quality: Math.round(currentTeacher.avg_teaching * 100) / 100,
            course_content: Math.round(currentTeacher.avg_content * 100) / 100,
            availability: Math.round(currentTeacher.avg_availability * 100) / 100,
            total_evaluations: currentTeacher.total_evaluations
          },
          ranking: {
            rank: currentRank,
            total_peers: peerData.length,
            percentile: percentile
          }
        },
        department_averages: departmentStats,
        peer_comparison: peerData.map(p => ({
          id: p.id,
          name: p.name,
          avg_overall: Math.round(p.avg_overall * 100) / 100,
          total_evaluations: p.total_evaluations,
          is_current_teacher: p.id == teacherId
        }))
      });
    });
  });
});

// 获取评价统计概览
router.get('/stats/overview', (req, res) => {
  const db = database.getDB();
  const { year = 2024, department } = req.query;

  let teacherFilter = '';
  const params = [year];

  if (department) {
    teacherFilter = ' AND t.department = ?';
    params.push(department);
  }

  const query = `
    SELECT
      COUNT(DISTINCT se.teacher_id) as teachers_evaluated,
      COUNT(se.id) as total_evaluations,
      AVG(se.overall_rating) as avg_overall,
      AVG(se.teaching_quality) as avg_teaching,
      AVG(se.course_content) as avg_content,
      AVG(se.availability) as avg_availability,
      MIN(se.overall_rating) as min_rating,
      MAX(se.overall_rating) as max_rating
    FROM student_evaluations se
    JOIN teachers t ON se.teacher_id = t.id
    WHERE se.year = ?${teacherFilter}
  `;

  db.get(query, params, (err, stats) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 获取评分分布
    const distributionQuery = `
      SELECT
        CASE
          WHEN overall_rating >= 4.5 THEN 'Excellent (4.5-5.0)'
          WHEN overall_rating >= 4.0 THEN 'Very Good (4.0-4.4)'
          WHEN overall_rating >= 3.5 THEN 'Good (3.5-3.9)'
          WHEN overall_rating >= 3.0 THEN 'Satisfactory (3.0-3.4)'
          ELSE 'Needs Improvement (<3.0)'
        END as rating_category,
        COUNT(*) as count
      FROM student_evaluations se
      JOIN teachers t ON se.teacher_id = t.id
      WHERE se.year = ?${teacherFilter}
      GROUP BY rating_category
    `;

    db.all(distributionQuery, params, (err, distribution) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        year: parseInt(year),
        department: department || 'All Departments',
        summary: {
          teachers_evaluated: stats.teachers_evaluated || 0,
          total_evaluations: stats.total_evaluations || 0,
          avg_overall: Math.round((stats.avg_overall || 0) * 100) / 100,
          avg_teaching: Math.round((stats.avg_teaching || 0) * 100) / 100,
          avg_content: Math.round((stats.avg_content || 0) * 100) / 100,
          avg_availability: Math.round((stats.avg_availability || 0) * 100) / 100,
          min_rating: stats.min_rating || 0,
          max_rating: stats.max_rating || 0
        },
        distribution: distribution
      });
    });
  });
});

// 更新评价
router.put('/:id', (req, res) => {
  const db = database.getDB();
  const evaluationId = req.params.id;
  const updates = req.body;

  const allowedFields = ['overall_rating', 'teaching_quality', 'course_content', 'availability', 'comments'];
  const updateFields = [];
  const params = [];

  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = ?`);
      params.push(updates[key]);
    }
  });

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  // 验证评分范围
  const ratingFields = ['overall_rating', 'teaching_quality', 'course_content', 'availability'];
  for (const field of ratingFields) {
    if (updates[field] !== undefined && (updates[field] < 1 || updates[field] > 5)) {
      return res.status(400).json({
        error: `${field} must be between 1 and 5`
      });
    }
  }

  params.push(evaluationId);
  const query = `UPDATE student_evaluations SET ${updateFields.join(', ')} WHERE id = ?`;

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    res.json({ message: 'Evaluation updated successfully' });
  });
});

// 删除评价
router.delete('/:id', (req, res) => {
  const db = database.getDB();
  const evaluationId = req.params.id;

  db.run('DELETE FROM student_evaluations WHERE id = ?', [evaluationId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    res.json({ message: 'Evaluation deleted successfully' });
  });
});

module.exports = router;