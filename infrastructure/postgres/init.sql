-- PostgreSQL 初始化脚本
-- 创建多个数据库和用户用于不同的微服务

-- 认证服务数据库
CREATE DATABASE auth_db;
CREATE USER auth_user WITH PASSWORD 'auth_pass';
GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_user;

-- 数据集成服务数据库
CREATE DATABASE data_db;
CREATE USER data_user WITH PASSWORD 'data_pass';
GRANT ALL PRIVILEGES ON DATABASE data_db TO data_user;

-- 评价引擎数据库
CREATE DATABASE eval_db;
CREATE USER eval_user WITH PASSWORD 'eval_pass';
GRANT ALL PRIVILEGES ON DATABASE eval_db TO eval_user;

-- 报告服务数据库
CREATE DATABASE report_db;
CREATE USER report_user WITH PASSWORD 'report_pass';
GRANT ALL PRIVILEGES ON DATABASE report_db TO report_user;

-- Keycloak 数据库
CREATE DATABASE keycloak;
CREATE USER keycloak WITH PASSWORD 'keycloak_password';
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;

-- 连接到主业务数据库进行表创建
\c eval_db;

-- 教师表 (PostgreSQL)
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE, -- Schoolday/OneRoster ID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    hire_date DATE,
    photo_url TEXT,
    bio TEXT,
    status VARCHAR(50) DEFAULT 'active',
    schoolday_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 课程表 (PostgreSQL)
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE, -- OneRoster course ID
    teacher_id INTEGER REFERENCES teachers(id),
    course_code VARCHAR(50) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    enrollment INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    schoolday_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 学生评价表 (PostgreSQL)
CREATE TABLE IF NOT EXISTS student_evaluations (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    teacher_id INTEGER REFERENCES teachers(id),
    external_evaluation_id VARCHAR(255), -- Schoolday evaluation ID
    semester VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    overall_rating DECIMAL(3,2) NOT NULL CHECK (overall_rating >= 0 AND overall_rating <= 5),
    teaching_quality DECIMAL(3,2) CHECK (teaching_quality >= 0 AND teaching_quality <= 5),
    course_content DECIMAL(3,2) CHECK (course_content >= 0 AND course_content <= 5),
    availability DECIMAL(3,2) CHECK (availability >= 0 AND availability <= 5),
    workload_rating DECIMAL(3,2) CHECK (workload_rating >= 0 AND workload_rating <= 5),
    comments TEXT,
    response_count INTEGER DEFAULT 1,
    schoolday_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 研究成果表 (PostgreSQL)
CREATE TABLE IF NOT EXISTS research_outputs (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('publication', 'grant', 'patent', 'conference')),
    title TEXT NOT NULL,
    description TEXT,
    publication_date DATE,
    journal_conference VARCHAR(255),
    impact_factor DECIMAL(5,3),
    citation_count INTEGER DEFAULT 0,
    funding_amount DECIMAL(12,2),
    funding_currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'published',
    doi VARCHAR(255),
    url TEXT,
    tags TEXT[], -- PostgreSQL array for tags
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 服务贡献表 (PostgreSQL)
CREATE TABLE IF NOT EXISTS service_contributions (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('committee', 'review', 'community', 'editorial', 'administrative')),
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    role VARCHAR(255),
    start_date DATE,
    end_date DATE,
    description TEXT,
    workload_hours INTEGER,
    compensation_amount DECIMAL(10,2),
    impact_level VARCHAR(50) CHECK (impact_level IN ('local', 'national', 'international')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 专业发展表 (PostgreSQL)
CREATE TABLE IF NOT EXISTS professional_development (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('education', 'certification', 'training', 'conference', 'workshop')),
    title VARCHAR(255) NOT NULL,
    institution VARCHAR(255),
    instructor VARCHAR(255),
    date_completed DATE,
    duration_hours INTEGER,
    cost DECIMAL(10,2),
    certificate_url TEXT,
    description TEXT,
    skills_gained TEXT[],
    schoolday_academy_id VARCHAR(255), -- Link to Schoolday Academy
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 职业历程表 (PostgreSQL)
CREATE TABLE IF NOT EXISTS career_history (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('position', 'award', 'recognition', 'promotion')),
    title VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    start_date DATE,
    end_date DATE,
    description TEXT,
    achievement_level VARCHAR(50) CHECK (achievement_level IN ('department', 'university', 'regional', 'national', 'international')),
    monetary_value DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Outbox 模式表 (用于分布式事务)
CREATE TABLE IF NOT EXISTS outbox_events (
    id SERIAL PRIMARY KEY,
    event_id UUID DEFAULT gen_random_uuid(),
    event_type VARCHAR(255) NOT NULL,
    aggregate_id VARCHAR(255) NOT NULL,
    aggregate_type VARCHAR(255) NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_teachers_department ON teachers(department);
CREATE INDEX idx_teachers_external_id ON teachers(external_id);
CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX idx_courses_year_semester ON courses(year, semester);
CREATE INDEX idx_evaluations_teacher_year ON student_evaluations(teacher_id, year);
CREATE INDEX idx_evaluations_course_id ON student_evaluations(course_id);
CREATE INDEX idx_research_teacher_id ON research_outputs(teacher_id);
CREATE INDEX idx_research_type_date ON research_outputs(type, publication_date);
CREATE INDEX idx_service_teacher_id ON service_contributions(teacher_id);
CREATE INDEX idx_service_type_dates ON service_contributions(type, start_date, end_date);
CREATE INDEX idx_professional_teacher_id ON professional_development(teacher_id);
CREATE INDEX idx_career_teacher_id ON career_history(teacher_id);
CREATE INDEX idx_outbox_processed ON outbox_events(processed, created_at);

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON student_evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_research_updated_at BEFORE UPDATE ON research_outputs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_updated_at BEFORE UPDATE ON service_contributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professional_updated_at BEFORE UPDATE ON professional_development FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_updated_at BEFORE UPDATE ON career_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();