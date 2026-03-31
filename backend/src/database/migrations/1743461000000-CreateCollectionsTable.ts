import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCollectionsTable1743461000000
  implements MigrationInterface
{
  name = 'CreateCollectionsTable1743461000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "collections" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "collection_no" character varying(30) NOT NULL,
        "route_id" uuid NOT NULL,
        "collection_date" date NOT NULL,
        "amount" decimal(12,2) NOT NULL,
        "payment_method" character varying(30),
        "note" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_8f3b1b46b9b338f5bc3a5d2a313" PRIMARY KEY ("id"),
        CONSTRAINT "collections_collection_no_unique" UNIQUE ("collection_no"),
        CONSTRAINT "FK_collections_route_id_routes_id"
          FOREIGN KEY ("route_id") REFERENCES "routes"("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "collections_collection_date_idx"
      ON "collections" ("collection_date")
    `);
    await queryRunner.query(`
      CREATE INDEX "collections_route_id_idx"
      ON "collections" ("route_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "collections_route_date_idx"
      ON "collections" ("route_id", "collection_date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "public"."collections_route_date_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."collections_route_id_idx"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."collections_collection_date_idx"
    `);
    await queryRunner.query(`
      DROP TABLE "collections"
    `);
  }
}
