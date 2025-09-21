const express = require('express');
const router = express.Router();
const database = require('../config/database');
const puppeteer = require('puppeteer');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

// 辅助函数：将数据转换为CSV格式
const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) {
    return headers.join(',') + '\n';
  }

  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || '';
      // 处理包含逗号或引号的值
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return csvHeaders + '\n' + csvRows.join('\n');
};

// 导出研究数据
router.get('/research/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const { format = 'json', type = 'all' } = req.query;
  const db = database.getDB();

  // 根据类型查询不同的研究数据
  let query = '';
  let params = [teacherId];

  if (type === 'publications') {
    query = `
      SELECT * FROM research_outputs
      WHERE teacher_id = ? AND type = 'publication'
      ORDER BY date DESC
    `;
  } else if (type === 'grants') {
    query = `
      SELECT * FROM research_outputs
      WHERE teacher_id = ? AND type = 'grant'
      ORDER BY date DESC
    `;
  } else {
    query = `
      SELECT * FROM research_outputs
      WHERE teacher_id = ?
      ORDER BY date DESC
    `;
  }

  db.all(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (format === 'csv') {
      const headers = ['type', 'title', 'description', 'date', 'impact_factor', 'citation_count', 'funding_amount', 'status', 'url'];
      const csvData = convertToCSV(results, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="research_data_${teacherId}_${type}.csv"`);
      res.send(csvData);
    } else {
      res.json({
        data: results,
        export_info: {
          teacher_id: teacherId,
          type: type,
          exported_at: new Date().toISOString(),
          total_records: results.length
        }
      });
    }
  });
});

// 导出服务数据
router.get('/service/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const { format = 'json' } = req.query;
  const db = database.getDB();

  const query = `
    SELECT * FROM service_contributions
    WHERE teacher_id = ?
    ORDER BY start_date DESC
  `;

  db.all(query, [teacherId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (format === 'csv') {
      const headers = ['type', 'title', 'organization', 'role', 'start_date', 'end_date', 'description', 'workload_hours'];
      const csvData = convertToCSV(results, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="service_data_${teacherId}.csv"`);
      res.send(csvData);
    } else {
      res.json({
        data: results,
        export_info: {
          teacher_id: teacherId,
          type: 'service',
          exported_at: new Date().toISOString(),
          total_records: results.length
        }
      });
    }
  });
});

// 导出专业发展数据
router.get('/professional/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const { format = 'json' } = req.query;
  const db = database.getDB();

  const query = `
    SELECT * FROM professional_development
    WHERE teacher_id = ?
    ORDER BY date_completed DESC
  `;

  db.all(query, [teacherId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (format === 'csv') {
      const headers = ['type', 'title', 'institution', 'date_completed', 'duration_hours', 'certificate_url', 'description'];
      const csvData = convertToCSV(results, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="professional_data_${teacherId}.csv"`);
      res.send(csvData);
    } else {
      res.json({
        data: results,
        export_info: {
          teacher_id: teacherId,
          type: 'professional',
          exported_at: new Date().toISOString(),
          total_records: results.length
        }
      });
    }
  });
});

// 导出职业历程数据
router.get('/career/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const { format = 'json' } = req.query;
  const db = database.getDB();

  const query = `
    SELECT * FROM career_history
    WHERE teacher_id = ?
    ORDER BY start_date DESC
  `;

  db.all(query, [teacherId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (format === 'csv') {
      const headers = ['type', 'title', 'organization', 'start_date', 'end_date', 'description', 'achievement_level'];
      const csvData = convertToCSV(results, headers);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="career_data_${teacherId}.csv"`);
      res.send(csvData);
    } else {
      res.json({
        data: results,
        export_info: {
          teacher_id: teacherId,
          type: 'career',
          exported_at: new Date().toISOString(),
          total_records: results.length
        }
      });
    }
  });
});

// 导出完整教师报告
router.get('/complete-report/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const { format = 'json' } = req.query;
  const db = database.getDB();

  // 查询教师基本信息
  const teacherQuery = 'SELECT * FROM teachers WHERE id = ?';

  db.get(teacherQuery, [teacherId], (err, teacher) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // 并行查询所有相关数据
    const queries = {
      courses: 'SELECT * FROM courses WHERE teacher_id = ? ORDER BY year DESC, semester DESC',
      research: 'SELECT * FROM research_outputs WHERE teacher_id = ? ORDER BY date DESC',
      service: 'SELECT * FROM service_contributions WHERE teacher_id = ? ORDER BY start_date DESC',
      professional: 'SELECT * FROM professional_development WHERE teacher_id = ? ORDER BY date_completed DESC',
      career: 'SELECT * FROM career_history WHERE teacher_id = ? ORDER BY start_date DESC',
      evaluations: `
        SELECT semester, year, AVG(overall_rating) as avg_rating, COUNT(*) as total_evaluations
        FROM student_evaluations
        WHERE teacher_id = ?
        GROUP BY semester, year
        ORDER BY year DESC, semester DESC
      `
    };

    const results = { teacher };
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
      db.all(query, [teacherId], (err, data) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        results[key] = data;
        completedQueries++;

        if (completedQueries === totalQueries) {
          // 所有查询完成，返回结果
          if (format === 'csv') {
            // 对于完整报告，返回JSON格式更合适
            res.json({
              message: 'Complete report is too complex for CSV format. Please use JSON format or export individual sections.',
              available_csv_endpoints: [
                `/api/exports/research/${teacherId}?format=csv`,
                `/api/exports/service/${teacherId}?format=csv`,
                `/api/exports/professional/${teacherId}?format=csv`,
                `/api/exports/career/${teacherId}?format=csv`
              ]
            });
          } else {
            res.json({
              data: results,
              export_info: {
                teacher_id: teacherId,
                type: 'complete_report',
                exported_at: new Date().toISOString(),
                sections: Object.keys(results).filter(key => key !== 'teacher'),
                teacher_name: teacher.name
              }
            });
          }
        }
      });
    });
  });
});

