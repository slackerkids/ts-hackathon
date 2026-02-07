-- ============================================================================
-- SEED DATA — Wipes all tables and inserts demo content
-- Run via: make seed
-- ============================================================================

-- Wipe everything (order matters due to foreign keys)
TRUNCATE purchases, shop_items, club_members, clubs, gov_members, attendance,
         hackathon_applications, hackathons, news, users
         RESTART IDENTITY CASCADE;

-- ─── News ──────────────────────────────────────────────────────────────────

INSERT INTO news (title, content, tag, image_url) VALUES
(
  'Welcome to TS Community OS!',
  'We are excited to launch the official digital platform for Tomorrow School students. Here you can find news, join clubs, register for hackathons, and earn coins by attending events. Stay tuned for more updates!',
  'Official',
  ''
),
(
  'Hackathon 2026: Build the Future',
  'The annual Tomorrow School hackathon is here! This year''s theme is "Build the Future" — create innovative solutions that improve student life. Teams of 2-4 people can register through the app. Prizes include scholarships, gadgets, and bragging rights.',
  'Hackathon',
  ''
),
(
  'Campus Life: New Study Spaces Open',
  'Great news for night owls! The library has extended its hours to midnight on weekdays. Additionally, three new collaborative study rooms have been opened on the second floor with whiteboards, projectors, and comfortable seating.',
  'Life',
  ''
);

-- ─── Hackathons ────────────────────────────────────────────────────────────

INSERT INTO hackathons (title, description, status, start_date, end_date) VALUES
(
  'TS Hackathon 2026',
  'Build innovative solutions for the Tomorrow School community. Theme: "Build the Future". Teams of 2-4 students. 48 hours of coding, mentoring, and fun. Prizes include scholarships and gadgets.',
  'active',
  '2026-02-15 09:00:00+00',
  '2026-02-17 18:00:00+00'
),
(
  'AI Challenge 2025',
  'Last year''s AI-focused hackathon. Participants built chatbots, recommendation systems, and computer vision projects.',
  'past',
  '2025-11-01 09:00:00+00',
  '2025-11-03 18:00:00+00'
);

-- ─── Clubs ─────────────────────────────────────────────────────────────────

INSERT INTO clubs (name, description, image_url, schedule) VALUES
(
  'Coding Club',
  'Weekly meetups for competitive programming, open-source contributions, and tech talks. All skill levels welcome!',
  '',
  'Every Wednesday, 18:00 — Room 302'
),
(
  'Sports Club',
  'Football, basketball, volleyball, and more. Join us for weekly games and tournaments between cohorts.',
  '',
  'Every Friday, 17:00 — Main Gym'
),
(
  'Art & Design Club',
  'Explore digital art, UI/UX design, photography, and creative coding. Monthly exhibitions and workshops.',
  '',
  'Every Tuesday, 18:30 — Creative Lab'
);

-- ─── Student Government ────────────────────────────────────────────────────

INSERT INTO gov_members (name, role_title, photo_url, contact_url, display_order) VALUES
('Aisha Nurmagambetova', 'President', '', 'https://t.me/aisha_n', 1),
('Daulet Karimov', 'Minister of Education', '', 'https://t.me/daulet_k', 2),
('Madina Suleimenova', 'Minister of Culture', '', 'https://t.me/madina_s', 3),
('Arman Bekturov', 'Minister of Sports', '', 'https://t.me/arman_b', 4);

-- ─── Shop Items ────────────────────────────────────────────────────────────

INSERT INTO shop_items (name, description, image_url, price_coins, stock) VALUES
('TS Sticker Pack', 'Exclusive Tomorrow School holographic stickers for your laptop.', '', 10, 50),
('Coffee Voucher', 'One free coffee at the campus cafe. Redeemable at the counter.', '', 25, 100),
('TS Hoodie', 'Limited edition Tomorrow School hoodie. Available in S/M/L/XL.', '', 200, 20);
