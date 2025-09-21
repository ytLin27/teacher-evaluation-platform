const express = require('express');
const router = express.Router();
const database = require('../config/database');

// 获取分页的 publications 列表
router.get('/', (req, res) => {
  const db = database.getDB();
  const {
    teacherId,
    page = 1,
    size = 10,
    q = '',
    type = '',
    status = '',
    year = '',
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query;

  // 验证必需参数
  if (!teacherId) {
    return res.status(400).json({
      error: 'teacherId is required'
    });
  }

  let baseQuery = 'FROM research_outputs WHERE teacher_id = ? AND type = "publication"';
  const params = [teacherId];

  // 添加搜索条件
  if (q) {
    baseQuery += ' AND (title LIKE ? OR description LIKE ?)';
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm);
  }

  // 添加过滤条件
  if (status) {
    baseQuery += ' AND status = ?';
    params.push(status);
  }

  if (year) {
    baseQuery += ' AND strftime("%Y", date) = ?';
    params.push(year);
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
    const validSortColumns = ['date', 'title', 'impact_factor', 'citation_count'];
    const validSortOrders = ['asc', 'desc'];

    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'date';
    const safeSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';

    const dataQuery = `
      SELECT id, title, description, date, impact_factor, citation_count, url, status, created_at
      ${baseQuery}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    const offset = (page - 1) * size;
    const dataParams = [...params, parseInt(size), offset];

    db.all(dataQuery, dataParams, (err, publications) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // 格式化数据
      const formattedPublications = publications.map(pub => ({
        ...pub,
        type: 'publication',
        journal: pub.description, // 暂时使用description作为journal
        year: pub.date ? new Date(pub.date).getFullYear() : null,
        impact_factor: pub.impact_factor || 0,
        citations: pub.citation_count || 0
      }));

      res.json({
        items: formattedPublications,
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

// 创建新的 publication
router.post('/', (req, res) => {
  const db = database.getDB();
  const {
    teacherId,
    title,
    type = 'Journal Article',
    venue,
    status = 'Published',
    date,
    citations = 0,
    impact = 0,
    url = ''
  } = req.body;

  // 验证必需字段
  if (!teacherId || !title || !status || !date) {
    return res.status(400).json({
      error: 'teacherId, title, status, and date are required'
    });
  }

  const insertQuery = `
    INSERT INTO research_outputs (
      teacher_id, type, title, description, date, impact_factor,
      citation_count, url, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `;

  const params = [
    teacherId,
    'publication',
    title,
    venue || '',
    date,
    parseFloat(impact) || 0,
    parseInt(citations) || 0,
    url,
    status
  ];

  db.run(insertQuery, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 返回创建的记录
    const selectQuery = 'SELECT * FROM research_outputs WHERE id = ?';
    db.get(selectQuery, [this.lastID], (err, publication) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: publication.id,
        title: publication.title,
        type: 'publication',
        venue: publication.description,
        status: publication.status,
        date: publication.date,
        citations: publication.citation_count,
        impact_factor: publication.impact_factor,
        url: publication.url,
        created_at: publication.created_at
      });
    });
  });
});

// 获取 grants 列表（用于 AllGrants 页面）
router.get('/grants', (req, res) => {
  const db = database.getDB();
  const {
    teacherId,
    page = 1,
    size = 10,
    q = '',
    status = '',
    sortBy = 'date',
    sortOrder = 'desc'
  } = req.query;

  if (!teacherId) {
    return res.status(400).json({
      error: 'teacherId is required'
    });
  }

  let baseQuery = 'FROM research_outputs WHERE teacher_id = ? AND type = "grant"';
  const params = [teacherId];

  if (q) {
    baseQuery += ' AND (title LIKE ? OR description LIKE ?)';
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm);
  }

  if (status) {
    baseQuery += ' AND status = ?';
    params.push(status);
  }

  const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;

  db.get(countQuery, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const total = countResult.total;
    const totalPages = Math.ceil(total / size);

    const validSortColumns = ['date', 'title', 'funding_amount'];
    const validSortOrders = ['asc', 'desc'];

    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'date';
    const safeSortOrder = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';

    const dataQuery = `
      SELECT id, title, description, date, funding_amount, status, created_at
      ${baseQuery}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    const offset = (page - 1) * size;
    const dataParams = [...params, parseInt(size), offset];

    db.all(dataQuery, dataParams, (err, grants) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const formattedGrants = grants.map(grant => ({
        ...grant,
        type: 'grant',
        agency: grant.description,
        amount: grant.funding_amount || 0,
        start_year: grant.date ? new Date(grant.date).getFullYear() : null,
        end_year: grant.date ? new Date(grant.date).getFullYear() + 2 : null // 假设项目持续2年
      }));

      res.json({
        items: formattedGrants,
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

module.exports = router;