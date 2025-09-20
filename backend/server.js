const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 导入数据库配置和初始化数据
const database = require('./config/database');
const { insertSeedData } = require('./config/seedData');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基础路由
app.get('/', (req, res) => {
  res.json({
    message: '教师评价平台 API - Schoolday集成Demo',
    version: '1.0.0',
    status: 'running',
    apis: {
      'Authentication': '/api/auth',
      'Schoolday Integration': '/api/schoolday',
      'Teachers': '/api/teachers',
      'Evaluations': '/api/evaluations',
      'Analytics': '/api/analytics'
    },
    documentation: 'https://api.schoolday.com/docs'
  });
});

// API路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/schoolday', require('./routes/schoolday'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/exports', require('./routes/exports'));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected'
  });
});

// API状态端点
app.get('/api/status', (req, res) => {
  res.json({
    api_version: '1.0.0',
    schoolday_integration: 'mock',
    features: {
      oauth2: 'enabled',
      oneroster_api: 'enabled',
      discovery_api: 'enabled',
      academy_api: 'enabled',
      evaluation_engine: 'enabled'
    },
    rate_limits: {
      requests_per_hour: 1000,
      burst_limit: 50
    }
  });
});

// 初始化示例数据的端点
app.post('/api/init-data', (req, res) => {
  try {
    insertSeedData();
    res.json({
      message: '示例数据初始化成功',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: '数据初始化失败',
      message: error.message
    });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || '服务器内部错误',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: '未找到请求的资源',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 教师评价平台后端服务启动成功');
  console.log(`📊 API地址: http://localhost:${PORT}`);
  console.log(`🔗 Schoolday集成: http://localhost:${PORT}/api/schoolday`);
  console.log(`📋 API文档: http://localhost:${PORT}/api/status`);
  console.log(`💚 健康检查: http://localhost:${PORT}/health`);

  // 启动时初始化示例数据 (已移动到database初始化完成后)
  // setTimeout(() => {
  //   try {
  //     insertSeedData();
  //     console.log('✅ 示例数据初始化完成');
  //   } catch (error) {
  //     console.error('❌ 示例数据初始化失败:', error.message);
  //   }
  // }, 1000);
});