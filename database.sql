-- ============================================
-- 1. STUDENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    program VARCHAR(150) NOT NULL,
    block_year VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. BOOTHS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS booths (
    id SERIAL PRIMARY KEY,
    booth_name VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(150),
    date_created TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. BOOTH LOGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS booth_logs (
    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,
    booth_id INTEGER NOT NULL,

    visit_date DATE DEFAULT CURRENT_DATE,
    visit_time TIME DEFAULT CURRENT_TIME,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_student
        FOREIGN KEY (student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booth
        FOREIGN KEY (booth_id)
        REFERENCES booths(id)
        ON DELETE CASCADE,

    -- Prevent the same student from registering
    -- for the same booth more than once
    CONSTRAINT unique_student_booth
        UNIQUE (student_id, booth_id)
);
