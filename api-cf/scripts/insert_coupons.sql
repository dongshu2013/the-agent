-- Insert sample coupon codes
INSERT INTO coupon_codes (code, credits, max_uses, is_active, expired_at, auth_user) VALUES
('MYSTA2025', 1000000, 100, 1, datetime('now', '+30 days'), NULL),
('VIP2025', 5000000, 1, 1, datetime('now', '+30 days'), 'taokevin1024@gmail.com'),
('TEAM2025', 3000000, 5, 1, datetime('now', '+30 days'), 'taokevin1024@gmail.com,dongs2011@gmail.com');