// 导出统计摘要
router.get('/summary/:teacherId', (req, res) => {
  const { teacherId } = req.params;
  const { format = 'json' } = req.query;
  const db = database.getDB();

  // 获取各种统计数据
  const statsQueries = [
    {
      name: 'research_stats',
      query: `
        SELECT
          COUNT(*) as total_research,
          COUNT(CASE WHEN type = 'publication' THEN 1 END) as publications,
          COUNT(CASE WHEN type = 'grant' THEN 1 END) as grants,
          SUM(CASE WHEN type = 'grant' THEN funding_amount ELSE 0 END) as total_funding,
          SUM(citation_count) as total_citations
        FROM research_outputs
        WHERE teacher_id = ?
      `
    },
    {
      name: 'service_stats',
      query: `
        SELECT
          COUNT(*) as total_service,
          SUM(workload_hours) as total_hours,
          COUNT(CASE WHEN type = 'committee' THEN 1 END) as committees,
          COUNT(CASE WHEN type = 'review' THEN 1 END) as reviews
        FROM service_contributions
        WHERE teacher_id = ?
      `
    },
    {
      name: 'professional_stats',
      query: `
        SELECT
          COUNT(*) as total_development,
          SUM(duration_hours) as total_hours,
          COUNT(CASE WHEN type = 'certification' THEN 1 END) as certifications,
          COUNT(CASE WHEN type = 'training' THEN 1 END) as trainings
        FROM professional_development
        WHERE teacher_id = ?
      `
    },
    {
      name: 'evaluation_stats',
      query: `
        SELECT
          AVG(overall_rating) as avg_overall_rating,
          AVG(teaching_quality) as avg_teaching_quality,
          AVG(course_content) as avg_course_content,
          AVG(availability) as avg_availability,
          COUNT(*) as total_evaluations
        FROM student_evaluations
        WHERE teacher_id = ?
      `
    }
  ];

  const summary = {};
  let completedQueries = 0;

  statsQueries.forEach(({ name, query }) => {
    db.get(query, [teacherId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      summary[name] = result;
      completedQueries++;

      if (completedQueries === statsQueries.length) {
        if (format === 'csv') {
          // 将统计数据转换为平面结构用于CSV
          const flatData = [{
            teacher_id: teacherId,
            total_research: summary.research_stats.total_research || 0,
            publications: summary.research_stats.publications || 0,
            grants: summary.research_stats.grants || 0,
            total_funding: summary.research_stats.total_funding || 0,
            total_citations: summary.research_stats.total_citations || 0,
            total_service: summary.service_stats.total_service || 0,
            service_hours: summary.service_stats.total_hours || 0,
            committees: summary.service_stats.committees || 0,
            reviews: summary.service_stats.reviews || 0,
            professional_development: summary.professional_stats.total_development || 0,
            professional_hours: summary.professional_stats.total_hours || 0,
            certifications: summary.professional_stats.certifications || 0,
            trainings: summary.professional_stats.trainings || 0,
            avg_overall_rating: summary.evaluation_stats.avg_overall_rating || 0,
            avg_teaching_quality: summary.evaluation_stats.avg_teaching_quality || 0,
            avg_course_content: summary.evaluation_stats.avg_course_content || 0,
            avg_availability: summary.evaluation_stats.avg_availability || 0,
            total_evaluations: summary.evaluation_stats.total_evaluations || 0
          }];

          const headers = Object.keys(flatData[0]);
          const csvData = convertToCSV(flatData, headers);

          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="summary_${teacherId}.csv"`);
          res.send(csvData);
        } else {
          res.json({
            data: summary,
            export_info: {
              teacher_id: teacherId,
              type: 'summary',
              exported_at: new Date().toISOString()
            }
          });
        }
      }
    });
  });
});

// Portfolio 报告生成路由
router.get('/reports/generate', async (req, res) => {
  const {
    scope = 'overview',
    format = 'pdf',
    from,
    to,
    include = 'charts',
    teacherId = 1 // 默认教师ID
  } = req.query;

  try {
    // 验证 scope 参数
    const validScopes = ['overview', 'teaching', 'research', 'service', 'professional', 'career', 'portfolio'];
    if (!validScopes.includes(scope)) {
      return res.status(400).json({
        error: `Invalid scope. Must be one of: ${validScopes.join(', ')}`
      });
    }

    // 收集数据
    const reportData = await collectReportData(teacherId, scope, { from, to });

    if (!reportData) {
      return res.status(404).json({ error: 'Teacher data not found' });
    }

    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[:-]/g, '').split('.')[0].replace('T', '_');
    const dateRange = from && to ? `${from}_${to}` : new Date().getFullYear();
    const teacherName = reportData.teacher.name.replace(/\s+/g, '');
    const scopeLabel = scope.charAt(0).toUpperCase() + scope.slice(1);
    const baseFileName = `${teacherName}_${scopeLabel}_${timestamp}_${dateRange}`;

    if (format === 'pdf') {
      // 生成 PDF
      const pdfBuffer = await generateReportPDF(reportData, scope, include.includes('charts'));

      if (scope === 'portfolio' && include.includes('raw')) {
        // 只有 Portfolio 支持 ZIP 格式
        const zipBuffer = await generatePortfolioZip(reportData, pdfBuffer, baseFileName);

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${baseFileName}.zip"`);
        res.send(zipBuffer);
      } else {
        // 返回 PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${baseFileName}.pdf"`);
        res.send(pdfBuffer);
      }
    } else {
      return res.status(400).json({
        error: 'Only PDF format is supported for reports'
      });
    }

  } catch (error) {
    console.error('Portfolio generation error:', error);
    res.status(500).json({
      error: 'Failed to generate portfolio report',
      message: error.message
    });
  }
});

// 收集报告数据的辅助函数（根据 scope 决定收集哪些数据）
async function collectReportData(teacherId, scope, { from, to }) {
  const db = database.getDB();

  return new Promise((resolve, reject) => {
    // 首先获取教师信息
    db.get('SELECT * FROM teachers WHERE id = ?', [teacherId], async (err, teacher) => {
      if (err) return reject(err);
      if (!teacher) return resolve(null);

      try {
        let reportData = { teacher, generated_at: new Date().toISOString() };

        // 根据 scope 决定收集哪些数据
        switch (scope) {
          case 'overview':
            const [courses, evaluations] = await Promise.all([
              queryDatabase(db, 'SELECT * FROM courses WHERE teacher_id = ? ORDER BY year DESC, semester DESC', [teacherId]),
              queryDatabase(db, `
                SELECT semester, year, AVG(overall_rating) as avg_rating,
                       AVG(teaching_quality) as avg_teaching,
                       AVG(course_content) as avg_content,
                       AVG(availability) as avg_availability,
                       COUNT(*) as total_evaluations
                FROM student_evaluations WHERE teacher_id = ?
                GROUP BY semester, year ORDER BY year DESC, semester DESC
              `, [teacherId])
            ]);

            // 获取所有数据的统计摘要
            const [research, service, professional] = await Promise.all([
              queryDatabase(db, 'SELECT * FROM research_outputs WHERE teacher_id = ?', [teacherId]),
              queryDatabase(db, 'SELECT * FROM service_contributions WHERE teacher_id = ?', [teacherId]),
              queryDatabase(db, 'SELECT * FROM professional_development WHERE teacher_id = ?', [teacherId])
            ]);

            reportData = {
              ...reportData,
              courses,
              evaluations,
              research,
              service,
              professional,
              stats: calculateOverviewStats({ courses, evaluations, research, service, professional })
            };
            break;

          case 'teaching':
            const [teachingCourses, teachingEvaluations] = await Promise.all([
              queryDatabase(db, 'SELECT * FROM courses WHERE teacher_id = ? ORDER BY year DESC, semester DESC', [teacherId]),
              queryDatabase(db, `
                SELECT semester, year, AVG(overall_rating) as avg_rating,
                       AVG(teaching_quality) as avg_teaching,
                       AVG(course_content) as avg_content,
                       AVG(availability) as avg_availability,
                       COUNT(*) as total_evaluations
                FROM student_evaluations WHERE teacher_id = ?
                GROUP BY semester, year ORDER BY year DESC, semester DESC
              `, [teacherId])
            ]);

            reportData = {
              ...reportData,
              courses: teachingCourses,
              evaluations: teachingEvaluations,
              stats: calculateTeachingStats({ courses: teachingCourses, evaluations: teachingEvaluations })
            };
            break;

          case 'research':
            const researchData = await queryDatabase(db, 'SELECT * FROM research_outputs WHERE teacher_id = ? ORDER BY date DESC', [teacherId]);

            reportData = {
              ...reportData,
              research: researchData,
              stats: calculateResearchStats({ research: researchData })
            };
            break;

          case 'service':
            const serviceData = await queryDatabase(db, 'SELECT * FROM service_contributions WHERE teacher_id = ? ORDER BY start_date DESC', [teacherId]);

            reportData = {
              ...reportData,
              service: serviceData,
              stats: calculateServiceStats({ service: serviceData })
            };
            break;

          case 'professional':
            const professionalData = await queryDatabase(db, 'SELECT * FROM professional_development WHERE teacher_id = ? ORDER BY date_completed DESC', [teacherId]);

            reportData = {
              ...reportData,
              professional: professionalData,
              stats: calculateProfessionalStats({ professional: professionalData })
            };
            break;

          case 'career':
            const careerData = await queryDatabase(db, 'SELECT * FROM career_history WHERE teacher_id = ? ORDER BY start_date DESC', [teacherId]);

            reportData = {
              ...reportData,
              career: careerData,
              stats: calculateCareerStats({ career: careerData })
            };
            break;

          case 'portfolio':
            // Portfolio 包含所有数据
            const [allCourses, allEvaluations, allResearch, allService, allProfessional, allCareer] = await Promise.all([
              queryDatabase(db, 'SELECT * FROM courses WHERE teacher_id = ? ORDER BY year DESC, semester DESC', [teacherId]),
              queryDatabase(db, `
                SELECT semester, year, AVG(overall_rating) as avg_rating,
                       AVG(teaching_quality) as avg_teaching,
                       AVG(course_content) as avg_content,
                       AVG(availability) as avg_availability,
                       COUNT(*) as total_evaluations
                FROM student_evaluations WHERE teacher_id = ?
                GROUP BY semester, year ORDER BY year DESC, semester DESC
              `, [teacherId]),
              queryDatabase(db, 'SELECT * FROM research_outputs WHERE teacher_id = ? ORDER BY date DESC', [teacherId]),
              queryDatabase(db, 'SELECT * FROM service_contributions WHERE teacher_id = ? ORDER BY start_date DESC', [teacherId]),
              queryDatabase(db, 'SELECT * FROM professional_development WHERE teacher_id = ? ORDER BY date_completed DESC', [teacherId]),
              queryDatabase(db, 'SELECT * FROM career_history WHERE teacher_id = ? ORDER BY start_date DESC', [teacherId])
            ]);

            reportData = {
              ...reportData,
              courses: allCourses,
              evaluations: allEvaluations,
              research: allResearch,
              service: allService,
              professional: allProfessional,
              career: allCareer,
              stats: calculatePortfolioStats({
                teacher, courses: allCourses, evaluations: allEvaluations, research: allResearch, service: allService, professional: allProfessional
              })
            };
            break;

          default:
            throw new Error(`Unsupported scope: ${scope}`);
        }

        resolve(reportData);

      } catch (error) {
        reject(error);
      }
    });
  });
}

// 收集 Portfolio 数据的辅助函数（保持向后兼容）
async function collectPortfolioData(teacherId, { from, to }) {
  const db = database.getDB();

  return new Promise((resolve, reject) => {
    // 首先获取教师信息
    db.get('SELECT * FROM teachers WHERE id = ?', [teacherId], async (err, teacher) => {
      if (err) return reject(err);
      if (!teacher) return resolve(null);

      try {
        // 收集所有模块数据
        const [courses, evaluations, research, service, professional, career] = await Promise.all([
          queryDatabase(db, 'SELECT * FROM courses WHERE teacher_id = ? ORDER BY year DESC, semester DESC', [teacherId]),
          queryDatabase(db, `
            SELECT semester, year, AVG(overall_rating) as avg_rating,
                   AVG(teaching_quality) as avg_teaching,
                   AVG(course_content) as avg_content,
                   AVG(availability) as avg_availability,
                   COUNT(*) as total_evaluations
            FROM student_evaluations WHERE teacher_id = ?
            GROUP BY semester, year ORDER BY year DESC, semester DESC
          `, [teacherId]),
          queryDatabase(db, 'SELECT * FROM research_outputs WHERE teacher_id = ? ORDER BY date DESC', [teacherId]),
          queryDatabase(db, 'SELECT * FROM service_contributions WHERE teacher_id = ? ORDER BY start_date DESC', [teacherId]),
          queryDatabase(db, 'SELECT * FROM professional_development WHERE teacher_id = ? ORDER BY date_completed DESC', [teacherId]),
          queryDatabase(db, 'SELECT * FROM career_history WHERE teacher_id = ? ORDER BY start_date DESC', [teacherId])
        ]);

        // 计算统计摘要
        const stats = calculatePortfolioStats({
          teacher, courses, evaluations, research, service, professional, career
        });

        resolve({
          teacher,
          courses,
          evaluations,
          research,
          service,
          professional,
          career,
          stats,
          generated_at: new Date().toISOString()
        });

      } catch (error) {
        reject(error);
      }
    });
  });
}

// 数据库查询的 Promise 包装器
function queryDatabase(db, query, params) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// 通用 PDF 生成函数
async function generateReportPDF(data, scope, includeCharts = true) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    let html;

    // 根据 scope 生成不同的 HTML
    switch (scope) {
      case 'portfolio':
        html = generatePortfolioHTML(data, includeCharts);
        break;
      case 'overview':
        html = generateOverviewHTML(data, includeCharts);
        break;
      case 'teaching':
        html = generateTeachingHTML(data, includeCharts);
        break;
      case 'research':
        html = generateResearchHTML(data, includeCharts);
        break;
      case 'service':
        html = generateServiceHTML(data, includeCharts);
        break;
      case 'professional':
        html = generateProfessionalHTML(data, includeCharts);
        break;
      case 'career':
        html = generateCareerHTML(data, includeCharts);
        break;
      default:
        throw new Error(`Unsupported scope for PDF generation: ${scope}`);
    }

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });

    // 确保返回 Node.js Buffer
    return Buffer.from(pdfData);

  } finally {
    await browser.close();
  }
}

