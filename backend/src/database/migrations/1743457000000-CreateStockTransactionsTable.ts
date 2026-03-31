import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStockTransactionsTable1743457000000
  implements MigrationInterface
{
  name = 'CreateStockTransactionsTable1743457000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."stock_transaction_type_enum" AS ENUM('purchase', 'sale', 'damage')
    `);
    await queryRunner.query(`
      CREATE TABLE "stock_transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "type" "public"."stock_transaction_type_enum" NOT NULL,
        "product_id" uuid NOT NULL,
        "warehouse_id" uuid NOT NULL,
        "reference_module" character varying(50) NOT NULL,
        "reference_id" character varying(100) NOT NULL,
        "reference_code" character varying(100),
        "transaction_date" date NOT NULL,
        "quantity_in" decimal(14,3) NOT NULL DEFAULT '0',
        "quantity_out" decimal(14,3) NOT NULL DEFAULT '0',
        "note" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_c68fd847a0e2d7a5f24f6c49d88" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_stock_transactions_quantities_non_negative"
          CHECK ("quantity_in" >= 0 AND "quantity_out" >= 0),
        CONSTRAINT "CHK_stock_transactions_single_direction"
          CHECK (
            ("quantity_in" > 0 AND "quantity_out" = 0)
            OR ("quantity_out" > 0 AND "quantity_in" = 0)
          ),
        CONSTRAINT "FK_stock_transactions_product_id_products_id"
          FOREIGN KEY ("product_id") REFERENCES "products"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_stock_transactions_warehouse_id_warehouses_id"
          FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "stock_transactions_type_idx"
      ON "stock_transactions" ("type")
    `);
    await queryRunner.query(`
      CREATE INDEX "stock_transactions_reference_module_idx"
      ON "stock_transactions" ("reference_module")
    `);
    await queryRunner.query(`
      CREATE INDEX "stock_transactions_reference_id_idx"
      ON "stock_transactions" ("reference_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "stock_transactions_transaction_date_idx"
      ON "stock_transactions" ("transaction_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "stock_transactions_product_id_idx"
      ON "stock_transactions" ("product_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "stock_transactions_warehouse_id_idx"
      ON "stock_transactions" ("warehouse_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "stock_transactions_product_warehouse_date_idx"
      ON "stock_transactions" ("product_id", "warehouse_id", "transaction_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."stock_transactions_product_warehouse_date_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."stock_transactions_warehouse_id_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."stock_transactions_product_id_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."stock_transactions_transaction_date_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."stock_transactions_reference_id_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."stock_transactions_reference_module_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."stock_transactions_type_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "stock_transactions"
    `);
    await queryRunner.query(`
      DROP TYPE "public"."stock_transaction_type_enum"
    `);
  }
}
