/**
 * 前端 OIDC 认证配置
 * 使用 Keycloak 进行单点登录
 */

import Keycloak from 'keycloak-js';

// Keycloak 配置
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8081',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'teacher-evaluation',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'teacher-eval-frontend',
};

// 初始化选项
const initOptions = {
  onLoad: 'check-sso', // 检查 SSO 状态
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  checkLoginIframe: false, // 禁用 iframe 检查以避免跨域问题
  flow: 'standard', // 使用标准授权码流程
  pkceMethod: 'S256', // 启用 PKCE
  responseMode: 'fragment',
  enableLogging: import.meta.env.DEV,
};

// 创建 Keycloak 实例
const keycloak = new Keycloak(keycloakConfig);

/**
 * 认证状态管理类
 */
class AuthManager {
  constructor() {
    this.keycloak = keycloak;
    this.authenticated = false;
    this.user = null;
    this.roles = [];
    this.permissions = new Set();
    this.callbacks = {
      onAuthSuccess: [],
      onAuthError: [],
      onAuthLogout: [],
      onTokenExpired: [],
    };
  }

  /**
   * 初始化认证系统
   * @returns {Promise<boolean>} 是否已认证
   */
  async initialize() {
    try {
      console.log('🔐 初始化认证系统...');

      this.authenticated = await this.keycloak.init(initOptions);

      if (this.authenticated) {
        await this.loadUserProfile();
        this.setupTokenRefresh();
        this.triggerCallbacks('onAuthSuccess', this.user);
        console.log('✅ 用户已认证:', this.user?.preferred_username);
      } else {
        console.log('ℹ️ 用户未认证');
      }

      // 设置事件监听器
      this.setupEventListeners();

      return this.authenticated;

    } catch (error) {
      console.error('❌ 认证初始化失败:', error);
      this.triggerCallbacks('onAuthError', error);
      throw error;
    }
  }

