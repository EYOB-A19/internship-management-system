-- =============================================================================
-- EthioIntern PostgreSQL Seed Data (Development / Demo Accounts)
-- Note: All demo accounts share password: Password123!
-- =============================================================================

INSERT INTO universities (name, short_name, city, region, website) VALUES
  ('Adama Science and Technology University', 'ASTU', 'Adama', 'Oromia', 'https://www.astu.edu.et'),
  ('Addis Ababa University', 'AAU', 'Addis Ababa', 'Addis Ababa', 'https://www.aau.edu.et'),
  ('Addis Ababa Science and Technology University', 'AASTU', 'Addis Ababa', 'Addis Ababa', 'https://www.aastu.edu.et'),
  ('Bahir Dar University', 'BDU', 'Bahir Dar', 'Amhara', 'https://www.bdu.edu.et'),
  ('Hawassa University', 'HU', 'Hawassa', 'Sidama', 'https://www.hu.edu.et'),
  ('Jimma University', 'JU', 'Jimma', 'Oromia', 'https://www.ju.edu.et'),
  ('Mekelle University', 'MU', 'Mekelle', 'Tigray', 'https://www.mu.edu.et'),
  ('University of Gondar', 'UoG', 'Gondar', 'Amhara', 'https://www.uog.edu.et'),
  ('Arba Minch University', 'AMU', 'Arba Minch', 'South Ethiopia', 'https://www.amu.edu.et'),
  ('Haramaya University', 'HRU', 'Dire Dawa / Haramaya', 'Oromia', 'https://www.haramaya.edu.et'),
  ('Wolkite University', 'WU', 'Wolkite', 'Oromia', 'https://www.wu.edu.et'),
  ('Gondar University', 'GU', 'Gondar', 'Amhara', 'https://www.gu.edu.et'),

ON CONFLICT (name) DO NOTHING;

INSERT INTO departments (name, faculty, description) VALUES
  ('Computer Science and Engineering', 'School of Electrical Engineering and Computing', 'Software systems, algorithms, distributed computing, and data engineering.'),
  ('Software Engineering', 'College of Engineering and Technology', 'Full-stack engineering, software architecture, quality assurance, and DevOps.'),
  ('Information Systems', 'College of Natural and Computational Sciences', 'Enterprise architecture, business intelligence, and database administration.'),
  ('Electrical and Computer Engineering', 'Institute of Technology', 'Embedded systems, telecommunications, power networks, and hardware design.'),
  ('Mechanical and Industrial Engineering', 'Institute of Technology', 'Manufacturing systems, CAD/CAM, thermal engineering, and industrial operations.'),
  ('Civil and Environmental Engineering', 'Institute of Technology', 'Structural design, water resources, transportation, and geotechnical engineering.'),
  ('Accounting and Finance', 'College of Business and Economics', 'Corporate finance, auditing, Ethiopian taxation, and banking operations.'),
  ('Logistics and Supply Chain Management', 'School of Commerce', 'Freight operations, procurement, inventory optimization, and customs corridor management.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO skills (name, category) VALUES
  ('JavaScript', 'Programming'),
  ('React', 'Frontend'),
  ('Node.js', 'Backend'),
  ('PostgreSQL', 'Database'),
  ('Express.js', 'Backend'),
  ('Python', 'Data & AI'),
  ('Data Analysis', 'Data & AI'),
  ('Git', 'DevOps & Tools'),
  ('UI/UX Design', 'Design'),
  ('Tailwind CSS', 'Frontend'),
  ('Docker', 'DevOps & Tools'),
  ('REST APIs', 'Backend'),
  ('SQL', 'Database'),
  ('Financial Modeling', 'Business & Finance'),
  ('Network Administration', 'Infrastructure'),
  ('AutoCAD', 'Engineering'),
  ('Supply Chain Analytics', 'Operations'),
  ('Flutter', 'Mobile')
ON CONFLICT (name) DO NOTHING;
