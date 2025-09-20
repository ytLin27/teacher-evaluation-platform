/**
 * Discovery API Routes
 * 模拟 Schoolday Discovery API - 区域/学校发现服务
 */

const express = require('express');
const mockData = require('../utils/mockDataGenerator');
const router = express.Router();

// 验证中间件
function authenticateDiscovery(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Bearer token required for Discovery API access'
    });
  }

  next();
}

router.use(authenticateDiscovery);

/**
 * Discovery API Info
 */
router.get('/', (req, res) => {
  res.json({
    service: 'Schoolday Discovery API',
    version: '2.0',
    description: 'Discover districts, schools, and educational organizations',
    endpoints: {
      districts: '/districts',
      schools: '/schools',
      search: '/search'
    },
    features: [
      'Geographic search',
      'Hierarchical organization discovery',
      'Real-time availability status',
      'Integration capability indicators'
    ]
  });
});

/**
 * Get All Districts
 */
router.get('/districts', (req, res) => {
  try {
    const {
      state,
      region,
      search,
      limit = 50,
      offset = 0,
      include_schools = false
    } = req.query;

    let districts = mockData.getDistricts().map(district => ({
      ...district,
      // 添加 Discovery API 特定字段
      geographic_info: {
        state: 'CA',
        region: 'Northern California',
        county: 'San Francisco County',
        timezone: 'America/Los_Angeles'
      },
      contact_info: {
        superintendent: `Dr. ${generateRandomName()}`,
        phone: generatePhoneNumber(),
        website: `https://${district.name.toLowerCase().replace(/\s+/g, '')}.edu`,
        address: generateAddress()
      },
      enrollment_stats: {
        total_students: 5000 + Math.floor(Math.random() * 15000),
        total_teachers: 200 + Math.floor(Math.random() * 800),
        total_schools: mockData.getSchoolsByDistrict(district.sourcedId).length,
        grade_levels: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
      },
      integration_status: {
        sis_connected: true,
        lms_connected: Math.random() > 0.3,
        assessment_connected: Math.random() > 0.5,
        last_sync: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      schoolday_features: {
        teacher_evaluation: true,
        professional_development: true,
        data_analytics: true,
        parent_engagement: Math.random() > 0.4
      }
    }));

    // 应用过滤器
    if (state) {
      districts = districts.filter(d => d.geographic_info.state === state.toUpperCase());
    }

    if (region) {
      districts = districts.filter(d =>
        d.geographic_info.region.toLowerCase().includes(region.toLowerCase())
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      districts = districts.filter(d =>
        d.name.toLowerCase().includes(searchLower) ||
        d.identifier.toLowerCase().includes(searchLower)
      );
    }

    // 分页
    const total = districts.length;
    const paginatedDistricts = districts.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    // 包含学校信息
    if (include_schools === 'true') {
      paginatedDistricts.forEach(district => {
        district.schools = mockData.getSchoolsByDistrict(district.sourcedId);
      });
    }

    res.json({
      districts: paginatedDistricts,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      },
      filters_applied: {
        state: state || null,
        region: region || null,
        search: search || null
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Get District by ID
 */
router.get('/districts/:id', (req, res) => {
  try {
    const districtId = req.params.id;
    const district = mockData.getDistricts().find(d => d.sourcedId === districtId);

    if (!district) {
      return res.status(404).json({
        error: 'not_found',
        message: `District with ID ${districtId} not found`
      });
    }

    // 增强的学区信息
    const enhancedDistrict = {
      ...district,
      geographic_info: {
        state: 'CA',
        region: 'Northern California',
        county: 'San Francisco County',
        timezone: 'America/Los_Angeles',
        coordinates: {
          latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
          longitude: -122.4194 + (Math.random() - 0.5) * 0.1
        }
      },
      contact_info: {
        superintendent: `Dr. ${generateRandomName()}`,
        phone: generatePhoneNumber(),
        email: `superintendent@${district.name.toLowerCase().replace(/\s+/g, '')}.edu`,
        website: `https://${district.name.toLowerCase().replace(/\s+/g, '')}.edu`,
        address: generateAddress()
      },
      enrollment_stats: {
        total_students: 5000 + Math.floor(Math.random() * 15000),
        total_teachers: 200 + Math.floor(Math.random() * 800),
        total_schools: mockData.getSchoolsByDistrict(districtId).length,
        grade_levels: ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        student_teacher_ratio: (15 + Math.random() * 10).toFixed(1)
      },
      schools: mockData.getSchoolsByDistrict(districtId),
      integration_status: {
        sis_connected: true,
        sis_provider: 'PowerSchool',
        lms_connected: Math.random() > 0.3,
        lms_provider: Math.random() > 0.5 ? 'Canvas' : 'Google Classroom',
        assessment_connected: Math.random() > 0.5,
        last_sync: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        sync_frequency: 'daily'
      },
      schoolday_features: {
        teacher_evaluation: true,
        professional_development: true,
        data_analytics: true,
        parent_engagement: Math.random() > 0.4,
        peer_observation: true,
        goal_setting: true
      },
      api_capabilities: {
        oneRoster_support: true,
        webhook_support: true,
        real_time_sync: true,
        bulk_operations: true
      }
    };

    res.json({ district: enhancedDistrict });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Get Schools in District
 */
router.get('/districts/:id/schools', (req, res) => {
  try {
    const districtId = req.params.id;
    const {
      school_type,
      grade_level,
      search,
      limit = 50,
      offset = 0
    } = req.query;

    let schools = mockData.getSchoolsByDistrict(districtId);

    if (schools.length === 0) {
      return res.status(404).json({
        error: 'not_found',
        message: `No schools found for district ${districtId}`
      });
    }

    // 增强学校信息
    schools = schools.map(school => ({
      ...school,
      principal: {
        name: `${generateRandomName()}`,
        email: `principal@${school.name.toLowerCase().replace(/\s+/g, '')}.edu`,
        phone: generatePhoneNumber()
      },
      enrollment: school.metadata.student_count,
      teacher_count: 20 + Math.floor(Math.random() * 50),
      performance_metrics: {
        academic_rating: (3.0 + Math.random() * 2.0).toFixed(1),
        graduation_rate: school.schoolType === 'high' ? (85 + Math.random() * 15).toFixed(1) + '%' : null,
        college_readiness: school.schoolType === 'high' ? (70 + Math.random() * 30).toFixed(1) + '%' : null
      },
      facilities: {
        library: true,
        computer_lab: Math.random() > 0.2,
        science_lab: school.schoolType !== 'elementary',
        gymnasium: true,
        cafeteria: true
      }
    }));

    // 应用过滤器
    if (school_type) {
      schools = schools.filter(s => s.schoolType === school_type);
    }

    if (grade_level) {
      schools = schools.filter(s => s.metadata.grade_levels.includes(grade_level));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      schools = schools.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.identifier.toLowerCase().includes(searchLower)
      );
    }

    // 分页
    const total = schools.length;
    const paginatedSchools = schools.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      schools: paginatedSchools,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      },
      filters_applied: {
        school_type: school_type || null,
        grade_level: grade_level || null,
        search: search || null
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

/**
 * Universal Search
 */
router.get('/search', (req, res) => {
  try {
    const {
      q: query,
      type = 'all',
      limit = 20,
      offset = 0
    } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'missing_parameter',
        message: 'Search query parameter "q" is required'
      });
    }

    const searchLower = query.toLowerCase();
    let results = [];

    // 搜索学区
    if (type === 'all' || type === 'district') {
      const districts = mockData.getDistricts()
        .filter(d =>
          d.name.toLowerCase().includes(searchLower) ||
          d.identifier.toLowerCase().includes(searchLower)
        )
        .map(d => ({
          ...d,
          result_type: 'district',
          match_field: d.name.toLowerCase().includes(searchLower) ? 'name' : 'identifier'
        }));
      results.push(...districts);
    }

    // 搜索学校
    if (type === 'all' || type === 'school') {
      const schools = mockData.getSchools()
        .filter(s =>
          s.name.toLowerCase().includes(searchLower) ||
          s.identifier.toLowerCase().includes(searchLower) ||
          s.schoolType.toLowerCase().includes(searchLower)
        )
        .map(s => ({
          ...s,
          result_type: 'school',
          match_field: s.name.toLowerCase().includes(searchLower) ? 'name' :
                      s.identifier.toLowerCase().includes(searchLower) ? 'identifier' : 'type'
        }));
      results.push(...schools);
    }

    // 搜索教师 (如果需要)
    if (type === 'all' || type === 'teacher') {
      const teachers = mockData.getTeachers()
        .filter(t =>
          `${t.givenName} ${t.familyName}`.toLowerCase().includes(searchLower) ||
          t.email.toLowerCase().includes(searchLower) ||
          t.subjects.some(subject => subject.toLowerCase().includes(searchLower))
        )
        .slice(0, 10) // 限制教师结果数量
        .map(t => ({
          sourcedId: t.sourcedId,
          name: `${t.givenName} ${t.familyName}`,
          email: t.email,
          subjects: t.subjects,
          school: t.orgs[0]?.sourcedId,
          result_type: 'teacher',
          match_field: `${t.givenName} ${t.familyName}`.toLowerCase().includes(searchLower) ? 'name' :
                      t.email.toLowerCase().includes(searchLower) ? 'email' : 'subject'
        }));
      results.push(...teachers);
    }

    // 排序 - 名称匹配优先
    results.sort((a, b) => {
      if (a.match_field === 'name' && b.match_field !== 'name') return -1;
      if (a.match_field !== 'name' && b.match_field === 'name') return 1;
      return 0;
    });

    // 分页
    const total = results.length;
    const paginatedResults = results.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    res.json({
      search_results: paginatedResults,
      search_info: {
        query,
        type,
        total_results: total,
        result_types: {
          districts: results.filter(r => r.result_type === 'district').length,
          schools: results.filter(r => r.result_type === 'school').length,
          teachers: results.filter(r => r.result_type === 'teacher').length
        }
      },
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
});

// 辅助函数
function generateRandomName() {
  const firstNames = ['Michael', 'Sarah', 'David', 'Jennifer', 'Robert', 'Linda', 'John', 'Mary'];
  const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez'];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return `${firstName} ${lastName}`;
}

function generatePhoneNumber() {
  const area = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `(${area}) ${exchange}-${number}`;
}

function generateAddress() {
  const streets = ['Main St', 'Oak Ave', 'Elm Dr', 'Park Blvd', 'School Rd', 'Education Way'];
  const number = Math.floor(Math.random() * 9999) + 1;
  const street = streets[Math.floor(Math.random() * streets.length)];
  const cities = ['San Francisco', 'Oakland', 'San Jose', 'Berkeley', 'Palo Alto'];
  const city = cities[Math.floor(Math.random() * cities.length)];

  return {
    street: `${number} ${street}`,
    city: city,
    state: 'CA',
    zip: `${94000 + Math.floor(Math.random() * 999)}`
  };
}

module.exports = router;