-- Phase 3: 课次异常、完成备注、站内通知
ALTER TABLE project_appointments
  ADD COLUMN completion_notes VARCHAR(1024) DEFAULT NULL COMMENT '专家课次完成备注' AFTER ops_confirmed_at,
  ADD COLUMN fee_deduct_amount DECIMAL(10,2) DEFAULT NULL COMMENT '课次扣费金额' AFTER completion_notes,
  ADD COLUMN defer_reason VARCHAR(512) DEFAULT NULL COMMENT '延期原因' AFTER fee_deduct_amount;

ALTER TABLE project_appointments
  MODIFY COLUMN status ENUM('scheduled','confirmed','cancelled','completed','deferred','incomplete') NOT NULL DEFAULT 'scheduled';

CREATE TABLE IF NOT EXISTS user_notifications (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id     BIGINT UNSIGNED NOT NULL,
    title       VARCHAR(255)    NOT NULL,
    body        VARCHAR(1024)   NOT NULL,
    category    VARCHAR(64)     NOT NULL DEFAULT 'general',
    read_at     DATETIME        DEFAULT NULL,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_notifications_user (user_id, read_at),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='站内通知';
