exports.up = (pgm) => {
  pgm.addColumn('tasks', {
    assigned_to: {
      type: 'integer',
      references: 'users(id)',
      onDelete: 'set null',
      allowNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('tasks', 'assigned_to');
};
