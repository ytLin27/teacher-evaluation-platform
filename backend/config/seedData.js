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

  // 研究成果数据 - 扩展版本
  researchOutputs: [
    // Jane Doe的研究成果 (15条记录)
    { teacher_id: 1, type: "publication", title: "Deep Learning Approaches for Natural Language Processing", description: "Journal of AI Research", date: "2024-03-15", impact_factor: 5.2, citation_count: 45, url: "https://doi.org/10.1000/paper1" },
    { teacher_id: 1, type: "publication", title: "Transformer Architectures in Computer Vision", description: "IEEE CVPR", date: "2023-11-20", impact_factor: 4.8, citation_count: 32, url: "https://doi.org/10.1000/paper2" },
    { teacher_id: 1, type: "publication", title: "Federated Learning for Privacy-Preserving AI", description: "Nature Machine Intelligence", date: "2023-08-12", impact_factor: 4.5, citation_count: 28, url: "https://doi.org/10.1000/paper3" },
    { teacher_id: 1, type: "publication", title: "Explainable AI in Healthcare Applications", description: "The Lancet Digital Health", date: "2023-05-08", impact_factor: 5.8, citation_count: 52, url: "https://doi.org/10.1000/paper4" },
    { teacher_id: 1, type: "publication", title: "Automated Code Generation with Large Language Models", description: "Communications of the ACM", date: "2023-02-14", impact_factor: 4.2, citation_count: 38, url: "https://doi.org/10.1000/paper5" },
    { teacher_id: 1, type: "publication", title: "Multi-modal Learning for Autonomous Systems", description: "Robotics and Autonomous Systems", date: "2022-12-03", impact_factor: 4.9, citation_count: 41, url: "https://doi.org/10.1000/paper6" },
    { teacher_id: 1, type: "publication", title: "Ethical Considerations in AI Development", description: "AI & Society", date: "2022-09-22", impact_factor: 3.8, citation_count: 67, url: "https://doi.org/10.1000/paper7" },
    { teacher_id: 1, type: "publication", title: "Neural Architecture Search for Edge Computing", description: "IEEE Transactions on Computers", date: "2022-06-15", impact_factor: 4.6, citation_count: 33, url: "https://doi.org/10.1000/paper8" },
    { teacher_id: 1, type: "publication", title: "Quantum Machine Learning Algorithms", description: "Quantum Information Processing", date: "2022-03-18", impact_factor: 5.1, citation_count: 29, url: "https://doi.org/10.1000/paper9" },
    { teacher_id: 1, type: "publication", title: "Adversarial Robustness in Deep Neural Networks", description: "IEEE Security & Privacy", date: "2021-11-09", impact_factor: 4.7, citation_count: 58, url: "https://doi.org/10.1000/paper10" },
    { teacher_id: 1, type: "grant", title: "NSF Grant for AI Research", description: "Machine Learning for Climate Change Prediction", date: "2023-09-01", funding_amount: 250000, status: "Active" },
    { teacher_id: 1, type: "grant", title: "Google Research Award", description: "Federated Learning Infrastructure", date: "2023-03-15", funding_amount: 75000, status: "Active" },
    { teacher_id: 1, type: "grant", title: "DARPA AI Research Initiative", description: "Explainable AI for Defense Applications", date: "2022-08-20", funding_amount: 500000, status: "Completed" },
    { teacher_id: 1, type: "patent", title: "Automated Code Generation System", description: "AI-powered programming assistant", date: "2024-01-10", status: "Pending" },
    { teacher_id: 1, type: "patent", title: "Privacy-Preserving Data Analysis Framework", description: "Federated learning system design", date: "2023-07-22", status: "Granted" },

    // John Smith的研究成果 (12条记录)
    { teacher_id: 2, type: "publication", title: "Numerical Methods for Partial Differential Equations", description: "SIAM Journal on Scientific Computing", date: "2024-02-28", impact_factor: 3.9, citation_count: 28, url: "https://doi.org/10.1000/math1" },
    { teacher_id: 2, type: "publication", title: "High-Performance Computing for Scientific Simulations", description: "Journal of Computational Physics", date: "2023-10-15", impact_factor: 4.1, citation_count: 35, url: "https://doi.org/10.1000/math2" },
    { teacher_id: 2, type: "publication", title: "Adaptive Mesh Refinement Techniques", description: "Computer Methods in Applied Mechanics", date: "2023-07-20", impact_factor: 3.7, citation_count: 22, url: "https://doi.org/10.1000/math3" },
    { teacher_id: 2, type: "publication", title: "Machine Learning for Numerical Analysis", description: "SIAM Review", date: "2023-04-12", impact_factor: 4.3, citation_count: 31, url: "https://doi.org/10.1000/math4" },
    { teacher_id: 2, type: "publication", title: "Spectral Methods for Fluid Dynamics", description: "Journal of Fluid Mechanics", date: "2022-12-08", impact_factor: 3.8, citation_count: 26, url: "https://doi.org/10.1000/math5" },
    { teacher_id: 2, type: "publication", title: "Optimization Algorithms for Scientific Computing", description: "ACM Transactions on Mathematical Software", date: "2022-08-25", impact_factor: 4.0, citation_count: 38, url: "https://doi.org/10.1000/math6" },
    { teacher_id: 2, type: "publication", title: "Uncertainty Quantification in Mathematical Models", description: "Journal of Uncertainty Quantification", date: "2022-05-18", impact_factor: 3.9, citation_count: 29, url: "https://doi.org/10.1000/math7" },
    { teacher_id: 2, type: "publication", title: "Parallel Linear Algebra Algorithms", description: "Parallel Computing", date: "2021-11-30", impact_factor: 3.6, citation_count: 42, url: "https://doi.org/10.1000/math8" },
    { teacher_id: 2, type: "grant", title: "DOE Computational Mathematics Grant", description: "High-performance computing research", date: "2023-07-15", funding_amount: 180000, status: "Active" },
    { teacher_id: 2, type: "grant", title: "NSF Mathematical Sciences Grant", description: "Advanced numerical methods development", date: "2022-09-01", funding_amount: 220000, status: "Active" },
    { teacher_id: 2, type: "grant", title: "Intel Parallel Computing Award", description: "Scalable algorithm development", date: "2023-01-10", funding_amount: 50000, status: "Completed" },
    { teacher_id: 2, type: "patent", title: "Adaptive Grid Generation Algorithm", description: "Dynamic mesh optimization system", date: "2023-06-14", status: "Granted" },

    // Emily Johnson的研究成果 (10条记录)
    { teacher_id: 3, type: "publication", title: "Quantum Entanglement in Many-Body Systems", description: "Physical Review Letters", date: "2024-01-05", impact_factor: 6.1, citation_count: 18, url: "https://doi.org/10.1000/phys1" },
    { teacher_id: 3, type: "publication", title: "Quantum Computing Algorithms for Optimization", description: "Quantum Science and Technology", date: "2023-09-12", impact_factor: 5.8, citation_count: 25, url: "https://doi.org/10.1000/phys2" },
    { teacher_id: 3, type: "publication", title: "Topological Quantum States in Condensed Matter", description: "Nature Physics", date: "2023-06-20", impact_factor: 6.3, citation_count: 31, url: "https://doi.org/10.1000/phys3" },
    { teacher_id: 3, type: "publication", title: "Quantum Error Correction Protocols", description: "Physical Review A", date: "2023-03-08", impact_factor: 5.9, citation_count: 22, url: "https://doi.org/10.1000/phys4" },
    { teacher_id: 3, type: "publication", title: "Quantum Simulation of Chemical Reactions", description: "Journal of Chemical Physics", date: "2022-11-15", impact_factor: 6.0, citation_count: 28, url: "https://doi.org/10.1000/phys5" },
    { teacher_id: 3, type: "publication", title: "Many-Body Localization in Disordered Systems", description: "Physical Review B", date: "2022-08-03", impact_factor: 5.7, citation_count: 34, url: "https://doi.org/10.1000/phys6" },
    { teacher_id: 3, type: "publication", title: "Quantum Machine Learning for Materials Discovery", description: "npj Quantum Information", date: "2022-04-28", impact_factor: 5.5, citation_count: 19, url: "https://doi.org/10.1000/phys7" },
    { teacher_id: 3, type: "grant", title: "NASA Quantum Research Fellowship", description: "Quantum computing applications", date: "2024-06-01", funding_amount: 120000, status: "Active" },
    { teacher_id: 3, type: "grant", title: "NSF CAREER Award", description: "Early career quantum physics research", date: "2023-02-15", funding_amount: 400000, status: "Active" },
    { teacher_id: 3, type: "grant", title: "IBM Quantum Network Grant", description: "Quantum algorithm development", date: "2022-10-20", funding_amount: 80000, status: "Completed" }
  ],

  // 服务贡献数据 - 扩展版本
  serviceContributions: [
    // Jane Doe的服务 (12条记录)
    { teacher_id: 1, type: "committee", title: "Faculty Search Committee", organization: "Computer Science Department", role: "Committee Member", start_date: "2024-01-01", end_date: "2024-06-30", description: "Participated in hiring process for new faculty", workload_hours: 40 },
    { teacher_id: 1, type: "committee", title: "Graduate Admissions Committee", organization: "Computer Science Department", role: "Committee Chair", start_date: "2023-08-01", end_date: "2024-05-31", description: "Led graduate student selection process", workload_hours: 60 },
    { teacher_id: 1, type: "committee", title: "University Senate Technology Committee", organization: "University Senate", role: "Committee Member", start_date: "2023-01-01", end_date: "2024-12-31", description: "Campus technology policy development", workload_hours: 30 },
    { teacher_id: 1, type: "review", title: "Journal Reviewer", organization: "IEEE Transactions on AI", role: "Peer Reviewer", start_date: "2023-01-01", end_date: null, description: "Regular reviewer for AI research papers", workload_hours: 60 },
    { teacher_id: 1, type: "review", title: "Conference Program Committee", organization: "NeurIPS Conference", role: "Area Chair", start_date: "2023-03-01", end_date: "2023-12-31", description: "Leading paper review process in ML track", workload_hours: 80 },
    { teacher_id: 1, type: "review", title: "NSF Panel Reviewer", organization: "National Science Foundation", role: "Panel Reviewer", start_date: "2023-06-01", end_date: "2023-06-30", description: "Reviewing grant proposals for AI research", workload_hours: 25 },
    { teacher_id: 1, type: "community", title: "STEM Outreach Program", organization: "Local High Schools", role: "Volunteer Instructor", start_date: "2023-09-01", end_date: "2024-05-31", description: "Teaching programming to high school students", workload_hours: 80 },
    { teacher_id: 1, type: "community", title: "Girls Who Code Mentor", organization: "Girls Who Code", role: "Technical Mentor", start_date: "2023-02-01", end_date: null, description: "Mentoring young women in programming", workload_hours: 40 },
    { teacher_id: 1, type: "community", title: "AI Ethics Workshop", organization: "Tech Industry Alliance", role: "Workshop Leader", start_date: "2023-10-15", end_date: "2023-10-15", description: "Led industry workshop on responsible AI", workload_hours: 8 },
    { teacher_id: 1, type: "committee", title: "Faculty Development Committee", organization: "College of Engineering", role: "Committee Member", start_date: "2022-08-01", end_date: "2023-07-31", description: "Supporting junior faculty career development", workload_hours: 35 },
    { teacher_id: 1, type: "review", title: "Editorial Board", organization: "Journal of AI Research", role: "Associate Editor", start_date: "2022-01-01", end_date: null, description: "Editorial duties for premier AI journal", workload_hours: 100 },
    { teacher_id: 1, type: "community", title: "AI Safety Panel", organization: "Tech Policy Institute", role: "Expert Panelist", start_date: "2022-11-20", end_date: "2022-11-20", description: "Public discussion on AI safety policies", workload_hours: 4 },

    // John Smith的服务 (10条记录)
    { teacher_id: 2, type: "committee", title: "Curriculum Committee", organization: "Mathematics Department", role: "Chair", start_date: "2023-08-01", end_date: null, description: "Leading curriculum reform initiatives", workload_hours: 120 },
    { teacher_id: 2, type: "committee", title: "Faculty Promotion Committee", organization: "College of Sciences", role: "Committee Member", start_date: "2023-01-01", end_date: "2023-12-31", description: "Evaluating faculty promotion cases", workload_hours: 50 },
    { teacher_id: 2, type: "committee", title: "Graduate Student Appeals Committee", organization: "Graduate School", role: "Committee Chair", start_date: "2022-08-01", end_date: "2024-07-31", description: "Handling graduate student academic appeals", workload_hours: 40 },
    { teacher_id: 2, type: "review", title: "Conference Program Committee", organization: "SIAM Conference", role: "Program Committee Member", start_date: "2024-01-01", end_date: "2024-07-31", description: "Reviewing conference submissions", workload_hours: 50 },
    { teacher_id: 2, type: "review", title: "Journal Reviewer", organization: "SIAM Journal on Scientific Computing", role: "Peer Reviewer", start_date: "2020-01-01", end_date: null, description: "Regular reviewer for computational mathematics", workload_hours: 80 },
    { teacher_id: 2, type: "review", title: "DOE Grant Review Panel", organization: "Department of Energy", role: "Panel Reviewer", start_date: "2023-04-01", end_date: "2023-04-30", description: "Reviewing computational science grants", workload_hours: 30 },
    { teacher_id: 2, type: "community", title: "Math Olympiad Coach", organization: "Regional Math Competition", role: "Volunteer Coach", start_date: "2022-09-01", end_date: null, description: "Training high school math competition teams", workload_hours: 60 },
    { teacher_id: 2, type: "community", title: "STEM Teacher Workshop", organization: "K-12 Education Alliance", role: "Workshop Instructor", start_date: "2023-07-15", end_date: "2023-07-17", description: "Training teachers in computational thinking", workload_hours: 24 },
    { teacher_id: 2, type: "committee", title: "Library Committee", organization: "University Library", role: "Committee Member", start_date: "2022-01-01", end_date: "2022-12-31", description: "Advising on academic resource allocation", workload_hours: 20 },
    { teacher_id: 2, type: "review", title: "Textbook Review", organization: "Academic Publishers", role: "Content Reviewer", start_date: "2023-03-01", end_date: "2023-05-31", description: "Reviewing calculus textbook manuscripts", workload_hours: 35 },

    // Emily Johnson的服务 (8条记录)
    { teacher_id: 3, type: "committee", title: "Student Affairs Committee", organization: "Physics Department", role: "Committee Member", start_date: "2023-01-01", end_date: null, description: "Addressing student academic concerns", workload_hours: 30 },
    { teacher_id: 3, type: "committee", title: "Safety Committee", organization: "College of Sciences", role: "Committee Member", start_date: "2022-08-01", end_date: null, description: "Ensuring laboratory safety protocols", workload_hours: 25 },
    { teacher_id: 3, type: "committee", title: "Undergraduate Research Committee", organization: "Physics Department", role: "Committee Chair", start_date: "2023-08-01", end_date: null, description: "Coordinating undergraduate research opportunities", workload_hours: 45 },
    { teacher_id: 3, type: "review", title: "Journal Reviewer", organization: "Physical Review Letters", role: "Peer Reviewer", start_date: "2021-01-01", end_date: null, description: "Reviewing quantum physics research papers", workload_hours: 40 },
    { teacher_id: 3, type: "review", title: "Conference Reviewer", organization: "Quantum Information Conference", role: "Program Committee Member", start_date: "2023-01-01", end_date: "2023-06-30", description: "Reviewing quantum computing submissions", workload_hours: 30 },
    { teacher_id: 3, type: "community", title: "Physics Olympiad Mentor", organization: "Regional Science Fair", role: "Mentor", start_date: "2023-10-01", end_date: "2024-04-30", description: "Mentoring high school physics competition teams", workload_hours: 45 },
    { teacher_id: 3, type: "community", title: "Science Museum Outreach", organization: "City Science Museum", role: "Guest Lecturer", start_date: "2022-01-01", end_date: null, description: "Public lectures on quantum physics", workload_hours: 20 },
    { teacher_id: 3, type: "community", title: "Women in Physics Workshop", organization: "American Physical Society", role: "Workshop Organizer", start_date: "2023-03-08", end_date: "2023-03-08", description: "Organized career development workshop", workload_hours: 15 }
  ]
};

