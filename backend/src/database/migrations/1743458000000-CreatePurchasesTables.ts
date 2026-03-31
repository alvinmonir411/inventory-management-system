import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePurchasesTables1743458000000 implements MigrationInterface {
  name = 'CreatePurchasesTables1743458000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "purchases" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "purchase_no" character varying(30) NOT NULL,
        "supplier_invoice_no" character varying(50),
        "purchase_date" date NOT NULL,
        "company_id" uuid NOT NULL,
        "warehouse_id" uuid NOT NULL,
        "note" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_9d7f80c7b7d0f9fb6f4e4c7aa20" PRIMARY KEY ("id"),
        CONSTRAINT "purchases_purchase_no_unique" UNIQUE ("purchase_no"),
        CONSTRAINT "FK_purchases_company_id_companies_id"
          FOREIGN KEY ("company_id") REFERENCES "companies"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_purchases_warehouse_id_warehouses_id"
          FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "purchases_purchase_date_idx" ON "purchases" ("purchase_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "purchases_company_id_idx" ON "purchases" ("company_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "purchases_warehouse_id_idx" ON "purchases" ("warehouse_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "purchases_company_date_idx" ON "purchases" ("company_id", "purchase_date")
    `);
    await queryRunner.query(`
      CREATE TABLE "purchase_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "purchase_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" decimal(14,3) NOT NULL,
        "unit_price" decimal(12,2) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_df4c29c2c0d9203f28b94973e30" PRIMARY KEY ("id"),
        CONSTRAINT "FK_purchase_items_purchase_id_purchases_id"
          FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_purchase_items_product_id_products_id"
          FOREIGN KEY ("product_id") REFERENCES "products"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "purchase_items_purchase_id_idx" ON "purchase_items" ("purchase_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "purchase_items_product_id_idx" ON "purchase_items" ("product_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."purchase_items_product_id_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."purchase_items_purchase_id_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "purchase_items"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."purchases_company_date_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."purchases_warehouse_id_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."purchases_company_id_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."purchases_purchase_date_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "purchases"
    `);
  }
}
