const express = require('express');
const router = express.Router();
const database = require('../config/database');

// 获取教师列表
router.get('/', (req, res) => {
  const db = database.getDB();
  const { department, position, page = 1, limit = 10 } = req.query;

  let query = 'SELECT * FROM teachers WHERE 1=1';
  const params = [];

  // 添加过滤条件
  if (department) {
    query += ' AND department = ?';
    params.push(department);
  }
  if (position) {
    query += ' AND position = ?';
    params.push(position);
  }

  // 添加分页
  const offset = (page - 1) * limit;
  query += ' ORDER BY name LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, teachers) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 获取总数用于分页
    db.get('SELECT COUNT(*) as total FROM teachers', (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        data: teachers,
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

// 获取特定教师详情
router.get('/:id', (req, res) => {
  const db = database.getDB();
  const teacherId = req.params.id;

  db.get('SELECT * FROM teachers WHERE id = ?', [teacherId], (err, teacher) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ data: teacher });
  });
});

// 获取教师的综合评价数据
router.get('/:id/evaluation', (req, res) => {
  const db = database.getDB();
  const teacherId = req.params.id;

  // 获取教师基本信息
  db.get('SELECT * FROM teachers WHERE id = ?', [teacherId], (err, teacher) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // 获取最新的学生评价数据
    const evaluationQuery = `
      SELECT
        AVG(overall_rating) as overall_avg,
        AVG(teaching_quality) as teaching_avg,
        AVG(course_content) as content_avg,
        AVG(availability) as availability_avg,
        COUNT(*) as total_evaluations
      FROM student_evaluations
      WHERE teacher_id = ? AND year = 2024
    `;

    db.get(evaluationQuery, [teacherId], (err, evalResults) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // 获取研究成果统计
      const researchQuery = `
        SELECT
          COUNT(*) as total_publications,
          SUM(CASE WHEN type = 'grant' THEN 1 ELSE 0 END) as grants_count,
          SUM(CASE WHEN type = 'grant' THEN funding_amount ELSE 0 END) as total_funding,
          AVG(CASE WHEN type = 'publication' THEN impact_factor ELSE NULL END) as avg_impact_factor
        FROM research_outputs
        WHERE teacher_id = ?
      `;

      db.get(researchQuery, [teacherId], (err, researchResults) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // 获取服务贡献统计
        const serviceQuery = `
          SELECT
            COUNT(*) as total_services,
            SUM(workload_hours) as total_hours
          FROM service_contributions
          WHERE teacher_id = ?
        `;

        db.get(serviceQuery, [teacherId], (err, serviceResults) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // 计算综合评分
          const teachingScore = evalResults.overall_avg || 0;
          const researchScore = Math.min((researchResults.total_publications * 0.5 +
                                        (researchResults.avg_impact_factor || 0) * 0.5), 5);
          const serviceScore = Math.min((serviceResults.total_services * 0.3 +
                                       (serviceResults.total_hours || 0) * 0.01), 5);
          const grantScore = Math.min((researchResults.total_funding || 0) / 50000, 5);

          const overallScore = (teachingScore * 0.4 + researchScore * 0.3 +
                               serviceScore * 0.15 + grantScore * 0.15);

          res.json({
            teacher: teacher,
            evaluation: {
              overall_score: Math.round(overallScore * 10) / 10,
              teaching_effectiveness: Math.round((evalResults.teaching_avg || 0) * 10) / 10,
              research_output: Math.round(researchScore * 10) / 10,
              service_contribution: Math.round(serviceScore * 10) / 10,
              grant_funding: Math.round(grantScore * 10) / 10
            },
            metrics: {
              teaching: {
                overall_rating: Math.round((evalResults.overall_avg || 0) * 10) / 10,
                teaching_quality: Math.round((evalResults.teaching_avg || 0) * 10) / 10,
                course_content: Math.round((evalResults.content_avg || 0) * 10) / 10,
                availability: Math.round((evalResults.availability_avg || 0) * 10) / 10,
                total_evaluations: evalResults.total_evaluations || 0
              },
              research: {
                publications: researchResults.total_publications || 0,
                grants: researchResults.grants_count || 0,
                total_funding: researchResults.total_funding || 0,
                avg_impact_factor: Math.round((researchResults.avg_impact_factor || 0) * 100) / 100
              },
              service: {
                total_contributions: serviceResults.total_services || 0,
                total_hours: serviceResults.total_hours || 0
              }
            }
          });
        });
      });
    });
  });
});

