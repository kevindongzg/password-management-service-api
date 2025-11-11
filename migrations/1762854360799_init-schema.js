/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'text', primaryKey: true },
    email: { type: 'text', notNull: true, unique: true },
    password_hash: { type: 'text', notNull: true },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });
  pgm.createIndex('users', 'email', { unique: true });

  pgm.createTable('password_reset_requests', {
    id: { type: 'text', primaryKey: true },
    user_id: { type: 'text', notNull: true },
    email: { type: 'text', notNull: true },
    code: { type: 'text', notNull: true },
    expires_at: { type: 'timestamptz', notNull: true },
    used_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
  });

  pgm.createIndex('password_reset_requests', ['user_id', 'expires_at']);
  pgm.createIndex('password_reset_requests', ['email', 'code']);

  // Add FK with ON DELETE CASCADE
  pgm.addConstraint('password_reset_requests', 'fk_password_reset_user', {
    foreignKeys: {
      columns: 'user_id',
      references: 'users(id)',
      onDelete: 'cascade',
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint('password_reset_requests', 'fk_password_reset_user');
  pgm.dropTable('password_reset_requests');
  pgm.dropIndex('users', 'email');
  pgm.dropTable('users');
};
