/**
 * OIDC 认证服务配置
 * 集成 Keycloak 进行企业级身份认证
 */

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const axios = require('axios');

// OIDC 配置
const OIDC_CONFIG = {
  issuer: process.env.KEYCLOAK_ISSUER || 'http://localhost:8081/realms/teacher-evaluation',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'teacher-eval-api',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'api-client-secret',
  jwksUri: process.env.KEYCLOAK_JWKS_URI || 'http://localhost:8081/realms/teacher-evaluation/protocol/openid-connect/certs',
  tokenEndpoint: process.env.KEYCLOAK_TOKEN_ENDPOINT || 'http://localhost:8081/realms/teacher-evaluation/protocol/openid-connect/token',
  userInfoEndpoint: process.env.KEYCLOAK_USERINFO_ENDPOINT || 'http://localhost:8081/realms/teacher-evaluation/protocol/openid-connect/userinfo',
  logoutEndpoint: process.env.KEYCLOAK_LOGOUT_ENDPOINT || 'http://localhost:8081/realms/teacher-evaluation/protocol/openid-connect/logout',
  introspectionEndpoint: process.env.KEYCLOAK_INTROSPECTION_ENDPOINT || 'http://localhost:8081/realms/teacher-evaluation/protocol/openid-connect/token/introspect'
};

// JWKS 客户端配置（用于验证 JWT 签名）
const jwksClientConfig = jwksClient({
  jwksUri: OIDC_CONFIG.jwksUri,
  requestHeaders: {},
  timeout: 30000,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10分钟缓存
  rateLimit: true,
  jwksRequestsPerMinute: 5
});

/**
 * 获取 JWT 签名密钥
 * @param {string} kid - Key ID
 * @returns {Promise<string>} 签名密钥
 */
function getKey(kid) {
  return new Promise((resolve, reject) => {
    jwksClientConfig.getSigningKey(kid, (err, key) => {
      if (err) {
        reject(err);
      } else {
        const signingKey = key.publicKey || key.rsaPublicKey;
        resolve(signingKey);
      }
    });
  });
}

/**
 * 验证 JWT Token
 * @param {string} token - JWT Token
 * @returns {Promise<Object>} 解码后的 token 负载
 */
async function verifyToken(token) {
  try {
    // 解码 token 头部获取 kid
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || !decoded.header || !decoded.header.kid) {
      throw new Error('Invalid token: missing kid in header');
    }

    // 获取签名密钥
    const signingKey = await getKey(decoded.header.kid);

    // 验证 token
    const payload = jwt.verify(token, signingKey, {
      issuer: OIDC_CONFIG.issuer,
      audience: OIDC_CONFIG.clientId,
      algorithms: ['RS256', 'RS384', 'RS512']
    });

    return payload;

  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw error;
  }
}

/**
 * 验证和解析用户权限
 * @param {Object} tokenPayload - JWT payload
 * @returns {Object} 用户信息和权限
 */
function parseUserFromToken(tokenPayload) {
  const realmAccess = tokenPayload.realm_access || {};
  const resourceAccess = tokenPayload.resource_access || {};
  const clientAccess = resourceAccess[OIDC_CONFIG.clientId] || {};

  return {
    user_id: tokenPayload.sub,
    username: tokenPayload.preferred_username,
    email: tokenPayload.email,
    name: tokenPayload.name,
    given_name: tokenPayload.given_name,
    family_name: tokenPayload.family_name,

    // 自定义属性
    teacher_id: tokenPayload.teacher_id,
    employee_id: tokenPayload.employee_id,
    department: tokenPayload.department,
    position: tokenPayload.position,

    // 权限和角色
    realm_roles: realmAccess.roles || [],
    client_roles: clientAccess.roles || [],
    roles: [...(realmAccess.roles || []), ...(clientAccess.roles || [])],

    // Token 信息
    issued_at: tokenPayload.iat,
    expires_at: tokenPayload.exp,
    issuer: tokenPayload.iss,

    // 会话信息
    session_id: tokenPayload.sid,
    session_state: tokenPayload.session_state
  };
}

/**
 * Express 中间件：验证 Bearer Token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'No valid authorization token provided'
    });
  }

  const token = authHeader.substring(7); // 移除 "Bearer " 前缀

  verifyToken(token)
    .then(payload => {
      req.user = parseUserFromToken(payload);
      req.tokenPayload = payload;
      next();
    })
    .catch(error => {
      console.error('Authentication failed:', error.message);
      res.status(401).json({
        error: 'invalid_token',
        message: 'Token is invalid or expired',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
}

/**
 * 权限检查中间件工厂
 * @param {string|Array} requiredRoles - 需要的角色
 * @param {Object} options - 选项
 * @returns {Function} Express 中间件
 */
