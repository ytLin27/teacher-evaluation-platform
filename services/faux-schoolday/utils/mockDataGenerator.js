/**
 * Mock Data Generator for Faux Schoolday API
 * 为 Schoolday API 模拟生成高质量测试数据
 */

const { v4: uuidv4 } = require('uuid');

class MockDataGenerator {
  constructor() {
    this.districts = [];
    this.schools = [];
    this.teachers = [];
    this.courses = [];
    this.lastGenerated = null;
  }

  /**
   * 生成所有模拟数据
   */
  seedData() {
    console.log('🌱 Generating mock data for Schoolday API...');

    this.generateDistricts();
    this.generateSchools();
    this.generateTeachers();
    this.generateCourses();

    this.lastGenerated = new Date().toISOString();
    console.log('✅ Mock data generation completed');
  }

  /**
   * 重置所有数据
   */
  resetData() {
    this.districts = [];
    this.schools = [];
    this.teachers = [];
    this.courses = [];
    this.lastGenerated = null;
  }

  /**
   * 生成学区数据
   */
  generateDistricts() {
    const districtNames = [
      'Metropolitan Education District',
      'Riverside Unified School District',
      'Mountain View School District',
      'Coastal Educational Zone',
      'Central Valley Schools'
    ];

    this.districts = districtNames.map((name, index) => ({
      sourcedId: `district_${index + 1}`,
      status: 'active',
      dateLastModified: new Date().toISOString(),
      metadata: {},
      name: name,
      type: 'district',
      identifier: `DIST-${String(index + 1).padStart(3, '0')}`,
      parent: {
        href: '',
        sourcedId: '',
        type: 'org'
      }
    }));
  }

  /**
   * 生成学校数据
   */
  generateSchools() {
    const schoolTypes = ['elementary', 'middle', 'high', 'k12'];
    const schoolNames = [
      'Lincoln Elementary School',
      'Washington Middle School',
      'Roosevelt High School',
      'Jefferson Academy',
      'Adams Primary School',
      'Madison Secondary School',
      'Monroe Preparatory School',
      'Jackson STEM Academy',
      'Van Buren Arts School',
      'Harrison Technical High'
    ];

    this.schools = [];

    this.districts.forEach(district => {
      // 每个学区3-4所学校
      const schoolCount = 3 + Math.floor(Math.random() * 2);

      for (let i = 0; i < schoolCount; i++) {
        const schoolId = `${district.sourcedId}_school_${i + 1}`;
        const randomName = schoolNames[Math.floor(Math.random() * schoolNames.length)];
        const schoolType = schoolTypes[Math.floor(Math.random() * schoolTypes.length)];

        this.schools.push({
          sourcedId: schoolId,
          status: 'active',
          dateLastModified: new Date().toISOString(),
          metadata: {
            district_id: district.sourcedId,
            student_count: 200 + Math.floor(Math.random() * 800),
            grade_levels: this.getGradeLevels(schoolType)
          },
          name: `${randomName} (${district.name})`,
          type: 'school',
          identifier: `SCH-${schoolId.replace(/[^0-9]/g, '')}`,
          parent: {
            href: `/orgs/${district.sourcedId}`,
            sourcedId: district.sourcedId,
            type: 'district'
          },
          schoolType: schoolType,
          address: this.generateAddress(),
          phone: this.generatePhoneNumber(),
          email: `info@${randomName.toLowerCase().replace(/\s+/g, '')}.edu`
        });
      }
    });
  }

