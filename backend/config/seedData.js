const database = require('./database');

const seedData = {
  // 教师数据
  teachers: [
    {
      name: "Dr. Jane Doe",
      email: "jane.doe@university.edu",
      department: "Computer Science",
      position: "Associate Professor",
      hire_date: "2018-08-15",
      photo_url: "/images/jane-doe.jpg",
      bio: "Dr. Jane Doe specializes in machine learning and artificial intelligence. She has published over 30 papers in top-tier conferences and has been teaching for 8 years."
    },
    {
      name: "Prof. John Smith",
      email: "john.smith@university.edu",
      department: "Mathematics",
      position: "Full Professor",
      hire_date: "2010-01-20",
      photo_url: "/images/john-smith.jpg",
      bio: "Prof. John Smith is an expert in applied mathematics with a focus on numerical analysis and computational methods."
    },
    {
      name: "Dr. Emily Johnson",
      email: "emily.johnson@university.edu",
      department: "Physics",
      position: "Assistant Professor",
      hire_date: "2020-09-01",
      photo_url: "/images/emily-johnson.jpg",
      bio: "Dr. Emily Johnson conducts research in quantum physics and has a passion for making complex physics concepts accessible to students."
    }
  ],

  // 课程数据
  courses: [
    { teacher_id: 1, course_code: "CS101", course_name: "Introduction to Programming", semester: "Fall", year: 2024, enrollment: 120 },
    { teacher_id: 1, course_code: "CS401", course_name: "Machine Learning", semester: "Spring", year: 2024, enrollment: 45 },
    { teacher_id: 1, course_code: "CS301", course_name: "Data Structures", semester: "Fall", year: 2023, enrollment: 80 },
    { teacher_id: 2, course_code: "MATH201", course_name: "Calculus II", semester: "Spring", year: 2024, enrollment: 200 },
    { teacher_id: 2, course_code: "MATH301", course_name: "Numerical Analysis", semester: "Fall", year: 2024, enrollment: 35 },
    { teacher_id: 3, course_code: "PHYS101", course_name: "General Physics I", semester: "Fall", year: 2024, enrollment: 150 },
    { teacher_id: 3, course_code: "PHYS401", course_name: "Quantum Mechanics", semester: "Spring", year: 2024, enrollment: 25 }
  ],

  // 学生评价数据
  studentEvaluations: [
    // Jane Doe的评价数据
    { course_id: 1, teacher_id: 1, semester: "Fall", year: 2024, overall_rating: 4.5, teaching_quality: 4.6, course_content: 4.4, availability: 4.3, comments: "Excellent instructor, very clear explanations" },
    { course_id: 2, teacher_id: 1, semester: "Spring", year: 2024, overall_rating: 4.7, teaching_quality: 4.8, course_content: 4.6, availability: 4.5, comments: "Best ML course I've taken" },
    { course_id: 3, teacher_id: 1, semester: "Fall", year: 2023, overall_rating: 4.4, teaching_quality: 4.5, course_content: 4.3, availability: 4.2, comments: "Challenging but rewarding course" },
    // 历史评价数据用于趋势分析
    { course_id: 1, teacher_id: 1, semester: "Fall", year: 2023, overall_rating: 4.2, teaching_quality: 4.3, course_content: 4.1, availability: 4.0, comments: "Good course structure" },
    { course_id: 1, teacher_id: 1, semester: "Fall", year: 2022, overall_rating: 4.0, teaching_quality: 4.1, course_content: 3.9, availability: 3.8, comments: "Room for improvement" },

    // John Smith的评价数据
    { course_id: 4, teacher_id: 2, semester: "Spring", year: 2024, overall_rating: 4.3, teaching_quality: 4.4, course_content: 4.2, availability: 4.1, comments: "Clear mathematical explanations" },
    { course_id: 5, teacher_id: 2, semester: "Fall", year: 2024, overall_rating: 4.6, teaching_quality: 4.7, course_content: 4.5, availability: 4.4, comments: "Excellent advanced course" },

    // Emily Johnson的评价数据
    { course_id: 6, teacher_id: 3, semester: "Fall", year: 2024, overall_rating: 4.1, teaching_quality: 4.2, course_content: 4.0, availability: 3.9, comments: "Enthusiastic teaching style" },
    { course_id: 7, teacher_id: 3, semester: "Spring", year: 2024, overall_rating: 4.4, teaching_quality: 4.5, course_content: 4.3, availability: 4.2, comments: "Complex but well-taught" }
  ],

  // 研究成果数据
  researchOutputs: [
    // Jane Doe的研究成果
    { teacher_id: 1, type: "publication", title: "Deep Learning Approaches for Natural Language Processing", description: "A comprehensive survey of deep learning methods in NLP", date: "2024-03-15", impact_factor: 5.2, citation_count: 45, url: "https://example.com/paper1" },
    { teacher_id: 1, type: "grant", title: "NSF Grant for AI Research", description: "Machine Learning for Climate Change Prediction", date: "2023-09-01", funding_amount: 250000, status: "Active" },
    { teacher_id: 1, type: "publication", title: "Transformer Architectures in Computer Vision", description: "Novel applications of attention mechanisms", date: "2023-11-20", impact_factor: 4.8, citation_count: 32, url: "https://example.com/paper2" },
    { teacher_id: 1, type: "patent", title: "Automated Code Generation System", description: "AI-powered programming assistant", date: "2024-01-10", status: "Pending" },

    // John Smith的研究成果
    { teacher_id: 2, type: "publication", title: "Numerical Methods for Partial Differential Equations", description: "Advanced computational techniques", date: "2024-02-28", impact_factor: 3.9, citation_count: 28, url: "https://example.com/paper3" },
    { teacher_id: 2, type: "grant", title: "DOE Computational Mathematics Grant", description: "High-performance computing research", date: "2023-07-15", funding_amount: 180000, status: "Active" },

    // Emily Johnson的研究成果
    { teacher_id: 3, type: "publication", title: "Quantum Entanglement in Many-Body Systems", description: "Theoretical advances in quantum mechanics", date: "2024-01-05", impact_factor: 6.1, citation_count: 18, url: "https://example.com/paper4" },
    { teacher_id: 3, type: "grant", title: "NASA Quantum Research Fellowship", description: "Quantum computing applications", date: "2024-06-01", funding_amount: 120000, status: "Active" }
  ],

  // 服务贡献数据
  serviceContributions: [
    // Jane Doe的服务
    { teacher_id: 1, type: "committee", title: "Faculty Search Committee", organization: "Computer Science Department", role: "Committee Member", start_date: "2024-01-01", end_date: "2024-06-30", description: "Participated in hiring process for new faculty", workload_hours: 40 },
    { teacher_id: 1, type: "review", title: "Journal Reviewer", organization: "IEEE Transactions on AI", role: "Peer Reviewer", start_date: "2023-01-01", end_date: null, description: "Regular reviewer for AI research papers", workload_hours: 60 },
    { teacher_id: 1, type: "community", title: "STEM Outreach Program", organization: "Local High Schools", role: "Volunteer Instructor", start_date: "2023-09-01", end_date: "2024-05-31", description: "Teaching programming to high school students", workload_hours: 80 },

    // John Smith的服务
    { teacher_id: 2, type: "committee", title: "Curriculum Committee", organization: "Mathematics Department", role: "Chair", start_date: "2023-08-01", end_date: null, description: "Leading curriculum reform initiatives", workload_hours: 120 },
    { teacher_id: 2, type: "review", title: "Conference Program Committee", organization: "SIAM Conference", role: "Program Committee Member", start_date: "2024-01-01", end_date: "2024-07-31", description: "Reviewing conference submissions", workload_hours: 50 },

    // Emily Johnson的服务
    { teacher_id: 3, type: "committee", title: "Student Affairs Committee", organization: "Physics Department", role: "Committee Member", start_date: "2023-01-01", end_date: null, description: "Addressing student academic concerns", workload_hours: 30 },
    { teacher_id: 3, type: "community", title: "Physics Olympiad Mentor", organization: "Regional Science Fair", role: "Mentor", start_date: "2023-10-01", end_date: "2024-04-30", description: "Mentoring high school physics competition teams", workload_hours: 45 }
  ],

  // 专业发展数据
  professionalDevelopment: [
    // Jane Doe的专业发展
    { teacher_id: 1, type: "education", title: "Ph.D. in Computer Science", institution: "Stanford University", date_completed: "2016-06-15", description: "Dissertation on Machine Learning Algorithms" },
    { teacher_id: 1, type: "certification", title: "AWS Certified Machine Learning", institution: "Amazon Web Services", date_completed: "2023-08-20", duration_hours: 40, certificate_url: "https://aws.amazon.com/cert123" },
    { teacher_id: 1, type: "conference", title: "NeurIPS Conference", institution: "Neural Information Processing Systems", date_completed: "2023-12-15", duration_hours: 32, description: "Attended workshops on latest ML research" },
    { teacher_id: 1, type: "training", title: "Teaching Excellence Workshop", institution: "University Teaching Center", date_completed: "2024-01-10", duration_hours: 16, description: "Advanced pedagogical techniques" },

    // John Smith的专业发展
    { teacher_id: 2, type: "education", title: "Ph.D. in Mathematics", institution: "MIT", date_completed: "2008-05-20", description: "Specialization in Numerical Analysis" },
    { teacher_id: 2, type: "certification", title: "High-Performance Computing Certificate", institution: "Supercomputing Institute", date_completed: "2023-09-15", duration_hours: 60 },
    { teacher_id: 2, type: "conference", title: "SIAM Annual Meeting", institution: "Society for Industrial and Applied Mathematics", date_completed: "2024-03-20", duration_hours: 24 },

    // Emily Johnson的专业发展
    { teacher_id: 3, type: "education", title: "Ph.D. in Physics", institution: "Caltech", date_completed: "2019-08-30", description: "Research in Quantum Mechanics" },
    { teacher_id: 3, type: "training", title: "Quantum Computing Bootcamp", institution: "IBM Quantum", date_completed: "2023-11-05", duration_hours: 80, description: "Hands-on quantum programming" },
    { teacher_id: 3, type: "conference", title: "APS March Meeting", institution: "American Physical Society", date_completed: "2024-03-08", duration_hours: 40 }
  ],

  // 职业历程数据
  careerHistory: [
    // Jane Doe的职业历程
    { teacher_id: 1, type: "position", title: "Software Engineer", organization: "Google", start_date: "2016-07-01", end_date: "2018-07-31", description: "Worked on machine learning infrastructure" },
    { teacher_id: 1, type: "position", title: "Assistant Professor", organization: "Current University", start_date: "2018-08-15", end_date: "2023-07-31", description: "Promoted to Associate Professor" },
    { teacher_id: 1, type: "position", title: "Associate Professor", organization: "Current University", start_date: "2023-08-01", end_date: null, description: "Current position" },
    { teacher_id: 1, type: "award", title: "Outstanding Teaching Award", organization: "University", start_date: "2022-05-15", achievement_level: "university", description: "Recognized for excellence in undergraduate education" },
    { teacher_id: 1, type: "award", title: "Best Paper Award", organization: "ICML Conference", start_date: "2023-07-20", achievement_level: "international", description: "Best paper at International Conference on Machine Learning" },

    // John Smith的职业历程
    { teacher_id: 2, type: "position", title: "Research Scientist", organization: "Los Alamos National Lab", start_date: "2008-06-01", end_date: "2010-01-15", description: "Computational mathematics research" },
    { teacher_id: 2, type: "position", title: "Assistant Professor", organization: "Current University", start_date: "2010-01-20", end_date: "2016-07-31", description: "Initial academic appointment" },
    { teacher_id: 2, type: "position", title: "Associate Professor", organization: "Current University", start_date: "2016-08-01", end_date: "2022-07-31", description: "Tenure achieved" },
    { teacher_id: 2, type: "position", title: "Full Professor", organization: "Current University", start_date: "2022-08-01", end_date: null, description: "Current position" },
    { teacher_id: 2, type: "award", title: "Excellence in Research Award", organization: "University", start_date: "2020-04-10", achievement_level: "university", description: "Outstanding research contributions" },
    { teacher_id: 2, type: "award", title: "SIAM Fellow", organization: "Society for Industrial and Applied Mathematics", start_date: "2023-03-15", achievement_level: "national", description: "Recognition for contributions to applied mathematics" },

    // Emily Johnson的职业历程
    { teacher_id: 3, type: "position", title: "Postdoctoral Researcher", organization: "CERN", start_date: "2019-09-01", end_date: "2020-08-31", description: "Quantum field theory research" },
    { teacher_id: 3, type: "position", title: "Assistant Professor", organization: "Current University", start_date: "2020-09-01", end_date: null, description: "Current position" },
    { teacher_id: 3, type: "award", title: "Early Career Researcher Award", organization: "Department of Physics", start_date: "2023-06-20", achievement_level: "university", description: "Outstanding early career achievements" }
  ]
};

