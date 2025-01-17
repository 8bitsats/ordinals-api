import { BasePgStoreModule, PgSqlClient } from '@hirosystems/api-toolkit';
import { SatoshiRarity } from '../../api/util/ordinal-satoshi';
import {
  DbInscriptionCountPerBlock,
  DbInscriptionCountPerBlockFilters,
  DbInscriptionIndexFilters,
  DbInscriptionType,
} from '../types';
import { DbInscriptionIndexResultCountType } from './types';
import { BlockCache } from '../block-cache';

/**
 * This class affects all the different tables that track inscription counts according to different
 * parameters (sat rarity, mime type, cursed, blessed, current owner, etc.)
 */
export class CountsPgStore extends BasePgStoreModule {
  async fromResults(
    countType: DbInscriptionIndexResultCountType,
    filters?: DbInscriptionIndexFilters
  ): Promise<number | undefined> {
    switch (countType) {
      case DbInscriptionIndexResultCountType.all:
        return await this.getInscriptionCount();
      case DbInscriptionIndexResultCountType.cursed:
        return await this.getInscriptionCount(
          filters?.cursed === true ? DbInscriptionType.cursed : DbInscriptionType.blessed
        );
      case DbInscriptionIndexResultCountType.mimeType:
        return await this.getMimeTypeCount(filters?.mime_type);
      case DbInscriptionIndexResultCountType.satRarity:
        return await this.getSatRarityCount(filters?.sat_rarity);
      case DbInscriptionIndexResultCountType.address:
        return await this.getAddressCount(filters?.address);
      case DbInscriptionIndexResultCountType.recursive:
        return await this.getRecursiveCount(filters?.recursive);
      case DbInscriptionIndexResultCountType.genesisAddress:
        return await this.getGenesisAddressCount(filters?.genesis_address);
      case DbInscriptionIndexResultCountType.blockHeight:
        return await this.getBlockCount(
          filters?.genesis_block_height,
          filters?.genesis_block_height
        );
      case DbInscriptionIndexResultCountType.fromblockHeight:
        return await this.getBlockCount(filters?.from_genesis_block_height);
      case DbInscriptionIndexResultCountType.toblockHeight:
        return await this.getBlockCount(undefined, filters?.to_genesis_block_height);
      case DbInscriptionIndexResultCountType.blockHeightRange:
        return await this.getBlockCount(
          filters?.from_genesis_block_height,
          filters?.to_genesis_block_height
        );
      case DbInscriptionIndexResultCountType.blockHash:
        return await this.getBlockHashCount(filters?.genesis_block_hash);
    }
  }

<<<<<<< HEAD
  async applyCounts(sql: PgSqlClient, cache: BlockCache) {
    if (cache.mimeTypeCounts.size) {
      const entries = [];
      for (const [mime_type, count] of cache.mimeTypeCounts) entries.push({ mime_type, count });
      await sql`
        INSERT INTO counts_by_mime_type ${sql(entries)}
        ON CONFLICT (mime_type) DO UPDATE SET count = counts_by_mime_type.count + EXCLUDED.count
      `;
    }
    if (cache.satRarityCounts.size) {
      const entries = [];
      for (const [sat_rarity, count] of cache.satRarityCounts) entries.push({ sat_rarity, count });
      await sql`
        INSERT INTO counts_by_sat_rarity ${sql(entries)}
        ON CONFLICT (sat_rarity) DO UPDATE SET count = counts_by_sat_rarity.count + EXCLUDED.count
      `;
    }
    if (cache.inscriptionTypeCounts.size) {
      const entries = [];
      for (const [type, count] of cache.inscriptionTypeCounts) entries.push({ type, count });
      await sql`
        INSERT INTO counts_by_type ${sql(entries)}
        ON CONFLICT (type) DO UPDATE SET count = counts_by_type.count + EXCLUDED.count
      `;
    }
    if (cache.recursiveCounts.size) {
      const entries = [];
      for (const [recursive, count] of cache.recursiveCounts) entries.push({ recursive, count });
      await sql`
        INSERT INTO counts_by_recursive ${sql(entries)}
        ON CONFLICT (recursive) DO UPDATE SET count = counts_by_recursive.count + EXCLUDED.count
      `;
    }
    if (cache.genesisAddressCounts.size) {
      const entries = [];
      for (const [address, count] of cache.genesisAddressCounts) entries.push({ address, count });
      await sql`
        INSERT INTO counts_by_genesis_address ${sql(entries)}
        ON CONFLICT (address) DO UPDATE SET count = counts_by_genesis_address.count + EXCLUDED.count
      `;
    }
    if (cache.inscriptions.length)
      await sql`
        WITH prev_entry AS (
          SELECT inscription_count_accum
          FROM counts_by_block
          WHERE block_height < ${cache.blockHeight}
          ORDER BY block_height DESC
          LIMIT 1
        )
        INSERT INTO counts_by_block
          (block_height, block_hash, inscription_count, inscription_count_accum, timestamp)
        VALUES (
          ${cache.blockHeight}, ${cache.blockHash}, ${cache.inscriptions.length},
          COALESCE((SELECT inscription_count_accum FROM prev_entry), 0) + ${cache.inscriptions.length},
          TO_TIMESTAMP(${cache.timestamp})
        )
      `;
    // Address ownership count is handled in `PgStore`.
=======
  async applyInscriptions(writes: DbInscriptionInsert[]): Promise<void> {
    if (writes.length === 0) return;
    const mimeType = new Map<string, any>();
    const rarity = new Map<string, any>();
    const recursion = new Map<boolean, any>();
    const type = new Map<string, any>();
    for (const i of writes) {
      const t = i.number < 0 ? 'cursed' : 'blessed';
      mimeType.set(i.mime_type, {
        mime_type: i.mime_type,
        count: mimeType.get(i.mime_type)?.count ?? 0 + 1,
      });
      rarity.set(i.sat_rarity, {
        sat_rarity: i.sat_rarity,
        count: rarity.get(i.sat_rarity)?.count ?? 0 + 1,
      });
      recursion.set(i.recursive, {
        recursive: i.recursive,
        count: recursion.get(i.recursive)?.count ?? 0 + 1,
      });
      type.set(t, { type: t, count: type.get(t)?.count ?? 0 + 1 });
    }
    // `counts_by_address` and `counts_by_genesis_address` count increases are handled in
    // `applyLocations`.
    await this.sql`
      WITH increase_mime_type AS (
        INSERT INTO counts_by_mime_type ${this.sql([...mimeType.values()])}
        ON CONFLICT (mime_type) DO UPDATE SET count = counts_by_mime_type.count + EXCLUDED.count
      ),
      increase_rarity AS (
        INSERT INTO counts_by_sat_rarity ${this.sql([...rarity.values()])}
        ON CONFLICT (sat_rarity) DO UPDATE SET count = counts_by_sat_rarity.count + EXCLUDED.count
      ),
      increase_recursive AS (
        INSERT INTO counts_by_recursive ${this.sql([...recursion.values()])}
        ON CONFLICT (recursive) DO UPDATE SET count = counts_by_recursive.count + EXCLUDED.count
      )
      INSERT INTO counts_by_type ${this.sql([...type.values()])}
      ON CONFLICT (type) DO UPDATE SET count = counts_by_type.count + EXCLUDED.count
    `;
  }

  async rollBackInscription(args: { inscription: DbInscription }): Promise<void> {
    await this.sql`
      WITH decrease_mime_type AS (
        UPDATE counts_by_mime_type SET count = count - 1
        WHERE mime_type = ${args.inscription.mime_type}
      ),
      decrease_rarity AS (
        UPDATE counts_by_sat_rarity SET count = count - 1
        WHERE sat_rarity = ${args.inscription.sat_rarity}
      ),
      decrease_recursive AS (
        UPDATE counts_by_recursive SET count = count - 1
        WHERE recursive = ${args.inscription.recursive}
      ),
      decrease_type AS (
        UPDATE counts_by_type SET count = count - 1 WHERE type = ${
          parseInt(args.inscription.number) < 0
            ? DbInscriptionType.cursed
            : DbInscriptionType.blessed
        }
      ),
      decrease_genesis AS (
        UPDATE counts_by_genesis_address SET count = count - 1 WHERE address = (
          SELECT address FROM current_locations WHERE inscription_id = ${args.inscription.id}
        )
      )
      UPDATE counts_by_address SET count = count - 1 WHERE address = (
        SELECT address FROM current_locations WHERE inscription_id = ${args.inscription.id}
      )
    `;
>>>>>>> 0f29209ba39b2e4cc4cb7e948b4c8b2989b0b648
  }

  async rollBackCounts(sql: PgSqlClient, cache: BlockCache) {
    if (cache.inscriptions.length)
      await sql`DELETE FROM counts_by_block WHERE block_height = ${cache.blockHeight}`;
    if (cache.genesisAddressCounts.size)
      for (const [address, count] of cache.genesisAddressCounts)
        await sql`
          UPDATE counts_by_genesis_address SET count = count - ${count} WHERE address = ${address}
        `;
    if (cache.recursiveCounts.size)
      for (const [recursive, count] of cache.recursiveCounts)
        await sql`
          UPDATE counts_by_recursive SET count = count - ${count} WHERE recursive = ${recursive}
        `;
    if (cache.inscriptionTypeCounts.size)
      for (const [type, count] of cache.inscriptionTypeCounts)
        await sql`
          UPDATE counts_by_type SET count = count - ${count} WHERE type = ${type}
        `;
    if (cache.satRarityCounts.size)
      for (const [sat_rarity, count] of cache.satRarityCounts)
        await sql`
          UPDATE counts_by_sat_rarity SET count = count - ${count} WHERE sat_rarity = ${sat_rarity}
        `;
    if (cache.mimeTypeCounts.size)
      for (const [mime_type, count] of cache.mimeTypeCounts)
        await sql`
          UPDATE counts_by_mime_type SET count = count - ${count} WHERE mime_type = ${mime_type}
        `;
    // Address ownership count is handled in `PgStore`.
  }

  async getInscriptionCountPerBlock(
    filters: DbInscriptionCountPerBlockFilters
  ): Promise<DbInscriptionCountPerBlock[]> {
    const fromCondition = filters.from_block_height
      ? this.sql`block_height >= ${filters.from_block_height}`
      : this.sql``;

    const toCondition = filters.to_block_height
      ? this.sql`block_height <= ${filters.to_block_height}`
      : this.sql``;

    const where =
      filters.from_block_height && filters.to_block_height
        ? this.sql`WHERE ${fromCondition} AND ${toCondition}`
        : this.sql`WHERE ${fromCondition}${toCondition}`;

    return await this.sql<DbInscriptionCountPerBlock[]>`
      SELECT *
      FROM counts_by_block
      ${filters.from_block_height || filters.to_block_height ? where : this.sql``}
      ORDER BY block_height DESC
      LIMIT 5000
    `; // roughly 35 days of blocks, assuming 10 minute block times on a full database
  }

  private async getBlockCount(from?: number, to?: number): Promise<number> {
    if (from === undefined && to === undefined) return 0;
    const result = await this.sql<{ count: number }[]>`
      SELECT COALESCE(SUM(inscription_count), 0)::int AS count
      FROM counts_by_block
      WHERE TRUE
        ${from !== undefined ? this.sql`AND block_height >= ${from}` : this.sql``}
        ${to !== undefined ? this.sql`AND block_height <= ${to}` : this.sql``}
    `;
    return result[0].count;
  }

  private async getBlockHashCount(hash?: string): Promise<number> {
    if (!hash) return 0;
    const result = await this.sql<{ count: number }[]>`
      SELECT COALESCE(SUM(inscription_count), 0)::int AS count
      FROM counts_by_block
      WHERE block_hash = ${hash}
    `;
    return result[0].count;
  }

  private async getInscriptionCount(type?: DbInscriptionType): Promise<number> {
    const types =
      type !== undefined ? [type] : [DbInscriptionType.blessed, DbInscriptionType.cursed];
    const result = await this.sql<{ count: number }[]>`
      SELECT COALESCE(SUM(count), 0)::int AS count
      FROM counts_by_type
      WHERE type IN ${this.sql(types)}
    `;
    return result[0].count;
  }

  private async getMimeTypeCount(mimeType?: string[]): Promise<number> {
    if (!mimeType) return 0;
    const result = await this.sql<{ count: number }[]>`
      SELECT COALESCE(SUM(count), 0)::int AS count
      FROM counts_by_mime_type
      WHERE mime_type IN ${this.sql(mimeType)}
    `;
    return result[0].count;
  }

  private async getSatRarityCount(satRarity?: SatoshiRarity[]): Promise<number> {
    if (!satRarity) return 0;
    const result = await this.sql<{ count: number }[]>`
      SELECT COALESCE(SUM(count), 0)::int AS count
      FROM counts_by_sat_rarity
      WHERE sat_rarity IN ${this.sql(satRarity)}
    `;
    return result[0].count;
  }

  private async getRecursiveCount(recursive?: boolean): Promise<number> {
    const rec = recursive !== undefined ? [recursive] : [true, false];
    const result = await this.sql<{ count: number }[]>`
<<<<<<< HEAD
      SELECT COALESCE(SUM(count), 0)::int AS count
=======
      SELECT COALESCE(SUM(count), 0) AS count
>>>>>>> 0f29209ba39b2e4cc4cb7e948b4c8b2989b0b648
      FROM counts_by_recursive
      WHERE recursive IN ${this.sql(rec)}
    `;
    return result[0].count;
  }

<<<<<<< HEAD
  async getAddressCount(address?: string[]): Promise<number> {
=======
  private async getAddressCount(address?: string[]): Promise<number> {
>>>>>>> 0f29209ba39b2e4cc4cb7e948b4c8b2989b0b648
    if (!address) return 0;
    const result = await this.sql<{ count: number }[]>`
      SELECT COALESCE(SUM(count), 0)::int AS count
      FROM counts_by_address
      WHERE address IN ${this.sql(address)}
    `;
    return result[0].count;
  }

  private async getGenesisAddressCount(genesisAddress?: string[]): Promise<number> {
    if (!genesisAddress) return 0;
    const result = await this.sql<{ count: number }[]>`
      SELECT COALESCE(SUM(count), 0)::int AS count
      FROM counts_by_genesis_address
      WHERE address IN ${this.sql(genesisAddress)}
    `;
    return result[0].count;
  }
}
