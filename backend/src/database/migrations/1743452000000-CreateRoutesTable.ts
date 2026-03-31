import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoutesTable1743452000000 implements MigrationInterface {
  name = 'CreateRoutesTable1743452000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "routes" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" character varying(20) NOT NULL,
        "name" character varying(100) NOT NULL,
        "note" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_5d7f8dd383b6cb93e3464ffba86" PRIMARY KEY ("id"),
        CONSTRAINT "routes_code_unique" UNIQUE ("code"),
        CONSTRAINT "routes_name_unique" UNIQUE ("name")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "routes_is_active_idx" ON "routes" ("is_active")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."routes_is_active_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "routes"
    `);
  }
}
