#!/usr/bin/env node

/**
 * SQLite 到分布式数据库迁移脚本
 * 将现有 SQLite 数据迁移到 PostgreSQL + MongoDB + InfluxDB
 */

const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const { MongoClient } = require('mongodb');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const path = require('path');
const fs = require('fs');

// 配置
const config = {
  sqlite: {
    path: path.join(__dirname, '../database/teacher_evaluation.db')
  },
  postgres: {
    host: 'localhost',
    port: 5432,
    database: 'eval_db',
    user: 'eval_user',
    password: 'eval_pass'
  },
  mongodb: {
    url: 'mongodb://localhost:27017',
    database: 'documents'
  },
  influxdb: {
    url: 'http://localhost:8086',
    token: 'your_influx_token',
    org: 'teacher-eval',
    bucket: 'teacher_metrics'
  }
};

class DatabaseMigrator {
  constructor() {
    this.sqliteDb = null;
    this.pgClient = null;
    this.mongoClient = null;
    this.influxClient = null;
    this.migrationLog = [];
  }

  async initialize() {
    console.log('🚀 开始数据库迁移...');

    // SQLite 连接
    this.sqliteDb = new sqlite3.Database(config.sqlite.path, (err) => {
      if (err) throw new Error(`SQLite 连接失败: ${err.message}`);
      console.log('✅ SQLite 连接成功');
    });

    // PostgreSQL 连接
    this.pgClient = new Client(config.postgres);
    await this.pgClient.connect();
    console.log('✅ PostgreSQL 连接成功');

    // MongoDB 连接
    this.mongoClient = new MongoClient(config.mongodb.url);
    await this.mongoClient.connect();
    this.mongodb = this.mongoClient.db(config.mongodb.database);
    console.log('✅ MongoDB 连接成功');

    // InfluxDB 连接
    this.influxClient = new InfluxDB({
      url: config.influxdb.url,
      token: config.influxdb.token
    });
    console.log('✅ InfluxDB 连接成功');
  }

  async migrateTeachers() {
    console.log('\n📊 迁移教师数据...');

    return new Promise((resolve, reject) => {
      this.sqliteDb.all('SELECT * FROM teachers', async (err, teachers) => {
        if (err) return reject(err);

        for (const teacher of teachers) {
          try {
            // 迁移到 PostgreSQL
            const insertQuery = `
              INSERT INTO teachers (
                name, email, department, position, hire_date,
                photo_url, bio, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              RETURNING id
            `;

            const values = [
              teacher.name,
              teacher.email,
              teacher.department,
              teacher.position,
              teacher.hire_date,
              teacher.photo_url,
              teacher.bio,
              teacher.created_at,
              teacher.updated_at
            ];

            const result = await this.pgClient.query(insertQuery, values);
            const newTeacherId = result.rows[0].id;

            // 创建初始绩效指标时序数据 (InfluxDB)
            const performancePoint = new Point('teacher_performance')
              .tag('teacher_id', newTeacherId.toString())
              .tag('department', teacher.department)
              .tag('position', teacher.position)
              .tag('metric_type', 'overall')
              .floatField('score', 0.0)
              .floatField('percentile', 0.0)
              .stringField('trend', 'stable')
              .intField('sample_size', 0)
              .timestamp(new Date());

            const writeApi = this.influxClient.getWriteApi(
              config.influxdb.org,
              config.influxdb.bucket
            );
            writeApi.writePoint(performancePoint);
            await writeApi.close();

            this.migrationLog.push({
              type: 'teacher',
              old_id: teacher.id,
              new_id: newTeacherId,
              status: 'success'
            });

          } catch (error) {
            console.error(`❌ 教师迁移失败 ${teacher.name}:`, error.message);
            this.migrationLog.push({
              type: 'teacher',
              old_id: teacher.id,
              error: error.message,
              status: 'failed'
            });
          }
        }

        console.log(`✅ 教师数据迁移完成: ${teachers.length} 条记录`);
        resolve();
      });
    });
  }

