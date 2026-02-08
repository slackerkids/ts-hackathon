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
),
(
  'New Curriculum: AI and ML Fundamentals',
  'Starting next semester, all students will have access to a new elective: "AI and Machine Learning Fundamentals". The course covers supervised and unsupervised learning, neural networks, and ethics in AI. Sign up via the student portal before the add-drop deadline. Office hours are held every Thursday in Building A, Room 105.',
  'Education',
  ''
),
(
  'Winter Break Schedule and Campus Closure',
  'The campus will be closed from December 23 to January 5 for the winter break. The library will offer limited online resources during this period. All club activities and hackathon deadlines have been adjusted — please check the app for the latest dates. We wish you a restful break!',
  'Official',
  ''
),
(
  'Student Survey: Shape the Next Hackathon',
  'We want your input! Tell us which tracks and prizes you would like to see at the next hackathon. Fill out the short survey in the app (Profile → Surveys) by the end of the month. Your feedback directly influences how we design future events.',
  'Hackathon',
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
  'DevTools Sprint Q1 2026',
  'A one-day sprint focused on developer experience: build extensions, CLI tools, or IDE plugins that make student and teacher workflows better. Solo or pairs. Lunch and swag provided. Winners get priority project showcase at the spring demo day.',
  'active',
  '2026-03-08 10:00:00+00',
  '2026-03-08 20:00:00+00'
),
(
  'AI Challenge 2025',
  'Last year''s AI-focused hackathon. Participants built chatbots, recommendation systems, and computer vision projects. Over 30 teams competed; winning projects are now being piloted in campus services.',
  'past',
  '2025-11-01 09:00:00+00',
  '2025-11-03 18:00:00+00'
),
(
  'Green Tech Hack 2025',
  'Sustainability-themed hackathon. Teams designed apps and hardware prototypes for energy saving, recycling, and campus green initiatives. Sponsored by the Sustainability Office. Winning solutions are being evaluated for campus rollout.',
  'past',
  '2025-09-12 09:00:00+00',
  '2025-09-14 18:00:00+00'
);

-- ─── Clubs ─────────────────────────────────────────────────────────────────

INSERT INTO clubs (name, description, image_url, schedule) VALUES
(
  'Coding Club',
  'Weekly meetups for competitive programming, open-source contributions, and tech talks. We cover algorithms, system design, and real-world projects. All skill levels welcome — from first-year students to graduating seniors. Bring your laptop and ideas!',
  '',
  'Every Wednesday, 18:00 — Room 302. Workshops on alternating weeks.'
),
(
  'Sports Club',
  'Football, basketball, volleyball, and more. Join us for weekly games and tournaments between cohorts. We also organize inter-school matches and fitness sessions. No experience required — just come ready to move and have fun.',
  '',
  'Every Friday, 17:00 — Main Gym. Tournaments on the first Saturday of each month.'
),
(
  'Art & Design Club',
  'Explore digital art, UI/UX design, photography, and creative coding. Monthly exhibitions and workshops with guest artists and designers. We run Figma jams, photo walks, and collaborative mural projects.',
  '',
  'Every Tuesday, 18:30 — Creative Lab. Exhibition prep sessions on Sundays.'
),
(
  'Debate & Public Speaking',
  'Develop your argumentation and presentation skills. We practice structured debates, impromptu speeches, and pitch sessions. Great preparation for hackathon demos, interviews, and academic presentations. No prior experience needed.',
  '',
  'Every Monday, 17:30 — Room 201. Mock competitions monthly.'
),
(
  'Music & Sound',
  'From jam sessions to electronic music production and podcasting. We have practice rooms, basic instruments, and DAW workshops. All genres and skill levels welcome. Perform at campus events and open mics.',
  '',
  'Every Thursday, 19:00 — Music Wing, Room 1. Open jam on the last Friday of the month.'
);

-- ─── Student Government ────────────────────────────────────────────────────

INSERT INTO gov_members (name, role_title, photo_url, contact_url, display_order) VALUES
('Aisha Nurmagambetova', 'President', 'https://api.dicebear.com/7.x/avataaars/svg?seed=aisha', 'https://t.me/aisha_n', 1),
('Daulet Karimov', 'Minister of Education', 'https://api.dicebear.com/7.x/avataaars/svg?seed=daulet', 'https://t.me/daulet_k', 2),
('Madina Suleimenova', 'Minister of Culture', 'https://api.dicebear.com/7.x/avataaars/svg?seed=madina', 'https://t.me/madina_s', 3),
('Arman Bekturov', 'Minister of Sports', 'https://api.dicebear.com/7.x/avataaars/svg?seed=arman', 'https://t.me/arman_b', 4),
('Zara Ospanova', 'Minister of Tech', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zara', 'https://t.me/zara_tech', 5);

-- ─── Shop Items ────────────────────────────────────────────────────────────

INSERT INTO shop_items (name, description, image_url, price_coins, stock) VALUES
('TS Sticker Pack', 'Exclusive Tomorrow School holographic stickers for your laptop. Set of 6 designs. Show your school pride and decorate your device.', '', 10, 50),
('Coffee Voucher', 'One free coffee (any size) at the campus cafe. Redeemable at the counter by showing the voucher in the app. Valid until end of semester.', '', 25, 100),
('TS Hoodie', 'Limited edition Tomorrow School hoodie. Soft cotton blend, embroidered logo. Available in S/M/L/XL. Perfect for hackathons and casual wear.', '', 200, 20),
('Notebook & Pen Set', 'Branded TS notebook (A5, 80 pages) and ballpoint pen. Ideal for lectures and brainstorming. While supplies last.', '', 15, 80),
('Mentorship Session', 'Book a 30-minute 1:1 session with a senior student or alum in your field of interest. Great for career advice, project feedback, or exam prep.', '', 75, -1),
('Priority Hackathon T‑Shirt', 'Official hackathon event T‑shirt. Guaranteed size if you register early. Wear it on demo day and stand out.', '', 50, 60);
