exports.up = (pgm) => {
  // Add some sample users for testing
  pgm.sql(`
    INSERT INTO users (email) VALUES 
      ('alice@example.com'),
      ('bob@example.com'),
      ('charlie@example.com')
    ON CONFLICT (email) DO NOTHING
  `);

  // Add assigned_user_id column to tasks
  pgm.addColumn('tasks', {
    assigned_user_id: {
      type: 'integer',
      references: 'users(id)',
      onDelete: 'SET NULL',
    },
  });

  // Add index for filtering by assigned user
  pgm.createIndex('tasks', 'assigned_user_id');
};

exports.down = (pgm) => {
  pgm.dropIndex('tasks', 'assigned_user_id');
  pgm.dropColumn('tasks', 'assigned_user_id');
  // Note: We don't remove the sample users on rollback
};