  async migrateCourses() {
    console.log('\n📚 迁移课程数据...');

    return new Promise((resolve, reject) => {
      this.sqliteDb.all('SELECT * FROM courses', async (err, courses) => {
        if (err) return reject(err);

        for (const course of courses) {
          try {
            // 获取新的教师ID
            const teacherMapping = this.migrationLog.find(
              log => log.type === 'teacher' && log.old_id === course.teacher_id
            );

            if (!teacherMapping || teacherMapping.status !== 'success') {
              continue; // 跳过没有对应教师的课程
            }

            const insertQuery = `
              INSERT INTO courses (
                teacher_id, course_code, course_name, semester,
                year, enrollment, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
              RETURNING id
            `;

            const values = [
              teacherMapping.new_id,
              course.course_code,
              course.course_name,
              course.semester,
              course.year,
              course.enrollment,
              course.created_at
            ];

            const result = await this.pgClient.query(insertQuery, values);

            this.migrationLog.push({
              type: 'course',
              old_id: course.id,
              new_id: result.rows[0].id,
              teacher_old_id: course.teacher_id,
              teacher_new_id: teacherMapping.new_id,
              status: 'success'
            });

          } catch (error) {
            console.error(`❌ 课程迁移失败 ${course.course_name}:`, error.message);
            this.migrationLog.push({
              type: 'course',
              old_id: course.id,
              error: error.message,
              status: 'failed'
            });
          }
        }

        console.log(`✅ 课程数据迁移完成: ${courses.length} 条记录`);
        resolve();
      });
    });
  }

  async migrateEvaluations() {
    console.log('\n📝 迁移评价数据...');

    return new Promise((resolve, reject) => {
      this.sqliteDb.all('SELECT * FROM student_evaluations', async (err, evaluations) => {
        if (err) return reject(err);

        for (const evaluation of evaluations) {
          try {
            // 获取映射的IDs
            const teacherMapping = this.migrationLog.find(
              log => log.type === 'teacher' && log.old_id === evaluation.teacher_id
            );
            const courseMapping = this.migrationLog.find(
              log => log.type === 'course' && log.old_id === evaluation.course_id
            );

            if (!teacherMapping || !courseMapping ||
                teacherMapping.status !== 'success' || courseMapping.status !== 'success') {
              continue;
            }

            // PostgreSQL 插入
            const insertQuery = `
              INSERT INTO student_evaluations (
                course_id, teacher_id, semester, year, overall_rating,
                teaching_quality, course_content, availability, comments, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              RETURNING id
            `;

            const values = [
              courseMapping.new_id,
              teacherMapping.new_id,
              evaluation.semester,
              evaluation.year,
              evaluation.overall_rating,
              evaluation.teaching_quality,
              evaluation.course_content,
              evaluation.availability,
              evaluation.comments,
              evaluation.created_at
            ];

            const result = await this.pgClient.query(insertQuery, values);

            // InfluxDB 时序数据
            const evaluationPoint = new Point('student_evaluations')
              .tag('teacher_id', teacherMapping.new_id.toString())
              .tag('course_id', courseMapping.new_id.toString())
              .tag('semester', evaluation.semester)
              .tag('evaluation_type', 'regular')
              .floatField('overall_rating', parseFloat(evaluation.overall_rating))
              .floatField('teaching_quality', parseFloat(evaluation.teaching_quality))
              .floatField('course_content', parseFloat(evaluation.course_content))
              .floatField('availability', parseFloat(evaluation.availability))
              .intField('response_count', 1)
              .timestamp(new Date(evaluation.created_at));

            const writeApi = this.influxClient.getWriteApi(
              config.influxdb.org,
              config.influxdb.bucket
            );
            writeApi.writePoint(evaluationPoint);
            await writeApi.close();

            this.migrationLog.push({
              type: 'evaluation',
              old_id: evaluation.id,
              new_id: result.rows[0].id,
              status: 'success'
            });

          } catch (error) {
            console.error(`❌ 评价迁移失败:`, error.message);
            this.migrationLog.push({
              type: 'evaluation',
              old_id: evaluation.id,
              error: error.message,
              status: 'failed'
            });
          }
        }

        console.log(`✅ 评价数据迁移完成: ${evaluations.length} 条记录`);
        resolve();
      });
    });
  }

