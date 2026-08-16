-- ============================================================================
-- SHV Store — Seed Reviews
-- ----------------------------------------------------------------------------
-- Adds 5–20 customer reviews to every product (ids 1–17) with realistic
-- star ratings. The overall rating shown on the site is the average of these,
-- rounded to 1 decimal place (e.g. 4.8, 4.3, 2.0).
--
-- HOW TO RUN:
--   Open your Supabase project -> SQL Editor -> New query, paste this file,
--   and run it. It is safe to run multiple times: it first removes the demo
--   reviewers and their reviews, then re-inserts everything fresh.
--
-- WHAT IT DOES:
--   1. Creates 16 demo reviewer accounts (role = 1 / USER, email_verified).
--      Their password is "password" (bcrypt hash below) — used for display
--      names only, they are not meant to be logged in as.
--   2. Inserts reviews referencing the real products by product_id and the
--      demo reviewers by email (joined to users.id).
--
-- RATINGS PROFILE:
--   MacBook Pro 14" (id 6)   -> 5.0   (all 5 stars)
--   iPhone 17 Pro Max (id 5) -> 4.9
--   iPhone 17 Pro (id 1)     -> 4.8   / Apple Watch Ultra 3 (id 12) -> 4.8
--   MacBook Pro 16" (id 7)   -> 4.7
--   MacBook Air 15" (id 4)   -> 4.6   / iPad Pro 13" (id 14)        -> 4.5
--   MacBook Air M5 (id 2)    -> 4.4   / iPad Air (id 8)             -> 4.4
--   iPad mini (id 17)        -> 4.4   / AirPods Pro 3 (id 10)       -> 4.3
--   AirPods Max (id 3)       -> 4.2   / Apple Watch S11 (id 11)     -> 4.1
--   iPhone Air (id 9)        -> 3.5   / iPhone 17e (id 15)          -> 3.0
--   iPhone 17 (id 13)        -> 2.0   / iPhone 15 Pro Max (id 16)   -> 1.5
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 0. Clean up a previous run of this seed (so it can be re-run safely)
-- ----------------------------------------------------------------------------
DELETE FROM reviews
WHERE user_id IN (
    SELECT id FROM users
    WHERE email IN (
        'alex.johnson@example.com',
        'maria.lopez@example.com',
        'david.chen@example.com',
        'emma.wilson@example.com',
        'liam.brown@example.com',
        'sofia.rossi@example.com',
        'noah.miller@example.com',
        'olivia.davis@example.com',
        'ethan.walker@example.com',
        'ava.garcia@example.com',
        'lucas.martin@example.com',
        'mia.thompson@example.com',
        'james.white@example.com',
        'isabella.clark@example.com',
        'benjamin.lee@example.com',
        'charlotte.adams@example.com'
    )
);

DELETE FROM users
WHERE email IN (
    'alex.johnson@example.com',
    'maria.lopez@example.com',
    'david.chen@example.com',
    'emma.wilson@example.com',
    'liam.brown@example.com',
    'sofia.rossi@example.com',
    'noah.miller@example.com',
    'olivia.davis@example.com',
    'ethan.walker@example.com',
    'ava.garcia@example.com',
    'lucas.martin@example.com',
    'mia.thompson@example.com',
    'james.white@example.com',
    'isabella.clark@example.com',
    'benjamin.lee@example.com',
    'charlotte.adams@example.com'
);


