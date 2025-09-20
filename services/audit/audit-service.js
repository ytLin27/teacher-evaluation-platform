/**
 * 审计服务
 * 提供统一的审计日志记录、安全监控和合规性报告功能
 */

const express = require('express');
const winston = require('winston');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');

class AuditService {
  constructor(config = {}) {
    this.config = {
      retention_days: config.retention_days || 2555, // 7年保留
      encryption_key: config.encryption_key || process.env.AUDIT_ENCRYPTION_KEY,
      siem_endpoint: config.siem_endpoint || process.env.SIEM_ENDPOINT,
      real_time_alerting: config.real_time_alerting !== false,
      ...config
    };

    this.setupLogger();
    this.auditEvents = new Map();
    this.securityRules = new Map();
    this.alertThresholds = new Map();
    this.riskScoreCache = new Map();

    this.initializeSecurityRules();
    this.initializeAlertThresholds();
  }

  /**
   * 设置审计日志记录器
   */
  setupLogger() {
    // 创建自定义日志格式
    const auditFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(info => {
        // 添加完整性保护
        const logEntry = {
          ...info,
          integrity_hash: this.calculateIntegrityHash(info)
        };
        return JSON.stringify(logEntry);
      })
    );

    // 安全审计日志记录器
    this.auditLogger = winston.createLogger({
      level: 'info',
      format: auditFormat,
      defaultMeta: {
        service: 'audit-service',
        environment: process.env.NODE_ENV || 'development'
      },
      transports: [
        // 主要审计日志文件
        new winston.transports.File({
          filename: 'logs/audit.log',
          maxsize: 100 * 1024 * 1024, // 100MB
          maxFiles: 100,
          tailable: true
        }),

        // 安全事件专用日志
        new winston.transports.File({
          filename: 'logs/security-events.log',
          level: 'warn',
          maxsize: 50 * 1024 * 1024, // 50MB
          maxFiles: 50
        }),

        // 合规性日志
        new winston.transports.File({
          filename: 'logs/compliance.log',
          maxsize: 50 * 1024 * 1024,
          maxFiles: 200 // 更长保留期
        }),

        // 控制台输出（开发环境）
        ...(process.env.NODE_ENV === 'development' ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          })
        ] : [])
      ]
    });

    // 系统监控日志记录器
    this.systemLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({
          filename: 'logs/system-monitoring.log',
          maxsize: 50 * 1024 * 1024,
          maxFiles: 30
        })
      ]
    });
  }

  /**
   * 初始化安全规则
   */
  initializeSecurityRules() {
    // 暴力破解检测规则
    this.securityRules.set('brute_force_detection', {
      type: 'rate_limit',
      threshold: 5,
      window_minutes: 15,
      action: 'block_ip',
      severity: 'high'
    });

    // 权限提升检测
    this.securityRules.set('privilege_escalation', {
      type: 'authorization_change',
      threshold: 1,
      window_minutes: 5,
      action: 'alert_admin',
      severity: 'critical'
    });

    // 异常数据访问模式
    this.securityRules.set('unusual_data_access', {
      type: 'data_access_pattern',
      threshold: 2.5, // 标准差
      baseline_days: 30,
      action: 'investigate',
      severity: 'medium'
    });

    // 大量数据导出检测
    this.securityRules.set('bulk_data_export', {
      type: 'data_export_volume',
      threshold_mb: 100,
      window_minutes: 10,
      action: 'require_approval',
      severity: 'high'
    });

    // 管理员账户异常访问
    this.securityRules.set('admin_unusual_access', {
      type: 'admin_access_pattern',
      unusual_time: true,
      unusual_location: true,
      action: 'mfa_challenge',
      severity: 'high'
    });
  }

  /**
   * 初始化告警阈值
   */
  initializeAlertThresholds() {
    this.alertThresholds.set('failed_logins', {
      threshold: 10,
      window_minutes: 5,
      severity: 'medium'
    });

    this.alertThresholds.set('suspicious_requests', {
      threshold: 50,
      window_minutes: 1,
      severity: 'high'
    });

    this.alertThresholds.set('error_rate', {
      threshold: 0.05, // 5%
      window_minutes: 5,
      severity: 'warning'
    });

    this.alertThresholds.set('response_time', {
      threshold: 5000, // 5秒
      window_minutes: 5,
      severity: 'warning'
    });
  }

  /**
   * 记录审计事件
   */
  async logAuditEvent(eventData) {
    try {
      const auditEvent = this.createAuditEvent(eventData);

      // 计算风险评分
      auditEvent.risk_score = await this.calculateRiskScore(auditEvent);

      // 应用安全规则
      const securityAlerts = await this.applySecurityRules(auditEvent);

      // 记录到审计日志
      this.auditLogger.info('Audit Event', auditEvent);

      // 如果有安全告警，记录到安全日志
      if (securityAlerts.length > 0) {
        this.auditLogger.warn('Security Alert', {
          ...auditEvent,
          security_alerts: securityAlerts
        });

        // 实时告警处理
        if (this.config.real_time_alerting) {
          await this.sendRealTimeAlert(auditEvent, securityAlerts);
        }
      }

      // 合规性日志记录
      if (this.isComplianceEvent(auditEvent)) {
        this.auditLogger.info('Compliance Event', {
          ...auditEvent,
          compliance_category: this.getComplianceCategory(auditEvent)
        });
      }

      // 转发到SIEM系统
      if (this.config.siem_endpoint) {
        await this.forwardToSIEM(auditEvent);
      }

      return {
        event_id: auditEvent.event_id,
        risk_score: auditEvent.risk_score,
        security_alerts: securityAlerts,
        timestamp: auditEvent.timestamp
      };

    } catch (error) {
      this.systemLogger.error('Failed to log audit event', {
        error: error.message,
        stack: error.stack,
        event_data: eventData
      });
      throw error;
    }
  }

  /**
   * 创建标准化审计事件
   */
  createAuditEvent(eventData) {
    const baseEvent = {
      event_id: uuidv4(),
      timestamp: new Date().toISOString(),
      service: 'teacher-evaluation-platform',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };

    // 必需字段验证
    const requiredFields = [
      'event_type', 'user_id', 'source_ip', 'user_agent',
      'resource_accessed', 'action_performed', 'result_status'
    ];

    for (const field of requiredFields) {
      if (!eventData[field]) {
        throw new Error(`Missing required audit field: ${field}`);
      }
    }

    // 合并事件数据
    const auditEvent = {
      ...baseEvent,
      ...eventData,
      // 添加会话信息
      session_id: eventData.session_id || 'unknown',
      correlation_id: eventData.correlation_id || uuidv4(),

      // 地理位置信息（如果可用）
      geolocation: eventData.geolocation || this.getGeolocation(eventData.source_ip),

      // 设备指纹（如果可用）
      device_fingerprint: eventData.device_fingerprint || this.generateDeviceFingerprint(eventData),

      // 请求详情
      request_details: {
        method: eventData.method || 'unknown',
        path: eventData.path || 'unknown',
        parameters: this.sanitizeParameters(eventData.parameters),
        headers: this.sanitizeHeaders(eventData.headers)
      }
    };

    return auditEvent;
  }

  /**
   * 计算风险评分
   */
  async calculateRiskScore(auditEvent) {
    let riskScore = 0;

    // 基于事件类型的基础风险评分
    const baseRiskScores = {
      'authentication_failure': 2,
      'authorization_denied': 3,
      'privilege_escalation': 8,
      'data_access': 1,
      'sensitive_data_access': 5,
      'data_modification': 3,
      'configuration_change': 6,
      'admin_action': 4,
      'security_violation': 9
    };

    riskScore += baseRiskScores[auditEvent.event_type] || 1;

    // 用户角色风险调整
    if (auditEvent.user_role === 'admin') {
      riskScore += 2;
    } else if (auditEvent.user_role === 'department_head') {
      riskScore += 1;
    }

    // 时间因素（非工作时间访问增加风险）
    const hour = new Date(auditEvent.timestamp).getHours();
    if (hour < 6 || hour > 22) {
      riskScore += 2;
    }

    // IP地址风险评估
    const ipRisk = await this.assessIPRisk(auditEvent.source_ip);
    riskScore += ipRisk;

    // 历史行为模式分析
    const behaviorRisk = await this.assessBehaviorRisk(auditEvent);
    riskScore += behaviorRisk;

    // 失败状态增加风险
    if (auditEvent.result_status === 'failed' || auditEvent.result_status === 'error') {
      riskScore += 2;
    }

    // 限制风险评分范围 (0-10)
    return Math.min(Math.max(riskScore, 0), 10);
  }

  /**
   * 应用安全规则
   */
  async applySecurityRules(auditEvent) {
    const alerts = [];

    for (const [ruleName, rule] of this.securityRules) {
      try {
        const alertTriggered = await this.evaluateSecurityRule(ruleName, rule, auditEvent);
        if (alertTriggered) {
          alerts.push({
            rule_name: ruleName,
            rule_type: rule.type,
            severity: rule.severity,
            action: rule.action,
            triggered_at: new Date().toISOString(),
            event_id: auditEvent.event_id
          });
        }
      } catch (error) {
        this.systemLogger.error(`Failed to evaluate security rule ${ruleName}`, {
          error: error.message,
          rule: rule,
          event_id: auditEvent.event_id
        });
      }
    }

    return alerts;
  }

  /**
   * 评估单个安全规则
   */
  async evaluateSecurityRule(ruleName, rule, auditEvent) {
    switch (rule.type) {
      case 'rate_limit':
        return await this.evaluateRateLimitRule(rule, auditEvent);

      case 'authorization_change':
        return this.evaluateAuthorizationChangeRule(rule, auditEvent);

      case 'data_access_pattern':
        return await this.evaluateDataAccessPatternRule(rule, auditEvent);

      case 'data_export_volume':
        return this.evaluateDataExportVolumeRule(rule, auditEvent);

      case 'admin_access_pattern':
        return await this.evaluateAdminAccessPatternRule(rule, auditEvent);

      default:
        this.systemLogger.warn(`Unknown security rule type: ${rule.type}`);
        return false;
    }
  }

  /**
   * 评估速率限制规则
   */
  async evaluateRateLimitRule(rule, auditEvent) {
    const key = `rate_limit:${auditEvent.user_id}:${auditEvent.source_ip}`;
    const windowStart = new Date(Date.now() - rule.window_minutes * 60 * 1000);

    // 这里应该查询实际的事件存储来计算速率
    // 简化实现：模拟计数
    const eventCount = await this.getEventCount(
      auditEvent.user_id,
      auditEvent.source_ip,
      windowStart,
      new Date()
    );

    return eventCount >= rule.threshold;
  }

  /**
   * 评估权限变更规则
   */
  evaluateAuthorizationChangeRule(rule, auditEvent) {
    const authChangeEvents = [
      'role_assignment',
      'role_removal',
      'permission_granted',
      'permission_denied',
      'privilege_escalation'
    ];

    return authChangeEvents.includes(auditEvent.event_type);
  }

  /**
   * 评估数据访问模式规则
   */
  async evaluateDataAccessPatternRule(rule, auditEvent) {
    if (!auditEvent.event_type.includes('data_access')) {
      return false;
    }

    // 获取用户历史访问模式
    const userBaseline = await this.getUserAccessBaseline(auditEvent.user_id, rule.baseline_days);

    if (!userBaseline) {
      return false; // 没有足够的历史数据
    }

    // 计算当前访问与基线的偏差
    const currentPattern = this.extractAccessPattern(auditEvent);
    const deviation = this.calculatePatternDeviation(currentPattern, userBaseline);

    return deviation > rule.threshold;
  }

  /**
   * 评估数据导出量规则
   */
  evaluateDataExportVolumeRule(rule, auditEvent) {
    if (auditEvent.event_type !== 'data_export') {
      return false;
    }

    const exportSizeMB = auditEvent.export_size_bytes / (1024 * 1024);
    return exportSizeMB > rule.threshold_mb;
  }

  /**
   * 评估管理员访问模式规则
   */
  async evaluateAdminAccessPatternRule(rule, auditEvent) {
    if (auditEvent.user_role !== 'admin') {
      return false;
    }

    let suspicious = false;

    // 检查异常时间访问
    if (rule.unusual_time) {
      const hour = new Date(auditEvent.timestamp).getHours();
      if (hour < 6 || hour > 22) {
        suspicious = true;
      }
    }

    // 检查异常位置访问
    if (rule.unusual_location && auditEvent.geolocation) {
      const isUnusualLocation = await this.checkUnusualLocation(
        auditEvent.user_id,
        auditEvent.geolocation
      );
      if (isUnusualLocation) {
        suspicious = true;
      }
    }

    return suspicious;
  }

  /**
   * 发送实时告警
   */
  async sendRealTimeAlert(auditEvent, securityAlerts) {
    const alertData = {
      timestamp: new Date().toISOString(),
      event_id: auditEvent.event_id,
      user_id: auditEvent.user_id,
      event_type: auditEvent.event_type,
      risk_score: auditEvent.risk_score,
      alerts: securityAlerts,
      event_summary: this.generateEventSummary(auditEvent)
    };

    // 发送到不同的告警渠道
    const promises = [];

    // 邮件告警
    if (this.config.email_alerts) {
      promises.push(this.sendEmailAlert(alertData));
    }

    // Slack告警
    if (this.config.slack_webhook) {
      promises.push(this.sendSlackAlert(alertData));
    }

    // Teams告警
    if (this.config.teams_webhook) {
      promises.push(this.sendTeamsAlert(alertData));
    }

    // 仪表板推送
    if (this.config.dashboard_endpoint) {
      promises.push(this.sendDashboardAlert(alertData));
    }

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      this.systemLogger.error('Failed to send real-time alert', {
        error: error.message,
        alert_data: alertData
      });
    }
  }

  /**
   * 生成合规性报告
   */
  async generateComplianceReport(startDate, endDate, reportType = 'full') {
    try {
      const report = {
        report_id: uuidv4(),
        report_type: reportType,
        period: {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        },
        generated_at: new Date().toISOString(),
        generated_by: 'audit-service'
      };

      // 获取期间内的审计事件
      const auditEvents = await this.getAuditEvents(startDate, endDate);

      // 分析合规性指标
      report.compliance_metrics = this.analyzeComplianceMetrics(auditEvents);

      // 安全事件统计
      report.security_events = this.analyzeSecurityEvents(auditEvents);

      // 访问控制分析
      report.access_control = this.analyzeAccessControl(auditEvents);

      // 数据保护分析
      report.data_protection = this.analyzeDataProtection(auditEvents);

      // 风险评估
      report.risk_assessment = this.analyzeRiskAssessment(auditEvents);

      // 建议和改进措施
      report.recommendations = this.generateRecommendations(report);

      // 保存报告
      await this.saveComplianceReport(report);

      return report;

    } catch (error) {
      this.systemLogger.error('Failed to generate compliance report', {
        error: error.message,
        start_date: startDate,
        end_date: endDate,
        report_type: reportType
      });
      throw error;
    }
  }

  /**
   * 分析合规性指标
   */
  analyzeComplianceMetrics(auditEvents) {
    const metrics = {
      total_events: auditEvents.length,
      authentication_events: 0,
      authorization_events: 0,
      data_access_events: 0,
      configuration_changes: 0,
      failed_attempts: 0,
      high_risk_events: 0
    };

    auditEvents.forEach(event => {
      // 分类统计事件
      if (event.event_type.includes('authentication')) {
        metrics.authentication_events++;
      }
      if (event.event_type.includes('authorization')) {
        metrics.authorization_events++;
      }
      if (event.event_type.includes('data_access')) {
        metrics.data_access_events++;
      }
      if (event.event_type.includes('configuration')) {
        metrics.configuration_changes++;
      }
      if (event.result_status === 'failed') {
        metrics.failed_attempts++;
      }
      if (event.risk_score >= 7) {
        metrics.high_risk_events++;
      }
    });

    // 计算合规性分数
    metrics.compliance_score = this.calculateComplianceScore(metrics);

    return metrics;
  }

  /**
   * 计算完整性哈希
   */
  calculateIntegrityHash(logEntry) {
    const data = JSON.stringify(logEntry, Object.keys(logEntry).sort());
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * 验证日志完整性
   */
  async verifyLogIntegrity(logEntry) {
    const { integrity_hash, ...dataWithoutHash } = logEntry;
    const calculatedHash = this.calculateIntegrityHash(dataWithoutHash);
    return calculatedHash === integrity_hash;
  }

  /**
   * 清理敏感参数
   */
  sanitizeParameters(parameters) {
    if (!parameters) return {};

    const sanitized = { ...parameters };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'credit_card'];

    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * 清理敏感头部信息
   */
  sanitizeHeaders(headers) {
    if (!headers) return {};

    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

    Object.keys(sanitized).forEach(key => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  // 辅助方法的简化实现

  getGeolocation(ip) {
    // 简化实现 - 实际应用中应该使用GeoIP服务
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      coordinates: { lat: 0, lon: 0 }
    };
  }

  generateDeviceFingerprint(eventData) {
    // 简化的设备指纹生成
    const data = `${eventData.user_agent}${eventData.source_ip}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  async assessIPRisk(ip) {
    // 简化的IP风险评估
    // 实际应用中应该查询威胁情报数据库
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return 0; // 内网IP低风险
    }
    return 1; // 外网IP中等风险
  }

  async assessBehaviorRisk(auditEvent) {
    // 简化的行为风险评估
    // 实际应用中应该基于机器学习模型
    return Math.floor(Math.random() * 3); // 0-2分随机风险
  }

  async getEventCount(userId, sourceIp, startTime, endTime) {
    // 简化实现 - 返回模拟计数
    return Math.floor(Math.random() * 10);
  }

  async getUserAccessBaseline(userId, baselineDays) {
    // 简化实现 - 返回模拟基线
    return {
      avg_daily_access: 50,
      typical_hours: [9, 10, 11, 14, 15, 16],
      common_resources: ['dashboard', 'evaluations', 'reports']
    };
  }

  extractAccessPattern(auditEvent) {
    return {
      hour: new Date(auditEvent.timestamp).getHours(),
      resource: auditEvent.resource_accessed,
      action: auditEvent.action_performed
    };
  }

  calculatePatternDeviation(currentPattern, baseline) {
    // 简化的模式偏差计算
    return Math.random() * 3; // 0-3的随机偏差
  }

  async checkUnusualLocation(userId, geolocation) {
    // 简化的位置检查
    return Math.random() > 0.8; // 20%概率为异常位置
  }

  generateEventSummary(auditEvent) {
    return `User ${auditEvent.user_id} performed ${auditEvent.action_performed} on ${auditEvent.resource_accessed} with result ${auditEvent.result_status}`;
  }

  async sendEmailAlert(alertData) {
    // 简化实现 - 实际应用中发送邮件
    console.log('Email alert sent:', alertData.event_summary);
  }

  async sendSlackAlert(alertData) {
    // 简化实现 - 实际应用中发送Slack消息
    console.log('Slack alert sent:', alertData.event_summary);
  }

  async sendTeamsAlert(alertData) {
    // 简化实现 - 实际应用中发送Teams消息
    console.log('Teams alert sent:', alertData.event_summary);
  }

  async sendDashboardAlert(alertData) {
    // 简化实现 - 实际应用中推送到仪表板
    console.log('Dashboard alert sent:', alertData.event_summary);
  }

  isComplianceEvent(auditEvent) {
    const complianceEvents = [
      'data_access',
      'sensitive_data_access',
      'data_modification',
      'data_export',
      'user_management',
      'configuration_change'
    ];
    return complianceEvents.some(type => auditEvent.event_type.includes(type));
  }

  getComplianceCategory(auditEvent) {
    if (auditEvent.event_type.includes('data')) {
      return 'data_protection';
    }
    if (auditEvent.event_type.includes('auth')) {
      return 'access_control';
    }
    if (auditEvent.event_type.includes('config')) {
      return 'system_security';
    }
    return 'general';
  }

  async forwardToSIEM(auditEvent) {
    // 简化实现 - 实际应用中转发到SIEM系统
    console.log('Event forwarded to SIEM:', auditEvent.event_id);
  }

  async getAuditEvents(startDate, endDate) {
    // 简化实现 - 实际应用中从存储中查询
    return [];
  }

  analyzeSecurityEvents(auditEvents) {
    return {
      total_security_events: 0,
      critical_events: 0,
      high_risk_events: 0,
      medium_risk_events: 0,
      low_risk_events: 0
    };
  }

  analyzeAccessControl(auditEvents) {
    return {
      successful_authentications: 0,
      failed_authentications: 0,
      authorization_failures: 0,
      privilege_escalations: 0
    };
  }

  analyzeDataProtection(auditEvents) {
    return {
      data_access_events: 0,
      sensitive_data_access: 0,
      data_modifications: 0,
      data_exports: 0
    };
  }

  analyzeRiskAssessment(auditEvents) {
    return {
      overall_risk_level: 'low',
      risk_trend: 'stable',
      high_risk_users: [],
      risk_factors: []
    };
  }

  generateRecommendations(report) {
    return [
      'Implement additional monitoring for high-risk events',
      'Review and update access control policies',
      'Conduct security awareness training',
      'Enhance data protection measures'
    ];
  }

  calculateComplianceScore(metrics) {
    // 简化的合规性分数计算
    const failureRate = metrics.failed_attempts / metrics.total_events;
    const riskRate = metrics.high_risk_events / metrics.total_events;

    let score = 100;
    score -= failureRate * 20;
    score -= riskRate * 30;

    return Math.max(Math.min(score, 100), 0);
  }

  async saveComplianceReport(report) {
    // 简化实现 - 实际应用中保存到数据库
    console.log('Compliance report saved:', report.report_id);
  }
}

module.exports = AuditService;