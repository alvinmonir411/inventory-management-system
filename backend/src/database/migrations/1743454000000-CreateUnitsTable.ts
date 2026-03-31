import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUnitsTable1743454000000 implements MigrationInterface {
  name = 'CreateUnitsTable1743454000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "units" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(50) NOT NULL,
        "symbol" character varying(20),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_d7f23c31f17b1b5ddf7283e3f7f" PRIMARY KEY ("id"),
        CONSTRAINT "units_name_unique" UNIQUE ("name"),
        CONSTRAINT "units_symbol_unique" UNIQUE ("symbol")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "units"
    `);
  }
}
