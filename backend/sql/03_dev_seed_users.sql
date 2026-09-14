-- 开发环境初始账号（密码见 backend/README.md）
-- admin / admin123
-- ops1 / ops123456
INSERT INTO users (phone, account, password_hash, role, status) VALUES
  ('13800000001', 'admin', '$2b$10$YMoS5IPMM0SzHauZs1ZM7.La2aTmRSVZn/pol5WlK6TdcEDyZAtDC', 'admin', 'active'),
  ('13800000002', 'ops1', '$2b$10$XBQrwAASCdkWBGrmslFLtuC5UYUqsUthobLA1X6AOa8PXVjdWboeu', 'ops', 'active')
ON DUPLICATE KEY UPDATE status = VALUES(status);

INSERT INTO ops_profiles (user_id, display_name)
SELECT id, '运营一号' FROM users WHERE account = 'ops1'
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name);
