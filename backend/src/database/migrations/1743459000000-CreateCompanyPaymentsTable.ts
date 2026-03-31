import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompanyPaymentsTable1743459000000
  implements MigrationInterface
{
  name = 'CreateCompanyPaymentsTable1743459000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "company_payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "payment_no" character varying(30) NOT NULL,
        "company_id" uuid NOT NULL,
        "payment_date" date NOT NULL,
        "amount" decimal(12,2) NOT NULL,
        "payment_method" character varying(30),
        "note" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_7ef6e4d2b4e5a756999b75f8b6c" PRIMARY KEY ("id"),
        CONSTRAINT "company_payments_payment_no_unique" UNIQUE ("payment_no"),
        CONSTRAINT "FK_company_payments_company_id_companies_id"
          FOREIGN KEY ("company_id") REFERENCES "companies"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "company_payments_payment_date_idx"
      ON "company_payments" ("payment_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "company_payments_company_id_idx"
      ON "company_payments" ("company_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "company_payments_company_date_idx"
      ON "company_payments" ("company_id", "payment_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."company_payments_company_date_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."company_payments_company_id_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."company_payments_payment_date_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "company_payments"
    `);
  }
}
