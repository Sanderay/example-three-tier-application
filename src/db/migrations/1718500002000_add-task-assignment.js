exports.up = (pgm) => {
  pgm.addColumn('tasks', {
    assigned_to: {
      type: 'integer',
      references: 'users(id)',
      onDelete: 'SET NULL',
    },
  });
  pgm.createIndex('tasks', 'assigned_to');
};

exports.down = (pgm) => {
  pgm.dropIndex('tasks', 'assigned_to');
  pgm.dropColumn('tasks', 'assigned_to');
};