  /**
   * 加载用户配置文件
   */
  async loadUserProfile() {
    try {
      const profile = await this.keycloak.loadUserProfile();
      const tokenParsed = this.keycloak.tokenParsed;

      this.user = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        name: `${profile.firstName} ${profile.lastName}`.trim(),

        // 从 token 中提取自定义属性
        teacherId: tokenParsed?.teacher_id,
        employeeId: tokenParsed?.employee_id,
        department: tokenParsed?.department,
        position: tokenParsed?.position,

        // 权限信息
        realmRoles: tokenParsed?.realm_access?.roles || [],
        clientRoles: tokenParsed?.resource_access?.[keycloakConfig.clientId]?.roles || [],
      };

      // 合并所有角色
      this.roles = [
        ...(this.user.realmRoles || []),
        ...(this.user.clientRoles || [])
      ];

      // 计算权限
      this.calculatePermissions();

      console.log('👤 用户配置文件已加载:', {
        username: this.user.username,
        roles: this.roles,
        department: this.user.department,
        position: this.user.position
      });

    } catch (error) {
      console.error('❌ 加载用户配置文件失败:', error);
      throw error;
    }
  }

  /**
   * 计算用户权限
   */
  calculatePermissions() {
    this.permissions.clear();

    // 基于角色的权限
    if (this.hasRole('admin')) {
      this.permissions.add('read:all');
      this.permissions.add('write:all');
      this.permissions.add('delete:all');
      this.permissions.add('manage:users');
      this.permissions.add('manage:system');
    }

    if (this.hasRole('department_head')) {
      this.permissions.add('read:department');
      this.permissions.add('write:department');
      this.permissions.add('manage:teachers');
      this.permissions.add('generate:reports');
    }

    if (this.hasRole('teacher')) {
      this.permissions.add('read:own');
      this.permissions.add('write:own');
      this.permissions.add('view:courses');
      this.permissions.add('update:profile');
    }

    if (this.hasRole('evaluator')) {
      this.permissions.add('submit:evaluations');
      this.permissions.add('view:evaluation_forms');
    }

    console.log('🔑 用户权限已计算:', Array.from(this.permissions));
  }

  /**
   * 设置 token 自动刷新
   */
  setupTokenRefresh() {
    // 在 token 过期前 30 秒刷新
    const refreshInterval = Math.max(
      (this.keycloak.tokenParsed.exp - this.keycloak.tokenParsed.iat - 30) * 1000,
      60000 // 最少1分钟
    );

    setInterval(async () => {
      try {
        const refreshed = await this.keycloak.updateToken(30);
        if (refreshed) {
          console.log('🔄 Token 已刷新');
          await this.loadUserProfile(); // 重新加载用户配置文件
        }
      } catch (error) {
        console.error('❌ Token 刷新失败:', error);
        this.triggerCallbacks('onTokenExpired', error);
        await this.logout();
      }
    }, refreshInterval);
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    this.keycloak.onTokenExpired = () => {
      console.log('⏰ Token 已过期');
      this.triggerCallbacks('onTokenExpired');
    };

    this.keycloak.onAuthSuccess = () => {
      console.log('✅ 认证成功');
    };

    this.keycloak.onAuthError = (error) => {
      console.error('❌ 认证错误:', error);
      this.triggerCallbacks('onAuthError', error);
    };

    this.keycloak.onAuthLogout = () => {
      console.log('👋 用户已登出');
      this.authenticated = false;
      this.user = null;
      this.roles = [];
      this.permissions.clear();
      this.triggerCallbacks('onAuthLogout');
    };
  }

  /**
   * 登录
   * @param {Object} options - 登录选项
   */
  async login(options = {}) {
    try {
      await this.keycloak.login({
        redirectUri: window.location.origin + '/',
        prompt: 'login',
        ...options
      });
    } catch (error) {
      console.error('❌ 登录失败:', error);
      throw error;
    }
  }

  /**
   * 登出
   * @param {Object} options - 登出选项
   */
  async logout(options = {}) {
    try {
      await this.keycloak.logout({
        redirectUri: window.location.origin + '/',
        ...options
      });
    } catch (error) {
      console.error('❌ 登出失败:', error);
      throw error;
    }
  }

  /**
   * 获取访问令牌
   * @returns {string|null} 访问令牌
   */
  getToken() {
    return this.authenticated ? this.keycloak.token : null;
  }

  /**
   * 获取刷新令牌
   * @returns {string|null} 刷新令牌
   */
  getRefreshToken() {
    return this.authenticated ? this.keycloak.refreshToken : null;
  }

  /**
   * 检查是否已认证
   * @returns {boolean} 是否已认证
   */
  isAuthenticated() {
    return this.authenticated && this.keycloak.authenticated;
  }

  /**
   * 检查用户是否具有指定角色
   * @param {string|Array} roles - 角色或角色数组
   * @param {boolean} requireAll - 是否需要所有角色
   * @returns {boolean} 是否具有角色
   */
  hasRole(roles, requireAll = false) {
    if (!this.isAuthenticated()) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];

    return requireAll
      ? roleArray.every(role => this.roles.includes(role))
      : roleArray.some(role => this.roles.includes(role));
  }

  /**
   * 检查用户是否具有指定权限
   * @param {string|Array} permissions - 权限或权限数组
   * @param {boolean} requireAll - 是否需要所有权限
   * @returns {boolean} 是否具有权限
   */
  hasPermission(permissions, requireAll = false) {
    if (!this.isAuthenticated()) return false;

    const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

    return requireAll
      ? permissionArray.every(permission => this.permissions.has(permission))
      : permissionArray.some(permission => this.permissions.has(permission));
  }

  /**
   * 检查用户是否可以访问指定部门的数据
   * @param {string} department - 部门名称
   * @returns {boolean} 是否可以访问
   */
  canAccessDepartment(department) {
    if (!this.isAuthenticated()) return false;
    if (this.hasRole('admin')) return true;
    if (this.hasRole('department_head') && this.user.department === department) return true;
    if (this.hasRole('teacher') && this.user.department === department) return true;
    return false;
  }

  /**
   * 检查用户是否可以访问指定教师的数据
   * @param {string} teacherId - 教师ID
   * @returns {boolean} 是否可以访问
   */
  canAccessTeacher(teacherId) {
    if (!this.isAuthenticated()) return false;
    if (this.hasRole('admin')) return true;
    if (this.hasRole('department_head')) return true; // 部门主管可以访问本部门所有教师
    if (this.hasRole('teacher') && this.user.teacherId === teacherId) return true;
    return false;
  }

  /**
   * 注册回调函数
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  onEvent(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  /**
   * 移除回调函数
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  offEvent(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
  }

  /**
   * 触发回调函数
   * @param {string} event - 事件名称
   * @param {*} data - 数据
   */
  triggerCallbacks(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`回调函数执行失败 (${event}):`, error);
        }
      });
    }
  }

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息
   */
  getUser() {
    return this.user;
  }

  /**
   * 获取用户角色
   * @returns {Array} 角色数组
   */
  getRoles() {
    return [...this.roles];
  }

  /**
   * 获取用户权限
   * @returns {Array} 权限数组
   */
  getPermissions() {
    return Array.from(this.permissions);
  }
}

// 创建全局认证管理器实例
const authManager = new AuthManager();

export default authManager;