// 各种统计计算函数
function calculateOverviewStats(data) {
  const { courses, evaluations, research, service, professional } = data;

  return {
    teaching: {
      total_courses: courses.length,
      avg_rating: evaluations.length ?
        (evaluations.reduce((sum, e) => sum + (e.avg_rating || 0), 0) / evaluations.length).toFixed(2) : 0,
      total_evaluations: evaluations.reduce((sum, e) => sum + (e.total_evaluations || 0), 0)
    },
    research: {
      total_outputs: research.length,
      publications: research.filter(r => r.type === 'publication').length,
      grants: research.filter(r => r.type === 'grant').length,
      total_funding: research.reduce((sum, r) => sum + (r.funding_amount || 0), 0),
      total_citations: research.reduce((sum, r) => sum + (r.citation_count || 0), 0)
    },
    service: {
      total_contributions: service.length,
      total_hours: service.reduce((sum, s) => sum + (s.workload_hours || 0), 0)
    },
    professional: {
      total_development: professional.length,
      certifications: professional.filter(p => p.type === 'certification').length
    }
  };
}

function calculateTeachingStats(data) {
  const { courses, evaluations } = data;

  return {
    total_courses: courses.length,
    avg_rating: evaluations.length ?
      (evaluations.reduce((sum, e) => sum + (e.avg_rating || 0), 0) / evaluations.length).toFixed(2) : 0,
    total_evaluations: evaluations.reduce((sum, e) => sum + (e.total_evaluations || 0), 0),
    avg_teaching_quality: evaluations.length ?
      (evaluations.reduce((sum, e) => sum + (e.avg_teaching || 0), 0) / evaluations.length).toFixed(2) : 0,
    avg_content_quality: evaluations.length ?
      (evaluations.reduce((sum, e) => sum + (e.avg_content || 0), 0) / evaluations.length).toFixed(2) : 0
  };
}

