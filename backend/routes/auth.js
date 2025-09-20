const express = require('express');
const router = express.Router();

// Mock用户数据（在实际应用中应该存储在数据库中）
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', // 在实际应用中应该使用哈希密码
    role: 'admin',
    name: 'System Administrator',
    email: 'admin@university.edu'
  },
  {
    id: 2,
    username: 'jane.doe',
    password: 'password123',
    role: 'teacher',
    name: 'Dr. Jane Doe',
    email: 'jane.doe@university.edu',
    teacher_id: 1
  },
  {
    id: 3,
    username: 'john.smith',
    password: 'password123',
    role: 'teacher',
    name: 'Prof. John Smith',
    email: 'john.smith@university.edu',
    teacher_id: 2
  },
  {
    id: 4,
    username: 'department.head',
    password: 'password123',
    role: 'department_head',
    name: 'Dr. Robert Wilson',
    email: 'robert.wilson@university.edu',
    department: 'Computer Science'
  }
];

// 生成简单的JWT token（mock版本）
function generateMockToken(user) {
  const payload = {
    user_id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    email: user.email,
    teacher_id: user.teacher_id || null,
    department: user.department || null,
    issued_at: Date.now(),
    expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24小时
  };

  // 在实际应用中，这里应该使用真正的JWT库
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// 验证mock token
function verifyMockToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());

    // 检查token是否过期
    if (Date.now() > payload.expires_at) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

// 登录端点
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'Username and password are required'
    });
  }

  // 查找用户
  const user = mockUsers.find(u => u.username === username);

  if (!user || user.password !== password) {
    return res.status(401).json({
      error: 'authentication_failed',
      message: 'Invalid username or password'
    });
  }

  // 生成token
  const token = generateMockToken(user);

  // 返回用户信息和token（不包含密码）
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    message: 'Login successful',
    token: token,
    user: userWithoutPassword,
    expires_in: 24 * 60 * 60, // 24小时（秒）
    token_type: 'Bearer'
  });
});

// 登出端点（在mock版本中只是返回成功消息）
router.post('/logout', (req, res) => {
  // 在实际应用中，这里可能需要将token加入黑名单
  res.json({
    message: 'Logout successful'
  });
});

// 获取当前用户信息
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'No valid authorization token provided'
    });
  }

  const token = authHeader.substring(7); // 移除 "Bearer " 前缀
  const payload = verifyMockToken(token);

  if (!payload) {
    return res.status(401).json({
      error: 'invalid_token',
      message: 'Token is invalid or expired'
    });
  }

  // 返回当前用户信息
  res.json({
    user: {
      id: payload.user_id,
      username: payload.username,
      role: payload.role,
      name: payload.name,
      email: payload.email,
      teacher_id: payload.teacher_id,
      department: payload.department
    },
    token_expires_at: new Date(payload.expires_at).toISOString()
  });
});

// 刷新token
router.post('/refresh', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'No valid authorization token provided'
    });
  }

  const token = authHeader.substring(7);
  const payload = verifyMockToken(token);

  if (!payload) {
    return res.status(401).json({
      error: 'invalid_token',
      message: 'Token is invalid or expired'
    });
  }

  // 查找用户并生成新token
  const user = mockUsers.find(u => u.id === payload.user_id);
  if (!user) {
    return res.status(401).json({
      error: 'user_not_found',
      message: 'User associated with token not found'
    });
  }

  const newToken = generateMockToken(user);

  res.json({
    message: 'Token refreshed successfully',
    token: newToken,
    expires_in: 24 * 60 * 60,
    token_type: 'Bearer'
  });
});

// 验证用户权限的中间件
function checkPermission(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'No valid authorization token provided'
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyMockToken(token);

    if (!payload) {
      return res.status(401).json({
        error: 'invalid_token',
        message: 'Token is invalid or expired'
      });
    }

    // 检查用户角色
    const roleHierarchy = {
      'admin': 4,
      'department_head': 3,
      'teacher': 2,
      'student': 1
    };

    const userLevel = roleHierarchy[payload.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 999;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        error: 'insufficient_permissions',
        message: 'You do not have permission to access this resource'
      });
    }

    // 将用户信息附加到请求对象
    req.user = payload;
    next();
  };
}

// 模拟Schoolday OAuth 2.0集成
router.get('/schoolday/authorize', (req, res) => {
  const { client_id, redirect_uri, response_type, scope, state } = req.query;

  // 验证基本OAuth参数
  if (!client_id || !redirect_uri || response_type !== 'code') {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Missing or invalid OAuth parameters'
    });
  }

  // 模拟授权页面重定向
  const authCode = `mock_auth_code_${Date.now()}`;
  const redirectUrl = `${redirect_uri}?code=${authCode}&state=${state || ''}`;

  res.json({
    message: 'Authorization successful',
    redirect_url: redirectUrl,
    authorization_code: authCode
  });
});

// Schoolday OAuth Token Exchange
router.post('/schoolday/token', (req, res) => {
  const { grant_type, code, client_id, client_secret, redirect_uri } = req.body;

  if (grant_type !== 'authorization_code' || !code || !client_id) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'Invalid OAuth token request'
    });
  }

  // 模拟成功的token响应
  res.json({
    access_token: `schoolday_access_${Date.now()}`,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: `schoolday_refresh_${Date.now()}`,
    scope: 'read:teachers read:courses read:evaluations'
  });
});

// 获取可用角色列表
router.get('/roles', checkPermission('admin'), (req, res) => {
  res.json({
    roles: [
      {
        name: 'admin',
        display_name: 'System Administrator',
        level: 4,
        permissions: ['all']
      },
      {
        name: 'department_head',
        display_name: 'Department Head',
        level: 3,
        permissions: ['view_department_data', 'manage_teachers', 'generate_reports']
      },
      {
        name: 'teacher',
        display_name: 'Teacher',
        level: 2,
        permissions: ['view_own_data', 'update_profile', 'view_courses']
      },
      {
        name: 'student',
        display_name: 'Student',
        level: 1,
        permissions: ['submit_evaluations', 'view_courses']
      }
    ]
  });
});

// 更改密码
router.post('/change-password', (req, res) => {
  const authHeader = req.headers.authorization;
  const { current_password, new_password } = req.body;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'No valid authorization token provided'
    });
  }

  const token = authHeader.substring(7);
  const payload = verifyMockToken(token);

  if (!payload) {
    return res.status(401).json({
      error: 'invalid_token',
      message: 'Token is invalid or expired'
    });
  }

  if (!current_password || !new_password) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'Current password and new password are required'
    });
  }

  // 查找用户
  const user = mockUsers.find(u => u.id === payload.user_id);
  if (!user || user.password !== current_password) {
    return res.status(401).json({
      error: 'authentication_failed',
      message: 'Current password is incorrect'
    });
  }

  // 更新密码（在实际应用中应该使用哈希）
  user.password = new_password;

  res.json({
    message: 'Password changed successfully'
  });
});

// 导出中间件函数供其他路由使用
router.checkPermission = checkPermission;

module.exports = router;