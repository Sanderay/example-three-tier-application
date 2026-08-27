exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO users (email) VALUES 
      ('alice@example.com'),
      ('bob@example.com'),
      ('charlie@example.com')
    ON CONFLICT (email) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM users WHERE email IN ('alice@example.com', 'bob@example.com', 'charlie@example.com');
  `);
};
