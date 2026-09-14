-- RTC 会话表 — 阿里云 dingrtc 1v1
-- 执行: npm run db:rtc

USE tutoring_platform;

CREATE TABLE IF NOT EXISTS rtc_sessions (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    channel_id      VARCHAR(64)     NOT NULL                    COMMENT '阿里云频道 ID',
    creator_id      INT UNSIGNED    NOT NULL                    COMMENT '发起人 users.id',
    callee_id       INT UNSIGNED    NOT NULL                    COMMENT '被叫人 users.id',
    order_id        INT UNSIGNED    DEFAULT NULL                COMMENT '可选关联项目/订单',
    status          ENUM('pending','active','ended','cancelled') NOT NULL DEFAULT 'pending',
    started_at      DATETIME        DEFAULT NULL,
    ended_at        DATETIME        DEFAULT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_channel_id (channel_id),
    INDEX idx_creator_id (creator_id),
    INDEX idx_callee_id (callee_id),
    INDEX idx_status (status),
    CONSTRAINT fk_rtc_creator FOREIGN KEY (creator_id) REFERENCES users(id),
    CONSTRAINT fk_rtc_callee  FOREIGN KEY (callee_id)  REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='RTC 音视频会话';
