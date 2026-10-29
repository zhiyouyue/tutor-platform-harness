-- 辅导内容改为 6 项。可重复执行。
INSERT INTO dict_coaching_types (code, label, sort_order, is_active) VALUES
  ('career_planning', '职业规划', 10, 1),
  ('resume_optimization', '简历优化', 20, 1),
  ('mock_interview', '模拟面试', 30, 1),
  ('interview_review', '面试复盘', 40, 1),
  ('salary_negotiation', '谈薪', 50, 1),
  ('offer_selection', 'OFFER选择', 60, 1)
ON DUPLICATE KEY UPDATE label = VALUES(label), sort_order = VALUES(sort_order), is_active = VALUES(is_active);

UPDATE dict_coaching_types
SET is_active = 0
WHERE code IN ('offer_negotiation', 'industry_insight', 'project_review');
