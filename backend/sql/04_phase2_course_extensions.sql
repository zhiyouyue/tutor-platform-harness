ALTER TABLE project_appointments
  ADD COLUMN meeting_url VARCHAR(512) DEFAULT NULL COMMENT '第三方会议链接' AFTER topic,
  ADD COLUMN expert_completed_at DATETIME DEFAULT NULL COMMENT '专家标记课次完成' AFTER status,
  ADD COLUMN ops_confirmed_at DATETIME DEFAULT NULL COMMENT '班主任确认课次完成' AFTER expert_completed_at;