function requireRoles(requiredRoles, options = {}) {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const requireAll = options.requireAll || false; // 是否需要所有角色

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Authentication required'
      });
    }

    const userRoles = req.user.roles || [];

    const hasRequiredRoles = requireAll
      ? roles.every(role => userRoles.includes(role))
      : roles.some(role => userRoles.includes(role));

    if (!hasRequiredRoles) {
      return res.status(403).json({
        error: 'insufficient_permissions',
        message: 'You do not have the required permissions',
        required_roles: roles,
        user_roles: userRoles
      });
    }

    next();
  };
}

/**
 * 部门权限检查中间件
 * @param {Object} options - 选项
 * @returns {Function} Express 中间件
 */
function requireDepartmentAccess(options = {}) {
  return (req, res, next) => {
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

    // 从请求中获取目标部门
    const targetDepartment = req.params.department || req.query.department || req.body.department;
    const userDepartment = req.user.department;

    // 如果没有指定部门，且用户有部门，限制为用户部门
    if (!targetDepartment && userDepartment) {
      req.query.department = userDepartment;
      return next();
    }

    // 检查部门权限
    if (targetDepartment && targetDepartment !== userDepartment) {
      // 部门主管可以访问自己的部门
      if (req.user.roles.includes('department_head') && targetDepartment === userDepartment) {
        return next();
      }

      return res.status(403).json({
        error: 'department_access_denied',
        message: 'You can only access data from your own department',
        user_department: userDepartment,
        requested_department: targetDepartment
      });
    }

    next();
  };
}

/**
 * 教师数据访问权限检查
 * @param {Object} options - 选项
 * @returns {Function} Express 中间件
 */
function requireTeacherAccess(options = {}) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Authentication required'
      });
    }

    // 管理员可以访问所有教师数据
    if (req.user.roles.includes('admin')) {
      return next();
    }

    const targetTeacherId = req.params.teacher_id || req.params.teacherId || req.body.teacher_id;
    const userTeacherId = req.user.teacher_id;

    // 教师只能访问自己的数据
    if (req.user.roles.includes('teacher') && !req.user.roles.includes('department_head')) {
      if (targetTeacherId && targetTeacherId !== userTeacherId) {
        return res.status(403).json({
          error: 'teacher_access_denied',
          message: 'You can only access your own data'
        });
      }

      // 如果没有指定教师ID，自动设置为当前用户
      if (!targetTeacherId && userTeacherId) {
        if (req.params.teacher_id !== undefined) req.params.teacher_id = userTeacherId;
        if (req.params.teacherId !== undefined) req.params.teacherId = userTeacherId;
        if (req.body.teacher_id !== undefined) req.body.teacher_id = userTeacherId;
        if (req.query.teacher_id !== undefined) req.query.teacher_id = userTeacherId;
      }
    }

    next();
  };
}

/**
 * 获取用户信息（从 Keycloak UserInfo 端点）
 * @param {string} accessToken - Access Token
 * @returns {Promise<Object>} 用户信息
 */
async function getUserInfo(accessToken) {
  try {
    const response = await axios.get(OIDC_CONFIG.userInfoEndpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    return response.data;

  } catch (error) {
    console.error('Failed to get user info:', error.message);
    throw new Error('Failed to retrieve user information');
  }
}

/**
 * 注销用户（撤销 token）
 * @param {string} refreshToken - Refresh Token
 * @returns {Promise<void>}
 */
async function logoutUser(refreshToken) {
  try {
    await axios.post(OIDC_CONFIG.logoutEndpoint, new URLSearchParams({
      client_id: OIDC_CONFIG.clientId,
      client_secret: OIDC_CONFIG.clientSecret,
      refresh_token: refreshToken
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

  } catch (error) {
    console.error('Logout failed:', error.message);
    throw new Error('Failed to logout user');
  }
}

/**
 * 内省 token（检查 token 状态）
 * @param {string} token - Token
 * @returns {Promise<Object>} Token 状态信息
 */
async function introspectToken(token) {
  try {
    const response = await axios.post(OIDC_CONFIG.introspectionEndpoint, new URLSearchParams({
      client_id: OIDC_CONFIG.clientId,
      client_secret: OIDC_CONFIG.clientSecret,
      token: token
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;

  } catch (error) {
    console.error('Token introspection failed:', error.message);
    throw new Error('Failed to introspect token');
  }
}

module.exports = {
  OIDC_CONFIG,
  verifyToken,
  parseUserFromToken,
  authenticateToken,
  requireRoles,
  requireDepartmentAccess,
  requireTeacherAccess,
  getUserInfo,
  logoutUser,
  introspectToken
};