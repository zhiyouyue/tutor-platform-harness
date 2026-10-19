-- Phase 1 专家交付平台 — 干净 schema（expert/ops，无 orders）
-- 执行前请确保已 USE expert_platform 或 MYSQL_DATABASE=expert_platform

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------------
-- 清理旧表（幂等重建）
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS rtc_sessions;
DROP TABLE IF EXISTS income_lines;
DROP TABLE IF EXISTS project_completions;
DROP TABLE IF EXISTS coaching_records;
DROP TABLE IF EXISTS deliverables;
DROP TABLE IF EXISTS project_messages;
DROP TABLE IF EXISTS project_files;
DROP TABLE IF EXISTS project_appointments;
DROP TABLE IF EXISTS project_nodes;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS student_login_tokens;
DROP TABLE IF EXISTS student_career_profiles;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS expert_certification_materials;
DROP TABLE IF EXISTS expert_payment_info;
DROP TABLE IF EXISTS expert_availability_blackouts;
DROP TABLE IF EXISTS expert_availability_slots;
DROP TABLE IF EXISTS expert_job_roles;
DROP TABLE IF EXISTS expert_industries;
DROP TABLE IF EXISTS expert_coaching_types;
DROP TABLE IF EXISTS expert_service_audiences;
DROP TABLE IF EXISTS expert_profiles;
DROP TABLE IF EXISTS ops_profiles;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS login_logs;
DROP TABLE IF EXISTS dict_job_roles;
DROP TABLE IF EXISTS dict_industries;
DROP TABLE IF EXISTS dict_coaching_types;
DROP TABLE IF EXISTS dict_service_audiences;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------------
-- 账号与会话
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    phone           VARCHAR(20)     DEFAULT NULL                COMMENT '手机号',
    account         VARCHAR(128)    DEFAULT NULL                COMMENT '登录账号',
    password_hash   VARCHAR(255)    DEFAULT NULL                COMMENT 'bcrypt',
    role            ENUM('admin','expert','ops','student') NOT NULL,
    status          ENUM('active','pending','suspended') NOT NULL DEFAULT 'pending',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_users_phone (phone),
    UNIQUE KEY uk_users_account (account),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='全角色账号';

