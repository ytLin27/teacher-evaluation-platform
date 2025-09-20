/**
 * Faux Schoolday API Service
 * 高保真 Schoolday 平台 API 模拟服务
 *
 * 模拟的 API:
 * - OAuth 2.0 认证流程
 * - Discovery API (区域/学校发现)
 * - OneRoster API (教师/课程数据同步)
 * - Academy API (专业发展课程推荐)
 * - Webhook 事件推送
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const winston = require('winston');

// 路由模块
const authRoutes = require('./routes/auth');
const discoveryRoutes = require('./routes/discovery');
const oneRosterRoutes = require('./routes/oneRoster');
const academyRoutes = require('./routes/academy');
const webhookRoutes = require('./routes/webhook');
const mockDataGenerator = require('./utils/mockDataGenerator');

// 配置
const config = {
  port: process.env.PORT || 3006,
  jwtSecret: process.env.JWT_SECRET || 'faux-schoolday-secret-key',
  environment: process.env.NODE_ENV || 'development',
  baseUrl: process.env.BASE_URL || 'http://localhost:3006',
  // 模拟的 Schoolday 配置
  schoolday: {
    clientId: 'teacher-eval-demo',
    clientSecret: 'demo-client-secret',
    apiVersion: 'v1.0',
    supportedScopes: ['read:districts', 'read:schools', 'read:teachers', 'read:courses', 'write:evaluations']
  }
};

// 日志配置
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'faux-schoolday-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class FauxSchooldayServer {
  constructor() {
    this.app = express();
    this.mockData = mockDataGenerator;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // 安全中间件
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"]
        }
      }
    }));

    // CORS 配置
    this.app.use(cors({
      origin: [
        'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:3001',
        'https://teacher-eval.local'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Client-Version']
    }));

    // 通用中间件
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 请求日志
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        clientId: req.headers['x-client-id']
      });
      next();
    });

    // API 速率限制
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 1000, // 每个IP最多1000次请求
      message: {
        error: 'rate_limit_exceeded',
        message: 'Too many requests from this IP'
      }
    });
    this.app.use('/api/', limiter);

    // API版本中间件
    this.app.use((req, res, next) => {
      res.header('X-API-Version', config.schoolday.apiVersion);
      res.header('X-Service', 'Faux-Schoolday-API');
      next();
    });
  }

  setupRoutes() {
    // API 文档
    const swaggerDocument = YAML.load('./docs/api-spec.yaml');
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: config.schoolday.apiVersion,
        environment: config.environment,
        services: {
          oauth: 'operational',
          discovery: 'operational',
          oneRoster: 'operational',
          academy: 'operational',
          webhooks: 'operational'
        }
      });
    });

    // 服务状态页面
    this.app.get('/', (req, res) => {
      res.json({
        service: 'Faux Schoolday API',
        description: 'High-fidelity mock of Schoolday platform APIs',
        version: config.schoolday.apiVersion,
        documentation: `${config.baseUrl}/docs`,
        endpoints: {
          oauth: `${config.baseUrl}/api/oauth`,
          discovery: `${config.baseUrl}/api/discovery`,
          oneRoster: `${config.baseUrl}/api/ims/oneroster/v1p1`,
          academy: `${config.baseUrl}/api/academy`,
          webhooks: `${config.baseUrl}/api/webhooks`
        },
        mockData: {
          districts: this.mockData.getDistricts().length,
          schools: this.mockData.getSchools().length,
          teachers: this.mockData.getTeachers().length,
          courses: this.mockData.getCourses().length
        }
      });
    });

    // API 路由
    this.app.use('/api/oauth', authRoutes);
    this.app.use('/api/discovery', discoveryRoutes);
    this.app.use('/api/ims/oneroster/v1p1', oneRosterRoutes);
    this.app.use('/api/academy', academyRoutes);
    this.app.use('/api/webhooks', webhookRoutes);

    // 模拟数据管理端点 (仅开发环境)
    if (config.environment === 'development') {
      this.app.get('/api/mock/reset', (req, res) => {
        this.mockData.resetData();
        res.json({ message: 'Mock data reset successfully' });
      });

      this.app.get('/api/mock/seed', (req, res) => {
        this.mockData.seedData();
        res.json({ message: 'Mock data seeded successfully' });
      });

      this.app.get('/api/mock/stats', (req, res) => {
        res.json({
          districts: this.mockData.getDistricts().length,
          schools: this.mockData.getSchools().length,
          teachers: this.mockData.getTeachers().length,
          courses: this.mockData.getCourses().length,
          generated_at: new Date().toISOString()
        });
      });
    }
  }

  setupErrorHandling() {
    // 404 处理
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'not_found',
        message: 'API endpoint not found',
        path: req.originalUrl,
        documentation: `${config.baseUrl}/docs`
      });
    });

    // 全局错误处理
    this.app.use((err, req, res, next) => {
      logger.error('Unhandled error:', err);

      const statusCode = err.statusCode || 500;
      const response = {
        error: err.code || 'internal_server_error',
        message: err.message || 'An unexpected error occurred'
      };

      if (config.environment === 'development') {
        response.stack = err.stack;
        response.details = err.details;
      }

      res.status(statusCode).json(response);
    });
  }

  start() {
    const server = this.app.listen(config.port, () => {
      logger.info(`🚀 Faux Schoolday API started on port ${config.port}`);
      logger.info(`📖 API Documentation: ${config.baseUrl}/docs`);
      logger.info(`🏥 Health Check: ${config.baseUrl}/health`);
      logger.info(`🌍 Environment: ${config.environment}`);

      // 初始化模拟数据
      this.mockData.seedData();
      logger.info('✅ Mock data initialized');
    });

    // 优雅关闭
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    return server;
  }
}

// 启动服务器
if (require.main === module) {
  const server = new FauxSchooldayServer();
  server.start();
}

module.exports = FauxSchooldayServer;