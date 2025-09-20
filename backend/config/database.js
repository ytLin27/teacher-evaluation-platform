const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database/teacher_evaluation.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('数据库连接失败:', err.message);
      } else {
        console.log('📊 SQLite数据库连接成功');
        this.initializeTables();
      }
    });
  }

  initializeTables() {
    // 创建教师表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS teachers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        position TEXT NOT NULL,
        hire_date DATE,
        photo_url TEXT,
        bio TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建课程表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER,
        course_code TEXT NOT NULL,
        course_name TEXT NOT NULL,
        semester TEXT NOT NULL,
        year INTEGER NOT NULL,
        enrollment INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers (id)
      )
    `);

    // 创建学生评价表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS student_evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER,
        teacher_id INTEGER,
        semester TEXT NOT NULL,
        year INTEGER NOT NULL,
        overall_rating REAL NOT NULL,
        teaching_quality REAL,
        course_content REAL,
        availability REAL,
        comments TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses (id),
        FOREIGN KEY (teacher_id) REFERENCES teachers (id)
      )
    `);

    // 创建研究成果表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS research_outputs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER,
        type TEXT NOT NULL, -- 'publication', 'grant', 'patent'
        title TEXT NOT NULL,
        description TEXT,
        date DATE,
        impact_factor REAL,
        citation_count INTEGER DEFAULT 0,
        funding_amount REAL,
        status TEXT,
        url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers (id)
      )
    `);

    // 创建服务贡献表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS service_contributions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER,
        type TEXT NOT NULL, -- 'committee', 'review', 'community'
        title TEXT NOT NULL,
        organization TEXT,
        role TEXT,
        start_date DATE,
        end_date DATE,
        description TEXT,
        workload_hours INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers (id)
      )
    `);

    // 创建专业发展表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS professional_development (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER,
        type TEXT NOT NULL, -- 'education', 'certification', 'training', 'conference'
        title TEXT NOT NULL,
        institution TEXT,
        date_completed DATE,
        duration_hours INTEGER,
        certificate_url TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers (id)
      )
    `);

    // 创建职业历程表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS career_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER,
        type TEXT NOT NULL, -- 'position', 'award', 'recognition'
        title TEXT NOT NULL,
        organization TEXT,
        start_date DATE,
        end_date DATE,
        description TEXT,
        achievement_level TEXT, -- 'university', 'national', 'international'
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES teachers (id)
      )
    `);

    console.log('✅ 数据库表结构初始化完成');
    console.log('💡 使用 POST /api/init-data 端点来初始化示例数据');
  }

  initializeSeedData() {
    // 延迟导入以避免循环依赖
    const { insertSeedData } = require('./seedData');
    try {
      insertSeedData();
      console.log('✅ 示例数据初始化完成');
    } catch (error) {
      console.error('❌ 示例数据初始化失败:', error.message);
    }
  }

  // 获取数据库实例
  getDB() {
    return this.db;
  }

  // 关闭数据库连接
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('关闭数据库失败:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  }
}

module.exports = new Database();