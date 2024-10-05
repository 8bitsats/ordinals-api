/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export function up(pgm: MigrationBuilder): void {
  pgm.createTable('counts_by_recursive', {
    recursive: {
      type: 'boolean',
<<<<<<< HEAD
=======
      notNull: true,
>>>>>>> 0f29209ba39b2e4cc4cb7e948b4c8b2989b0b648
      primaryKey: true,
    },
    count: {
      type: 'bigint',
      notNull: true,
<<<<<<< HEAD
      default: 0,
    },
  });
=======
      default: 1,
    },
  });
  pgm.sql(`
    INSERT INTO counts_by_recursive (recursive, count)
    (SELECT recursive, COUNT(*) AS count FROM inscriptions GROUP BY recursive)
  `);
}

export function down(pgm: MigrationBuilder): void {
  pgm.dropTable('counts_by_recursive');
>>>>>>> 0f29209ba39b2e4cc4cb7e948b4c8b2989b0b648
}
