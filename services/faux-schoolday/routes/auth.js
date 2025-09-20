/**
 * OAuth 2.0 Authentication Routes
 * 模拟 Schoolday OAuth 2.0 认证流程
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// 模拟配置
const config = {
  clientId: 'teacher-eval-demo',
  clientSecret: 'demo-client-secret',
  jwtSecret: 'faux-schoolday-secret-key',
  tokenExpiry: '1h',
  refreshTokenExpiry: '30d'
};

// 模拟的授权码存储
const authorizationCodes = new Map();
const accessTokens = new Map();
const refreshTokens = new Map();

/**
 * OAuth 2.0 服务发现端点
 */
router.get('/.well-known/oauth-authorization-server', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  res.json({
    issuer: `${baseUrl}/api/oauth`,
    authorization_endpoint: `${baseUrl}/api/oauth/authorize`,
    token_endpoint: `${baseUrl}/api/oauth/token`,
    revocation_endpoint: `${baseUrl}/api/oauth/revoke`,
    introspection_endpoint: `${baseUrl}/api/oauth/introspect`,
    userinfo_endpoint: `${baseUrl}/api/oauth/userinfo`,
    jwks_uri: `${baseUrl}/api/oauth/jwks`,
    scopes_supported: [
      'read:districts',
      'read:schools',
      'read:teachers',
      'read:courses',
      'write:evaluations',
      'openid',
      'profile',
      'email'
    ],
    response_types_supported: ['code', 'token'],
    grant_types_supported: ['authorization_code', 'client_credentials', 'refresh_token'],
    token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
    code_challenge_methods_supported: ['S256', 'plain']
  });
});

/**
 * 授权端点 - 开始 OAuth 流程
 */
router.get('/authorize', (req, res) => {
  const {
    client_id,
    redirect_uri,
    response_type,
    scope,
    state,
    code_challenge,
    code_challenge_method
  } = req.query;

  // 验证客户端
  if (client_id !== config.clientId) {
    return res.status(400).json({
      error: 'invalid_client',
      error_description: 'Invalid client_id'
    });
  }

  // 验证响应类型
  if (response_type !== 'code') {
    return res.status(400).json({
      error: 'unsupported_response_type',
      error_description: 'Only authorization code flow is supported'
    });
  }

  // 生成授权码
  const authCode = uuidv4();

  // 存储授权码信息
  authorizationCodes.set(authCode, {
    client_id,
    redirect_uri,
    scope: scope || 'read:districts read:schools read:teachers',
    code_challenge,
    code_challenge_method,
    expires_at: Date.now() + 10 * 60 * 1000, // 10分钟过期
    user_id: 'demo-user-' + uuidv4()
  });

  // 模拟用户同意页面 - 实际应用中这里会显示同意界面
  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.append('code', authCode);
  if (state) redirectUrl.searchParams.append('state', state);

  res.redirect(redirectUrl.toString());
});

/**
 * Token 端点 - 交换访问令牌
 */
router.post('/token', (req, res) => {
  const {
    grant_type,
    code,
    redirect_uri,
    client_id,
    client_secret,
    refresh_token,
    scope
  } = req.body;

  // 客户端认证
  if (client_id !== config.clientId || client_secret !== config.clientSecret) {
    return res.status(401).json({
      error: 'invalid_client',
      error_description: 'Invalid client credentials'
    });
  }

  if (grant_type === 'authorization_code') {
    // 授权码流程
    const authCodeData = authorizationCodes.get(code);

    if (!authCodeData) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Invalid authorization code'
      });
    }

    if (authCodeData.expires_at < Date.now()) {
      authorizationCodes.delete(code);
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Authorization code expired'
      });
    }

    if (authCodeData.redirect_uri !== redirect_uri) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Redirect URI mismatch'
      });
    }

    // 生成访问令牌
    const tokenData = generateTokens(authCodeData.user_id, authCodeData.scope);

    // 清理授权码
    authorizationCodes.delete(code);

    res.json(tokenData);

  } else if (grant_type === 'client_credentials') {
    // 客户端凭证流程
    const requestedScope = scope || 'read:districts read:schools';
    const tokenData = generateTokens('service-account', requestedScope);

    res.json(tokenData);

  } else if (grant_type === 'refresh_token') {
    // 刷新令牌流程
    const refreshTokenData = refreshTokens.get(refresh_token);

    if (!refreshTokenData || refreshTokenData.expires_at < Date.now()) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Invalid or expired refresh token'
      });
    }

    // 生成新的访问令牌
    const tokenData = generateTokens(refreshTokenData.user_id, refreshTokenData.scope);

    res.json(tokenData);

  } else {
    res.status(400).json({
      error: 'unsupported_grant_type',
      error_description: 'Grant type not supported'
    });
  }
});