// 数据插入函数
function insertSeedData() {
  const db = database.getDB();

  console.log('🌱 开始插入模拟数据...');

  // 检查是否已有教师数据，避免重复插入
  const teacherCount = db.prepare('SELECT COUNT(*) as count FROM teachers').get();
  if (teacherCount.count > 0) {
    console.log('📊 数据库已有数据，跳过种子数据插入');
    return;
  }

  // 插入教师数据
  const teacherStmt = db.prepare(`
    INSERT INTO teachers (name, email, department, position, hire_date, photo_url, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  seedData.teachers.forEach(teacher => {
    teacherStmt.run(teacher.name, teacher.email, teacher.department, teacher.position,
                   teacher.hire_date, teacher.photo_url, teacher.bio);
  });
  teacherStmt.finalize();

  // 插入课程数据
  const courseStmt = db.prepare(`
    INSERT INTO courses (teacher_id, course_code, course_name, semester, year, enrollment)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  seedData.courses.forEach(course => {
    courseStmt.run(course.teacher_id, course.course_code, course.course_name,
                  course.semester, course.year, course.enrollment);
  });
  courseStmt.finalize();

  // 插入学生评价数据
  const evalStmt = db.prepare(`
    INSERT INTO student_evaluations (course_id, teacher_id, semester, year, overall_rating,
                                   teaching_quality, course_content, availability, comments)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  seedData.studentEvaluations.forEach(eval => {
    evalStmt.run(eval.course_id, eval.teacher_id, eval.semester, eval.year,
                eval.overall_rating, eval.teaching_quality, eval.course_content,
                eval.availability, eval.comments);
  });
  evalStmt.finalize();

  // 插入研究成果数据
  const researchStmt = db.prepare(`
    INSERT INTO research_outputs (teacher_id, type, title, description, date, impact_factor,
                                citation_count, funding_amount, status, url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  seedData.researchOutputs.forEach(research => {
    researchStmt.run(research.teacher_id, research.type, research.title, research.description,
                    research.date, research.impact_factor, research.citation_count,
                    research.funding_amount, research.status, research.url);
  });
  researchStmt.finalize();

  // 插入服务贡献数据
  const serviceStmt = db.prepare(`
    INSERT INTO service_contributions (teacher_id, type, title, organization, role,
                                     start_date, end_date, description, workload_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  seedData.serviceContributions.forEach(service => {
    serviceStmt.run(service.teacher_id, service.type, service.title, service.organization,
                   service.role, service.start_date, service.end_date, service.description,
                   service.workload_hours);
  });
  serviceStmt.finalize();

  // 插入专业发展数据
  const profDevStmt = db.prepare(`
    INSERT INTO professional_development (teacher_id, type, title, institution, date_completed,
                                        duration_hours, certificate_url, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  seedData.professionalDevelopment.forEach(dev => {
    profDevStmt.run(dev.teacher_id, dev.type, dev.title, dev.institution, dev.date_completed,
                   dev.duration_hours, dev.certificate_url, dev.description);
  });
  profDevStmt.finalize();

  // 插入职业历程数据
  const careerStmt = db.prepare(`
    INSERT INTO career_history (teacher_id, type, title, organization, start_date, end_date,
                               description, achievement_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  seedData.careerHistory.forEach(career => {
    careerStmt.run(career.teacher_id, career.type, career.title, career.organization,
                  career.start_date, career.end_date, career.description, career.achievement_level);
  });
  careerStmt.finalize();

  console.log('✅ 模拟数据插入完成');
}

module.exports = { insertSeedData };