function calculateResearchStats(data) {
  const { research } = data;

  return {
    total_outputs: research.length,
    publications: research.filter(r => r.type === 'publication').length,
    grants: research.filter(r => r.type === 'grant').length,
    patents: research.filter(r => r.type === 'patent').length,
    total_funding: research.reduce((sum, r) => sum + (r.funding_amount || 0), 0),
    total_citations: research.reduce((sum, r) => sum + (r.citation_count || 0), 0),
    avg_impact_factor: research.filter(r => r.impact_factor).length ?
      (research.reduce((sum, r) => sum + (r.impact_factor || 0), 0) / research.filter(r => r.impact_factor).length).toFixed(2) : 0
  };
}

function calculateServiceStats(data) {
  const { service } = data;

  return {
    total_contributions: service.length,
    total_hours: service.reduce((sum, s) => sum + (s.workload_hours || 0), 0),
    committees: service.filter(s => s.type === 'committee').length,
    reviews: service.filter(s => s.type === 'review').length,
    community: service.filter(s => s.type === 'community').length,
    avg_hours_per_service: service.length ?
      (service.reduce((sum, s) => sum + (s.workload_hours || 0), 0) / service.length).toFixed(1) : 0
  };
}

function calculateProfessionalStats(data) {
  const { professional } = data;

  return {
    total_development: professional.length,
    certifications: professional.filter(p => p.type === 'certification').length,
    trainings: professional.filter(p => p.type === 'training').length,
    conferences: professional.filter(p => p.type === 'conference').length,
    total_hours: professional.reduce((sum, p) => sum + (p.duration_hours || 0), 0),
    avg_hours_per_activity: professional.length ?
      (professional.reduce((sum, p) => sum + (p.duration_hours || 0), 0) / professional.length).toFixed(1) : 0
  };
}

function calculateCareerStats(data) {
  const { career } = data;

  return {
    total_events: career.length,
    positions: career.filter(c => c.type === 'position').length,
    awards: career.filter(c => c.type === 'award').length,
    recognitions: career.filter(c => c.type === 'recognition').length,
    university_level: career.filter(c => c.achievement_level === 'university').length,
    national_level: career.filter(c => c.achievement_level === 'national').length,
    international_level: career.filter(c => c.achievement_level === 'international').length
  };
}