/**
 * 令牌内省端点
 */
router.post('/introspect', authenticateClient, (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Token parameter is required'
    });
  }

  const tokenData = accessTokens.get(token);

  if (!tokenData || tokenData.expires_at < Date.now()) {
    return res.json({ active: false });
  }

  res.json({
    active: true,
    client_id: config.clientId,
    scope: tokenData.scope,
    exp: Math.floor(tokenData.expires_at / 1000),
    iat: Math.floor(tokenData.issued_at / 1000),
    sub: tokenData.user_id,
    aud: config.clientId,
    token_type: 'Bearer'
  });
});

/**
 * 用户信息端点
 */
router.get('/userinfo', authenticateToken, (req, res) => {
  const tokenData = req.tokenData;

  res.json({
    sub: tokenData.user_id,
    name: 'Demo User',
    email: 'demo.user@schoolday.com',
    email_verified: true,
    organization: 'Demo School District',
    role: 'administrator'
  });
});

/**
 * JWKS 端点 (JSON Web Key Set)
 */
router.get('/jwks', (req, res) => {
  // 在实际实现中，这里应该返回真实的公钥
  res.json({
    keys: [
      {
        kty: 'RSA',
        use: 'sig',
        kid: 'demo-key-1',
        alg: 'RS256',
        n: 'demo-modulus-value',
        e: 'AQAB'
      }
    ]
  });
});

/**
 * 令牌撤销端点
 */
router.post('/revoke', authenticateClient, (req, res) => {
  const { token, token_type_hint } = req.body;

  if (!token) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Token parameter is required'
    });
  }

  // 撤销访问令牌
  accessTokens.delete(token);

  // 如果是刷新令牌，也撤销它
  refreshTokens.delete(token);

  res.status(200).json({});
});

// 辅助函数

function generateTokens(userId, scope) {
  const accessToken = jwt.sign(
    {
      sub: userId,
      scope: scope,
      iss: 'faux-schoolday',
      aud: config.clientId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600 // 1小时
    },
    config.jwtSecret
  );

  const refreshToken = uuidv4();

  const tokenData = {
    user_id: userId,
    scope: scope,
    issued_at: Date.now(),
    expires_at: Date.now() + 3600 * 1000 // 1小时
  };

  const refreshTokenData = {
    user_id: userId,
    scope: scope,
    issued_at: Date.now(),
    expires_at: Date.now() + 30 * 24 * 3600 * 1000 // 30天
  };

  // 存储令牌
  accessTokens.set(accessToken, tokenData);
  refreshTokens.set(refreshToken, refreshTokenData);

  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: refreshToken,
    scope: scope
  };
}

function authenticateClient(req, res, next) {
  const { client_id, client_secret } = req.body;

  if (client_id !== config.clientId || client_secret !== config.clientSecret) {
    return res.status(401).json({
      error: 'invalid_client',
      error_description: 'Invalid client credentials'
    });
  }

  next();
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'invalid_token',
      error_description: 'Bearer token required'
    });
  }

  const token = authHeader.substring(7);
  const tokenData = accessTokens.get(token);

  if (!tokenData || tokenData.expires_at < Date.now()) {
    return res.status(401).json({
      error: 'invalid_token',
      error_description: 'Token is invalid or expired'
    });
  }

  req.tokenData = tokenData;
  next();
}

module.exports = router;