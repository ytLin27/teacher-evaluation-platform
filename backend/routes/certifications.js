const express = require('express');
const router = express.Router();
const database = require('../config/database');

// 获取教师的认证列表
router.get('/', (req, res) => {
  const db = database.getDB();
  const { teacherId } = req.query;

  if (!teacherId) {
    return res.status(400).json({
      error: 'teacherId is required'
    });
  }

  const query = `
    SELECT * FROM professional_development
    WHERE teacher_id = ? AND type = 'certification'
    ORDER BY created_at DESC
  `;

  db.all(query, [teacherId], (err, certifications) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 格式化数据
    const formattedCertifications = certifications.map(cert => ({
      id: cert.id,
      name: cert.title,
      issuer: cert.institution,
      issueDate: cert.date_completed,
      expireDate: null, // 暂时没有对应字段
      credentialId: null, // 暂时没有对应字段
      credentialUrl: cert.certificate_url,
      notes: cert.description,
      created_at: cert.created_at
    }));

    res.json({
      items: formattedCertifications
    });
  });
});

// 创建新的认证
router.post('/', (req, res) => {
  const db = database.getDB();
  const {
    teacherId,
    name,
    issuer,
    issueDate,
    expireDate,
    credentialId,
    credentialUrl,
    notes
  } = req.body;

  // 验证必需字段
  if (!teacherId || !name || !issuer || !issueDate) {
    return res.status(400).json({
      error: 'teacherId, name, issuer, and issueDate are required'
    });
  }

  // 验证日期
  if (expireDate && new Date(expireDate) < new Date(issueDate)) {
    return res.status(400).json({
      error: 'Expire date must be after issue date'
    });
  }

  const insertQuery = `
    INSERT INTO professional_development (
      teacher_id, type, title, institution, date_completed,
      certificate_url, description, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `;

  const params = [
    teacherId,
    'certification',
    name,
    issuer,
    issueDate,
    credentialUrl || null,
    notes || null
  ];

  db.run(insertQuery, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 返回创建的记录
    const selectQuery = 'SELECT * FROM professional_development WHERE id = ?';
    db.get(selectQuery, [this.lastID], (err, certification) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const formattedCertification = {
        id: certification.id,
        name: certification.title,
        issuer: certification.institution,
        issueDate: certification.date_completed,
        expireDate: null, // 暂时没有对应字段
        credentialId: null, // 暂时没有对应字段
        credentialUrl: certification.certificate_url,
        notes: certification.description,
        created_at: certification.created_at
      };

      res.status(201).json(formattedCertification);
    });
  });
});

// 更新认证
router.put('/:id', (req, res) => {
  const db = database.getDB();
  const { id } = req.params;
  const {
    name,
    issuer,
    issueDate,
    expireDate,
    credentialId,
    credentialUrl,
    notes
  } = req.body;

  // 验证必需字段
  if (!name || !issuer || !issueDate) {
    return res.status(400).json({
      error: 'name, issuer, and issueDate are required'
    });
  }

  // 验证日期
  if (expireDate && new Date(expireDate) < new Date(issueDate)) {
    return res.status(400).json({
      error: 'Expire date must be after issue date'
    });
  }

  const updateQuery = `
    UPDATE professional_development
    SET title = ?, institution = ?, date_completed = ?,
        certificate_url = ?, description = ?
    WHERE id = ? AND type = 'certification'
  `;

  const params = [
    name,
    issuer,
    issueDate,
    credentialUrl || null,
    notes || null,
    id
  ];

  db.run(updateQuery, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    // 返回更新后的记录
    const selectQuery = 'SELECT * FROM professional_development WHERE id = ?';
    db.get(selectQuery, [id], (err, certification) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const formattedCertification = {
        id: certification.id,
        name: certification.title,
        issuer: certification.institution,
        issueDate: certification.date_completed,
        expireDate: null, // 暂时没有对应字段
        credentialId: null, // 暂时没有对应字段
        credentialUrl: certification.certificate_url,
        notes: certification.description,
        created_at: certification.created_at
      };

      res.json(formattedCertification);
    });
  });
});

// 删除认证
router.delete('/:id', (req, res) => {
  const db = database.getDB();
  const { id } = req.params;

  const deleteQuery = `
    DELETE FROM professional_development
    WHERE id = ? AND type = 'certification'
  `;

  db.run(deleteQuery, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    res.json({ message: 'Certification deleted successfully' });
  });
});

module.exports = router;