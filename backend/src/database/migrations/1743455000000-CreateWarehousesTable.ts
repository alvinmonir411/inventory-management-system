import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWarehousesTable1743455000000
  implements MigrationInterface
{
  name = 'CreateWarehousesTable1743455000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "warehouses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "code" character varying(30),
        "note" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_9a3ed8b2d5f4c1b0b8d3221e0f7" PRIMARY KEY ("id"),
        CONSTRAINT "warehouses_name_unique" UNIQUE ("name"),
        CONSTRAINT "warehouses_code_unique" UNIQUE ("code")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "warehouses_is_active_idx" ON "warehouses" ("is_active")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."warehouses_is_active_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "warehouses"
    `);
  }
}