// 简化的数据插入函数
function insertSeedData() {
  const db = database.getDB();

  console.log('🌱 开始插入模拟数据...');

  // 检查是否已有教师数据，避免重复插入
  db.get('SELECT COUNT(*) as count FROM teachers', (err, teacherCount) => {
    if (err) {
      console.error('检查教师数据失败:', err.message);
      return;
    }

    if (teacherCount.count > 0) {
      console.log('📊 数据库已有数据，跳过种子数据插入');
      return;
    }

    insertAllData(db);
  });
}

function insertAllData(db) {
  console.log('开始插入所有种子数据...');

  // 使用事务确保数据一致性
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    try {
      // 插入教师数据
      console.log('插入教师数据...');
      seedData.teachers.forEach(teacher => {
        db.run(`
          INSERT INTO teachers (name, email, department, position, hire_date, photo_url, bio)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [teacher.name, teacher.email, teacher.department, teacher.position,
            teacher.hire_date, teacher.photo_url, teacher.bio]);
      });

      // 插入课程数据
      console.log('插入课程数据...');
      seedData.courses.forEach(course => {
        db.run(`
          INSERT INTO courses (teacher_id, course_code, course_name, semester, year, enrollment)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [course.teacher_id, course.course_code, course.course_name,
            course.semester, course.year, course.enrollment]);
      });

      // 插入学生评价数据
      console.log('插入学生评价数据...');
      seedData.studentEvaluations.forEach(eval => {
        db.run(`
          INSERT INTO student_evaluations (course_id, teacher_id, semester, year, overall_rating,
                                         teaching_quality, course_content, availability, comments)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [eval.course_id, eval.teacher_id, eval.semester, eval.year,
            eval.overall_rating, eval.teaching_quality, eval.course_content,
            eval.availability, eval.comments]);
      });

      // 插入研究成果数据
      console.log('插入研究成果数据...');
      seedData.researchOutputs.forEach(research => {
        db.run(`
          INSERT INTO research_outputs (teacher_id, type, title, description, date, impact_factor,
                                      citation_count, funding_amount, status, url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [research.teacher_id, research.type, research.title, research.description,
            research.date, research.impact_factor, research.citation_count,
            research.funding_amount, research.status, research.url]);
      });

      // 插入服务贡献数据
      console.log('插入服务贡献数据...');
      seedData.serviceContributions.forEach(service => {
        db.run(`
          INSERT INTO service_contributions (teacher_id, type, title, organization, role, start_date,
                                           end_date, description, workload_hours)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [service.teacher_id, service.type, service.title, service.organization,
            service.role, service.start_date, service.end_date, service.description,
            service.workload_hours]);
      });

      db.run('COMMIT', (err) => {
        if (err) {
          console.error('❌ 提交事务失败:', err.message);
          db.run('ROLLBACK');
        } else {
          console.log('✅ 模拟数据插入完成');
          console.log(`📊 插入统计:`);
          console.log(`   - 教师: ${seedData.teachers.length} 条`);
          console.log(`   - 课程: ${seedData.courses.length} 条`);
          console.log(`   - 学生评价: ${seedData.studentEvaluations.length} 条`);
          console.log(`   - 研究成果: ${seedData.researchOutputs.length} 条`);
          console.log(`   - 服务贡献: ${seedData.serviceContributions.length} 条`);
        }
      });
    } catch (error) {
      console.error('❌ 插入数据时出错:', error.message);
      db.run('ROLLBACK');
    }
  });
}

module.exports = { insertSeedData };