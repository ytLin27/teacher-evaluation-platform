// Schoolday API格式的Mock数据
// 基于文档中提到的Schoolday Partner API、OneRoster API、Discovery API等规范

const schooldayMockData = {
  // OAuth 2.0 Token Response
  oauthToken: {
    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    token_type: "Bearer",
    expires_in: 3600,
    scope: "read:districts read:teachers read:courses read:evaluations",
    refresh_token: "rt_1234567890abcdef"
  },

  // Discovery API Response - 自动发现连接的学区
  districts: {
    data: [
      {
        id: "district_001",
        name: "Riverside Unified School District",
        type: "public",
        state: "CA",
        city: "Riverside",
        status: "active",
        enrollment: 42000,
        schools_count: 58,
        teachers_count: 2100,
        connected_date: "2023-08-15T00:00:00Z",
        metadata: {
          district_code: "RUSD001",
          timezone: "America/Los_Angeles",
          academic_year: "2024-2025"
        }
      },
      {
        id: "district_002",
        name: "Pacific Coast Academy District",
        type: "charter",
        state: "CA",
        city: "San Diego",
        status: "active",
        enrollment: 15000,
        schools_count: 12,
        teachers_count: 750,
        connected_date: "2023-09-01T00:00:00Z",
        metadata: {
          district_code: "PCAD002",
          timezone: "America/Los_Angeles",
          academic_year: "2024-2025"
        }
      }
    ],
    pagination: {
      total: 2,
      page: 1,
      per_page: 50,
      has_more: false
    }
  },

  // OneRoster API Format - Teachers (符合OneRoster 1.1规范)
  oneRosterTeachers: {
    users: [
      {
        sourcedId: "teacher_001",
        status: "active",
        dateLastModified: "2024-08-15T10:30:00Z",
        metadata: {
          district_id: "district_001",
          school_id: "school_001"
        },
        username: "jane.doe",
        userIds: [
          {
            type: "schoolday_id",
            identifier: "sd_teacher_001"
          },
          {
            type: "sis_id",
            identifier: "emp_12345"
          }
        ],
        givenName: "Jane",
        familyName: "Doe",
        middleName: "Marie",
        email: "jane.doe@riverside.edu",
        sms: "+1-555-0123",
        phone: "+1-555-0123",
        identifier: "jane.doe",
        role: "teacher",
        grades: ["9", "10", "11", "12"],
        orgs: [
          {
            href: "https://api.schoolday.com/ims/oneroster/v1p1/orgs/school_001",
            sourcedId: "school_001",
            type: "org"
          }
        ],
        agents: [],
        demographics: {
          gender: "female",
          birthDate: "1985-03-22"
        }
      },
      {
        sourcedId: "teacher_002",
        status: "active",
        dateLastModified: "2024-08-20T14:45:00Z",
        metadata: {
          district_id: "district_001",
          school_id: "school_001"
        },
        username: "john.smith",
        userIds: [
          {
            type: "schoolday_id",
            identifier: "sd_teacher_002"
          }
        ],
        givenName: "John",
        familyName: "Smith",
        email: "john.smith@riverside.edu",
        phone: "+1-555-0124",
        identifier: "john.smith",
        role: "teacher",
        grades: ["11", "12"],
        orgs: [
          {
            href: "https://api.schoolday.com/ims/oneroster/v1p1/orgs/school_001",
            sourcedId: "school_001",
            type: "org"
          }
        ]
      },
      {
        sourcedId: "teacher_003",
        status: "active",
        dateLastModified: "2024-09-01T09:15:00Z",
        metadata: {
          district_id: "district_002",
          school_id: "school_002"
        },
        username: "emily.johnson",
        userIds: [
          {
            type: "schoolday_id",
            identifier: "sd_teacher_003"
          }
        ],
        givenName: "Emily",
        familyName: "Johnson",
        email: "emily.johnson@pacificcoast.edu",
        phone: "+1-555-0125",
        identifier: "emily.johnson",
        role: "teacher",
        grades: ["9", "10"],
        orgs: [
          {
            href: "https://api.schoolday.com/ims/oneroster/v1p1/orgs/school_002",
            sourcedId: "school_002",
            type: "org"
          }
        ]
      }
    ]
  },

  // OneRoster API Format - Courses
  oneRosterCourses: {
    classes: [
      {
        sourcedId: "class_001",
        status: "active",
        dateLastModified: "2024-08-15T10:30:00Z",
        metadata: {
          district_id: "district_001",
          school_id: "school_001",
          subject_area: "computer_science"
        },
        title: "Introduction to Programming",
        classCode: "CS101",
        classType: "scheduled",
        location: "Room 205",
        periods: ["3"],
        course: {
          href: "https://api.schoolday.com/ims/oneroster/v1p1/courses/course_001",
          sourcedId: "course_001",
          type: "course"
        },
        school: {
          href: "https://api.schoolday.com/ims/oneroster/v1p1/orgs/school_001",
          sourcedId: "school_001",
          type: "org"
        },
        terms: [
          {
            href: "https://api.schoolday.com/ims/oneroster/v1p1/terms/term_fall_2024",
            sourcedId: "term_fall_2024",
            type: "academicSession"
          }
        ],
        subjects: ["Computer Science"],
        grades: ["9", "10", "11", "12"]
      },
      {
        sourcedId: "class_002",
        status: "active",
        dateLastModified: "2024-08-15T10:30:00Z",
        metadata: {
          district_id: "district_001",
          school_id: "school_001",
          subject_area: "computer_science"
        },
        title: "Machine Learning",
        classCode: "CS401",
        classType: "scheduled",
        location: "Lab 101",
        periods: ["5"],
        course: {
          href: "https://api.schoolday.com/ims/oneroster/v1p1/courses/course_002",
          sourcedId: "course_002",
          type: "course"
        },
        school: {
          href: "https://api.schoolday.com/ims/oneroster/v1p1/orgs/school_001",
          sourcedId: "school_001",
          type: "org"
        },
        terms: [
          {
            href: "https://api.schoolday.com/ims/oneroster/v1p1/terms/term_spring_2024",
            sourcedId: "term_spring_2024",
            type: "academicSession"
          }
        ],
        subjects: ["Computer Science"],
        grades: ["11", "12"]
      },
      {
        sourcedId: "class_003",
        status: "active",
        dateLastModified: "2024-08-20T14:45:00Z",
        metadata: {
          district_id: "district_001",
          school_id: "school_001",
          subject_area: "mathematics"
        },
        title: "Calculus II",
        classCode: "MATH201",
        classType: "scheduled",
        location: "Room 301",
        periods: ["2"],
        course: {
          href: "https://api.schoolday.com/ims/oneroster/v1p1/courses/course_003",
          sourcedId: "course_003",
          type: "course"
        },
        school: {
          href: "https://api.schoolday.com/ims/oneroster/v1p1/orgs/school_001",
          sourcedId: "school_001",
          type: "org"
        },
        terms: [
          {
            href: "https://api.schoolday.com/ims/oneroster/v1p1/terms/term_spring_2024",
            sourcedId: "term_spring_2024",
            type: "academicSession"
          }
        ],
        subjects: ["Mathematics"],
        grades: ["11", "12"]
      }
    ]
  },

  // Schoolday Academy API - Professional Development Courses
  academyCourses: {
    courses: [
      {
        id: "academy_001",
        title: "Advanced Teaching Techniques in STEM",
        description: "Learn cutting-edge pedagogical approaches for science, technology, engineering, and mathematics education.",
        provider: "Schoolday Academy",
        category: "teaching_methods",
        level: "intermediate",
        duration_hours: 20,
        format: "online",
        cost: 299.00,
        currency: "USD",
        enrollment: {
          start_date: "2024-01-15T00:00:00Z",
          end_date: "2024-12-15T23:59:59Z",
          capacity: 100,
          enrolled: 45
        },
        prerequisites: ["teaching_certificate"],
        learning_objectives: [
          "Master inquiry-based learning techniques",
          "Implement project-based STEM curricula",
          "Assess student understanding effectively"
        ],
        certification: {
          available: true,
          type: "completion_certificate",
          credits: 2.0,
          accreditation: "State Teaching Council"
        },
        instructor: {
          name: "Dr. Sarah Williams",
          credentials: "Ph.D. in Education, 15 years experience",
          rating: 4.8
        },
        schedule: {
          self_paced: true,
          live_sessions: [
            {
              date: "2024-10-15T18:00:00Z",
              duration_minutes: 90,
              topic: "Interactive STEM Demonstrations"
            }
          ]
        }
      },
      {
        id: "academy_002",
        title: "Classroom Management for New Teachers",
        description: "Essential strategies for creating positive learning environments and managing diverse student populations.",
        provider: "Schoolday Academy",
        category: "classroom_management",
        level: "beginner",
        duration_hours: 15,
        format: "hybrid",
        cost: 199.00,
        currency: "USD",
        enrollment: {
          start_date: "2024-02-01T00:00:00Z",
          end_date: "2024-11-30T23:59:59Z",
          capacity: 150,
          enrolled: 89
        },
        prerequisites: [],
        learning_objectives: [
          "Develop effective classroom rules and procedures",
          "Handle disruptive behavior constructively",
          "Build positive relationships with students"
        ],
        certification: {
          available: true,
          type: "completion_certificate",
          credits: 1.5,
          accreditation: "National Education Association"
        },
        instructor: {
          name: "Prof. Michael Chen",
          credentials: "M.Ed. in Educational Leadership",
          rating: 4.7
        }
      },
      {
        id: "academy_003",
        title: "Data-Driven Instruction and Assessment",
        description: "Harness the power of educational data to improve student outcomes and personalize learning experiences.",
        provider: "Schoolday Academy",
        category: "assessment",
        level: "advanced",
        duration_hours: 25,
        format: "online",
        cost: 399.00,
        currency: "USD",
        enrollment: {
          start_date: "2024-03-01T00:00:00Z",
          end_date: "2024-12-31T23:59:59Z",
          capacity: 75,
          enrolled: 23
        },
        prerequisites: ["basic_statistics", "2_years_teaching_experience"],
        learning_objectives: [
          "Analyze student performance data effectively",
          "Design formative and summative assessments",
          "Implement differentiated instruction strategies"
        ],
        certification: {
          available: true,
          type: "professional_certificate",
          credits: 3.0,
          accreditation: "International Association of Educational Assessment"
        },
        instructor: {
          name: "Dr. Lisa Rodriguez",
          credentials: "Ph.D. in Educational Measurement",
          rating: 4.9
        }
      }
    ],
    recommendations: [
      {
        teacher_id: "teacher_001",
        recommended_courses: ["academy_001", "academy_003"],
        reason: "Based on your Computer Science background and interest in data analysis",
        confidence_score: 0.85
      },
      {
        teacher_id: "teacher_002",
        recommended_courses: ["academy_003"],
        reason: "Complement your Mathematics expertise with assessment skills",
        confidence_score: 0.78
      },
      {
        teacher_id: "teacher_003",
        recommended_courses: ["academy_002", "academy_001"],
        reason: "As a new faculty member, these courses will enhance your teaching foundation",
        confidence_score: 0.92
      }
    ]
  },

  // Schoolday Partner API - 教师评价集成数据
  evaluationIntegration: {
    sync_status: {
      last_sync: "2024-09-19T10:30:00Z",
      status: "completed",
      records_processed: 1247,
      errors: 0,
      next_scheduled_sync: "2024-09-20T02:00:00Z"
    },
    webhook_events: [
      {
        id: "event_001",
        type: "teacher.evaluation.submitted",
        timestamp: "2024-09-19T09:15:00Z",
        data: {
          teacher_id: "teacher_001",
          evaluation_id: "eval_2024_fall_001",
          course_id: "class_001",
          submitted_by: "student_group",
          status: "completed"
        }
      },
      {
        id: "event_002",
        type: "roster.updated",
        timestamp: "2024-09-19T08:45:00Z",
        data: {
          class_id: "class_002",
          changes: ["enrollment_updated"],
          new_enrollment: 47
        }
      }
    ],
    rate_limiting: {
      requests_per_hour: 1000,
      current_usage: 245,
      reset_time: "2024-09-19T11:00:00Z"
    }
  }
};

module.exports = schooldayMockData;