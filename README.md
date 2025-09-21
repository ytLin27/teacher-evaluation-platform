# 教师评价平台 (Teacher Evaluation Platform)

> **高保真本地演示项目** - 展示现代企业级教师评价系统的全功能原型

[![Frontend](https://img.shields.io/badge/Frontend-React%2019.1.1-61dafb?logo=react)](http://localhost:5173)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20+%20Express-339933?logo=node.js)](http://localhost:3001)
[![Database](https://img.shields.io/badge/Database-SQLite-003b57?logo=sqlite)](./database/)
[![License](https://img.shields.io/badge/License-MIT-blue)](./LICENSE)

## 🎯 项目概述

这是一个**完整功能的本地演示项目**，展示了现代化教师评价平台的所有核心功能。该系统替代传统纸质评价方式，提供数据驱动的综合评价解决方案。

### ✨ 核心价值
- 📊 **数据驱动评价**：通过学生评价跟踪教学效果
- 🔬 **科研产出监控**：研究成果和资助资金管理
- 🤝 **服务贡献记录**：委员会工作和社区影响力追踪
- 📈 **专业发展管理**：培训认证和职业发展路径
- 📋 **高级分析引擎**：同行比较和趋势预测
- 🔌 **教育生态集成**：与Schoolday等平台无缝对接

## 🚀 快速开始

### 前提条件
- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Git**

### 🔧 安装和运行

```bash
# 1. 克隆项目
git clone https://github.com/ytLin27/teacher-evaluation-platform.git
cd teacher-evaluation-platform

# 2. 安装后端依赖
cd backend
npm install

# 3. 启动后端服务 (在新终端窗口)
npm start
# ✅ 后端运行在: http://localhost:3001

# 4. 安装前端依赖 (在另一个新终端窗口)
cd ../frontend
npm install

# 5. 启动前端开发服务器
npm run dev
# ✅ 前端运行在: http://localhost:5173
```

### 🌐 访问应用

打开浏览器访问：**http://localhost:5173**

**默认登录凭据：**
- 邮箱：`jane.doe@university.edu`
- 密码：`password123`

## 📋 功能特性

### 🎨 多标签评价界面
- **📊 Overview (概览)**：雷达图 + 4个关键性能指标卡片
- **👩‍🏫 Teaching (教学)**：课程列表 + 学生评价趋势图表
- **🔬 Research (科研)**：发表论文跟踪 + 资助项目管理
- **🤝 Service (服务)**：委员会工作 + 社区贡献评分
- **📚 Professional (专业发展)**：学历认证 + 技能管理
- **🏆 Career (履职)**：就业时间线 + 奖项认可

### 📈 高级分析引擎
- **📊 同行比较**：部门内统计算法比较
- **📈 趋势分析**：时间序列评价模式和性能预测
- **🎯 性能基准**：部门和大学范围的比较指标
- **📋 自定义报告**：可配置的多格式报告生成

### 🆕 Portfolio Export 功能
- **📄 多格式导出**：PDF和ZIP格式支持
- **🎯 全scope支持**：overview、teaching、research、service、professional、career、portfolio
- **📦 原始数据包含**：ZIP包含PDF报告 + 5个CSV数据文件
- **📁 自动归档**：导出后自动保存到Documents模块
- **🏷️ 智能命名**：`{TeacherName}_Portfolio_{YYYYMMDD_HHmm}_{Range}.pdf`

### 🔌 Schoolday集成模拟
- **🔐 OAuth 2.0**：完整的身份验证流程模拟
- **🔍 Discovery API**：模拟区域和学校发现
- **📚 OneRoster API**：教师和课程花名册同步
- **🎓 Academy API**：专业发展课程推荐
- **🔗 Webhook事件**：实时数据同步模拟

## 🏗️ 技术架构

### 当前技术栈 (完全功能)
```
Frontend  : React 19.1.1 + Vite 7.1.6 + TailwindCSS 4.1.13
Backend   : Node.js + Express 5.1.0 + SQLite3 5.1.7
Charts    : Chart.js + 自定义D3.js组件
Auth      : Mock JWT系统 (生产环境可无缝切换到Keycloak OIDC)
Export    : Puppeteer (PDF) + Archiver (ZIP)
API       : 7个主要路由文件 (auth, teachers, evaluations, analytics, schoolday, exports, documents)
```

### 数据库结构
**7个核心表：**
- `teachers` - 教师基本信息
- `courses` - 课程和教学数据
- `student_evaluations` - 学生评价记录
- `research_outputs` - 研究成果和发表论文
- `service_contributions` - 服务贡献记录
- `professional_development` - 专业发展和认证
- `career_history` - 职业履历和奖项

## 📁 项目结构

```
教师服务后台/
├── 📱 frontend/                 # React SPA应用
│   ├── src/
│   │   ├── components/         # 可重用UI组件
│   │   │   ├── ui/            # 基础UI组件库
│   │   │   └── layout/        # 布局组件
│   │   ├── pages/             # 路由页面组件
│   │   ├── contexts/          # React Context
│   │   └── config/            # 配置文件
│   └── package.json
├── 🖥️ backend/                  # Express API服务
│   ├── routes/                # API路由处理器
│   │   ├── auth.js           # 身份验证
│   │   ├── teachers.js       # 教师管理
│   │   ├── evaluations.js    # 评价数据
│   │   ├── analytics.js      # 分析引擎
│   │   ├── schoolday.js      # 集成模拟
│   │   ├── exports.js        # 报告导出 (Portfolio功能)
│   │   └── documents.js      # 文档管理
│   ├── config/               # 数据库配置
│   └── server.js             # Express服务器
├── 🗄️ database/                 # SQLite数据库文件
├── 📋 CLAUDE.md                 # 开发指南
└── 📖 README.md                 # 项目文档
```

## 🔌 主要API端点

### 🔐 认证服务
```
POST /api/auth/login           # 用户登录
GET  /api/auth/me              # 获取当前用户信息
POST /api/auth/logout          # 用户登出
```

### 👥 核心业务API
```
GET  /api/teachers/{id}/evaluation     # 教师综合评价数据
POST /api/evaluations/{id}/submit      # 提交学生评价
GET  /api/analytics/peer-comparison    # 同行比较分析
GET  /api/analytics/trends             # 趋势分析
```

### 📊 Portfolio Export API
```
GET  /api/exports/reports/generate     # 生成报告 (支持所有7种scope)
    ?scope=portfolio&format=pdf&teacherId=1&include=charts,raw
GET  /api/exports/research/{teacherId} # 导出科研数据
GET  /api/exports/service/{teacherId}  # 导出服务数据
```

### 📁 文档管理API
```
POST /api/documents/upload             # 文件上传
GET  /api/documents/{id}               # 文件预览/下载
DELETE /api/documents/{id}             # 删除文件
```

## 🛠️ 开发指南

### 开发命令
```bash
# 🖥️ 后端开发
cd backend
npm start                    # 启动Express服务器

# 📱 前端开发
cd frontend
npm run dev                  # 启动Vite开发服务器
npm run build                # 构建生产版本
npm run preview              # 预览生产构建
npm run lint                 # 运行ESLint检查
```

### 🔍 健康检查
```bash
# 检查后端API状态
curl http://localhost:3001/health

# 测试Portfolio Export功能
curl "http://localhost:3001/api/exports/reports/generate?scope=portfolio&format=pdf&teacherId=1"
```

### 🐛 故障排除

**端口冲突：**
如果端口被占用，Vite会自动尝试其他端口 (5174, 5175等)

**数据库问题：**
```bash
# 删除并重新创建数据库
rm database/teacher_evaluation.db
# 重启后端服务器会自动重新创建
```

**依赖问题：**
```bash
# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

## 📊 性能基准

- **API响应时间**：标准查询 <200ms，复杂分析 <500ms
- **前端加载时间**：初始加载 <2s，页面间导航 <1s
- **Portfolio导出**：PDF生成 <3s，ZIP打包 <5s
- **数据库查询**：优化索引，连接池，查询分析

## 🔒 安全特性

- **身份验证**：JWT令牌 + 角色映射 (开发中使用Mock，生产可切换OIDC)
- **数据隔离**：用户只能访问其部门数据
- **输入验证**：所有API端点的数据验证
- **审计日志**：敏感操作的用户归属记录

## 📖 更多文档

- **[开发指南](./CLAUDE.md)** - 详细的技术文档和架构说明
- **[API文档](http://localhost:3001/api/status)** - 完整的API端点说明
- **[数据库架构](./backend/config/database.js)** - 数据模型和关系

## 🤝 贡献指南

1. Fork本项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 📄 许可证

本项目基于 MIT License 开源。

## 👨‍💻 作者

**Lin** - [GitHub](https://github.com/ytLin27)

---

**⭐ 如果这个项目对您有帮助，请给它一个星标！**

## 📞 支持

如果您遇到任何问题或有疑问，请：

1. 查看 [Issues](https://github.com/ytLin27/teacher-evaluation-platform/issues)
2. 创建新的Issue描述您的问题
3. 联系项目维护者

---

**🚀 现在就开始探索现代化的教师评价系统吧！**