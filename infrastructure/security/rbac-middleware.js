/**
 * 基于角色的访问控制 (RBAC) 中间件
 * 提供细粒度的权限控制和资源访问管理
 */

const jwt = require('jsonwebtoken');
const AuditService = require('../services/audit/audit-service');

class RBACMiddleware {
  constructor(config = {}) {
    this.config = {
      jwt_secret: config.jwt_secret || process.env.JWT_SECRET,
      issuer: config.issuer || 'http://localhost:8081/realms/teacher-evaluation',
      audience: config.audience || ['teacher-eval-frontend', 'teacher-eval-api'],
      enable_audit: config.enable_audit !== false,
      ...config
    };

    this.auditService = new AuditService();
    this.permissions = new Map();
    this.roleHierarchy = new Map();
    this.resourcePolicies = new Map();

    this.initializePermissions();
    this.initializeRoleHierarchy();
    this.initializeResourcePolicies();
  }

  /**
   * 初始化权限定义
   */
  initializePermissions() {
    // 系统级权限
    this.permissions.set('system:read', {
      name: 'System Read',
      description: 'Read system configuration and status',
      category: 'system'
    });

    this.permissions.set('system:write', {
      name: 'System Write',
      description: 'Modify system configuration',
      category: 'system'
    });

    this.permissions.set('system:admin', {
      name: 'System Administration',
      description: 'Full system administration access',
      category: 'system'
    });

    // 用户管理权限
    this.permissions.set('users:read', {
      name: 'User Read',
      description: 'View user information',
      category: 'user_management'
    });

    this.permissions.set('users:write', {
      name: 'User Write',
      description: 'Create and modify user accounts',
      category: 'user_management'
    });

    this.permissions.set('users:delete', {
      name: 'User Delete',
      description: 'Delete user accounts',
      category: 'user_management'
    });

    // 评价数据权限
    this.permissions.set('evaluations:read', {
      name: 'Evaluation Read',
      description: 'View evaluation data',
      category: 'evaluations'
    });

    this.permissions.set('evaluations:write', {
      name: 'Evaluation Write',
      description: 'Submit and modify evaluations',
      category: 'evaluations'
    });

    this.permissions.set('evaluations:delete', {
      name: 'Evaluation Delete',
      description: 'Delete evaluation records',
      category: 'evaluations'
    });

    // 教师数据权限
    this.permissions.set('teachers:read', {
      name: 'Teacher Read',
      description: 'View teacher information',
      category: 'teachers'
    });

    this.permissions.set('teachers:write', {
      name: 'Teacher Write',
      description: 'Modify teacher information',
      category: 'teachers'
    });

    this.permissions.set('teachers:manage', {
      name: 'Teacher Management',
      description: 'Full teacher management access',
      category: 'teachers'
    });

    // 报告权限
    this.permissions.set('reports:read', {
      name: 'Report Read',
      description: 'View reports',
      category: 'reports'
    });

    this.permissions.set('reports:generate', {
      name: 'Report Generate',
      description: 'Generate new reports',
      category: 'reports'
    });

    this.permissions.set('reports:export', {
      name: 'Report Export',
      description: 'Export report data',
      category: 'reports'
    });

    // 分析权限
    this.permissions.set('analytics:read', {
      name: 'Analytics Read',
      description: 'View analytics data',
      category: 'analytics'
    });

    this.permissions.set('analytics:advanced', {
      name: 'Advanced Analytics',
      description: 'Access advanced analytics features',
      category: 'analytics'
    });

    // 审计权限
    this.permissions.set('audit:read', {
      name: 'Audit Read',
      description: 'View audit logs',
      category: 'audit'
    });

    this.permissions.set('audit:export', {
      name: 'Audit Export',
      description: 'Export audit data',
      category: 'audit'
    });
  }