// 获取教师的课程列表
router.get('/:id/courses', (req, res) => {
  const db = database.getDB();
  const teacherId = req.params.id;
  const { year, semester } = req.query;

  let query = `
    SELECT c.*,
           AVG(se.overall_rating) as avg_rating,
           COUNT(se.id) as evaluation_count
    FROM courses c
    LEFT JOIN student_evaluations se ON c.id = se.course_id
    WHERE c.teacher_id = ?
  `;
  const params = [teacherId];

  if (year) {
    query += ' AND c.year = ?';
    params.push(year);
  }
  if (semester) {
    query += ' AND c.semester = ?';
    params.push(semester);
  }

  query += ' GROUP BY c.id ORDER BY c.year DESC, c.semester';

  db.all(query, params, (err, courses) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 格式化结果
    const formattedCourses = courses.map(course => ({
      ...course,
      avg_rating: course.avg_rating ? Math.round(course.avg_rating * 10) / 10 : null
    }));

    res.json({ data: formattedCourses });
  });
});

// 获取教师的研究成果
router.get('/:id/research', (req, res) => {
  const db = database.getDB();
  const teacherId = req.params.id;
  const { type, year } = req.query;

  let query = 'SELECT * FROM research_outputs WHERE teacher_id = ?';
  const params = [teacherId];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  if (year) {
    query += ' AND strftime("%Y", date) = ?';
    params.push(year);
  }

  query += ' ORDER BY date DESC';

  db.all(query, params, (err, research) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ data: research });
  });
});

// 获取教师的服务贡献
router.get('/:id/service', (req, res) => {
  const db = database.getDB();
  const teacherId = req.params.id;
  const { type, active_only } = req.query;

  let query = 'SELECT * FROM service_contributions WHERE teacher_id = ?';
  const params = [teacherId];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  if (active_only === 'true') {
    query += ' AND (end_date IS NULL OR end_date > date("now"))';
  }

  query += ' ORDER BY start_date DESC';

  db.all(query, params, (err, services) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ data: services });
  });
});

// 获取教师的专业发展记录
router.get('/:id/professional-development', (req, res) => {
  const db = database.getDB();
  const teacherId = req.params.id;
  const { type } = req.query;

  let query = 'SELECT * FROM professional_development WHERE teacher_id = ?';
  const params = [teacherId];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  query += ' ORDER BY date_completed DESC';

  db.all(query, params, (err, development) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ data: development });
  });
});

// 获取教师的职业历程
router.get('/:id/career', (req, res) => {
  const db = database.getDB();
  const teacherId = req.params.id;
  const { type } = req.query;

  let query = 'SELECT * FROM career_history WHERE teacher_id = ?';
  const params = [teacherId];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  query += ' ORDER BY start_date DESC';

  db.all(query, params, (err, career) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ data: career });
  });
});

// 创建新教师
router.post('/', (req, res) => {
  const db = database.getDB();
  const { name, email, department, position, hire_date, bio } = req.body;

  if (!name || !email || !department || !position) {
    return res.status(400).json({
      error: 'Missing required fields: name, email, department, position'
    });
  }

  const query = `
    INSERT INTO teachers (name, email, department, position, hire_date, bio)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [name, email, department, position, hire_date, bio], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: 'Teacher created successfully',
      teacher_id: this.lastID
    });
  });
});

// 更新教师信息
router.put('/:id', (req, res) => {
  const db = database.getDB();
  const teacherId = req.params.id;
  const updates = req.body;

  // 构建动态更新查询
  const allowedFields = ['name', 'email', 'department', 'position', 'hire_date', 'photo_url', 'bio'];
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

  params.push(teacherId);
  const query = `UPDATE teachers SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ message: 'Teacher updated successfully' });
  });
});

// 删除教师
router.delete('/:id', (req, res) => {
  const db = database.getDB();
  const teacherId = req.params.id;

  db.run('DELETE FROM teachers WHERE id = ?', [teacherId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ message: 'Teacher deleted successfully' });
  });
});

module.exports = router;