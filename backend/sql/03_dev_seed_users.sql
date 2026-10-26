-- 开发环境初始账号（明文密码见 docs/product-specs/phase-3/user-manual/00-本地测试账号.md）
-- admin / admin123
-- ops1 / ops123456
-- expert1 / expert123456
-- student1 / student123456
INSERT INTO users (phone, account, password_hash, role, status) VALUES
  ('13800000001', 'admin', '$2b$10$YMoS5IPMM0SzHauZs1ZM7.La2aTmRSVZn/pol5WlK6TdcEDyZAtDC', 'admin', 'active'),
  ('13800000002', 'ops1', '$2b$10$XBQrwAASCdkWBGrmslFLtuC5UYUqsUthobLA1X6AOa8PXVjdWboeu', 'ops', 'active'),
  ('13800000003', 'expert1', '$2b$10$Co65qmIR4uNocq3PFKv3Uu4Bt2.8ohbSLkUQp48e58.pkAgcf67yS', 'expert', 'active'),
  ('13800000004', 'student1', '$2b$10$MSK7Yu6ztDCh/5XsTsHTPu/OnMTlHwGMEHd71NXkJLIYdgQBlXXUm', 'student', 'active')
ON DUPLICATE KEY UPDATE status = VALUES(status), password_hash = VALUES(password_hash), role = VALUES(role);

INSERT INTO ops_profiles (user_id, display_name)
SELECT id, '运营一号' FROM users WHERE account = 'ops1'
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);

INSERT INTO expert_profiles (user_id, real_name, city, current_company, current_title, profile_status, accepting_projects, verified_at, verified_by)
SELECT u.id, '测试专家', '上海', '职优越', '导师', 'active', 1, NOW(), a.id
FROM users u
JOIN users a ON a.account = 'admin'
WHERE u.account = 'expert1'
ON DUPLICATE KEY UPDATE
  real_name = VALUES(real_name),
  profile_status = 'active',
  accepting_projects = 1,
  verified_at = VALUES(verified_at),
  verified_by = VALUES(verified_by);

INSERT INTO student_profiles (user_id, real_name, city, student_type)
SELECT id, '测试学员', '上海', '应届' FROM users WHERE account = 'student1'
ON DUPLICATE KEY UPDATE real_name = VALUES(real_name), city = VALUES(city), student_type = VALUES(student_type);