  async migrateOtherTables() {
    console.log('\n🔬 迁移其他数据表...');

    const tables = [
      'research_outputs',
      'service_contributions',
      'professional_development',
      'career_history'
    ];

    for (const tableName of tables) {
      await this.migrateTable(tableName);
    }
  }

  async migrateTable(tableName) {
    return new Promise((resolve, reject) => {
      this.sqliteDb.all(`SELECT * FROM ${tableName}`, async (err, rows) => {
        if (err) return reject(err);

        for (const row of rows) {
          try {
            // 获取教师映射
            const teacherMapping = this.migrationLog.find(
              log => log.type === 'teacher' && log.old_id === row.teacher_id
            );

            if (!teacherMapping || teacherMapping.status !== 'success') {
              continue;
            }

            // 动态构建插入查询
            const columns = Object.keys(row).filter(key => key !== 'id');
            const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
            const values = columns.map(col => {
              return col === 'teacher_id' ? teacherMapping.new_id : row[col];
            });

            const insertQuery = `
              INSERT INTO ${tableName} (${columns.join(', ')})
              VALUES (${placeholders})
              RETURNING id
            `;

            const result = await this.pgClient.query(insertQuery, values);

            this.migrationLog.push({
              type: tableName,
              old_id: row.id,
              new_id: result.rows[0].id,
              status: 'success'
            });

          } catch (error) {
            console.error(`❌ ${tableName} 迁移失败:`, error.message);
            this.migrationLog.push({
              type: tableName,
              old_id: row.id,
              error: error.message,
              status: 'failed'
            });
          }
        }

        console.log(`✅ ${tableName} 迁移完成: ${rows.length} 条记录`);
        resolve();
      });
    });
  }

  async generateMigrationReport() {
    console.log('\n📋 生成迁移报告...');

    const report = {
      migration_date: new Date().toISOString(),
      total_records: this.migrationLog.length,
      successful_records: this.migrationLog.filter(log => log.status === 'success').length,
      failed_records: this.migrationLog.filter(log => log.status === 'failed').length,
      breakdown: {},
      detailed_log: this.migrationLog
    };

    // 按类型统计
    const types = [...new Set(this.migrationLog.map(log => log.type))];
    for (const type of types) {
      const typeRecords = this.migrationLog.filter(log => log.type === type);
      report.breakdown[type] = {
        total: typeRecords.length,
        successful: typeRecords.filter(r => r.status === 'success').length,
        failed: typeRecords.filter(r => r.status === 'failed').length
      };
    }

    // 保存到MongoDB
    await this.mongodb.collection('migration_reports').insertOne(report);

    // 保存到文件
    const reportPath = path.join(__dirname, '../logs/migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📊 迁移报告已保存: ${reportPath}`);
    console.log(`✅ 成功: ${report.successful_records}/${report.total_records}`);
    console.log(`❌ 失败: ${report.failed_records}/${report.total_records}`);

    return report;
  }

  async cleanup() {
    if (this.sqliteDb) this.sqliteDb.close();
    if (this.pgClient) await this.pgClient.end();
    if (this.mongoClient) await this.mongoClient.close();
    console.log('🧹 数据库连接已清理');
  }

  async run() {
    try {
      await this.initialize();
      await this.migrateTeachers();
      await this.migrateCourses();
      await this.migrateEvaluations();
      await this.migrateOtherTables();
      await this.generateMigrationReport();

      console.log('\n🎉 数据库迁移成功完成！');

    } catch (error) {
      console.error('💥 迁移失败:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const migrator = new DatabaseMigrator();
  migrator.run().catch(console.error);
}

module.exports = DatabaseMigrator;