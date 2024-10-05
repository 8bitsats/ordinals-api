<<<<<<< HEAD:src/pg/brc20/helpers.ts
import * as postgres from 'postgres';
import { PgSqlClient } from '@hirosystems/api-toolkit';
=======
import { Static, Type } from '@fastify/type-provider-typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import BigNumber from 'bignumber.js';
import { hexToBuffer } from '../../../api/util/helpers';
import { DbInscriptionInsert } from '../../../pg/types';
>>>>>>> 0f29209ba39b2e4cc4cb7e948b4c8b2989b0b648:src/meta-protocols/brc-20/pg/helpers.ts

export function sqlOr(
  sql: PgSqlClient,
  partials: postgres.PendingQuery<postgres.Row[]>[] | undefined
) {
  return partials?.reduce((acc, curr) => sql`${acc} OR ${curr}`);
}
