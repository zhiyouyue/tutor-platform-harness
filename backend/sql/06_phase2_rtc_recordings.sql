-- Phase 2.1: 课次云端录制元数据（OSS）
CREATE TABLE IF NOT EXISTS rtc_recordings (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    rtc_session_id  BIGINT UNSIGNED NOT NULL,
    appointment_id  BIGINT UNSIGNED DEFAULT NULL,
    oss_bucket      VARCHAR(128)    NOT NULL,
    oss_key         VARCHAR(512)    NOT NULL,
    duration_sec    INT UNSIGNED    DEFAULT NULL,
    status          ENUM('pending','ready','failed') NOT NULL DEFAULT 'pending',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at    DATETIME        DEFAULT NULL,

    PRIMARY KEY (id),
    INDEX idx_rtc_rec_appointment (appointment_id),
    INDEX idx_rtc_rec_session (rtc_session_id),
    CONSTRAINT fk_rtc_rec_session FOREIGN KEY (rtc_session_id) REFERENCES rtc_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_rtc_rec_appointment FOREIGN KEY (appointment_id) REFERENCES project_appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='RTC 云端录制（OSS 元数据）';
