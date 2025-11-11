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
  pgm.sql(`
    INSERT INTO users (id, email, password_hash, is_active, created_at, updated_at)
    VALUES
      ('user-1', 'user1@example.com', '$2b$12$ZpWZkW2Ew3Q5bS9t9d8YyOkkQp7dCkM3yDqYyT3wLwV0GvCwA8kqG', true, NOW(), NOW()),
      ('user-2', 'user2@example.com', '$2b$12$ZpWZkW2Ew3Q5bS9t9d8YyOkkQp7dCkM3yDqYyT3wLwV0GvCwA8kqG', true, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM users WHERE id IN ('user-1','user-2');
  `);
};
