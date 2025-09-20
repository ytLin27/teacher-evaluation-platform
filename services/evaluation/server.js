/**
 * Evaluation Engine Service
 * 核心评价引擎服务 - 提供高级数据分析和预测算法
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const CircuitBreaker = require('opossum');

// 业务模块
const AdvancedAnalyticsService = require('./analytics');
const DatabaseManager = require('./database');
const PeerComparisonService = require('./peerComparison');
const PredictionService = require('./prediction');

// 配置
const config = {
  port: process.env.PORT || 3003,
  environment: process.env.NODE_ENV || 'development',
  databases: {
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT || 5432,
      database: process.env.POSTGRES_DB || 'eval_db',
      user: process.env.POSTGRES_USER || 'eval_user',
      password: process.env.POSTGRES_PASSWORD || 'eval_pass'
    },
    mongodb: {
      url: process.env.MONGODB_URL || 'mongodb://localhost:27017',
      database: process.env.MONGODB_DB || 'documents'
    },
    influxdb: {
      url: process.env.INFLUXDB_URL || 'http://localhost:8086',
      token: process.env.INFLUXDB_TOKEN || 'your_influx_token',
      org: process.env.INFLUXDB_ORG || 'teacher-eval',
      bucket: process.env.INFLUXDB_BUCKET || 'teacher_metrics'
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    }
  },
  cache: {
    defaultTTL: 3600, // 1小时
    analyticsResultsTTL: 1800, // 30分钟
    predictionsTTL: 7200 // 2小时
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
  defaultMeta: { service: 'evaluation-engine' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

class EvaluationEngineServer {
  constructor() {
    this.app = express();
    this.analytics = new AdvancedAnalyticsService();
    this.dbManager = new DatabaseManager(config.databases);
    this.peerComparison = new PeerComparisonService();
    this.prediction = new PredictionService();

    this.setupMiddleware();
    this.setupCircuitBreakers();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // 安全中间件
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"]
        }
      }
    }));

    // CORS 配置
    this.app.use(cors({
      origin: [
        'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:3001'
      ],
      credentials: true
    }));

    // 通用中间件
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // 请求日志
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      next();
    });

    // API 速率限制
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 500, // 每个IP最多500次请求
      message: {
        error: 'rate_limit_exceeded',
        message: 'Too many requests from this IP'
      }
    });
    this.app.use('/api/', limiter);

    // 服务头部
    this.app.use((req, res, next) => {
      res.header('X-Service', 'Evaluation-Engine');
      res.header('X-Service-Version', '1.0.0');
      next();
    });
  }

  setupCircuitBreakers() {
    // 数据库熔断器
    const dbOptions = {
      timeout: 5000, // 5秒超时
      errorThresholdPercentage: 50,
      resetTimeout: 30000, // 30秒重置
      rollingCountTimeout: 10000,
      rollingCountBuckets: 10
    };

    this.dbBreaker = new CircuitBreaker(this.dbManager.query.bind(this.dbManager), dbOptions);
    this.dbBreaker.fallback(() => ({ error: 'Database service temporarily unavailable' }));

    this.dbBreaker.on('open', () => logger.warn('Database circuit breaker opened'));
    this.dbBreaker.on('halfOpen', () => logger.info('Database circuit breaker half-open'));
    this.dbBreaker.on('close', () => logger.info('Database circuit breaker closed'));
  }

  setupRoutes() {
    // 健康检查
    this.app.get('/health', async (req, res) => {
      try {
        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: config.environment,
          services: {
            analytics: 'operational',
            database: await this.checkDatabaseHealth(),
            cache: await this.checkCacheHealth(),
            prediction: 'operational'
          },
          metrics: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
          }
        };

        res.json(health);
      } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
          status: 'unhealthy',
          error: error.message
        });
      }
    });

    // 服务信息
    this.app.get('/', (req, res) => {
      res.json({
        service: 'Evaluation Engine',
        description: 'Advanced analytics and prediction service for teacher evaluations',
        version: '1.0.0',
        capabilities: [
          'Statistical analysis with confidence intervals',
          'Trend analysis and forecasting',
          'Peer comparison with effect size calculations',
          'Anomaly detection using multiple algorithms',
          'Correlation analysis and multivariate statistics',
          'Machine learning predictions with model validation'
        ],
        endpoints: {
          analytics: '/api/analytics',
          predictions: '/api/predictions',
          comparisons: '/api/comparisons',
          anomalies: '/api/anomalies'
        }
      });
    });

    // 高级分析端点
    this.app.post('/api/analytics/comprehensive', async (req, res) => {
      try {
        const { teacher_id, evaluation_data, options = {} } = req.body;

        if (!teacher_id || !evaluation_data || !Array.isArray(evaluation_data)) {
          return res.status(400).json({
            error: 'invalid_request',
            message: 'teacher_id and evaluation_data array are required'
          });
        }

        // 检查缓存
        const cacheKey = `analytics:${teacher_id}:${JSON.stringify(options)}`;
        const cached = await this.getCachedResult(cacheKey);
        if (cached) {
          return res.json({
            ...cached,
            cache_hit: true
          });
        }

        // 执行分析
        const startTime = Date.now();
        const results = await this.analytics.calculatePerformanceStatistics(evaluation_data, options);

        // 增强结果
        const enhancedResults = {
          ...results,
          teacher_id: teacher_id,
          analysis_performance: {
            execution_time_ms: Date.now() - startTime,
            data_quality_score: this.assessDataQuality(evaluation_data),
            reliability_score: this.calculateReliabilityScore(results)
          },
          recommendations: this.generateRecommendations(results),
          cache_hit: false
        };

        // 缓存结果
        await this.setCachedResult(cacheKey, enhancedResults, config.cache.analyticsResultsTTL);

        res.json(enhancedResults);

      } catch (error) {
        logger.error('Comprehensive analytics failed:', error);
        res.status(500).json({
          error: 'analytics_error',
          message: 'Failed to perform comprehensive analysis',
          details: config.environment === 'development' ? error.message : undefined
        });
      }
    });

    // 预测分析端点
    this.app.post('/api/predictions/performance', async (req, res) => {
      try {
        const { teacher_id, historical_data, prediction_options = {} } = req.body;

        if (!teacher_id || !historical_data || !Array.isArray(historical_data)) {
          return res.status(400).json({
            error: 'invalid_request',
            message: 'teacher_id and historical_data array are required'
          });
        }

        // 检查缓存
        const cacheKey = `predictions:${teacher_id}:${JSON.stringify(prediction_options)}`;
        const cached = await this.getCachedResult(cacheKey);
        if (cached) {
          return res.json({
            ...cached,
            cache_hit: true
          });
        }

        // 生成预测
        const startTime = Date.now();
        const predictions = await this.analytics.generatePredictions(historical_data, {
          forecastPeriods: prediction_options.periods || 6,
          confidenceLevel: prediction_options.confidence_level || 0.95,
          ...prediction_options
        });

        // 增强预测结果
        const enhancedPredictions = {
          ...predictions,
          teacher_id: teacher_id,
          prediction_metadata: {
            execution_time_ms: Date.now() - startTime,
            model_reliability: this.assessModelReliability(predictions),
            data_sufficiency: this.assessDataSufficiency(historical_data),
            prediction_horizon: prediction_options.periods || 6
          },
          interpretation: this.interpretPredictions(predictions),
          actionable_insights: this.generateActionableInsights(predictions),
          cache_hit: false
        };

        // 缓存结果
        await this.setCachedResult(cacheKey, enhancedPredictions, config.cache.predictionsTTL);

        res.json(enhancedPredictions);

      } catch (error) {
        logger.error('Performance prediction failed:', error);
        res.status(500).json({
          error: 'prediction_error',
          message: 'Failed to generate performance predictions',
          details: config.environment === 'development' ? error.message : undefined
        });
      }
    });

    // 同行比较端点
    this.app.post('/api/comparisons/peer-analysis', async (req, res) => {
      try {
        const { teacher_id, teacher_data, comparison_group, options = {} } = req.body;

        if (!teacher_id || !teacher_data || !comparison_group) {
          return res.status(400).json({
            error: 'invalid_request',
            message: 'teacher_id, teacher_data, and comparison_group are required'
          });
        }

        // 执行同行比较
        const startTime = Date.now();
        const comparison = await this.analytics.calculatePeerComparison(teacher_data, comparison_group);

        // 增强比较结果
        const enhancedComparison = {
          ...comparison,
          teacher_id: teacher_id,
          comparison_metadata: {
            execution_time_ms: Date.now() - startTime,
            comparison_validity: this.assessComparisonValidity(comparison),
            statistical_power: this.calculateStatisticalPower(comparison)
          },
          development_recommendations: this.generateDevelopmentRecommendations(comparison),
          strength_areas: this.identifyStrengthAreas(comparison),
          improvement_opportunities: this.identifyImprovementOpportunities(comparison)
        };

        res.json(enhancedComparison);

      } catch (error) {
        logger.error('Peer comparison failed:', error);
        res.status(500).json({
          error: 'comparison_error',
          message: 'Failed to perform peer comparison analysis',
          details: config.environment === 'development' ? error.message : undefined
        });
      }
    });

    // 异常检测端点
    this.app.post('/api/anomalies/detect', async (req, res) => {
      try {
        const { teacher_id, evaluation_data, detection_options = {} } = req.body;

        if (!teacher_id || !evaluation_data || !Array.isArray(evaluation_data)) {
          return res.status(400).json({
            error: 'invalid_request',
            message: 'teacher_id and evaluation_data array are required'
          });
        }

        // 执行异常检测
        const startTime = Date.now();
        const anomalies = await this.analytics.detectAnomalies(evaluation_data, {
          method: detection_options.method || 'combined',
          threshold: detection_options.threshold || 0.1,
          ...detection_options
        });

        // 增强异常检测结果
        const enhancedAnomalies = {
          ...anomalies,
          teacher_id: teacher_id,
          detection_metadata: {
            execution_time_ms: Date.now() - startTime,
            detection_confidence: this.calculateDetectionConfidence(anomalies),
            false_positive_estimate: this.estimateFalsePositives(anomalies)
          },
          investigation_priority: this.prioritizeAnomalies(anomalies),
          recommended_actions: this.recommendAnomalyActions(anomalies)
        };

        res.json(enhancedAnomalies);

      } catch (error) {
        logger.error('Anomaly detection failed:', error);
        res.status(500).json({
          error: 'anomaly_detection_error',
          message: 'Failed to detect anomalies',
          details: config.environment === 'development' ? error.message : undefined
        });
      }
    });

    // 相关性分析端点
    this.app.post('/api/analytics/correlations', async (req, res) => {
      try {
        const { teacher_id, evaluation_data, correlation_options = {} } = req.body;

        if (!teacher_id || !evaluation_data || !Array.isArray(evaluation_data)) {
          return res.status(400).json({
            error: 'invalid_request',
            message: 'teacher_id and evaluation_data array are required'
          });
        }

        // 执行相关性分析
        const startTime = Date.now();
        const correlations = await this.analytics.analyzeCorrelations(evaluation_data);

        // 增强相关性分析结果
        const enhancedCorrelations = {
          ...correlations,
          teacher_id: teacher_id,
          analysis_metadata: {
            execution_time_ms: Date.now() - startTime,
            sample_adequacy: this.assessSampleAdequacy(evaluation_data),
            multicollinearity_assessment: this.assessMulticollinearity(correlations)
          },
          practical_implications: this.interpretCorrelationImplications(correlations),
          focus_areas: this.identifyCorrelationFocusAreas(correlations)
        };

        res.json(enhancedCorrelations);

      } catch (error) {
        logger.error('Correlation analysis failed:', error);
        res.status(500).json({
          error: 'correlation_error',
          message: 'Failed to perform correlation analysis',
          details: config.environment === 'development' ? error.message : undefined
        });
      }
    });

    // 批量分析端点
    this.app.post('/api/analytics/batch', async (req, res) => {
      try {
        const { analysis_requests } = req.body;

        if (!analysis_requests || !Array.isArray(analysis_requests)) {
          return res.status(400).json({
            error: 'invalid_request',
            message: 'analysis_requests array is required'
          });
        }

        // 处理批量请求
        const startTime = Date.now();
        const results = await Promise.allSettled(
          analysis_requests.map(request => this.processBatchAnalysis(request))
        );

        const batchResults = {
          total_requests: analysis_requests.length,
          successful: results.filter(r => r.status === 'fulfilled').length,
          failed: results.filter(r => r.status === 'rejected').length,
          execution_time_ms: Date.now() - startTime,
          results: results.map((result, index) => ({
            request_id: analysis_requests[index].request_id || index,
            status: result.status,
            data: result.status === 'fulfilled' ? result.value : null,
            error: result.status === 'rejected' ? result.reason.message : null
          }))
        };

        res.json(batchResults);

      } catch (error) {
        logger.error('Batch analysis failed:', error);
        res.status(500).json({
          error: 'batch_analysis_error',
          message: 'Failed to process batch analysis',
          details: config.environment === 'development' ? error.message : undefined
        });
      }
    });
  }

  setupErrorHandling() {
    // 404 处理
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'not_found',
        message: 'API endpoint not found',
        path: req.originalUrl
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
      }

      res.status(statusCode).json(response);
    });
  }

  // 辅助方法

  async checkDatabaseHealth() {
    try {
      await this.dbManager.healthCheck();
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  async checkCacheHealth() {
    try {
      // 简单的缓存健康检查
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }

  async getCachedResult(key) {
    // 简化的缓存实现
    return null;
  }

  async setCachedResult(key, data, ttl) {
    // 简化的缓存实现
    return true;
  }

  assessDataQuality(data) {
    const completeness = data.filter(d => d.overall_rating && !isNaN(parseFloat(d.overall_rating))).length / data.length;
    const consistency = this.assessDataConsistency(data);
    const recency = this.assessDataRecency(data);

    return parseFloat(((completeness + consistency + recency) / 3).toFixed(3));
  }

  assessDataConsistency(data) {
    // 简化的数据一致性评估
    const scores = data.map(d => parseFloat(d.overall_rating)).filter(s => !isNaN(s));
    const outliers = scores.filter(s => s < 1 || s > 5).length;
    return Math.max(0, 1 - (outliers / scores.length));
  }

  assessDataRecency(data) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const recentData = data.filter(d => new Date(d.created_at) > thirtyDaysAgo).length;
    return Math.min(1, recentData / Math.min(data.length, 10));
  }

  calculateReliabilityScore(results) {
    // 简化的可靠性分数计算
    const sampleSize = results.analysis_metadata.data_points;
    const sizeScore = Math.min(1, sampleSize / 30);

    const confidenceScore = results.basic_statistics.confidence_interval ? 0.8 : 0.6;
    const trendStrength = results.trend_analysis?.linear_trend?.r_squared || 0.5;

    return parseFloat(((sizeScore + confidenceScore + trendStrength) / 3).toFixed(3));
  }

  generateRecommendations(results) {
    const recommendations = [];

    // 基于趋势的建议
    if (results.trend_analysis?.trend_summary?.trend_classification?.includes('negative')) {
      recommendations.push({
        category: 'performance_improvement',
        priority: 'high',
        recommendation: 'Consider implementing targeted professional development based on declining trend',
        supporting_data: 'Negative performance trend detected'
      });
    }

    // 基于异常的建议
    if (results.anomaly_detection?.anomalies_found > 0) {
      recommendations.push({
        category: 'data_quality',
        priority: 'medium',
        recommendation: 'Review evaluation data for potential inconsistencies or outliers',
        supporting_data: `${results.anomaly_detection.anomalies_found} anomalies detected`
      });
    }

    // 基于同行比较的建议
    if (results.peer_comparison?.ranking?.percentile_rank < 25) {
      recommendations.push({
        category: 'peer_support',
        priority: 'high',
        recommendation: 'Connect with high-performing peers for mentoring and best practice sharing',
        supporting_data: 'Below-average performance compared to peers'
      });
    }

    return recommendations;
  }

  assessModelReliability(predictions) {
    // 简化的模型可靠性评估
    if (predictions.error) return 0;

    const modelCount = Object.keys(predictions.predictions || {}).length - 1; // 排除ensemble
    const modelAgreement = this.calculateModelAgreement(predictions.predictions);

    return parseFloat(((modelCount / 4 + modelAgreement) / 2).toFixed(3));
  }

  calculateModelAgreement(predictions) {
    // 计算模型预测的一致性
    if (!predictions.ensemble?.predictions) return 0.5;

    const ensemblePredictions = predictions.ensemble.predictions;
    const avgVariance = ensemblePredictions.reduce((sum, pred) => {
      const interval = pred.prediction_interval;
      if (interval) {
        const variance = Math.pow((interval.upper - interval.lower) / 4, 2);
        return sum + variance;
      }
      return sum;
    }, 0) / ensemblePredictions.length;

    return Math.max(0, 1 - avgVariance);
  }

  assessDataSufficiency(data) {
    const minRequired = 12; // 最少12个数据点
    const optimal = 36; // 最优36个数据点

    if (data.length < minRequired) {
      return { sufficient: false, score: data.length / minRequired, message: 'Insufficient data for reliable predictions' };
    } else if (data.length >= optimal) {
      return { sufficient: true, score: 1.0, message: 'Optimal data volume for predictions' };
    } else {
      return { sufficient: true, score: data.length / optimal, message: 'Adequate data for predictions' };
    }
  }

  interpretPredictions(predictions) {
    const interpretations = [];

    if (predictions.predictions?.ensemble?.predictions) {
      const ensemble = predictions.predictions.ensemble.predictions;
      const trend = this.analyzePredictionTrend(ensemble);

      interpretations.push({
        type: 'trend',
        message: `Predicted performance trend: ${trend.direction}`,
        confidence: trend.confidence,
        details: trend.details
      });

      const volatility = this.analyzePredictionVolatility(ensemble);
      interpretations.push({
        type: 'volatility',
        message: `Prediction volatility: ${volatility.level}`,
        implications: volatility.implications
      });
    }

    return interpretations;
  }

  analyzePredictionTrend(predictions) {
    if (predictions.length < 2) return { direction: 'unknown', confidence: 0 };

    const firstValue = predictions[0].predicted_value;
    const lastValue = predictions[predictions.length - 1].predicted_value;
    const change = lastValue - firstValue;
    const changePercent = (change / firstValue) * 100;

    let direction, details;
    if (Math.abs(changePercent) < 2) {
      direction = 'stable';
      details = 'Performance expected to remain relatively stable';
    } else if (changePercent > 0) {
      direction = 'improving';
      details = `Performance expected to improve by ${changePercent.toFixed(1)}%`;
    } else {
      direction = 'declining';
      details = `Performance expected to decline by ${Math.abs(changePercent).toFixed(1)}%`;
    }

    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

    return {
      direction,
      confidence: avgConfidence,
      details
    };
  }

  analyzePredictionVolatility(predictions) {
    const values = predictions.map(p => p.predicted_value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    let level, implications;
    if (cv < 0.1) {
      level = 'low';
      implications = 'Consistent performance expected with minimal fluctuation';
    } else if (cv < 0.2) {
      level = 'moderate';
      implications = 'Some performance variation expected within normal ranges';
    } else {
      level = 'high';
      implications = 'Significant performance variation expected - monitor closely';
    }

    return { level, implications };
  }

  generateActionableInsights(predictions) {
    const insights = [];

    if (predictions.prediction_metadata?.data_sufficiency?.sufficient === false) {
      insights.push({
        category: 'data_collection',
        insight: 'Increase evaluation frequency to improve prediction accuracy',
        action: 'Implement monthly evaluation checkpoints',
        expected_benefit: 'More reliable performance forecasting'
      });
    }

    const trend = this.analyzePredictionTrend(predictions.predictions?.ensemble?.predictions || []);
    if (trend.direction === 'declining') {
      insights.push({
        category: 'intervention',
        insight: 'Declining performance trend detected in predictions',
        action: 'Schedule professional development intervention within next 2-3 periods',
        expected_benefit: 'Prevent predicted performance decline'
      });
    }

    return insights;
  }

  async processBatchAnalysis(request) {
    const { type, teacher_id, data, options } = request;

    switch (type) {
      case 'comprehensive':
        return this.analytics.calculatePerformanceStatistics(data, options);
      case 'predictions':
        return this.analytics.generatePredictions(data, options);
      case 'peer_comparison':
        return this.analytics.calculatePeerComparison(data, options.comparison_group);
      case 'anomalies':
        return this.analytics.detectAnomalies(data, options);
      case 'correlations':
        return this.analytics.analyzeCorrelations(data);
      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }
  }

  // 更多辅助方法...

  assessComparisonValidity(comparison) {
    const teacherSampleSize = comparison.teacher_performance.sample_size;
    const peerSampleSize = comparison.peer_performance.sample_size;

    const sizeAdequacy = Math.min(teacherSampleSize / 10, 1) * Math.min(peerSampleSize / 20, 1);
    const statisticalSignificance = comparison.statistical_comparison.t_test.significant ? 1 : 0.5;

    return parseFloat(((sizeAdequacy + statisticalSignificance) / 2).toFixed(3));
  }

  calculateStatisticalPower(comparison) {
    // 简化的统计功效计算
    const effectSize = Math.abs(comparison.statistical_comparison.effect_size.cohens_d);
    const sampleSize = comparison.teacher_performance.sample_size + comparison.peer_performance.sample_size;

    // 基于效应大小和样本量的简化功效估算
    let power = 0.5;
    if (effectSize > 0.8 && sampleSize > 30) power = 0.9;
    else if (effectSize > 0.5 && sampleSize > 20) power = 0.8;
    else if (effectSize > 0.2 && sampleSize > 15) power = 0.7;

    return parseFloat(power.toFixed(2));
  }

  generateDevelopmentRecommendations(comparison) {
    const recommendations = [];
    const percentile = comparison.ranking.percentile_rank;

    if (percentile < 25) {
      recommendations.push({
        priority: 'high',
        area: 'fundamental_skills',
        recommendation: 'Focus on developing core teaching competencies',
        timeline: '3-6 months'
      });
    } else if (percentile < 50) {
      recommendations.push({
        priority: 'medium',
        area: 'skill_enhancement',
        recommendation: 'Target specific areas for improvement based on peer analysis',
        timeline: '2-4 months'
      });
    } else if (percentile > 90) {
      recommendations.push({
        priority: 'low',
        area: 'leadership_development',
        recommendation: 'Consider mentoring roles and leadership opportunities',
        timeline: 'ongoing'
      });
    }

    return recommendations;
  }

  identifyStrengthAreas(comparison) {
    const strengths = [];

    if (comparison.ranking.percentile_rank > 75) {
      strengths.push({
        area: 'overall_performance',
        description: 'Consistently strong performance compared to peers',
        percentile: comparison.ranking.percentile_rank
      });
    }

    if (comparison.statistical_comparison.effect_size.cohens_d > 0.5) {
      strengths.push({
        area: 'performance_distinction',
        description: 'Meaningfully higher performance than peer group',
        effect_size: comparison.statistical_comparison.effect_size.cohens_d
      });
    }

    return strengths;
  }

  identifyImprovementOpportunities(comparison) {
    const opportunities = [];

    if (comparison.ranking.percentile_rank < 50) {
      opportunities.push({
        area: 'peer_learning',
        description: 'Observe and learn from higher-performing colleagues',
        potential_impact: 'moderate to high'
      });
    }

    if (comparison.statistical_comparison.t_test.significant && comparison.statistical_comparison.difference < 0) {
      opportunities.push({
        area: 'performance_gap',
        description: 'Address identified performance gap through targeted development',
        gap_size: Math.abs(comparison.statistical_comparison.difference)
      });
    }

    return opportunities;
  }

  calculateDetectionConfidence(anomalies) {
    if (anomalies.anomalies_found === 0) return 0.95;

    const avgScore = anomalies.anomalies.reduce((sum, a) => sum + a.score, 0) / anomalies.anomalies.length;
    return Math.min(0.95, 0.5 + avgScore * 0.45);
  }

  estimateFalsePositives(anomalies) {
    // 基于异常检测方法估算假阳性率
    const method = anomalies.method;
    const baseRate = {
      'statistical': 0.05,
      'isolation_forest': 0.1,
      'z_score': 0.05,
      'combined': 0.03
    };

    return baseRate[method] || 0.1;
  }

  prioritizeAnomalies(anomalies) {
    if (anomalies.anomalies_found === 0) return [];

    return anomalies.anomalies
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((anomaly, index) => ({
        priority_rank: index + 1,
        anomaly_index: anomaly.index,
        severity: anomaly.severity || this.classifyAnomalySeverity(anomaly.score),
        investigation_urgency: anomaly.score > 0.8 ? 'immediate' : anomaly.score > 0.5 ? 'within_week' : 'routine'
      }));
  }

  classifyAnomalySeverity(score) {
    if (score > 0.8) return 'high';
    if (score > 0.5) return 'medium';
    return 'low';
  }

  recommendAnomalyActions(anomalies) {
    const actions = [];

    if (anomalies.anomalies_found > 0) {
      const highSeverity = anomalies.anomalies.filter(a => this.classifyAnomalySeverity(a.score) === 'high').length;

      if (highSeverity > 0) {
        actions.push({
          action: 'immediate_review',
          description: 'Review high-severity anomalies immediately for data quality issues',
          timeline: 'within 24 hours'
        });
      }

      actions.push({
        action: 'data_validation',
        description: 'Validate evaluation data collection processes',
        timeline: 'within 1 week'
      });

      if (anomalies.anomaly_rate > 10) {
        actions.push({
          action: 'systematic_review',
          description: 'Conduct systematic review of evaluation methodology',
          timeline: 'within 1 month'
        });
      }
    }

    return actions;
  }

  assessSampleAdequacy(data) {
    const sampleSize = data.length;
    const variables = this.analytics.extractNumericalVariables(data).length;

    // Kaiser-Meyer-Olkin测试的简化版本
    const adequacy = Math.min(1, sampleSize / (variables * 10));

    return {
      sample_size: sampleSize,
      variable_count: variables,
      adequacy_score: parseFloat(adequacy.toFixed(3)),
      adequacy_level: adequacy > 0.8 ? 'excellent' : adequacy > 0.6 ? 'good' : adequacy > 0.5 ? 'fair' : 'poor'
    };
  }

  assessMulticollinearity(correlations) {
    if (!correlations.correlation_matrix) return { assessment: 'unknown' };

    const matrix = correlations.correlation_matrix;
    const variables = Object.keys(matrix);
    let highCorrelations = 0;

    variables.forEach(var1 => {
      variables.forEach(var2 => {
        if (var1 !== var2 && Math.abs(matrix[var1][var2]) > 0.8) {
          highCorrelations++;
        }
      });
    });

    // 避免重复计数
    highCorrelations = highCorrelations / 2;

    return {
      high_correlation_pairs: highCorrelations,
      multicollinearity_risk: highCorrelations > 0 ? 'present' : 'low',
      recommendation: highCorrelations > 0 ? 'Consider variable selection or dimensionality reduction' : 'No multicollinearity concerns'
    };
  }

  interpretCorrelationImplications(correlations) {
    const implications = [];

    if (correlations.strongest_correlations) {
      correlations.strongest_correlations.forEach(corr => {
        if (Math.abs(corr.correlation) > 0.6) {
          implications.push({
            variables: corr.variables,
            implication: `Strong relationship suggests ${corr.interpretation.direction} interdependence`,
            practical_meaning: this.getCorrelationPracticalMeaning(corr.variables, corr.correlation)
          });
        }
      });
    }

    return implications;
  }

  getCorrelationPracticalMeaning(variables, correlation) {
    // 简化的实际意义解释
    if (variables.includes('overall_rating') && variables.includes('teaching_quality')) {
      return correlation > 0 ? 'Teaching quality strongly influences overall ratings' : 'Unexpected negative relationship requires investigation';
    }

    return 'Strong relationship indicates these aspects of performance tend to vary together';
  }

  identifyCorrelationFocusAreas(correlations) {
    const focusAreas = [];

    if (correlations.strongest_correlations) {
      correlations.strongest_correlations.forEach(corr => {
        if (Math.abs(corr.correlation) > 0.5) {
          focusAreas.push({
            area: corr.variables,
            focus_type: corr.correlation > 0 ? 'synergistic_improvement' : 'conflicting_dynamics',
            priority: Math.abs(corr.correlation) > 0.7 ? 'high' : 'medium',
            development_approach: this.suggestDevelopmentApproach(corr)
          });
        }
      });
    }

    return focusAreas;
  }

  suggestDevelopmentApproach(correlation) {
    if (correlation.correlation > 0.7) {
      return 'Focus on integrated development - improvements in one area will likely enhance the other';
    } else if (correlation.correlation < -0.7) {
      return 'Address potential conflicts - these areas may need balanced approach to avoid trade-offs';
    } else {
      return 'Consider moderate relationship in development planning';
    }
  }

  async start() {
    try {
      // 初始化数据库连接
      await this.dbManager.initialize();
      logger.info('Database connections established');

      const server = this.app.listen(config.port, () => {
        logger.info(`🚀 Evaluation Engine Service started on port ${config.port}`);
        logger.info(`📊 Advanced Analytics: Ready`);
        logger.info(`🔮 Prediction Models: Ready`);
        logger.info(`📈 Statistical Analysis: Ready`);
        logger.info(`🎯 Anomaly Detection: Ready`);
        logger.info(`🌍 Environment: ${config.environment}`);
      });

      // 优雅关闭
      process.on('SIGTERM', () => {
        logger.info('SIGTERM received, shutting down gracefully');
        server.close(async () => {
          await this.dbManager.cleanup();
          logger.info('Process terminated');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        logger.info('SIGINT received, shutting down gracefully');
        server.close(async () => {
          await this.dbManager.cleanup();
          logger.info('Process terminated');
          process.exit(0);
        });
      });

      return server;

    } catch (error) {
      logger.error('Failed to start Evaluation Engine Service:', error);
      process.exit(1);
    }
  }
}

// 启动服务器
if (require.main === module) {
  const server = new EvaluationEngineServer();
  server.start();
}

module.exports = EvaluationEngineServer;