  /**
   * 初始化角色层次结构
   */
  initializeRoleHierarchy() {
    // 管理员角色 - 最高权限
    this.roleHierarchy.set('admin', {
      name: 'System Administrator',
      permissions: [
        'system:read', 'system:write', 'system:admin',
        'users:read', 'users:write', 'users:delete',
        'evaluations:read', 'evaluations:write', 'evaluations:delete',
        'teachers:read', 'teachers:write', 'teachers:manage',
        'reports:read', 'reports:generate', 'reports:export',
        'analytics:read', 'analytics:advanced',
        'audit:read', 'audit:export'
      ],
      inherits: [],
      resource_restrictions: {}
    });

    // 部门主管角色
    this.roleHierarchy.set('department_head', {
      name: 'Department Head',
      permissions: [
        'system:read',
        'users:read',
        'evaluations:read', 'evaluations:write',
        'teachers:read', 'teachers:write', 'teachers:manage',
        'reports:read', 'reports:generate', 'reports:export',
        'analytics:read', 'analytics:advanced'
      ],
      inherits: [],
      resource_restrictions: {
        department_scope: true,
        own_department_only: true
      }
    });

    // 教师角色
    this.roleHierarchy.set('teacher', {
      name: 'Teacher',
      permissions: [
        'system:read',
        'evaluations:read',
        'teachers:read',
        'reports:read',
        'analytics:read'
      ],
      inherits: [],
      resource_restrictions: {
        self_data_only: true,
        own_courses_only: true
      }
    });

    // 评价员角色
    this.roleHierarchy.set('evaluator', {
      name: 'Evaluator',
      permissions: [
        'system:read',
        'evaluations:read', 'evaluations:write',
        'teachers:read',
        'reports:read'
      ],
      inherits: [],
      resource_restrictions: {
        assigned_teachers_only: true,
        evaluation_period_only: true
      }
    });

    // 只读用户角色
    this.roleHierarchy.set('viewer', {
      name: 'Viewer',
      permissions: [
        'system:read',
        'evaluations:read',
        'teachers:read',
        'reports:read'
      ],
      inherits: [],
      resource_restrictions: {
        read_only: true,
        department_scope: true
      }
    });
  }

  /**
   * 初始化资源策略
   */
  initializeResourcePolicies() {
    // 教师数据访问策略
    this.resourcePolicies.set('teacher_data', {
      name: 'Teacher Data Access Policy',
      rules: [
        {
          condition: 'user.role === "admin"',
          effect: 'allow',
          resources: ['*']
        },
        {
          condition: 'user.role === "department_head" && user.department === resource.department',
          effect: 'allow',
          resources: ['teacher_profile', 'teacher_evaluations', 'teacher_courses']
        },
        {
          condition: 'user.role === "teacher" && user.teacher_id === resource.teacher_id',
          effect: 'allow',
          resources: ['own_profile', 'own_evaluations', 'own_courses']
        },
        {
          condition: 'user.role === "evaluator" && resource.teacher_id IN user.assigned_teachers',
          effect: 'allow',
          resources: ['teacher_profile', 'evaluation_forms']
        }
      ],
      default_effect: 'deny'
    });

    // 评价数据访问策略
    this.resourcePolicies.set('evaluation_data', {
      name: 'Evaluation Data Access Policy',
      rules: [
        {
          condition: 'user.role === "admin"',
          effect: 'allow',
          resources: ['*']
        },
        {
          condition: 'user.role === "department_head" && user.department === resource.department',
          effect: 'allow',
          resources: ['department_evaluations', 'evaluation_reports']
        },
        {
          condition: 'user.role === "teacher" && user.teacher_id === resource.teacher_id',
          effect: 'allow',
          resources: ['own_evaluations']
        },
        {
          condition: 'user.role === "evaluator" && user.user_id === resource.evaluator_id',
          effect: 'allow',
          resources: ['submitted_evaluations', 'evaluation_forms']
        }
      ],
      default_effect: 'deny'
    });

    // 报告访问策略
    this.resourcePolicies.set('report_data', {
      name: 'Report Access Policy',
      rules: [
        {
          condition: 'user.role === "admin"',
          effect: 'allow',
          resources: ['*']
        },
        {
          condition: 'user.role === "department_head" && user.department === resource.department',
          effect: 'allow',
          resources: ['department_reports', 'teacher_reports']
        },
        {
          condition: 'user.role === "teacher" && user.teacher_id === resource.teacher_id',
          effect: 'allow',
          resources: ['personal_reports']
        }
      ],
      default_effect: 'deny'
    });

    // 系统配置访问策略
    this.resourcePolicies.set('system_config', {
      name: 'System Configuration Access Policy',
      rules: [
        {
          condition: 'user.role === "admin"',
          effect: 'allow',
          resources: ['*']
        },
        {
          condition: 'user.role === "department_head"',
          effect: 'allow',
          resources: ['department_settings']
        }
      ],
      default_effect: 'deny'
    });
  }

