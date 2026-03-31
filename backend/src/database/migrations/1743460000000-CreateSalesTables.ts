import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSalesTables1743460000000 implements MigrationInterface {
  name = 'CreateSalesTables1743460000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "sales" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sale_no" character varying(30) NOT NULL,
        "sale_date" date NOT NULL,
        "route_id" uuid NOT NULL,
        "warehouse_id" uuid NOT NULL,
        "note" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_68206b6c03b1b94ceab3f0aafa3" PRIMARY KEY ("id"),
        CONSTRAINT "sales_sale_no_unique" UNIQUE ("sale_no"),
        CONSTRAINT "FK_sales_route_id_routes_id"
          FOREIGN KEY ("route_id") REFERENCES "routes"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_sales_warehouse_id_warehouses_id"
          FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "sales_sale_date_idx" ON "sales" ("sale_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "sales_route_id_idx" ON "sales" ("route_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "sales_warehouse_id_idx" ON "sales" ("warehouse_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "sales_route_date_idx" ON "sales" ("route_id", "sale_date")
    `);
    await queryRunner.query(`
      CREATE TABLE "sale_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sale_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" decimal(14,3) NOT NULL,
        "unit_price" decimal(12,2) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_d03891f2ee6e7fcd4b8c73d11ba" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sale_items_sale_id_sales_id"
          FOREIGN KEY ("sale_id") REFERENCES "sales"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_sale_items_product_id_products_id"
          FOREIGN KEY ("product_id") REFERENCES "products"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "sale_items_sale_id_idx" ON "sale_items" ("sale_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "sale_items_product_id_idx" ON "sale_items" ("product_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."sale_items_product_id_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."sale_items_sale_id_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "sale_items"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."sales_route_date_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."sales_warehouse_id_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."sales_route_id_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."sales_sale_date_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "sales"
    `);
  }
}
