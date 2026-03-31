import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompaniesTable1743451000000 implements MigrationInterface {
  name = 'CreateCompaniesTable1743451000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "companies" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "note" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_4a7fbd9b5f7464f987f979b0d24" PRIMARY KEY ("id"),
        CONSTRAINT "companies_name_unique" UNIQUE ("name")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "companies_is_active_idx" ON "companies" ("is_active")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."companies_is_active_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "companies"
    `);
  }
}