  /**
   * 生成教师数据
   */
  generateTeachers() {
    const firstNames = [
      'Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry',
      'Isabel', 'Jack', 'Karen', 'Leo', 'Maria', 'Nathan', 'Olivia', 'Paul',
      'Quinn', 'Rachel', 'Steve', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier'
    ];

    const lastNames = [
      'Anderson', 'Brown', 'Clark', 'Davis', 'Evans', 'Foster', 'Garcia',
      'Harris', 'Johnson', 'King', 'Lopez', 'Miller', 'Nelson', 'O\'Brien',
      'Parker', 'Quinn', 'Roberts', 'Smith', 'Taylor', 'Wilson'
    ];

    const subjects = [
      'Mathematics', 'English Language Arts', 'Science', 'Social Studies',
      'Physical Education', 'Art', 'Music', 'Computer Science', 'Foreign Language',
      'Special Education', 'Library Sciences', 'Counseling'
    ];

    const positions = [
      'Teacher', 'Lead Teacher', 'Department Head', 'Assistant Principal',
      'Principal', 'Librarian', 'Counselor', 'Coach'
    ];

    this.teachers = [];

    this.schools.forEach(school => {
      // 每所学校15-25名教师
      const teacherCount = 15 + Math.floor(Math.random() * 11);

      for (let i = 0; i < teacherCount; i++) {
        const teacherId = `${school.sourcedId}_teacher_${i + 1}`;
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const position = positions[Math.floor(Math.random() * positions.length)];

        this.teachers.push({
          sourcedId: teacherId,
          status: 'active',
          dateLastModified: new Date().toISOString(),
          metadata: {
            school_id: school.sourcedId,
            employee_id: `EMP-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
            hire_date: this.generateHireDate(),
            certification: this.generateCertification(subject),
            performance_rating: (3.5 + Math.random() * 1.5).toFixed(1)
          },
          enabledUser: uuidv4(),
          givenName: firstName,
          familyName: lastName,
          middleName: '',
          identifier: `TCH-${teacherId.replace(/[^0-9]/g, '')}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${school.name.toLowerCase().replace(/\s+/g, '')}.edu`,
          username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`,
          phone: this.generatePhoneNumber(),
          sms: this.generatePhoneNumber(),
          role: 'teacher',
          grades: this.generateGrades(school.metadata.grade_levels),
          agents: [],
          orgs: [{
            href: `/orgs/${school.sourcedId}`,
            sourcedId: school.sourcedId,
            type: 'school'
          }],
          userProfiles: [{
            profileType: 'teacher',
            vendorId: 'schoolday',
            credentialType: 'username',
            username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`
          }],
          // 教师特定字段
          subjects: [subject],
          position: position,
          department: this.getDepartmentBySubject(subject),
          qualifications: this.generateQualifications()
        });
      }
    });
  }

  /**
   * 生成课程数据
   */
  generateCourses() {
    const courseSubjects = {
      'Mathematics': [
        'Algebra I', 'Algebra II', 'Geometry', 'Pre-Calculus', 'Calculus',
        'Statistics', 'Trigonometry', 'Applied Mathematics'
      ],
      'English Language Arts': [
        'English 9', 'English 10', 'English 11', 'English 12',
        'Creative Writing', 'Literature', 'Public Speaking', 'Journalism'
      ],
      'Science': [
        'Biology', 'Chemistry', 'Physics', 'Earth Science',
        'Environmental Science', 'Anatomy', 'Astronomy', 'Marine Biology'
      ],
      'Social Studies': [
        'World History', 'US History', 'Government', 'Economics',
        'Psychology', 'Sociology', 'Geography', 'Anthropology'
      ],
      'Physical Education': [
        'PE Foundations', 'Team Sports', 'Individual Fitness',
        'Health Education', 'Outdoor Education'
      ]
    };

    this.courses = [];

    this.teachers.forEach(teacher => {
      // 每位教师教1-3门课程
      const courseCount = 1 + Math.floor(Math.random() * 3);
      const teacherSubjects = teacher.subjects;

      for (let i = 0; i < courseCount; i++) {
        const courseId = `${teacher.sourcedId}_course_${i + 1}`;
        const subject = teacherSubjects[0] || 'General Studies';
        const availableCourses = courseSubjects[subject] || ['General Course'];
        const courseName = availableCourses[Math.floor(Math.random() * availableCourses.length)];

        this.courses.push({
          sourcedId: courseId,
          status: 'active',
          dateLastModified: new Date().toISOString(),
          metadata: {
            teacher_id: teacher.sourcedId,
            school_id: teacher.orgs[0].sourcedId,
            enrollment_count: 15 + Math.floor(Math.random() * 20),
            room_number: `Room ${100 + Math.floor(Math.random() * 300)}`,
            schedule: this.generateSchedule()
          },
          title: courseName,
          courseCode: this.generateCourseCode(subject, courseName),
          grades: teacher.grades,
          subjects: [subject],
          org: {
            href: teacher.orgs[0].href,
            sourcedId: teacher.orgs[0].sourcedId,
            type: 'school'
          },
          schoolYear: {
            href: '/academicSessions/2024-2025',
            sourcedId: '2024-2025',
            type: 'academicSession'
          },
          // 课程特定信息
          description: `${courseName} course taught by ${teacher.givenName} ${teacher.familyName}`,
          credits: Math.floor(Math.random() * 4) + 1,
          period: Math.floor(Math.random() * 8) + 1,
          semester: ['Fall', 'Spring', 'Full Year'][Math.floor(Math.random() * 3)]
        });
      }
    });
  }

  // 辅助方法

  getGradeLevels(schoolType) {
    switch (schoolType) {
      case 'elementary': return ['K', '1', '2', '3', '4', '5'];
      case 'middle': return ['6', '7', '8'];
      case 'high': return ['9', '10', '11', '12'];
      case 'k12': return ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
      default: return ['K', '1', '2', '3', '4', '5'];
    }
  }

  generateAddress() {
    const streets = ['Main St', 'Oak Ave', 'Elm Dr', 'Park Blvd', 'School Rd'];
    const number = Math.floor(Math.random() * 9999) + 1;
    const street = streets[Math.floor(Math.random() * streets.length)];
    return `${number} ${street}`;
  }

  generatePhoneNumber() {
    const area = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `(${area}) ${exchange}-${number}`;
  }

  generateHireDate() {
    const start = new Date('2005-01-01');
    const end = new Date('2023-12-31');
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  }

  generateCertification(subject) {
    const certifications = {
      'Mathematics': 'Mathematics Education Certification',
      'English Language Arts': 'English Language Arts Certification',
      'Science': 'Science Education Certification',
      'Social Studies': 'Social Studies Certification',
      'Physical Education': 'Physical Education Certification'
    };
    return certifications[subject] || 'General Teaching Certification';
  }

  generateGrades(schoolGrades) {
    const gradeCount = Math.min(3, schoolGrades.length);
    const selectedGrades = [];

    for (let i = 0; i < gradeCount; i++) {
      const grade = schoolGrades[Math.floor(Math.random() * schoolGrades.length)];
      if (!selectedGrades.includes(grade)) {
        selectedGrades.push(grade);
      }
    }

    return selectedGrades.length > 0 ? selectedGrades : [schoolGrades[0]];
  }

  getDepartmentBySubject(subject) {
    const departments = {
      'Mathematics': 'Mathematics Department',
      'English Language Arts': 'English Department',
      'Science': 'Science Department',
      'Social Studies': 'Social Studies Department',
      'Physical Education': 'Athletics Department',
      'Art': 'Fine Arts Department',
      'Music': 'Fine Arts Department',
      'Computer Science': 'Technology Department'
    };
    return departments[subject] || 'General Studies';
  }

  generateQualifications() {
    const degrees = ['Bachelor of Education', 'Master of Education', 'Master of Arts', 'Master of Science'];
    const degree = degrees[Math.floor(Math.random() * degrees.length)];
    const yearsExp = Math.floor(Math.random() * 20) + 1;

    return {
      degree: degree,
      years_experience: yearsExp,
      specializations: []
    };
  }

  generateCourseCode(subject, courseName) {
    const prefixes = {
      'Mathematics': 'MATH',
      'English Language Arts': 'ENG',
      'Science': 'SCI',
      'Social Studies': 'HIST',
      'Physical Education': 'PE'
    };

    const prefix = prefixes[subject] || 'GEN';
    const number = Math.floor(Math.random() * 999) + 100;
    return `${prefix}${number}`;
  }

  generateSchedule() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const times = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'];

    return {
      days: days.slice(0, 5), // 周一到周五
      start_time: times[Math.floor(Math.random() * times.length)],
      duration: 50 // 分钟
    };
  }

  // Getter 方法
  getDistricts() { return this.districts; }
  getSchools() { return this.schools; }
  getTeachers() { return this.teachers; }
  getCourses() { return this.courses; }

  getSchoolsByDistrict(districtId) {
    return this.schools.filter(school => school.metadata.district_id === districtId);
  }

  getTeachersBySchool(schoolId) {
    return this.teachers.filter(teacher =>
      teacher.orgs.some(org => org.sourcedId === schoolId)
    );
  }

  getCoursesByTeacher(teacherId) {
    return this.courses.filter(course => course.metadata.teacher_id === teacherId);
  }

  getTeacherById(teacherId) {
    return this.teachers.find(teacher => teacher.sourcedId === teacherId);
  }

  getCourseById(courseId) {
    return this.courses.find(course => course.sourcedId === courseId);
  }
}

module.exports = new MockDataGenerator();