import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDamagesTable1743462000000 implements MigrationInterface {
  name = 'CreateDamagesTable1743462000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "damages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "product_id" uuid NOT NULL,
        "warehouse_id" uuid NOT NULL,
        "damage_date" date NOT NULL,
        "quantity" decimal(14,3) NOT NULL,
        "reason" character varying(150),
        "note" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_74f6cfd3f330fc1c29d7f89a3c8" PRIMARY KEY ("id"),
        CONSTRAINT "FK_damages_product_id_products_id"
          FOREIGN KEY ("product_id") REFERENCES "products"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_damages_warehouse_id_warehouses_id"
          FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "damages_damage_date_idx" ON "damages" ("damage_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "damages_product_date_idx" ON "damages" ("product_id", "damage_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "damages_warehouse_date_idx" ON "damages" ("warehouse_id", "damage_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."damages_warehouse_date_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."damages_product_date_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."damages_damage_date_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "damages"
    `);
  }
}