  /**
   * JWT认证中间件
   */
  authenticate() {
    return async (req, res, next) => {
      try {
        const token = this.extractToken(req);

        if (!token) {
          await this.logAuditEvent(req, {
            event_type: 'authentication_failure',
            reason: 'missing_token',
            result_status: 'failed'
          });

          return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentication token required'
          });
        }

        // 验证JWT token
        const decoded = jwt.verify(token, this.config.jwt_secret, {
          issuer: this.config.issuer,
          audience: this.config.audience
        });

        // 提取用户信息
        const user = await this.extractUserFromToken(decoded);

        // 检查用户状态
        if (!user.active) {
          await this.logAuditEvent(req, {
            event_type: 'authentication_failure',
            user_id: user.user_id,
            reason: 'user_inactive',
            result_status: 'failed'
          });

          return res.status(401).json({
            error: 'unauthorized',
            message: 'User account is inactive'
          });
        }

        // 设置用户上下文
        req.user = user;
        req.token = token;

        await this.logAuditEvent(req, {
          event_type: 'authentication_success',
          user_id: user.user_id,
          result_status: 'success'
        });

        next();

      } catch (error) {
        await this.logAuditEvent(req, {
          event_type: 'authentication_failure',
          reason: error.name,
          error_message: error.message,
          result_status: 'failed'
        });

        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'token_expired',
            message: 'Authentication token has expired'
          });
        }

        if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({
            error: 'invalid_token',
            message: 'Invalid authentication token'
          });
        }

        return res.status(401).json({
          error: 'authentication_error',
          message: 'Authentication failed'
        });
      }
    };
  }

  /**
   * 权限检查中间件工厂
   */
  requirePermission(permission, options = {}) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentication required'
          });
        }

        const hasPermission = await this.checkPermission(req.user, permission, req, options);

        if (!hasPermission) {
          await this.logAuditEvent(req, {
            event_type: 'authorization_denied',
            user_id: req.user.user_id,
            required_permission: permission,
            result_status: 'failed'
          });

          return res.status(403).json({
            error: 'insufficient_permissions',
            message: `Permission '${permission}' required`,
            required_permission: permission
          });
        }

        await this.logAuditEvent(req, {
          event_type: 'authorization_granted',
          user_id: req.user.user_id,
          granted_permission: permission,
          result_status: 'success'
        });

        next();

      } catch (error) {
        await this.logAuditEvent(req, {
          event_type: 'authorization_error',
          user_id: req.user?.user_id,
          permission: permission,
          error_message: error.message,
          result_status: 'error'
        });

        return res.status(500).json({
          error: 'authorization_error',
          message: 'Failed to check permissions'
        });
      }
    };
  }

  /**
   * 多权限检查中间件
   */
  requireAnyPermission(permissions, options = {}) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentication required'
          });
        }

        let hasAnyPermission = false;
        for (const permission of permissions) {
          if (await this.checkPermission(req.user, permission, req, options)) {
            hasAnyPermission = true;
            break;
          }
        }

        if (!hasAnyPermission) {
          await this.logAuditEvent(req, {
            event_type: 'authorization_denied',
            user_id: req.user.user_id,
            required_permissions: permissions,
            result_status: 'failed'
          });

          return res.status(403).json({
            error: 'insufficient_permissions',
            message: 'One of the following permissions required',
            required_permissions: permissions
          });
        }

        next();

      } catch (error) {
        return res.status(500).json({
          error: 'authorization_error',
          message: 'Failed to check permissions'
        });
      }
    };
  }

  /**
   * 资源访问控制中间件
   */
  requireResourceAccess(resourceType, options = {}) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentication required'
          });
        }

        const hasAccess = await this.checkResourceAccess(req.user, resourceType, req, options);

        if (!hasAccess) {
          await this.logAuditEvent(req, {
            event_type: 'resource_access_denied',
            user_id: req.user.user_id,
            resource_type: resourceType,
            resource_id: this.extractResourceId(req, options),
            result_status: 'failed'
          });

          return res.status(403).json({
            error: 'resource_access_denied',
            message: `Access to ${resourceType} denied`,
            resource_type: resourceType
          });
        }

        await this.logAuditEvent(req, {
          event_type: 'resource_access_granted',
          user_id: req.user.user_id,
          resource_type: resourceType,
          resource_id: this.extractResourceId(req, options),
          result_status: 'success'
        });

        next();

      } catch (error) {
        return res.status(500).json({
          error: 'resource_access_error',
          message: 'Failed to check resource access'
        });
      }
    };
  }

  /**
   * 部门范围访问控制中间件
   */
  requireDepartmentAccess(options = {}) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentication required'
          });
        }

        // 管理员可以访问所有部门
        if (req.user.roles.includes('admin')) {
          return next();
        }

        const targetDepartment = this.extractDepartment(req, options);
        const userDepartment = req.user.department;

        // 检查部门访问权限
        if (targetDepartment && targetDepartment !== userDepartment) {
          // 部门主管可以访问自己的部门
          if (req.user.roles.includes('department_head') && targetDepartment === userDepartment) {
            return next();
          }

          await this.logAuditEvent(req, {
            event_type: 'department_access_denied',
            user_id: req.user.user_id,
            user_department: userDepartment,
            requested_department: targetDepartment,
            result_status: 'failed'
          });

          return res.status(403).json({
            error: 'department_access_denied',
            message: 'You can only access data from your own department',
            user_department: userDepartment,
            requested_department: targetDepartment
          });
        }

        // 如果没有指定部门，限制为用户部门
        if (!targetDepartment && userDepartment) {
          req.query.department = userDepartment;
        }

        next();

      } catch (error) {
        return res.status(500).json({
          error: 'department_access_error',
          message: 'Failed to check department access'
        });
      }
    };
  }

  /**
   * 检查用户权限
   */
  async checkPermission(user, permission, req = null, options = {}) {
    try {
      // 获取用户的所有权限
      const userPermissions = await this.getUserPermissions(user);

      // 直接权限检查
      if (userPermissions.includes(permission)) {
        return true;
      }

      // 通配符权限检查
      const wildcardPermissions = userPermissions.filter(p => p.endsWith(':*'));
      for (const wildcardPerm of wildcardPermissions) {
        const prefix = wildcardPerm.slice(0, -1); // 移除 '*'
        if (permission.startsWith(prefix)) {
          return true;
        }
      }

      return false;

    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * 检查资源访问权限
   */
  async checkResourceAccess(user, resourceType, req, options = {}) {
    try {
      const policy = this.resourcePolicies.get(resourceType);
      if (!policy) {
        console.warn(`No policy found for resource type: ${resourceType}`);
        return false;
      }

      // 构建评估上下文
      const context = {
        user: user,
        resource: this.extractResourceContext(req, options),
        request: req,
        time: new Date()
      };

      // 评估策略规则
      for (const rule of policy.rules) {
        try {
          const conditionResult = this.evaluateCondition(rule.condition, context);

          if (conditionResult) {
            if (rule.effect === 'allow') {
              // 检查资源匹配
              if (this.matchesResources(rule.resources, context.resource, options)) {
                return true;
              }
            } else if (rule.effect === 'deny') {
              return false;
            }
          }
        } catch (error) {
          console.error(`Rule evaluation failed for condition: ${rule.condition}`, error);
          continue;
        }
      }

      // 默认效果
      return policy.default_effect === 'allow';

    } catch (error) {
      console.error('Resource access check failed:', error);
      return false;
    }
  }

  /**
   * 获取用户的所有权限
   */
  async getUserPermissions(user) {
    const permissions = new Set();

    // 从用户角色获取权限
    for (const role of user.roles) {
      const roleConfig = this.roleHierarchy.get(role);
      if (roleConfig) {
        roleConfig.permissions.forEach(permission => permissions.add(permission));

        // 处理角色继承
        for (const inheritedRole of roleConfig.inherits) {
          const inheritedConfig = this.roleHierarchy.get(inheritedRole);
          if (inheritedConfig) {
            inheritedConfig.permissions.forEach(permission => permissions.add(permission));
          }
        }
      }
    }

    // 添加直接分配的权限（如果有）
    if (user.direct_permissions) {
      user.direct_permissions.forEach(permission => permissions.add(permission));
    }

    return Array.from(permissions);
  }

  /**
   * 提取JWT token
   */
  extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 检查查询参数中的token（仅用于特殊情况）
    if (req.query.token) {
      return req.query.token;
    }

    return null;
  }

  /**
   * 从token提取用户信息
   */
  async extractUserFromToken(decoded) {
    return {
      user_id: decoded.sub,
      username: decoded.preferred_username,
      email: decoded.email,
      name: decoded.name,
      roles: [...(decoded.realm_access?.roles || []), ...(decoded.resource_access?.['teacher-eval-api']?.roles || [])],
      department: decoded.department,
      teacher_id: decoded.teacher_id,
      employee_id: decoded.employee_id,
      position: decoded.position,
      active: true, // 假设从Keycloak来的token代表活跃用户
      session_id: decoded.sid,
      issued_at: decoded.iat,
      expires_at: decoded.exp
    };
  }

  /**
   * 提取资源上下文
   */
  extractResourceContext(req, options = {}) {
    const context = {
      path: req.path,
      method: req.method,
      params: req.params,
      query: req.query,
      body: req.body
    };

    // 提取特定资源标识符
    if (options.resource_id_param) {
      context.resource_id = req.params[options.resource_id_param];
    }

    if (options.department_param) {
      context.department = req.params[options.department_param] || req.query[options.department_param];
    }

    if (options.teacher_id_param) {
      context.teacher_id = req.params[options.teacher_id_param] || req.query[options.teacher_id_param];
    }

    return context;
  }

  /**
   * 提取资源ID
   */
  extractResourceId(req, options = {}) {
    if (options.resource_id_param) {
      return req.params[options.resource_id_param];
    }

    // 尝试从常见参数中提取
    return req.params.id || req.params.resourceId || req.query.id;
  }

  /**
   * 提取部门信息
   */
  extractDepartment(req, options = {}) {
    if (options.department_param) {
      return req.params[options.department_param] || req.query[options.department_param];
    }

    return req.params.department || req.query.department || req.body.department;
  }

  /**
   * 评估条件表达式
   */
  evaluateCondition(condition, context) {
    try {
      // 简化的条件评估器
      // 实际应用中应该使用更安全的表达式解析器

      // 替换变量
      let expression = condition
        .replace(/user\.(\w+)/g, (match, prop) => {
          const value = context.user[prop];
          return typeof value === 'string' ? `"${value}"` : String(value);
        })
        .replace(/resource\.(\w+)/g, (match, prop) => {
          const value = context.resource[prop];
          return typeof value === 'string' ? `"${value}"` : String(value);
        });

      // 处理 IN 操作符
      expression = expression.replace(/(\w+)\s+IN\s+(\w+)/g, (match, item, array) => {
        return `${array}.includes(${item})`;
      });

      // 评估表达式
      return Function(`"use strict"; return (${expression})`)();

    } catch (error) {
      console.error('Condition evaluation failed:', error);
      return false;
    }
  }

  /**
   * 检查资源匹配
   */
  matchesResources(allowedResources, resourceContext, options = {}) {
    if (allowedResources.includes('*')) {
      return true;
    }

    const requestedResource = options.resource_name || resourceContext.path;
    return allowedResources.some(resource => {
      if (resource === requestedResource) {
        return true;
      }

      // 通配符匹配
      if (resource.endsWith('*')) {
        const prefix = resource.slice(0, -1);
        return requestedResource.startsWith(prefix);
      }

      return false;
    });
  }

  /**
   * 记录审计事件
   */
  async logAuditEvent(req, eventData) {
    if (!this.config.enable_audit) {
      return;
    }

    try {
      const auditEvent = {
        ...eventData,
        user_id: req.user?.user_id || 'anonymous',
        session_id: req.user?.session_id || 'unknown',
        source_ip: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent') || 'unknown',
        resource_accessed: req.path,
        action_performed: req.method,
        correlation_id: req.headers['x-correlation-id'] || req.headers['x-request-id'],
        timestamp: new Date().toISOString()
      };

      await this.auditService.logAuditEvent(auditEvent);

    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  /**
   * 获取用户权限列表
   */
  async getUserPermissionList(user) {
    return await this.getUserPermissions(user);
  }

  /**
   * 获取角色配置
   */
  getRoleConfiguration(role) {
    return this.roleHierarchy.get(role);
  }

  /**
   * 获取权限配置
   */
  getPermissionConfiguration(permission) {
    return this.permissions.get(permission);
  }

  /**
   * 获取资源策略
   */
  getResourcePolicy(resourceType) {
    return this.resourcePolicies.get(resourceType);
  }
}

module.exports = RBACMiddleware;