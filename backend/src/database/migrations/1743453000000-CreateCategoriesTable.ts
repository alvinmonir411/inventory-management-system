import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesTable1743453000000
  implements MigrationInterface
{
  name = 'CreateCategoriesTable1743453000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(100) NOT NULL,
        "note" character varying(300),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"),
        CONSTRAINT "categories_name_unique" UNIQUE ("name")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "categories"
    `);
  }
}
