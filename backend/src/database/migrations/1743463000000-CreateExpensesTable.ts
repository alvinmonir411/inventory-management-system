import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExpensesTable1743463000000 implements MigrationInterface {
  name = 'CreateExpensesTable1743463000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "expenses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "expense_date" date NOT NULL,
        "name" character varying(100) NOT NULL,
        "amount" decimal(12,2) NOT NULL,
        "note" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_4cb0be9353f9d1d07fdbe41d1a6" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "expenses_expense_date_idx" ON "expenses" ("expense_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "expenses_name_date_idx" ON "expenses" ("name", "expense_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."expenses_name_date_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."expenses_expense_date_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "expenses"
    `);
  }
}