CREATE TABLE user_sessions (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    expires_at      DATETIME        NOT NULL,
    revoked_at      DATETIME        DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_user_sessions_user (user_id),
    CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Refresh token 会话';

CREATE TABLE login_logs (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED DEFAULT NULL,
    ip_address      VARCHAR(45)     DEFAULT NULL,
    user_agent      VARCHAR(512)    DEFAULT NULL,
    success         TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_login_logs_user (user_id),
    CONSTRAINT fk_login_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='登录审计';

CREATE TABLE student_login_tokens (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL,
    token_hash      VARCHAR(255)    NOT NULL,
    type            ENUM('otp','magic_link') NOT NULL,
    expires_at      DATETIME        NOT NULL,
    used_at         DATETIME        DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_student_login_tokens_user (user_id),
    CONSTRAINT fk_student_login_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='学员 OTP / Magic Link';

-- ---------------------------------------------------------------------------
-- 档案
-- ---------------------------------------------------------------------------
CREATE TABLE expert_profiles (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id             BIGINT UNSIGNED NOT NULL,
    real_name           VARCHAR(64)     DEFAULT NULL,
    city                VARCHAR(64)     DEFAULT NULL,
    current_company     VARCHAR(128)    DEFAULT NULL,
    current_title       VARCHAR(128)    DEFAULT NULL,
    bio                 TEXT            DEFAULT NULL,
    education_json      JSON            DEFAULT NULL                COMMENT '教育经历',
    work_experience_json JSON           DEFAULT NULL                COMMENT '工作经历',
    profile_status      ENUM('draft','pending_review','active','rejected','suspended') NOT NULL DEFAULT 'draft',
    accepting_projects  TINYINT(1)      NOT NULL DEFAULT 1          COMMENT '是否接项目',
    verified_at         DATETIME        DEFAULT NULL,
    verified_by         BIGINT UNSIGNED DEFAULT NULL                COMMENT '管理员 users.id',
    reject_reason       VARCHAR(512)    DEFAULT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_expert_profiles_user (user_id),
    INDEX idx_expert_profiles_status (profile_status),
    CONSTRAINT fk_expert_profiles_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_expert_profiles_verified_by FOREIGN KEY (verified_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='专家档案与认证状态';

CREATE TABLE ops_profiles (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL,
    display_name    VARCHAR(64)     DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_ops_profiles_user (user_id),
    CONSTRAINT fk_ops_profiles_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='运营档案';

CREATE TABLE student_profiles (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         BIGINT UNSIGNED NOT NULL,
    real_name       VARCHAR(64)     DEFAULT NULL,
    city            VARCHAR(64)     DEFAULT NULL,
    student_type    VARCHAR(32)     DEFAULT NULL                COMMENT '应届/在职等',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_student_profiles_user (user_id),
    CONSTRAINT fk_student_profiles_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='学员基础档案';

CREATE TABLE student_career_profiles (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    student_id          BIGINT UNSIGNED NOT NULL,
    school              VARCHAR(128)    DEFAULT NULL,
    major               VARCHAR(128)    DEFAULT NULL,
    graduation_year     SMALLINT        DEFAULT NULL,
    target_industry     VARCHAR(128)    DEFAULT NULL,
    target_role         VARCHAR(128)    DEFAULT NULL,
    target_city         VARCHAR(64)     DEFAULT NULL,
    background_summary  TEXT            DEFAULT NULL,
    current_situation   TEXT            DEFAULT NULL,
    core_issues         TEXT            DEFAULT NULL,
    maintained_by       BIGINT UNSIGNED DEFAULT NULL                COMMENT '运营 users.id',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_student_career_profiles_student (student_id),
    CONSTRAINT fk_student_career_profiles_student FOREIGN KEY (student_id) REFERENCES student_profiles(id),
    CONSTRAINT fk_student_career_profiles_maintainer FOREIGN KEY (maintained_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='学员求职档案';

CREATE TABLE expert_payment_info (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    expert_id           BIGINT UNSIGNED NOT NULL,
    payee_name          VARCHAR(64)     DEFAULT NULL,
    bank_name           VARCHAR(128)    DEFAULT NULL,
    bank_account_masked VARCHAR(32)     DEFAULT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_expert_payment_info_expert (expert_id),
    CONSTRAINT fk_expert_payment_info_expert FOREIGN KEY (expert_id) REFERENCES expert_profiles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='专家收款信息（V1 仅展示）';

CREATE TABLE expert_certification_materials (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    expert_id       BIGINT UNSIGNED NOT NULL,
    material_type   ENUM('id_card','certificate','other') NOT NULL,
    file_name       VARCHAR(255)    DEFAULT NULL,
    oss_bucket      VARCHAR(128)    DEFAULT NULL,
    oss_key         VARCHAR(512)    NOT NULL,
    mime_type       VARCHAR(64)     DEFAULT NULL,
    size_bytes      BIGINT UNSIGNED DEFAULT NULL,
    submitted_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_expert_cert_materials_expert (expert_id),
    CONSTRAINT fk_expert_cert_materials_expert FOREIGN KEY (expert_id) REFERENCES expert_profiles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='专家认证材料';

CREATE TABLE expert_availability_slots (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    expert_id       BIGINT UNSIGNED NOT NULL,
    weekday         TINYINT         NOT NULL                    COMMENT '0=周日 … 6=周六',
    start_time      TIME            NOT NULL,
    end_time        TIME            NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_expert_availability_slots_expert (expert_id),
    CONSTRAINT fk_expert_availability_slots_expert FOREIGN KEY (expert_id) REFERENCES expert_profiles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='专家可辅导时段';

CREATE TABLE expert_availability_blackouts (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    expert_id       BIGINT UNSIGNED NOT NULL,
    start_at        DATETIME        NOT NULL,
    end_at          DATETIME        NOT NULL,
    reason          VARCHAR(255)    DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_expert_availability_blackouts_expert (expert_id),
    CONSTRAINT fk_expert_availability_blackouts_expert FOREIGN KEY (expert_id) REFERENCES expert_profiles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='专家临时不可用';

-- ---------------------------------------------------------------------------
-- 字典（Phase 1 固定 seed，admin 不可后台配置）
-- ---------------------------------------------------------------------------
CREATE TABLE dict_service_audiences (
    code            VARCHAR(64)     NOT NULL,
    label           VARCHAR(128)    NOT NULL,
    sort_order      INT             NOT NULL DEFAULT 0,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,

    PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='服务人群字典';

CREATE TABLE dict_coaching_types (
    code            VARCHAR(64)     NOT NULL,
    label           VARCHAR(128)    NOT NULL,
    sort_order      INT             NOT NULL DEFAULT 0,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,

    PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='辅导内容字典';

CREATE TABLE dict_industries (
    code            VARCHAR(64)     NOT NULL,
    label           VARCHAR(128)    NOT NULL,
    sort_order      INT             NOT NULL DEFAULT 0,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,

    PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='行业字典';

CREATE TABLE dict_job_roles (
    code            VARCHAR(64)     NOT NULL,
    label           VARCHAR(128)    NOT NULL,
    sort_order      INT             NOT NULL DEFAULT 0,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,

    PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='岗位字典';

-- 专家能力 — 4 张关联表
CREATE TABLE expert_service_audiences (
    expert_id       BIGINT UNSIGNED NOT NULL,
    audience_code   VARCHAR(64)     NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (expert_id, audience_code),
    CONSTRAINT fk_expert_service_audiences_expert FOREIGN KEY (expert_id) REFERENCES expert_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_expert_service_audiences_code FOREIGN KEY (audience_code) REFERENCES dict_service_audiences(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE expert_coaching_types (
    expert_id       BIGINT UNSIGNED NOT NULL,
    coaching_code   VARCHAR(64)     NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (expert_id, coaching_code),
    CONSTRAINT fk_expert_coaching_types_expert FOREIGN KEY (expert_id) REFERENCES expert_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_expert_coaching_types_code FOREIGN KEY (coaching_code) REFERENCES dict_coaching_types(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE expert_industries (
    expert_id       BIGINT UNSIGNED NOT NULL,
    industry_code   VARCHAR(64)     NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (expert_id, industry_code),
    CONSTRAINT fk_expert_industries_expert FOREIGN KEY (expert_id) REFERENCES expert_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_expert_industries_code FOREIGN KEY (industry_code) REFERENCES dict_industries(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE expert_job_roles (
    expert_id       BIGINT UNSIGNED NOT NULL,
    job_role_code   VARCHAR(64)     NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (expert_id, job_role_code),
    CONSTRAINT fk_expert_job_roles_expert FOREIGN KEY (expert_id) REFERENCES expert_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_expert_job_roles_code FOREIGN KEY (job_role_code) REFERENCES dict_job_roles(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 项目核心（无 orders）
-- ---------------------------------------------------------------------------
CREATE TABLE projects (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    project_no      VARCHAR(30)     NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    student_id      BIGINT UNSIGNED NOT NULL,
    expert_id       BIGINT UNSIGNED DEFAULT NULL,
    ops_user_id     BIGINT UNSIGNED NOT NULL,
    status          ENUM(
                        'draft',
                        'pending_confirm',
                        'rejected',
                        'in_progress',
                        'pending_completion_review',
                        'completed',
                        'cancelled'
                    ) NOT NULL DEFAULT 'draft',
    total_amount    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    currency        CHAR(3)         NOT NULL DEFAULT 'CNY',
    goals_json      JSON            DEFAULT NULL,
    reject_reason   VARCHAR(255)    DEFAULT NULL,
    accepted_at     DATETIME        DEFAULT NULL,
    rejected_at     DATETIME        DEFAULT NULL,
    published_at    DATETIME        DEFAULT NULL,
    completed_at    DATETIME        DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_projects_no (project_no),
    INDEX idx_projects_student (student_id),
    INDEX idx_projects_expert (expert_id),
    INDEX idx_projects_ops (ops_user_id),
    INDEX idx_projects_status (status),
    CONSTRAINT fk_projects_student FOREIGN KEY (student_id) REFERENCES student_profiles(id),
    CONSTRAINT fk_projects_expert FOREIGN KEY (expert_id) REFERENCES expert_profiles(id),
    CONSTRAINT fk_projects_ops FOREIGN KEY (ops_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='辅导项目';

CREATE TABLE project_nodes (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id      BIGINT UNSIGNED NOT NULL,
    node_type       VARCHAR(64)     NOT NULL                    COMMENT 'dict_coaching_types.code',
    sort_order      INT             NOT NULL DEFAULT 0,
    status          ENUM('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
    completed_at    DATETIME        DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_project_nodes_project (project_id),
    CONSTRAINT fk_project_nodes_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_nodes_type FOREIGN KEY (node_type) REFERENCES dict_coaching_types(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='项目辅导节点';

CREATE TABLE project_completions (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id      BIGINT UNSIGNED NOT NULL,
    status          ENUM('not_submitted','pending_ops_review','confirmed','rejected') NOT NULL DEFAULT 'not_submitted',
    submitted_by    BIGINT UNSIGNED DEFAULT NULL                COMMENT '专家 users.id',
    submitted_at    DATETIME        DEFAULT NULL,
    reviewed_by     BIGINT UNSIGNED DEFAULT NULL                COMMENT '运营 users.id',
    reviewed_at     DATETIME        DEFAULT NULL,
    reject_reason   VARCHAR(512)    DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_project_completions_project (project_id),
    CONSTRAINT fk_project_completions_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_completions_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id),
    CONSTRAINT fk_project_completions_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='项目完成双确认';

CREATE TABLE coaching_records (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id      BIGINT UNSIGNED NOT NULL,
    node_id         BIGINT UNSIGNED DEFAULT NULL,
    expert_id       BIGINT UNSIGNED NOT NULL,
    coached_at      DATETIME        NOT NULL,
    content_summary TEXT            DEFAULT NULL,
    student_issues  TEXT            DEFAULT NULL,
    expert_advice   TEXT            DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_coaching_records_project (project_id),
    CONSTRAINT fk_coaching_records_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_coaching_records_node FOREIGN KEY (node_id) REFERENCES project_nodes(id) ON DELETE SET NULL,
    CONSTRAINT fk_coaching_records_expert FOREIGN KEY (expert_id) REFERENCES expert_profiles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='辅导记录';

CREATE TABLE deliverables (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id      BIGINT UNSIGNED NOT NULL,
    node_id         BIGINT UNSIGNED DEFAULT NULL,
    expert_id       BIGINT UNSIGNED NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT            DEFAULT NULL,
    submitted_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_deliverables_project (project_id),
    CONSTRAINT fk_deliverables_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_deliverables_node FOREIGN KEY (node_id) REFERENCES project_nodes(id) ON DELETE SET NULL,
    CONSTRAINT fk_deliverables_expert FOREIGN KEY (expert_id) REFERENCES expert_profiles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='交付结果';

CREATE TABLE project_messages (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id      BIGINT UNSIGNED NOT NULL,
    sender_user_id  BIGINT UNSIGNED NOT NULL,
    sender_role     ENUM('expert','ops','student') NOT NULL,
    channel         ENUM('expert_ops','expert_student') NOT NULL,
    content         TEXT            NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_project_messages_project (project_id),
    CONSTRAINT fk_project_messages_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_messages_sender FOREIGN KEY (sender_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='交付空间消息';

CREATE TABLE project_files (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id      BIGINT UNSIGNED NOT NULL,
    uploader_user_id BIGINT UNSIGNED NOT NULL,
    file_name       VARCHAR(255)    NOT NULL,
    mime_type       VARCHAR(64)     DEFAULT NULL,
    size_bytes      BIGINT UNSIGNED DEFAULT NULL,
    oss_bucket      VARCHAR(128)    NOT NULL,
    oss_key         VARCHAR(512)    NOT NULL,
    category        ENUM('resume','courseware','deliverable','certification','other') NOT NULL DEFAULT 'other',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_project_files_project (project_id),
    CONSTRAINT fk_project_files_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_files_uploader FOREIGN KEY (uploader_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='项目文件（OSS）';

CREATE TABLE project_appointments (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    project_id      BIGINT UNSIGNED NOT NULL,
    node_id         BIGINT UNSIGNED DEFAULT NULL,
    start_at        DATETIME        NOT NULL,
    end_at          DATETIME        NOT NULL,
    topic           VARCHAR(255)    DEFAULT NULL,
    meeting_url     VARCHAR(512)    DEFAULT NULL COMMENT '第三方会议链接',
    status          ENUM('scheduled','confirmed','cancelled','completed') NOT NULL DEFAULT 'scheduled',
    expert_completed_at DATETIME    DEFAULT NULL COMMENT '专家标记课次完成',
    ops_confirmed_at    DATETIME    DEFAULT NULL COMMENT '班主任确认课次完成',
    created_by      BIGINT UNSIGNED NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_project_appointments_project (project_id),
    INDEX idx_project_appointments_start (start_at),
    CONSTRAINT fk_project_appointments_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_project_appointments_node FOREIGN KEY (node_id) REFERENCES project_nodes(id) ON DELETE SET NULL,
    CONSTRAINT fk_project_appointments_creator FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='辅导预约';

CREATE TABLE income_lines (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    expert_id       BIGINT UNSIGNED NOT NULL,
    project_id      BIGINT UNSIGNED NOT NULL,
    appointment_id  BIGINT UNSIGNED DEFAULT NULL COMMENT '课次入账',
    amount          DECIMAL(10,2)   NOT NULL,
    currency        CHAR(3)         NOT NULL DEFAULT 'CNY',
    status          ENUM('accrued','pending_settlement','settled') NOT NULL DEFAULT 'accrued',
    description     VARCHAR(255)    DEFAULT NULL,
    accrued_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    settled_at      DATETIME        DEFAULT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_income_lines_appointment (appointment_id),
    INDEX idx_income_lines_expert (expert_id),
    INDEX idx_income_lines_project (project_id),
    CONSTRAINT fk_income_lines_expert FOREIGN KEY (expert_id) REFERENCES expert_profiles(id),
    CONSTRAINT fk_income_lines_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_income_lines_appointment FOREIGN KEY (appointment_id) REFERENCES project_appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='专家收入账本';

-- ---------------------------------------------------------------------------
-- RTC（关联预约，无 order_id）
-- ---------------------------------------------------------------------------
CREATE TABLE rtc_sessions (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    channel_id      VARCHAR(64)     NOT NULL,
    creator_id      BIGINT UNSIGNED NOT NULL,
    callee_id       BIGINT UNSIGNED NOT NULL,
    appointment_id  BIGINT UNSIGNED DEFAULT NULL                COMMENT '关联 project_appointments.id',
    status          ENUM('pending','active','ended','cancelled') NOT NULL DEFAULT 'pending',
    started_at      DATETIME        DEFAULT NULL,
    ended_at        DATETIME        DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_rtc_channel_id (channel_id),
    INDEX idx_rtc_creator (creator_id),
    INDEX idx_rtc_callee (callee_id),
    INDEX idx_rtc_appointment (appointment_id),
    INDEX idx_rtc_status (status),
    CONSTRAINT fk_rtc_creator FOREIGN KEY (creator_id) REFERENCES users(id),
    CONSTRAINT fk_rtc_callee FOREIGN KEY (callee_id) REFERENCES users(id),
    CONSTRAINT fk_rtc_appointment FOREIGN KEY (appointment_id) REFERENCES project_appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='阿里云 RTC 1v1 会话';