// 计算 Portfolio 统计数据
function calculatePortfolioStats(data) {
  const { courses, evaluations, research, service, professional } = data;

  return {
    overview: {
      total_courses: courses.length,
      avg_rating: evaluations.length ?
        (evaluations.reduce((sum, e) => sum + (e.avg_rating || 0), 0) / evaluations.length).toFixed(2) : 0,
      total_evaluations: evaluations.reduce((sum, e) => sum + (e.total_evaluations || 0), 0)
    },
    research: {
      total_outputs: research.length,
      publications: research.filter(r => r.type === 'publication').length,
      grants: research.filter(r => r.type === 'grant').length,
      total_funding: research.reduce((sum, r) => sum + (r.funding_amount || 0), 0),
      total_citations: research.reduce((sum, r) => sum + (r.citation_count || 0), 0)
    },
    service: {
      total_contributions: service.length,
      total_hours: service.reduce((sum, s) => sum + (s.workload_hours || 0), 0),
      committees: service.filter(s => s.type === 'committee').length,
      reviews: service.filter(s => s.type === 'review').length
    },
    professional: {
      total_development: professional.length,
      certifications: professional.filter(p => p.type === 'certification').length,
      trainings: professional.filter(p => p.type === 'training').length,
      total_hours: professional.reduce((sum, p) => sum + (p.duration_hours || 0), 0)
    }
  };
}

// 生成 Portfolio PDF
async function generatePortfolioPDF(data, includeCharts = true) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    const html = generatePortfolioHTML(data, includeCharts);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm'
      }
    });

    // 确保返回 Node.js Buffer
    return Buffer.from(pdfData);

  } finally {
    await browser.close();
  }
}

// 生成 Portfolio ZIP (包含 PDF 和原始数据)
async function generatePortfolioZip(data, pdfBuffer, baseFileName) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const chunks = [];

    archive.on('data', chunk => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    // 确保 pdfBuffer 是 Buffer 类型
    if (!Buffer.isBuffer(pdfBuffer)) {
      return reject(new Error('pdfBuffer must be a Buffer instance'));
    }

    // 添加 PDF 文件
    archive.append(pdfBuffer, { name: `${baseFileName}.pdf` });

    // 添加原始数据 CSV 文件
    const sections = ['courses', 'research', 'service', 'professional', 'career'];
    sections.forEach(section => {
      if (data[section] && data[section].length > 0) {
        const headers = Object.keys(data[section][0]);
        const csvData = convertToCSV(data[section], headers);
        archive.append(csvData, { name: `${section}_data.csv` });
      }
    });

    // 添加统计摘要
    const statsCSV = convertToCSV([{
      teacher_id: data.teacher.id,
      teacher_name: data.teacher.name,
      total_courses: data.stats.overview.total_courses,
      avg_rating: data.stats.overview.avg_rating,
      total_research: data.stats.research.total_outputs,
      total_funding: data.stats.research.total_funding,
      total_service: data.stats.service.total_contributions,
      total_professional: data.stats.professional.total_development,
      generated_at: data.generated_at
    }], [
      'teacher_id', 'teacher_name', 'total_courses', 'avg_rating',
      'total_research', 'total_funding', 'total_service',
      'total_professional', 'generated_at'
    ]);

    archive.append(statsCSV, { name: 'portfolio_summary.csv' });

    archive.finalize();
  });
}