-- ----------------------------------------------------------------------------
-- 1. Demo reviewer accounts (used only for review display names)
--    role = 1 (USER), bcrypt hash of "password"
-- ----------------------------------------------------------------------------
INSERT INTO users (name, email, password, phone_number, role, email_verified, created_at)
VALUES
    ('Alex Johnson',   'alex.johnson@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0101', 1, TRUE, NOW() - INTERVAL '400 days'),
    ('Maria Lopez',    'maria.lopez@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0102', 1, TRUE, NOW() - INTERVAL '380 days'),
    ('David Chen',     'david.chen@example.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0103', 1, TRUE, NOW() - INTERVAL '360 days'),
    ('Emma Wilson',    'emma.wilson@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0104', 1, TRUE, NOW() - INTERVAL '340 days'),
    ('Liam Brown',     'liam.brown@example.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0105', 1, TRUE, NOW() - INTERVAL '320 days'),
    ('Sofia Rossi',    'sofia.rossi@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0106', 1, TRUE, NOW() - INTERVAL '300 days'),
    ('Noah Miller',    'noah.miller@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0107', 1, TRUE, NOW() - INTERVAL '280 days'),
    ('Olivia Davis',   'olivia.davis@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0108', 1, TRUE, NOW() - INTERVAL '260 days'),
    ('Ethan Walker',   'ethan.walker@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0109', 1, TRUE, NOW() - INTERVAL '240 days'),
    ('Ava Garcia',     'ava.garcia@example.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0110', 1, TRUE, NOW() - INTERVAL '220 days'),
    ('Lucas Martin',   'lucas.martin@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0111', 1, TRUE, NOW() - INTERVAL '200 days'),
    ('Mia Thompson',   'mia.thompson@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0112', 1, TRUE, NOW() - INTERVAL '180 days'),
    ('James White',    'james.white@example.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0113', 1, TRUE, NOW() - INTERVAL '160 days'),
    ('Isabella Clark', 'isabella.clark@example.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0114', 1, TRUE, NOW() - INTERVAL '140 days'),
    ('Benjamin Lee',   'benjamin.lee@example.com',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0115', 1, TRUE, NOW() - INTERVAL '120 days'),
    ('Charlotte Adams','charlotte.adams@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '555-0116', 1, TRUE, NOW() - INTERVAL '100 days');


-- ----------------------------------------------------------------------------
-- 2. Reviews
--    content, rating (1–5), product_id, user_email (resolved to users.id), created_at
-- ----------------------------------------------------------------------------
INSERT INTO reviews (content, rating, product_id, user_id, created_at)
SELECT r.content, r.rating, r.product_id, u.id, r.created_at
FROM (VALUES
    -- ===== iPhone 17 Pro (id 1) — avg 4.8 =====
    ('Absolutely blown away by the A19 Pro chip. Everything is instant and the titanium build feels incredibly premium. The best iPhone I have owned.', 5, 1, 'alex.johnson@example.com', NOW() - INTERVAL '12 days'),
    ('Battery easily lasts me a full day and a half. The 48MP camera is stunning — photos at night look like they were shot on a mirrorless camera.', 5, 1, 'maria.lopez@example.com', NOW() - INTERVAL '20 days'),
    ('Upgraded from the 15 Pro and the difference is night and day. ProMotion 120Hz is buttery and the new ultrawide is a big step up.', 5, 1, 'david.chen@example.com', NOW() - INTERVAL '25 days'),
    ('The display is the brightest I have ever seen. Reading in direct sunlight is finally possible. Build quality is flawless.', 5, 1, 'emma.wilson@example.com', NOW() - INTERVAL '30 days'),
    ('Face ID is faster than ever and iOS 19 is silky smooth. This phone feels years ahead of the competition.', 5, 1, 'liam.brown@example.com', NOW() - INTERVAL '34 days'),
    ('Love the lighter titanium frame. The camera system is a genuine upgrade, especially the 5x telephoto which is razor sharp.', 5, 1, 'sofia.rossi@example.com', NOW() - INTERVAL '40 days'),
    ('Fastest phone I have used, hands down. Video recording in 4K ProRes is insane quality for a pocket device.', 5, 1, 'noah.miller@example.com', NOW() - INTERVAL '45 days'),
    ('Design is gorgeous — Natural Titanium is subtle and classy. No regrets switching to this.', 5, 1, 'olivia.davis@example.com', NOW() - INTERVAL '50 days'),
    ('Performance is overkill for daily use but that is exactly what you want for future-proofing. Battery and cameras are superb.', 5, 1, 'ethan.walker@example.com', NOW() - INTERVAL '55 days'),
    ('The haptics, the screen, the speed — everything feels expensive. Worth every cent.', 5, 1, 'ava.garcia@example.com', NOW() - INTERVAL '60 days'),
    ('Great phone overall, only gripe is there is still no charger in the box. Otherwise it is a brilliant device.', 4, 1, 'lucas.martin@example.com', NOW() - INTERVAL '65 days'),
    ('Fantastic camera and speed, but I wish the ultra-wide was sharper in low light. Minor complaint, still the best phone I have had.', 4, 1, 'mia.thompson@example.com', NOW() - INTERVAL '70 days'),

    -- ===== MacBook Air M5 (id 2) — avg 4.4 =====
    ('Silent, cool, and absurdly fast. The M5 handles everything I throw at it and the battery truly lasts all day.', 5, 2, 'alex.johnson@example.com', NOW() - INTERVAL '9 days'),
    ('This is the perfect laptop for students. Light, quiet, and the screen is gorgeous. Best value in Apple''s lineup.', 5, 2, 'emma.wilson@example.com', NOW() - INTERVAL '15 days'),
    ('Upgraded from an Intel Mac and it is like a different planet. Instant wake, zero fan noise, phenomenal battery.', 5, 2, 'david.chen@example.com', NOW() - INTERVAL '22 days'),
    ('Keyboard feels amazing, the build is rock solid, and Touch ID is super convenient. Love it.', 5, 2, 'sofia.rossi@example.com', NOW() - INTERVAL '28 days'),
    ('M5 chip is a beast. I edit 4K video and it does not break a sweat. The 512GB is a bit tight but manageable.', 5, 2, 'ethan.walker@example.com', NOW() - INTERVAL '33 days'),
    ('Perfect weight and size for travel. Screen is bright and crisp. This laptop just works.', 5, 2, 'charlotte.adams@example.com', NOW() - INTERVAL '40 days'),
    ('Best battery life of any laptop I have owned. Can go two full workdays on a charge.', 5, 2, 'benjamin.lee@example.com', NOW() - INTERVAL '47 days'),
    ('Switched from Windows and never looking back. macOS plus this hardware is a joy to use.', 5, 2, 'ava.garcia@example.com', NOW() - INTERVAL '52 days'),
    ('Great machine, just wish it came with more ports. A second USB-C would have been nice.', 4, 2, 'lucas.martin@example.com', NOW() - INTERVAL '58 days'),
    ('Fast and quiet, but the base RAM config feels limiting for heavy multitaskers.', 4, 2, 'mia.thompson@example.com', NOW() - INTERVAL '63 days'),
    ('Solid laptop, but honestly not a massive jump over the M3 for everyday tasks. Still good value.', 3, 2, 'james.white@example.com', NOW() - INTERVAL '68 days'),
    ('Disappointed with the glossy screen in bright rooms — lots of reflections. Performance is great though.', 2, 2, 'isabella.clark@example.com', NOW() - INTERVAL '74 days'),

    -- ===== AirPods Max (id 3) — avg 4.2 =====
    ('The best-sounding headphones I have ever owned. ANC is top tier and the spatial audio is mind-blowing.', 5, 3, 'sofia.rossi@example.com', NOW() - INTERVAL '11 days'),
    ('Build quality is exceptional — aluminum and memory foam, nothing feels cheap. Bass is deep and detailed.', 5, 3, 'david.chen@example.com', NOW() - INTERVAL '19 days'),
    ('Noise cancellation makes flights feel silent. The comfort is incredible for long sessions.', 5, 3, 'olivia.davis@example.com', NOW() - INTERVAL '27 days'),
    ('Soundstage is huge and voices sound incredibly natural. Expensive, but you get what you pay for.', 5, 3, 'ethan.walker@example.com', NOW() - INTERVAL '35 days'),
    ('Transparency mode is the closest thing to wearing nothing at all. Apple nailed it.', 5, 3, 'ava.garcia@example.com', NOW() - INTERVAL '42 days'),
    ('Sound is phenomenal, just wish the case was not so silly and it had a battery meter.', 4, 3, 'liam.brown@example.com', NOW() - INTERVAL '49 days'),
    ('Very good headphones, but at this price I expected USB-C charging included by default.', 4, 3, 'lucas.martin@example.com', NOW() - INTERVAL '55 days'),
    ('They sound great, but they are heavy for long wear and the smart case is a bad design.', 4, 3, 'benjamin.lee@example.com', NOW() - INTERVAL '61 days'),
    ('For the price, the lack of a headphone jack and the odd power case design really bother me.', 3, 3, 'james.white@example.com', NOW() - INTERVAL '67 days'),
    ('Heavy for the price and the case is terrible. Sound quality does not justify the cost for me.', 2, 3, 'isabella.clark@example.com', NOW() - INTERVAL '73 days'),

    -- ===== MacBook Air 15-inch M4 (id 4) — avg 4.6 =====
    ('The bigger screen makes all the difference. Thin, light, and fast — this is the sweet spot of the lineup.', 5, 4, 'emma.wilson@example.com', NOW() - INTERVAL '8 days'),
    ('M4 is a beast and the 15-inch display is stunning for work and movies. Battery is excellent.', 5, 4, 'david.chen@example.com', NOW() - INTERVAL '16 days'),
    ('Perfect balance of portability and screen real estate. Best MacBook Air they have made.', 5, 4, 'alex.johnson@example.com', NOW() - INTERVAL '24 days'),
    ('Colors on this display are vibrant and the performance is snappy. Love the Starlight finish.', 5, 4, 'sofia.rossi@example.com', NOW() - INTERVAL '31 days'),
    ('Does everything I need without the Pro weight. Quiet and cool under load.', 5, 4, 'charlotte.adams@example.com', NOW() - INTERVAL '39 days'),
    ('Upgraded from the 13-inch and the extra space is worth it. Amazing laptop.', 5, 4, 'benjamin.lee@example.com', NOW() - INTERVAL '46 days'),
    ('Fantastic screen, great keyboard, and it never gets hot. Highly recommended.', 5, 4, 'ethan.walker@example.com', NOW() - INTERVAL '53 days'),
    ('This replaced my desktop for most work. Incredible value for a 15-inch laptop.', 5, 4, 'ava.garcia@example.com', NOW() - INTERVAL '60 days'),
    ('Great laptop, just wish there were more than two USB-C ports.', 4, 4, 'lucas.martin@example.com', NOW() - INTERVAL '66 days'),
    ('Very good, but the 16GB RAM is starting to feel standard — I would pay more for 32.', 4, 4, 'mia.thompson@example.com', NOW() - INTERVAL '72 days'),
    ('Good laptop, but I expected a bit more of a jump from the previous generation.', 4, 4, 'isabella.clark@example.com', NOW() - INTERVAL '78 days'),
    ('Nice machine, though the glossy screen is a bit reflective in bright offices.', 3, 4, 'james.white@example.com', NOW() - INTERVAL '84 days'),

    -- ===== iPhone 17 Pro Max (id 5) — avg 4.9 =====
    ('The ultimate phone. The 6.9-inch screen is gorgeous and battery easily lasts two days.', 5, 5, 'alex.johnson@example.com', NOW() - INTERVAL '10 days'),
    ('Camera king. The 5x telephoto is phenomenal and low-light photos are unreal.', 5, 5, 'maria.lopez@example.com', NOW() - INTERVAL '18 days'),
    ('Huge upgrade. Everything about it feels next-gen — display, chip, build.', 5, 5, 'david.chen@example.com', NOW() - INTERVAL '26 days'),
    ('This screen is the best I have ever used. Movies and photos look incredible.', 5, 5, 'emma.wilson@example.com', NOW() - INTERVAL '34 days'),
    ('Fastest, most premium phone available. No competition.', 5, 5, 'liam.brown@example.com', NOW() - INTERVAL '41 days'),
    ('Battery life is outstanding. I charge every other day now.', 5, 5, 'sofia.rossi@example.com', NOW() - INTERVAL '48 days'),
    ('The titanium body is light and premium. Video recording quality is absurdly good.', 5, 5, 'noah.miller@example.com', NOW() - INTERVAL '54 days'),
    ('Zero complaints. It is big, but you get used to it fast and the experience is worth it.', 5, 5, 'olivia.davis@example.com', NOW() - INTERVAL '61 days'),
    ('Performance is flawless and the cameras are on another level.', 5, 5, 'ethan.walker@example.com', NOW() - INTERVAL '68 days'),
    ('Best iPhone ever made, period.', 5, 5, 'ava.garcia@example.com', NOW() - INTERVAL '74 days'),
    ('The ProMotion screen at 6.9 inches is a media lover''s dream.', 5, 5, 'lucas.martin@example.com', NOW() - INTERVAL '80 days'),
    ('Bought it for the camera and was not disappointed. Zoom shots are sharp and crisp.', 5, 5, 'mia.thompson@example.com', NOW() - INTERVAL '86 days'),
    ('Superb device. The ultrawide upgrade was badly needed and delivers.', 5, 5, 'benjamin.lee@example.com', NOW() - INTERVAL '92 days'),
    ('Amazing phone, though it is a bit heavy in one-handed use. Otherwise flawless.', 4, 5, 'isabella.clark@example.com', NOW() - INTERVAL '98 days'),

    -- ===== MacBook Pro 14-inch M5 (id 6) — avg 5.0 =====
    ('An absolute powerhouse. 4K editing is effortless and the XDR display is stunning.', 5, 6, 'alex.johnson@example.com', NOW() - INTERVAL '7 days'),
    ('The mini-LED screen with 1600 nits HDR is jaw-dropping. Best laptop screen on the market.', 5, 6, 'david.chen@example.com', NOW() - INTERVAL '14 days'),
    ('Silent under full load. The M5 is a monster and this machine handles anything.', 5, 6, 'emma.wilson@example.com', NOW() - INTERVAL '21 days'),
    ('Worth every penny for a professional workflow. Build quality is flawless.', 5, 6, 'liam.brown@example.com', NOW() - INTERVAL '28 days'),
    ('Speakers are incredible for a laptop — best I have ever heard.', 5, 6, 'sofia.rossi@example.com', NOW() - INTERVAL '35 days'),
    ('The notch is barely noticeable and the extra screen space is great. Perfect machine.', 5, 6, 'noah.miller@example.com', NOW() - INTERVAL '42 days'),
    ('Ports, keyboard, screen, power — this laptop has it all. Zero compromises.', 5, 6, 'olivia.davis@example.com', NOW() - INTERVAL '49 days'),
    ('I have bought a lot of laptops. This is the best one, full stop.', 5, 6, 'ethan.walker@example.com', NOW() - INTERVAL '56 days'),
    ('HDR content looks like a cinema screen. Performance never drops, even with many tabs and 4K renders.', 5, 6, 'ava.garcia@example.com', NOW() - INTERVAL '63 days'),
    ('Battery easily lasts my full workday with heavy use. Remarkable engineering.', 5, 6, 'charlotte.adams@example.com', NOW() - INTERVAL '70 days'),

    -- ===== MacBook Pro 16-inch M5 Pro (id 7) — avg 4.7 =====
    ('The perfect workstation. The 16-inch XDR screen is enormous and beautiful.', 5, 7, 'alex.johnson@example.com', NOW() - INTERVAL '9 days'),
    ('Handles my heavy 3D work without breaking a sweat. The M5 Pro is incredible.', 5, 7, 'david.chen@example.com', NOW() - INTERVAL '17 days'),
    ('Best investment I have made for my business. Silent, powerful, and the display is superb.', 5, 7, 'emma.wilson@example.com', NOW() - INTERVAL '25 days'),
    ('The screen real estate plus the power make this the ultimate creative machine.', 5, 7, 'liam.brown@example.com', NOW() - INTERVAL '33 days'),
    ('Renders that used to take 30 minutes now take 3. Absolutely worth it.', 5, 7, 'sofia.rossi@example.com', NOW() - INTERVAL '40 days'),
    ('Great keyboard, massive trackpad, and build quality that is second to none.', 5, 7, 'noah.miller@example.com', NOW() - INTERVAL '47 days'),
    ('For video editing this is unbeatable. The HDR screen is a game changer.', 5, 7, 'olivia.davis@example.com', NOW() - INTERVAL '54 days'),
    ('Portable enough to carry daily yet powerful enough to replace a desktop.', 5, 7, 'benjamin.lee@example.com', NOW() - INTERVAL '61 days'),
    ('Excellent machine, but it is heavy to carry around every day.', 4, 7, 'mia.thompson@example.com', NOW() - INTERVAL '68 days'),
    ('Powerful and beautiful, though the price is hard to swallow.', 4, 7, 'ethan.walker@example.com', NOW() - INTERVAL '75 days'),
    ('Brilliant performance, but I wish the base model had more storage.', 4, 7, 'ava.garcia@example.com', NOW() - INTERVAL '82 days'),
    ('Amazing screen and speed, just a bit overkill unless you do heavy creative work.', 4, 7, 'james.white@example.com', NOW() - INTERVAL '89 days'),

    -- ===== iPad Air 11-inch M3 (id 8) — avg 4.4 =====
    ('The M3 chip makes this feel like a laptop replacement. Fast, light, and beautiful.', 5, 8, 'emma.wilson@example.com', NOW() - INTERVAL '10 days'),
    ('Perfect for drawing with the Apple Pencil Pro. No lag at all.', 5, 8, 'david.chen@example.com', NOW() - INTERVAL '19 days'),
    ('Great tablet for the price. The display is bright and the performance is snappy.', 5, 8, 'sofia.rossi@example.com', NOW() - INTERVAL '28 days'),
    ('Battery lasts days. The 11-inch size is ideal for reading and media.', 5, 8, 'charlotte.adams@example.com', NOW() - INTERVAL '37 days'),
    ('Very good tablet, though the speakers could be louder.', 4, 8, 'lucas.martin@example.com', NOW() - INTERVAL '46 days'),
    ('Fast and light, but the screen is not laminated on this model like I hoped.', 4, 8, 'mia.thompson@example.com', NOW() - INTERVAL '55 days'),
    ('Solid upgrade from my old iPad. Wish it had Face ID instead of Touch ID.', 4, 8, 'olivia.davis@example.com', NOW() - INTERVAL '64 days'),
    ('Good performance, but storage fills up fast with the base model.', 4, 8, 'james.white@example.com', NOW() - INTERVAL '73 days'),
    ('Great for notes and media. The pencil support is excellent.', 4, 8, 'ava.garcia@example.com', NOW() - INTERVAL '82 days'),
    ('Nice tablet, just wish the charging brick was included.', 4, 8, 'isabella.clark@example.com', NOW() - INTERVAL '90 days'),

    -- ===== iPhone Air (id 9) — avg 3.5 =====
    ('Super thin and light. The 48MP camera is surprisingly good for the price.', 5, 9, 'alex.johnson@example.com', NOW() - INTERVAL '12 days'),
    ('Love the Sky Blue color and how light it feels. Great value iPhone.', 5, 9, 'emma.wilson@example.com', NOW() - INTERVAL '22 days'),
    ('Perfect everyday phone. Fast enough, beautiful screen, and lasts all day.', 5, 9, 'sofia.rossi@example.com', NOW() - INTERVAL '32 days'),
    ('Good phone overall, though the single camera is a bit limiting.', 4, 9, 'lucas.martin@example.com', NOW() - INTERVAL '42 days'),
    ('Nice and light, but I expected a bit more battery life.', 4, 9, 'mia.thompson@example.com', NOW() - INTERVAL '52 days'),
    ('It is okay. Battery life is average and it gets warm during heavy use.', 3, 9, 'james.white@example.com', NOW() - INTERVAL '62 days'),
    ('Decent phone, but eSIM only was a hassle when traveling.', 3, 9, 'isabella.clark@example.com', NOW() - INTERVAL '72 days'),
    ('Fine for basics, but the camera cannot match the Pro models.', 3, 9, 'noah.miller@example.com', NOW() - INTERVAL '82 days'),
    ('Disappointed with the charging speed. It feels slower than my last phone.', 2, 9, 'ethan.walker@example.com', NOW() - INTERVAL '92 days'),
    ('Screen scratches way too easily. Really disappointed with the durability.', 1, 9, 'charlotte.adams@example.com', NOW() - INTERVAL '102 days'),

    -- ===== AirPods Pro 3 (id 10) — avg 4.3 =====
    ('The noise cancellation is unreal — twice as strong as the old Pros. Must-have.', 5, 10, 'maria.lopez@example.com', NOW() - INTERVAL '8 days'),
    ('Best earbuds I have used. Spatial audio with head tracking is magic.', 5, 10, 'david.chen@example.com', NOW() - INTERVAL '16 days'),
    ('Sound quality is superb and they fit perfectly. The heart-rate sensing is a cool bonus.', 5, 10, 'sofia.rossi@example.com', NOW() - INTERVAL '24 days'),
    ('Transparency mode is so natural. Calls sound crystal clear.', 5, 10, 'olivia.davis@example.com', NOW() - INTERVAL '32 days'),
    ('The improved ANC makes commutes silent. Excellent battery with the case.', 5, 10, 'benjamin.lee@example.com', NOW() - INTERVAL '40 days'),
    ('Comfortable for hours and the controls are intuitive. Worth every penny.', 5, 10, 'ava.garcia@example.com', NOW() - INTERVAL '48 days'),
    ('Great upgrade from the Pro 2. Cleaner bass and better call quality.', 5, 10, 'liam.brown@example.com', NOW() - INTERVAL '56 days'),
    ('Great sound, but the case gets scratched easily.', 4, 10, 'lucas.martin@example.com', NOW() - INTERVAL '64 days'),
    ('Very good earbuds, wish the tips had more size options.', 4, 10, 'mia.thompson@example.com', NOW() - INTERVAL '72 days'),
    ('Good ANC and sound, though they can feel a bit small in bigger ears.', 4, 10, 'noah.miller@example.com', NOW() - INTERVAL '80 days'),
    ('They sound good but keep disconnecting from my Windows laptop.', 3, 10, 'james.white@example.com', NOW() - INTERVAL '88 days'),
    ('Battery drains faster than expected after a year of use.', 2, 10, 'isabella.clark@example.com', NOW() - INTERVAL '96 days'),

    -- ===== Apple Watch Series 11 (id 11) — avg 4.1 =====
    ('The always-on display is gorgeous and the health features are spot on.', 5, 11, 'emma.wilson@example.com', NOW() - INTERVAL '9 days'),
    ('Battery finally lasts a full day even with heavy tracking. Love the new sensors.', 5, 11, 'david.chen@example.com', NOW() - INTERVAL '18 days'),
    ('Best smartwatch for iPhone users, period. The ECG and sleep tracking are excellent.', 5, 11, 'sofia.rossi@example.com', NOW() - INTERVAL '27 days'),
    ('The 46mm size is perfect and the band system is so convenient.', 5, 11, 'olivia.davis@example.com', NOW() - INTERVAL '36 days'),
    ('Great watch, though I would love longer battery life for sleep tracking.', 4, 11, 'lucas.martin@example.com', NOW() - INTERVAL '45 days'),
    ('Works beautifully, but it is expensive for what it is.', 4, 11, 'mia.thompson@example.com', NOW() - INTERVAL '54 days'),
    ('Very good fitness tracking. The screen is bright and responsive.', 4, 11, 'noah.miller@example.com', NOW() - INTERVAL '63 days'),
    ('Good watch overall, but the always-on display eats the battery.', 4, 11, 'james.white@example.com', NOW() - INTERVAL '72 days'),
    ('It is fine, but the sleep apnea feature needs more accuracy.', 3, 11, 'isabella.clark@example.com', NOW() - INTERVAL '81 days'),
    ('Battery barely lasts a day with GPS running. Disappointing.', 2, 11, 'ethan.walker@example.com', NOW() - INTERVAL '90 days'),

    -- ===== Apple Watch Ultra 3 (id 12) — avg 4.8 =====
    ('A beast. The 3000-nit screen is visible in direct sun and battery lasts days.', 5, 12, 'alex.johnson@example.com', NOW() - INTERVAL '11 days'),
    ('Built for adventure. GPS is rock solid and the action button is genius.', 5, 12, 'david.chen@example.com', NOW() - INTERVAL '21 days'),
    ('The ultimate rugged watch. Battery life in low-power mode is incredible.', 5, 12, 'emma.wilson@example.com', NOW() - INTERVAL '31 days'),
    ('I dive, hike, and run — this watch does it all flawlessly.', 5, 12, 'liam.brown@example.com', NOW() - INTERVAL '41 days'),
    ('The titanium build feels premium and the big screen is fantastic.', 5, 12, 'sofia.rossi@example.com', NOW() - INTERVAL '51 days'),
    ('Best battery life of any smartwatch I have owned.', 5, 12, 'noah.miller@example.com', NOW() - INTERVAL '61 days'),
    ('The siren feature is a real safety net. Worth every penny for outdoor folks.', 5, 12, 'olivia.davis@example.com', NOW() - INTERVAL '71 days'),
    ('Tracks everything accurately, from altitude to water temp. Superb.', 5, 12, 'charlotte.adams@example.com', NOW() - INTERVAL '81 days'),
    ('Excellent watch, though it is bulky under dress shirts.', 4, 12, 'lucas.martin@example.com', NOW() - INTERVAL '91 days'),
    ('Great for sports, but heavy for daily wear.', 4, 12, 'mia.thompson@example.com', NOW() - INTERVAL '101 days'),

    -- ===== iPhone 17 (id 13) — avg 2.0 =====
    ('It is a fine phone honestly, but you would expect more for the price.', 4, 13, 'ava.garcia@example.com', NOW() - INTERVAL '13 days'),
    ('The camera is decent and it works, but nothing special.', 4, 13, 'benjamin.lee@example.com', NOW() - INTERVAL '26 days'),
    ('Average phone. The battery is okay, the screen is nice, but performance feels throttled.', 3, 13, 'james.white@example.com', NOW() - INTERVAL '39 days'),
    ('It is okay for everyday use, just do not expect Pro-level features.', 3, 13, 'isabella.clark@example.com', NOW() - INTERVAL '52 days'),
    ('Battery life is genuinely bad. I am charging twice a day.', 2, 13, 'ethan.walker@example.com', NOW() - INTERVAL '65 days'),
    ('Gets warm during gaming and the speakers sound tinny.', 2, 13, 'charlotte.adams@example.com', NOW() - INTERVAL '78 days'),
    ('Extremely disappointed. The battery degrades fast and there are random freezes.', 1, 13, 'maria.lopez@example.com', NOW() - INTERVAL '91 days'),
    ('Not worth the money. My old phone was better.', 1, 13, 'lucas.martin@example.com', NOW() - INTERVAL '104 days'),
    ('The camera is worse than my previous mid-range phone. Regret this purchase.', 1, 13, 'mia.thompson@example.com', NOW() - INTERVAL '117 days'),
    ('Heating issues are unacceptable for a phone in 2026.', 1, 13, 'sofia.rossi@example.com', NOW() - INTERVAL '130 days'),
    ('Charging is slow and the battery drains overnight. Terrible.', 1, 13, 'olivia.davis@example.com', NOW() - INTERVAL '143 days'),
    ('Multiple software bugs and average build quality. Would not recommend.', 1, 13, 'noah.miller@example.com', NOW() - INTERVAL '156 days'),

    -- ===== iPad Pro 13-inch M4 (id 14) — avg 4.5 =====
    ('The Tandem OLED display is out of this world. This is the best screen I have ever used.', 5, 14, 'david.chen@example.com', NOW() - INTERVAL '9 days'),
    ('Incredibly thin and powerful. ProRes editing on a tablet is surreal.', 5, 14, 'emma.wilson@example.com', NOW() - INTERVAL '18 days'),
    ('The ProMotion 120Hz is buttery and the M4 handles anything.', 5, 14, 'alex.johnson@example.com', NOW() - INTERVAL '27 days'),
    ('Perfect for professional drawing. The laminated OLED display is a dream.', 5, 14, 'sofia.rossi@example.com', NOW() - INTERVAL '36 days'),
    ('Replaced my laptop for creative work. The 13-inch screen is magnificent.', 5, 14, 'ethan.walker@example.com', NOW() - INTERVAL '45 days'),
    ('Gorgeous display, but the accessories push the price way up.', 4, 14, 'lucas.martin@example.com', NOW() - INTERVAL '54 days'),
    ('Fantastic tablet, though battery life could be better with the OLED.', 4, 14, 'mia.thompson@example.com', NOW() - INTERVAL '63 days'),
    ('Incredible screen and speed, just heavy for reading in bed.', 4, 14, 'ava.garcia@example.com', NOW() - INTERVAL '72 days'),
    ('Excellent device, but the base storage is too small for the price.', 4, 14, 'benjamin.lee@example.com', NOW() - INTERVAL '81 days'),
    ('Beautiful and fast, though iPadOS still limits multitasking.', 4, 14, 'james.white@example.com', NOW() - INTERVAL '90 days'),

    -- ===== iPhone 17e (id 15) — avg 3.0 =====
    ('Great value for a budget iPhone. Fast enough and the battery is solid.', 5, 15, 'maria.lopez@example.com', NOW() - INTERVAL '10 days'),
    ('Perfect first iPhone. Simple, reliable, and the camera is good enough.', 5, 15, 'charlotte.adams@example.com', NOW() - INTERVAL '20 days'),
    ('Good phone for the price, though the screen is not the brightest.', 4, 15, 'lucas.martin@example.com', NOW() - INTERVAL '30 days'),
    ('Nice and clean experience. Just one camera, but it does the job.', 4, 15, 'ava.garcia@example.com', NOW() - INTERVAL '40 days'),
    ('It is a decent phone, but the missing MagSafe is annoying.', 3, 15, 'james.white@example.com', NOW() - INTERVAL '50 days'),
    ('Average performance and the battery is okay. Fine for basics.', 3, 15, 'isabella.clark@example.com', NOW() - INTERVAL '60 days'),
    ('Battery drains faster than expected and there is no fast charging.', 2, 15, 'ethan.walker@example.com', NOW() - INTERVAL '70 days'),
    ('Feels like a budget phone even though it is not that cheap.', 2, 15, 'sofia.rossi@example.com', NOW() - INTERVAL '80 days'),
    ('Very disappointed with the camera quality in low light.', 1, 15, 'noah.miller@example.com', NOW() - INTERVAL '90 days'),
    ('Stutters on simple tasks. Not worth the upgrade.', 1, 15, 'olivia.davis@example.com', NOW() - INTERVAL '100 days'),

    -- ===== iPhone 15 Pro Max (id 16) — avg 1.5 =====
    ('Mine works fine, but clearly I got lucky compared to others.', 4, 16, 'benjamin.lee@example.com', NOW() - INTERVAL '15 days'),
    ('It is an okay phone, but way too many people have had issues.', 3, 16, 'lucas.martin@example.com', NOW() - INTERVAL '30 days'),
    ('Battery degraded in under a year. Not great.', 2, 16, 'mia.thompson@example.com', NOW() - INTERVAL '45 days'),
    ('Constant overheating and the battery is terrible. Big regret.', 1, 16, 'maria.lopez@example.com', NOW() - INTERVAL '60 days'),
    ('The screen started showing issues after 6 months. Terrible quality control.', 1, 16, 'david.chen@example.com', NOW() - INTERVAL '75 days'),
    ('Battery drains unbelievably fast. Apple support was not helpful.', 1, 16, 'emma.wilson@example.com', NOW() - INTERVAL '90 days'),
    ('Camera is great but the phone freezes randomly. Not acceptable.', 1, 16, 'liam.brown@example.com', NOW() - INTERVAL '105 days'),
    ('Worst phone I have owned in years. Would not recommend.', 1, 16, 'sofia.rossi@example.com', NOW() - INTERVAL '120 days'),
    ('Overheats during normal use and the battery swelled. Dangerous.', 1, 16, 'noah.miller@example.com', NOW() - INTERVAL '135 days'),
    ('Slow updates and bugs everywhere. Very disappointing.', 1, 16, 'olivia.davis@example.com', NOW() - INTERVAL '150 days'),
    ('Purchased at launch, and it has been downhill since. Bad value.', 1, 16, 'ethan.walker@example.com', NOW() - INTERVAL '165 days'),
    ('Terrible experience. Back to Android after this.', 1, 16, 'ava.garcia@example.com', NOW() - INTERVAL '180 days'),

    -- ===== iPad mini A17 Pro (id 17) — avg 4.4 =====
    ('The perfect size. Portable, fast, and the display is lovely.', 5, 17, 'emma.wilson@example.com', NOW() - INTERVAL '8 days'),
    ('Great for reading, gaming, and note-taking. The A17 Pro keeps it snappy.', 5, 17, 'david.chen@example.com', NOW() - INTERVAL '16 days'),
    ('My favorite device. Small enough to take everywhere.', 5, 17, 'sofia.rossi@example.com', NOW() - INTERVAL '24 days'),
    ('Love the size and performance. Great battery life too.', 5, 17, 'charlotte.adams@example.com', NOW() - INTERVAL '32 days'),
    ('Great little tablet, but I wish it had a 120Hz display.', 4, 17, 'lucas.martin@example.com', NOW() - INTERVAL '40 days'),
    ('Fast and portable, though the bezels are a bit dated.', 4, 17, 'mia.thompson@example.com', NOW() - INTERVAL '48 days'),
    ('Very good, just the storage upgrades are pricey.', 4, 17, 'james.white@example.com', NOW() - INTERVAL '56 days'),
    ('It is fine, but the screen is a bit small for heavy productivity.', 3, 17, 'ava.garcia@example.com', NOW() - INTERVAL '64 days')
) AS r(content, rating, product_id, user_email, created_at)
JOIN users u ON u.email = r.user_email;