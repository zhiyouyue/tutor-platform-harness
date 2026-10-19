-- 可重复执行：列/索引已存在时 run-sql 会 SKIP
ALTER TABLE income_lines
  ADD COLUMN appointment_id BIGINT UNSIGNED DEFAULT NULL COMMENT '课次入账' AFTER project_id,
  ADD UNIQUE KEY uk_income_lines_appointment (appointment_id),
  ADD CONSTRAINT fk_income_lines_appointment FOREIGN KEY (appointment_id) REFERENCES project_appointments(id) ON DELETE SET NULL;
