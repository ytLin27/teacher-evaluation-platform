const express = require('express');
const router = express.Router();
const database = require('../config/database');

// 获取分页的 services 列表
router.get('/', (req, res) => {
  const db = database.getDB();
  const {
    teacherId,
    page = 1,
    size = 10,
    q = '',
    type = '',
    role = '',
    from = '',
    to = '',
    sortBy = 'start_date',
    sortOrder = 'desc'
  } = req.query;

  // 验证必需参数
  if (!teacherId) {
    return res.status(400).json({
      error: 'teacherId is required'
    });
  }

  let baseQuery = 'FROM service_contributions WHERE teacher_id = ?';
  const params = [teacherId];

  // 添加搜索条件
  if (q) {
    baseQuery += ' AND (title LIKE ? OR description LIKE ? OR organization LIKE ?)';
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  // 添加过滤条件
  if (type) {
    baseQuery += ' AND type = ?';
    params.push(type);
  }

  if (role) {
    baseQuery += ' AND role LIKE ?';
    params.push(`%${role}%`);
  }

  // 时间段过滤
  if (from) {
    baseQuery += ' AND (end_date IS NULL OR end_date >= ?)';
    params.push(from);
  }

  if (to) {
    baseQuery += ' AND start_date <= ?';
    params.push(to);
  }

  // 计算总数
  const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;

  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const total = countResult.total;
    const totalPages = Math.ceil(total / size);

    // 添加排序和分页
    const validSortColumns = ['start_date', 'end_date', 'title', 'type', 'workload_hours'];
    const validSortOrders = ['asc', 'desc'];

    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'start_date';
    const safeSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';

    const dataQuery = `
      SELECT id, type, title, organization, role, start_date, end_date,
             description, workload_hours, created_at
      ${baseQuery}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    const offset = (page - 1) * size;
    const dataParams = [...params, parseInt(size), offset];

    db.all(dataQuery, dataParams, (err, services) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // 格式化数据
      const formattedServices = services.map(service => ({
        ...service,
        period: `${service.start_date || 'Ongoing'} - ${service.end_date || 'Present'}`,
        duration: service.end_date ?
          Math.ceil((new Date(service.end_date) - new Date(service.start_date)) / (1000 * 60 * 60 * 24 * 30)) + ' months' :
          'Ongoing',
        workload: service.workload_hours ? `${service.workload_hours} hours` : 'N/A'
      }));

      res.json({
        items: formattedServices,
        pagination: {
          page: parseInt(page),
          size: parseInt(size),
          total: total,
          totalPages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    });
  });
});

// 创建新的 service
router.post('/', (req, res) => {
  const db = database.getDB();
  const {
    teacherId,
    type,
    title,
    organization,
    role,
    startDate,
    endDate,
    description,
    workloadHours
  } = req.body;

  // 验证必需字段
  if (!teacherId || !type || !title || !startDate) {
    return res.status(400).json({
      error: 'teacherId, type, title, and startDate are required'
    });
  }

  const insertQuery = `
    INSERT INTO service_contributions (
      teacher_id, type, title, organization, role, start_date, end_date,
      description, workload_hours, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `;

  const params = [
    teacherId,
    type,
    title,
    organization || '',
    role || '',
    startDate,
    endDate || null,
    description || '',
    parseInt(workloadHours) || null
  ];

  db.run(insertQuery, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 返回创建的记录
    const selectQuery = 'SELECT * FROM service_contributions WHERE id = ?';
    db.get(selectQuery, [this.lastID], (err, service) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: service.id,
        type: service.type,
        title: service.title,
        organization: service.organization,
        role: service.role,
        start_date: service.start_date,
        end_date: service.end_date,
        description: service.description,
        workload_hours: service.workload_hours,
        period: `${service.start_date} - ${service.end_date || 'Present'}`,
        created_at: service.created_at
      });
    });
  });
});

// 获取服务类型统计
router.get('/stats', (req, res) => {
  const db = database.getDB();
  const { teacherId } = req.query;

  if (!teacherId) {
    return res.status(400).json({
      error: 'teacherId is required'
    });
  }

  const statsQuery = `
    SELECT
      type,
      COUNT(*) as count,
      SUM(workload_hours) as total_hours,
      AVG(workload_hours) as avg_hours
    FROM service_contributions
    WHERE teacher_id = ?
    GROUP BY type
    ORDER BY count DESC
  `;

  db.all(statsQuery, [teacherId], (err, stats) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 总体统计
    const totalQuery = `
      SELECT
        COUNT(*) as total_services,
        SUM(workload_hours) as total_hours,
        COUNT(CASE WHEN end_date IS NULL THEN 1 END) as ongoing_services
      FROM service_contributions
      WHERE teacher_id = ?
    `;

    db.get(totalQuery, [teacherId], (err, total) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        summary: {
          total_services: total.total_services,
          total_hours: total.total_hours || 0,
          ongoing_services: total.ongoing_services,
          avg_hours_per_service: total.total_services > 0 ?
            Math.round((total.total_hours || 0) / total.total_services) : 0
        },
        by_type: stats.map(stat => ({
          type: stat.type,
          count: stat.count,
          total_hours: stat.total_hours || 0,
          avg_hours: Math.round(stat.avg_hours || 0)
        }))
      });
    });
  });
});

module.exports = router;