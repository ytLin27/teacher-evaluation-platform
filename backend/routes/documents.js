const express = require('express');
const router = express.Router();
const database = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: function (req, file, cb) {
    // 允许的文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// 获取教师的文档列表
router.get('/teacher/:teacherId', (req, res) => {
  const db = database.getDB();
  const { teacherId } = req.params;
  const { tag, q, page = 1, size = 20 } = req.query;

  let query = 'SELECT * FROM documents WHERE teacher_id = ?';
  const params = [teacherId];

  // 添加标签过滤
  if (tag && tag !== 'all') {
    query += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }

  // 添加搜索过滤
  if (q) {
    query += ' AND (name LIKE ? OR tags LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  // 添加排序和分页
  query += ' ORDER BY uploaded_at DESC';
  const offset = (page - 1) * size;
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(size), offset);

  db.all(query, params, (err, documents) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 获取总数用于分页
    let countQuery = 'SELECT COUNT(*) as total FROM documents WHERE teacher_id = ?';
    const countParams = [teacherId];

    if (tag && tag !== 'all') {
      countQuery += ' AND tags LIKE ?';
      countParams.push(`%${tag}%`);
    }

    if (q) {
      countQuery += ' AND (name LIKE ? OR tags LIKE ?)';
      countParams.push(`%${q}%`, `%${q}%`);
    }

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // 格式化文档数据，添加下载URL
      const formattedDocuments = documents.map(doc => ({
        ...doc,
        tags: doc.tags ? doc.tags.split(',').map(tag => tag.trim()) : [],
        download_url: `/api/documents/${doc.id}/download`,
        preview_url: `/api/documents/${doc.id}/preview`
      }));

      res.json({
        data: formattedDocuments,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(size),
          total: countResult.total,
          total_pages: Math.ceil(countResult.total / size)
        }
      });
    });
  });
});

