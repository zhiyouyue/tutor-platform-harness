-- Phase 1 固定字典 seed（不可后台配置）

INSERT INTO dict_service_audiences (code, label, sort_order) VALUES
  ('fresh_grad', '应届毕业生', 10),
  ('junior_0_1y', '0-1年经验', 20),
  ('junior_1_3y', '1-3年经验', 30),
  ('mid_3_5y', '3-5年经验', 40),
  ('career_switch', '转行/跨行业', 50)
ON DUPLICATE KEY UPDATE label = VALUES(label), sort_order = VALUES(sort_order);

INSERT INTO dict_coaching_types (code, label, sort_order) VALUES
  ('resume_optimization', '简历优化', 10),
  ('mock_interview', '模拟面试', 20),
  ('career_planning', '职业规划', 30),
  ('offer_negotiation', 'Offer 谈判', 40),
  ('industry_insight', '行业洞察', 50),
  ('project_review', '项目复盘', 60)
ON DUPLICATE KEY UPDATE label = VALUES(label), sort_order = VALUES(sort_order);

INSERT INTO dict_industries (code, label, sort_order) VALUES
  ('internet', '互联网/科技', 10),
  ('finance', '金融', 20),
  ('consulting', '咨询', 30),
  ('manufacturing', '制造业', 40),
  ('consumer', '消费/零售', 50),
  ('healthcare', '医疗/健康', 60),
  ('education', '教育', 70),
  ('media', '传媒/内容', 80)
ON DUPLICATE KEY UPDATE label = VALUES(label), sort_order = VALUES(sort_order);

INSERT INTO dict_job_roles (code, label, sort_order) VALUES
  ('product', '产品', 10),
  ('rd', '研发/技术', 20),
  ('operation', '运营', 30),
  ('marketing', '市场/品牌', 40),
  ('sales', '销售/商务', 50),
  ('design', '设计', 60),
  ('data', '数据/分析', 70),
  ('hr', '人力/行政', 80)
ON DUPLICATE KEY UPDATE label = VALUES(label), sort_order = VALUES(sort_order);
