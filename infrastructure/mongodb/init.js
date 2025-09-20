// MongoDB 初始化脚本
// 文档存储：CV、证书、文件等

// 切换到文档数据库
db = db.getSiblingDB('documents');

// 创建用户
db.createUser({
  user: 'doc_user',
  pwd: 'doc_password',
  roles: [
    {
      role: 'readWrite',
      db: 'documents'
    }
  ]
});

// 创建集合和索引

// 1. 教师文档集合 (CV、简历等)
db.createCollection('teacher_documents', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['teacher_id', 'document_type', 'filename'],
      properties: {
        teacher_id: {
          bsonType: 'string',
          description: 'Teacher ID reference'
        },
        document_type: {
          bsonType: 'string',
          enum: ['cv', 'resume', 'portfolio', 'transcript', 'certificate', 'award_document', 'research_paper', 'other'],
          description: 'Type of document'
        },
        filename: {
          bsonType: 'string',
          description: 'Original filename'
        },
        file_id: {
          bsonType: 'objectId',
          description: 'GridFS file ID'
        },
        title: {
          bsonType: 'string',
          description: 'Document title'
        },
        description: {
          bsonType: 'string',
          description: 'Document description'
        },
        file_size: {
          bsonType: 'number',
          description: 'File size in bytes'
        },
        mime_type: {
          bsonType: 'string',
          description: 'MIME type'
        },
        upload_date: {
          bsonType: 'date',
          description: 'Upload timestamp'
        },
        tags: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          },
          description: 'Document tags'
        },
        access_level: {
          bsonType: 'string',
          enum: ['public', 'internal', 'private'],
          description: 'Access level'
        },
        version: {
          bsonType: 'number',
          description: 'Document version'
        },
        schoolday_synced: {
          bsonType: 'bool',
          description: 'Whether synced with Schoolday'
        }
      }
    }
  }
});

// 2. 证书和认证集合
db.createCollection('certifications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['teacher_id', 'certification_name', 'issuing_authority'],
      properties: {
        teacher_id: {
          bsonType: 'string',
          description: 'Teacher ID reference'
        },
        certification_name: {
          bsonType: 'string',
          description: 'Name of certification'
        },
        issuing_authority: {
          bsonType: 'string',
          description: 'Organization that issued the certification'
        },
        issue_date: {
          bsonType: 'date',
          description: 'Date issued'
        },
        expiry_date: {
          bsonType: 'date',
          description: 'Expiry date (if applicable)'
        },
        certification_id: {
          bsonType: 'string',
          description: 'Certification ID/number'
        },
        verification_url: {
          bsonType: 'string',
          description: 'URL for verification'
        },
        certificate_file_id: {
          bsonType: 'objectId',
          description: 'GridFS file ID for certificate'
        },
        status: {
          bsonType: 'string',
          enum: ['active', 'expired', 'revoked', 'pending'],
          description: 'Certification status'
        },
        skills: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          },
          description: 'Skills gained from certification'
        }
      }
    }
  }
});

// 3. Schoolday 同步数据缓存
db.createCollection('schoolday_cache', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['cache_key', 'data_type', 'cached_data'],
      properties: {
        cache_key: {
          bsonType: 'string',
          description: 'Unique cache key'
        },
        data_type: {
          bsonType: 'string',
          enum: ['districts', 'schools', 'courses', 'users', 'evaluations', 'academy_courses'],
          description: 'Type of cached data'
        },
        cached_data: {
          bsonType: 'object',
          description: 'The actual cached data'
        },
        cache_timestamp: {
          bsonType: 'date',
          description: 'When data was cached'
        },
        expiry_timestamp: {
          bsonType: 'date',
          description: 'When cache expires'
        },
        source_url: {
          bsonType: 'string',
          description: 'Original API URL'
        },
        hash: {
          bsonType: 'string',
          description: 'Data hash for change detection'
        }
      }
    }
  }
});

// 4. 系统配置集合
db.createCollection('system_config', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['config_key', 'config_value'],
      properties: {
        config_key: {
          bsonType: 'string',
          description: 'Configuration key'
        },
        config_value: {
          description: 'Configuration value (any type)'
        },
        description: {
          bsonType: 'string',
          description: 'Configuration description'
        },
        category: {
          bsonType: 'string',
          description: 'Configuration category'
        },
        is_sensitive: {
          bsonType: 'bool',
          description: 'Whether this is sensitive data'
        },
        updated_at: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

// 创建索引
db.teacher_documents.createIndex({ 'teacher_id': 1 });
db.teacher_documents.createIndex({ 'document_type': 1 });
db.teacher_documents.createIndex({ 'upload_date': -1 });
db.teacher_documents.createIndex({ 'teacher_id': 1, 'document_type': 1 });
db.teacher_documents.createIndex({ 'tags': 1 });

db.certifications.createIndex({ 'teacher_id': 1 });
db.certifications.createIndex({ 'expiry_date': 1 });
db.certifications.createIndex({ 'status': 1 });
db.certifications.createIndex({ 'issuing_authority': 1 });

db.schoolday_cache.createIndex({ 'cache_key': 1 }, { unique: true });
db.schoolday_cache.createIndex({ 'data_type': 1 });
db.schoolday_cache.createIndex({ 'expiry_timestamp': 1 });

db.system_config.createIndex({ 'config_key': 1 }, { unique: true });
db.system_config.createIndex({ 'category': 1 });

// 插入默认配置
db.system_config.insertMany([
  {
    config_key: 'schoolday_sync_interval',
    config_value: 3600,
    description: 'Schoolday data sync interval in seconds',
    category: 'integration',
    is_sensitive: false,
    updated_at: new Date()
  },
  {
    config_key: 'max_file_size',
    config_value: 10485760, // 10MB
    description: 'Maximum file upload size in bytes',
    category: 'storage',
    is_sensitive: false,
    updated_at: new Date()
  },
  {
    config_key: 'allowed_file_types',
    config_value: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
    description: 'Allowed file extensions for upload',
    category: 'storage',
    is_sensitive: false,
    updated_at: new Date()
  },
  {
    config_key: 'evaluation_cache_ttl',
    config_value: 1800,
    description: 'Evaluation data cache TTL in seconds',
    category: 'performance',
    is_sensitive: false,
    updated_at: new Date()
  }
]);

print('MongoDB initialization completed successfully!');