// 上传文档
router.post('/upload', upload.array('files', 10), (req, res) => {
  const db = database.getDB();
  const { teacher_id = 1, tags = '' } = req.body; // 默认teacher_id为1 (demo模式)

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const uploadPromises = req.files.map(file => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO documents (teacher_id, name, file_path, file_size, mime_type, tags, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `;

      const params = [
        teacher_id,
        file.originalname,
        file.filename, // 存储文件名而不是完整路径
        file.size,
        file.mimetype,
        tags
      ];

      db.run(query, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            name: file.originalname,
            file_size: file.size,
            mime_type: file.mimetype,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            uploaded_at: new Date().toISOString(),
            download_url: `/api/documents/${this.lastID}/download`,
            preview_url: `/api/documents/${this.lastID}/preview`
          });
        }
      });
    });
  });

  Promise.all(uploadPromises)
    .then(results => {
      res.status(201).json({
        message: `${results.length} file(s) uploaded successfully`,
        documents: results
      });
    })
    .catch(err => {
      // 清理已上传的文件
      req.files.forEach(file => {
        fs.unlink(file.path, () => {});
      });
      res.status(500).json({ error: err.message });
    });
});

// 获取单个文档信息
router.get('/:id', (req, res) => {
  const db = database.getDB();
  const documentId = req.params.id;

  db.get('SELECT * FROM documents WHERE id = ?', [documentId], (err, document) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      data: {
        ...document,
        tags: document.tags ? document.tags.split(',').map(tag => tag.trim()) : [],
        download_url: `/api/documents/${document.id}/download`,
        preview_url: `/api/documents/${document.id}/preview`
      }
    });
  });
});

// 下载文档
router.get('/:id/download', (req, res) => {
  const db = database.getDB();
  const documentId = req.params.id;

  db.get('SELECT * FROM documents WHERE id = ?', [documentId], (err, document) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = path.join(uploadDir, document.file_path);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // 设置适当的响应头
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);

    // 发送文件
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error downloading file' });
        }
      }
    });
  });
});

// 预览文档（对于支持的文件类型）
router.get('/:id/preview', (req, res) => {
  const db = database.getDB();
  const documentId = req.params.id;

  db.get('SELECT * FROM documents WHERE id = ?', [documentId], (err, document) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = path.join(uploadDir, document.file_path);

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // 对于图片和PDF，直接在浏览器中显示
    if (document.mime_type.startsWith('image/') || document.mime_type === 'application/pdf') {
      res.setHeader('Content-Type', document.mime_type);
      res.setHeader('Content-Disposition', `inline; filename="${document.name}"`);
      res.sendFile(filePath);
    } else {
      // 对于其他文件类型，返回文档信息
      res.json({
        message: 'Preview not available for this file type',
        document: {
          ...document,
          tags: document.tags ? document.tags.split(',').map(tag => tag.trim()) : [],
          download_url: `/api/documents/${document.id}/download`
        }
      });
    }
  });
});

// 更新文档信息（主要是标签）
router.put('/:id', (req, res) => {
  const db = database.getDB();
  const documentId = req.params.id;
  const { name, tags } = req.body;

  let query = 'UPDATE documents SET ';
  const updates = [];
  const params = [];

  if (name) {
    updates.push('name = ?');
    params.push(name);
  }

  if (tags !== undefined) {
    updates.push('tags = ?');
    params.push(Array.isArray(tags) ? tags.join(', ') : tags);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  query += updates.join(', ') + ' WHERE id = ?';
  params.push(documentId);

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document updated successfully' });
  });
});

// 删除文档
router.delete('/:id', (req, res) => {
  const db = database.getDB();
  const documentId = req.params.id;

  // 首先获取文档信息以删除物理文件
  db.get('SELECT * FROM documents WHERE id = ?', [documentId], (err, document) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // 删除数据库记录
    db.run('DELETE FROM documents WHERE id = ?', [documentId], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // 删除物理文件
      const filePath = path.join(uploadDir, document.file_path);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.warn('Warning: Could not delete physical file:', err.message);
        }
      });

      res.json({ message: 'Document deleted successfully' });
    });
  });
});

// 获取所有标签
router.get('/teacher/:teacherId/tags', (req, res) => {
  const db = database.getDB();
  const { teacherId } = req.params;

  const query = 'SELECT DISTINCT tags FROM documents WHERE teacher_id = ? AND tags IS NOT NULL AND tags != ""';

  db.all(query, [teacherId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // 处理逗号分隔的标签
    const tagSet = new Set();
    results.forEach(row => {
      if (row.tags) {
        row.tags.split(',').forEach(tag => {
          const trimmedTag = tag.trim();
          if (trimmedTag) {
            tagSet.add(trimmedTag);
          }
        });
      }
    });

    res.json({
      tags: Array.from(tagSet).sort()
    });
  });
});

// 批量删除文档
router.delete('/batch', (req, res) => {
  const db = database.getDB();
  const { document_ids } = req.body;

  if (!Array.isArray(document_ids) || document_ids.length === 0) {
    return res.status(400).json({ error: 'document_ids array is required' });
  }

  // 首先获取所有要删除的文档信息
  const placeholders = document_ids.map(() => '?').join(',');
  const query = `SELECT * FROM documents WHERE id IN (${placeholders})`;

  db.all(query, document_ids, (err, documents) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (documents.length === 0) {
      return res.status(404).json({ error: 'No documents found' });
    }

    // 删除数据库记录
    const deleteQuery = `DELETE FROM documents WHERE id IN (${placeholders})`;
    db.run(deleteQuery, document_ids, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // 删除物理文件
      documents.forEach(doc => {
        const filePath = path.join(uploadDir, doc.file_path);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.warn('Warning: Could not delete physical file:', err.message);
          }
        });
      });

      res.json({
        message: `${documents.length} document(s) deleted successfully`,
        deleted_count: documents.length
      });
    });
  });
});

module.exports = router;