// 记录下载次数的路由
router.post('/reports/download-count', (req, res) => {
  const { filename, teacherId = 1 } = req.body;

  // 简单记录下载日志（在实际生产环境中，这里可以存储到数据库或分析系统）
  const downloadRecord = {
    timestamp: new Date().toISOString(),
    filename: filename,
    teacherId: teacherId,
    userAgent: req.headers['user-agent'] || 'Unknown',
    ip: req.ip || req.connection.remoteAddress
  };

  console.log('📥 Portfolio Download Record:', JSON.stringify(downloadRecord, null, 2));

  res.json({
    message: 'Download count recorded successfully',
    filename: filename,
    downloadId: `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  });
});

// 生成 Portfolio HTML 模板
function generatePortfolioHTML(data, includeCharts = true) {
  const { teacher, stats, courses, evaluations, research, service, professional, career, generated_at } = data;

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Portfolio Report - ${teacher.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }

        .cover-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          page-break-after: always;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .cover-title {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .cover-subtitle {
          font-size: 24px;
          margin-bottom: 40px;
          opacity: 0.9;
        }

        .cover-info {
          font-size: 18px;
          line-height: 2;
        }

        .page {
          padding: 40px;
          min-height: 100vh;
          page-break-after: always;
        }

        .page:last-child {
          page-break-after: avoid;
        }

        h1 {
          font-size: 32px;
          color: #4f46e5;
          border-bottom: 3px solid #4f46e5;
          padding-bottom: 10px;
          margin-bottom: 30px;
        }

        h2 {
          font-size: 24px;
          color: #6366f1;
          margin: 30px 0 20px;
        }

        h3 {
          font-size: 18px;
          color: #4338ca;
          margin: 20px 0 15px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin: 30px 0;
        }

        .summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }

        .summary-card h3 {
          color: #1e293b;
          margin-bottom: 10px;
        }

        .summary-value {
          font-size: 36px;
          font-weight: bold;
          color: #4f46e5;
          margin-bottom: 5px;
        }

        .summary-label {
          color: #64748b;
          font-size: 14px;
        }

        .section-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin: 20px 0;
        }

        .stat-item {
          background: #fafafa;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          border-left: 4px solid #4f46e5;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #4f46e5;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }

        .data-table th,
        .data-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        .data-table th {
          background-color: #4f46e5;
          color: white;
          font-weight: bold;
        }

        .data-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }

        .chart-placeholder {
          width: 100%;
          height: 200px;
          background: linear-gradient(45deg, #f0f9ff, #e0e7ff);
          border: 2px dashed #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4f46e5;
          font-weight: bold;
          margin: 20px 0;
          border-radius: 8px;
        }

        .footer {
          position: fixed;
          bottom: 20px;
          right: 40px;
          font-size: 10px;
          color: #666;
        }

        .note {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          font-style: italic;
        }

        @media print {
          .page {
            margin: 0;
            padding: 30px;
          }
        }
      </style>
    </head>
    <body>
      <!-- 封面页 -->
      <div class="cover-page">
        <div class="cover-title">Portfolio Report</div>
        <div class="cover-subtitle">${teacher.name} - ${teacher.department}</div>
        <div class="cover-info">
          <div><strong>职位:</strong> ${teacher.position}</div>
          <div><strong>生成时间:</strong> ${new Date(generated_at).toLocaleString('zh-CN')}</div>
          <div><strong>报告范围:</strong> 综合评价档案</div>
        </div>
      </div>

      <!-- 执行摘要 -->
      <div class="page">
        <h1>执行摘要</h1>

        <div class="summary-grid">
          <div class="summary-card">
            <h3>教学表现</h3>
            <div class="summary-value">${stats.overview.avg_rating}/5.0</div>
            <div class="summary-label">平均评分 (${stats.overview.total_evaluations} 评价)</div>
          </div>

          <div class="summary-card">
            <h3>研究成果</h3>
            <div class="summary-value">${stats.research.total_outputs}</div>
            <div class="summary-label">研究产出总数</div>
          </div>

          <div class="summary-card">
            <h3>服务贡献</h3>
            <div class="summary-value">${stats.service.total_contributions}</div>
            <div class="summary-label">服务项目总数</div>
          </div>

          <div class="summary-card">
            <h3>专业发展</h3>
            <div class="summary-value">${stats.professional.total_development}</div>
            <div class="summary-label">发展活动总数</div>
          </div>
        </div>

        ${includeCharts ? `
        <div class="chart-placeholder">
          📊 综合表现趋势图表区域
          <br><small>（教学、研究、服务、专业发展综合评分趋势）</small>
        </div>
        ` : ''}

        <div class="note">
          <strong>说明:</strong> 本报告汇总了 ${teacher.name} 在教学、研究、服务、专业发展、履职经历等六大维度的综合表现。
          数据截止时间: ${new Date(generated_at).toLocaleDateString('zh-CN')}
        </div>
      </div>

      <!-- 教学模块 -->
      <div class="page">
        <h1>1. 教学表现</h1>

        <div class="section-stats">
          <div class="stat-item">
            <div class="stat-value">${stats.overview.total_courses}</div>
            <div class="stat-label">授课总数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.overview.avg_rating}</div>
            <div class="stat-label">平均评分</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.overview.total_evaluations}</div>
            <div class="stat-label">评价总数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${evaluations.length}</div>
            <div class="stat-label">评价期数</div>
          </div>
        </div>

        ${includeCharts ? `
        <div class="chart-placeholder">
          📈 学生评价趋势图
          <br><small>（各学期教学质量评分变化趋势）</small>
        </div>
        ` : ''}

        <h3>最近课程评价明细</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>学期</th>
              <th>年份</th>
              <th>总体评分</th>
              <th>教学质量</th>
              <th>课程内容</th>
              <th>可获得性</th>
              <th>评价数量</th>
            </tr>
          </thead>
          <tbody>
            ${evaluations.slice(0, 10).map(eval => `
              <tr>
                <td>${eval.semester}</td>
                <td>${eval.year}</td>
                <td>${(eval.avg_rating || 0).toFixed(2)}</td>
                <td>${(eval.avg_teaching || 0).toFixed(2)}</td>
                <td>${(eval.avg_content || 0).toFixed(2)}</td>
                <td>${(eval.avg_availability || 0).toFixed(2)}</td>
                <td>${eval.total_evaluations || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- 研究模块 -->
      <div class="page">
        <h1>2. 研究成果</h1>

        <div class="section-stats">
          <div class="stat-item">
            <div class="stat-value">${stats.research.publications}</div>
            <div class="stat-label">发表论文</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.research.grants}</div>
            <div class="stat-label">获得资助</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">¥${(stats.research.total_funding / 10000).toFixed(1)}万</div>
            <div class="stat-label">总资助额</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.research.total_citations}</div>
            <div class="stat-label">总引用数</div>
          </div>
        </div>

        ${includeCharts ? `
        <div class="chart-placeholder">
          📊 研究产出统计图
          <br><small>（论文发表和资助获得趋势）</small>
        </div>
        ` : ''}

        <h3>最近研究成果明细</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>类型</th>
              <th>标题</th>
              <th>日期</th>
              <th>影响因子</th>
              <th>引用数</th>
              <th>资助金额</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            ${research.slice(0, 10).map(item => `
              <tr>
                <td>${item.type}</td>
                <td>${item.title}</td>
                <td>${item.date ? new Date(item.date).toLocaleDateString('zh-CN') : '-'}</td>
                <td>${item.impact_factor || '-'}</td>
                <td>${item.citation_count || 0}</td>
                <td>${item.funding_amount ? '¥' + (item.funding_amount / 10000).toFixed(1) + '万' : '-'}</td>
                <td>${item.status || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- 服务模块 -->
      <div class="page">
        <h1>3. 服务贡献</h1>

        <div class="section-stats">
          <div class="stat-item">
            <div class="stat-value">${stats.service.committees}</div>
            <div class="stat-label">委员会工作</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.service.reviews}</div>
            <div class="stat-label">评议工作</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.service.total_hours}</div>
            <div class="stat-label">总服务时数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.service.total_contributions}</div>
            <div class="stat-label">服务项目总数</div>
          </div>
        </div>

        <h3>最近服务记录明细</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>类型</th>
              <th>标题</th>
              <th>组织机构</th>
              <th>角色</th>
              <th>开始日期</th>
              <th>结束日期</th>
              <th>工作时数</th>
            </tr>
          </thead>
          <tbody>
            ${service.slice(0, 10).map(item => `
              <tr>
                <td>${item.type}</td>
                <td>${item.title}</td>
                <td>${item.organization || '-'}</td>
                <td>${item.role || '-'}</td>
                <td>${item.start_date ? new Date(item.start_date).toLocaleDateString('zh-CN') : '-'}</td>
                <td>${item.end_date ? new Date(item.end_date).toLocaleDateString('zh-CN') : '进行中'}</td>
                <td>${item.workload_hours || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- 专业发展模块 -->
      <div class="page">
        <h1>4. 专业发展</h1>

        <div class="section-stats">
          <div class="stat-item">
            <div class="stat-value">${stats.professional.certifications}</div>
            <div class="stat-label">获得认证</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.professional.trainings}</div>
            <div class="stat-label">培训项目</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.professional.total_hours}</div>
            <div class="stat-label">总学习时数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats.professional.total_development}</div>
            <div class="stat-label">发展活动总数</div>
          </div>
        </div>

        <h3>最近专业发展记录</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>类型</th>
              <th>标题</th>
              <th>机构</th>
              <th>完成日期</th>
              <th>持续时间</th>
              <th>证书</th>
            </tr>
          </thead>
          <tbody>
            ${professional.slice(0, 10).map(item => `
              <tr>
                <td>${item.type}</td>
                <td>${item.title}</td>
                <td>${item.institution || '-'}</td>
                <td>${item.date_completed ? new Date(item.date_completed).toLocaleDateString('zh-CN') : '-'}</td>
                <td>${item.duration_hours ? item.duration_hours + '小时' : '-'}</td>
                <td>${item.certificate_url ? '✓' : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- 履职历程模块 -->
      <div class="page">
        <h1>5. 履职历程</h1>

        <h3>职业发展轨迹</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>类型</th>
              <th>标题</th>
              <th>组织机构</th>
              <th>开始日期</th>
              <th>结束日期</th>
              <th>成就级别</th>
              <th>描述</th>
            </tr>
          </thead>
          <tbody>
            ${career.slice(0, 15).map(item => `
              <tr>
                <td>${item.type}</td>
                <td>${item.title}</td>
                <td>${item.organization || '-'}</td>
                <td>${item.start_date ? new Date(item.start_date).toLocaleDateString('zh-CN') : '-'}</td>
                <td>${item.end_date ? new Date(item.end_date).toLocaleDateString('zh-CN') : '至今'}</td>
                <td>${item.achievement_level || '-'}</td>
                <td>${item.description ? item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '') : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- 附录页 -->
      <div class="page">
        <h1>附录</h1>

        <h2>数据统计摘要</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>模块</th>
              <th>主要指标</th>
              <th>数值</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>教学</td>
              <td>平均评分</td>
              <td>${stats.overview.avg_rating}/5.0</td>
              <td>基于 ${stats.overview.total_evaluations} 次学生评价</td>
            </tr>
            <tr>
              <td>研究</td>
              <td>总产出</td>
              <td>${stats.research.total_outputs} 项</td>
              <td>包含 ${stats.research.publications} 篇论文, ${stats.research.grants} 项资助</td>
            </tr>
            <tr>
              <td>服务</td>
              <td>服务时数</td>
              <td>${stats.service.total_hours} 小时</td>
              <td>涵盖 ${stats.service.total_contributions} 个服务项目</td>
            </tr>
            <tr>
              <td>专业发展</td>
              <td>学习时数</td>
              <td>${stats.professional.total_hours} 小时</td>
              <td>包含 ${stats.professional.certifications} 个认证</td>
            </tr>
          </tbody>
        </table>

        <div class="note">
          <strong>报告说明:</strong>
          <ul style="margin-top: 10px; padding-left: 20px;">
            <li>本报告数据来源于教师评价系统数据库</li>
            <li>生成时间: ${new Date(generated_at).toLocaleString('zh-CN')}</li>
            <li>数据统计截止: ${new Date().toLocaleDateString('zh-CN')}</li>
            <li>如需原始数据，请选择包含原始表格的ZIP格式导出</li>
          </ul>
        </div>
      </div>

      <div class="footer">
        Portfolio Report - Generated by Teacher Evaluation System
      </div>
    </body>
    </html>
  `;
}

// 生成其他类型报告的 HTML 模板
function generateOverviewHTML(data, includeCharts = true) {
  const { teacher, stats, generated_at } = data;

  return generateSimpleReportHTML({
    title: 'Performance Overview Report',
    teacher,
    generated_at,
    scope: 'overview',
    stats,
    includeCharts,
    content: `
      <h2>Teaching Performance</h2>
      <div class="section-stats">
        <div class="stat-item">
          <div class="stat-value">${stats.teaching.total_courses}</div>
          <div class="stat-label">Total Courses</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.teaching.avg_rating}</div>
          <div class="stat-label">Average Rating</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.teaching.total_evaluations}</div>
          <div class="stat-label">Total Evaluations</div>
        </div>
      </div>

      <h2>Research Highlights</h2>
      <div class="section-stats">
        <div class="stat-item">
          <div class="stat-value">${stats.research.total_outputs}</div>
          <div class="stat-label">Research Outputs</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.research.publications}</div>
          <div class="stat-label">Publications</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">¥${(stats.research.total_funding / 10000).toFixed(1)}万</div>
          <div class="stat-label">Total Funding</div>
        </div>
      </div>

      <h2>Service & Professional Development</h2>
      <div class="section-stats">
        <div class="stat-item">
          <div class="stat-value">${stats.service.total_contributions}</div>
          <div class="stat-label">Service Contributions</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.professional.total_development}</div>
          <div class="stat-label">Professional Activities</div>
        </div>
      </div>
    `
  });
}

function generateTeachingHTML(data, includeCharts = true) {
  const { teacher, stats, courses, evaluations, generated_at } = data;

  return generateSimpleReportHTML({
    title: 'Teaching Performance Report',
    teacher,
    generated_at,
    scope: 'teaching',
    stats,
    includeCharts,
    content: `
      <h2>Teaching Statistics</h2>
      <div class="section-stats">
        <div class="stat-item">
          <div class="stat-value">${stats.total_courses}</div>
          <div class="stat-label">Total Courses</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.avg_rating}</div>
          <div class="stat-label">Average Rating</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.avg_teaching_quality}</div>
          <div class="stat-label">Teaching Quality</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.avg_content_quality}</div>
          <div class="stat-label">Content Quality</div>
        </div>
      </div>

      ${includeCharts ? '<div class="chart-placeholder">📈 Teaching Performance Trends</div>' : ''}

      <h3>Recent Courses</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Semester</th>
            <th>Year</th>
            <th>Enrollment</th>
          </tr>
        </thead>
        <tbody>
          ${courses.slice(0, 10).map(course => `
            <tr>
              <td>${course.course_code}</td>
              <td>${course.course_name}</td>
              <td>${course.semester}</td>
              <td>${course.year}</td>
              <td>${course.enrollment || 0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  });
}

function generateResearchHTML(data, includeCharts = true) {
  const { teacher, stats, research, generated_at } = data;

  return generateSimpleReportHTML({
    title: 'Research Portfolio Report',
    teacher,
    generated_at,
    scope: 'research',
    stats,
    includeCharts,
    content: `
      <h2>Research Statistics</h2>
      <div class="section-stats">
        <div class="stat-item">
          <div class="stat-value">${stats.publications}</div>
          <div class="stat-label">Publications</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.grants}</div>
          <div class="stat-label">Grants</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">¥${(stats.total_funding / 10000).toFixed(1)}万</div>
          <div class="stat-label">Total Funding</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.total_citations}</div>
          <div class="stat-label">Citations</div>
        </div>
      </div>

      ${includeCharts ? '<div class="chart-placeholder">📊 Research Output Trends</div>' : ''}

      <h3>Recent Research Outputs</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>Date</th>
            <th>Impact Factor</th>
            <th>Citations</th>
            <th>Funding</th>
          </tr>
        </thead>
        <tbody>
          ${research.slice(0, 10).map(item => `
            <tr>
              <td>${item.type}</td>
              <td>${item.title}</td>
              <td>${item.date ? new Date(item.date).toLocaleDateString('zh-CN') : '-'}</td>
              <td>${item.impact_factor || '-'}</td>
              <td>${item.citation_count || 0}</td>
              <td>${item.funding_amount ? '¥' + (item.funding_amount / 10000).toFixed(1) + '万' : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  });
}

function generateServiceHTML(data, includeCharts = true) {
  const { teacher, stats, service, generated_at } = data;

  return generateSimpleReportHTML({
    title: 'Service Contributions Report',
    teacher,
    generated_at,
    scope: 'service',
    stats,
    includeCharts,
    content: `
      <h2>Service Statistics</h2>
      <div class="section-stats">
        <div class="stat-item">
          <div class="stat-value">${stats.committees}</div>
          <div class="stat-label">Committee Work</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.reviews}</div>
          <div class="stat-label">Review Activities</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.total_hours}</div>
          <div class="stat-label">Total Hours</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.avg_hours_per_service}</div>
          <div class="stat-label">Avg Hours/Service</div>
        </div>
      </div>

      <h3>Service Records</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>Organization</th>
            <th>Role</th>
            <th>Start Date</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          ${service.slice(0, 10).map(item => `
            <tr>
              <td>${item.type}</td>
              <td>${item.title}</td>
              <td>${item.organization || '-'}</td>
              <td>${item.role || '-'}</td>
              <td>${item.start_date ? new Date(item.start_date).toLocaleDateString('zh-CN') : '-'}</td>
              <td>${item.workload_hours || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  });
}

function generateProfessionalHTML(data, includeCharts = true) {
  const { teacher, stats, professional, generated_at } = data;

  return generateSimpleReportHTML({
    title: 'Professional Development Report',
    teacher,
    generated_at,
    scope: 'professional',
    stats,
    includeCharts,
    content: `
      <h2>Professional Development Statistics</h2>
      <div class="section-stats">
        <div class="stat-item">
          <div class="stat-value">${stats.certifications}</div>
          <div class="stat-label">Certifications</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.trainings}</div>
          <div class="stat-label">Training Programs</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.total_hours}</div>
          <div class="stat-label">Total Hours</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.avg_hours_per_activity}</div>
          <div class="stat-label">Avg Hours/Activity</div>
        </div>
      </div>

      <h3>Professional Development Activities</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>Institution</th>
            <th>Completed</th>
            <th>Duration</th>
            <th>Certificate</th>
          </tr>
        </thead>
        <tbody>
          ${professional.slice(0, 10).map(item => `
            <tr>
              <td>${item.type}</td>
              <td>${item.title}</td>
              <td>${item.institution || '-'}</td>
              <td>${item.date_completed ? new Date(item.date_completed).toLocaleDateString('zh-CN') : '-'}</td>
              <td>${item.duration_hours ? item.duration_hours + '小时' : '-'}</td>
              <td>${item.certificate_url ? '✓' : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  });
}

function generateCareerHTML(data, includeCharts = true) {
  const { teacher, stats, career, generated_at } = data;

  return generateSimpleReportHTML({
    title: 'Career Journey Report',
    teacher,
    generated_at,
    scope: 'career',
    stats,
    includeCharts,
    content: `
      <h2>Career Statistics</h2>
      <div class="section-stats">
        <div class="stat-item">
          <div class="stat-value">${stats.positions}</div>
          <div class="stat-label">Positions</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.awards}</div>
          <div class="stat-label">Awards</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.national_level}</div>
          <div class="stat-label">National Level</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.international_level}</div>
          <div class="stat-label">International Level</div>
        </div>
      </div>

      <h3>Career Timeline</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>Organization</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Achievement Level</th>
          </tr>
        </thead>
        <tbody>
          ${career.slice(0, 15).map(item => `
            <tr>
              <td>${item.type}</td>
              <td>${item.title}</td>
              <td>${item.organization || '-'}</td>
              <td>${item.start_date ? new Date(item.start_date).toLocaleDateString('zh-CN') : '-'}</td>
              <td>${item.end_date ? new Date(item.end_date).toLocaleDateString('zh-CN') : '至今'}</td>
              <td>${item.achievement_level || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
  });
}

// 通用的简单报告 HTML 模板
function generateSimpleReportHTML({ title, teacher, generated_at, scope, stats, includeCharts, content }) {
  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - ${teacher.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
          padding: 40px;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #4f46e5;
        }

        .report-title {
          font-size: 32px;
          color: #4f46e5;
          margin-bottom: 10px;
        }

        .teacher-info {
          font-size: 18px;
          color: #666;
        }

        h2 {
          font-size: 24px;
          color: #6366f1;
          margin: 30px 0 20px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }

        h3 {
          font-size: 18px;
          color: #4338ca;
          margin: 20px 0 15px;
        }

        .section-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin: 20px 0;
        }

        .stat-item {
          background: #fafafa;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          border-left: 4px solid #4f46e5;
        }

        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #4f46e5;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 12px;
        }

        .data-table th,
        .data-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        .data-table th {
          background-color: #4f46e5;
          color: white;
          font-weight: bold;
        }

        .data-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }

        .chart-placeholder {
          width: 100%;
          height: 200px;
          background: linear-gradient(45deg, #f0f9ff, #e0e7ff);
          border: 2px dashed #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4f46e5;
          font-weight: bold;
          margin: 20px 0;
          border-radius: 8px;
        }

        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="report-title">${title}</div>
        <div class="teacher-info">
          ${teacher.name} - ${teacher.department} - ${teacher.position}
          <br>
          Generated: ${new Date(generated_at).toLocaleString('zh-CN')}
        </div>
      </div>

      ${content}

      <div class="footer">
        Report generated by Teacher Evaluation System - ${new Date().toLocaleDateString('zh-CN')}
      </div>
    </body>
    </html>
  `;
}

module.exports = router;