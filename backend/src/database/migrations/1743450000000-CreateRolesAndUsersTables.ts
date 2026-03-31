import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesAndUsersTables1743450000000
  implements MigrationInterface
{
  name = 'CreateRolesAndUsersTables1743450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto"
    `);
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying(50) NOT NULL,
        "description" character varying(150),
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"),
        CONSTRAINT "roles_name_unique" UNIQUE ("name")
      )
    `);
    await queryRunner.query(`
      INSERT INTO "roles" ("name", "description")
      VALUES
        ('admin', 'Full administrative access'),
        ('operator', 'Operational access')
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "username" character varying(50) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "role_id" uuid NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"),
        CONSTRAINT "users_username_unique" UNIQUE ("username")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "FK_users_role_id_roles_id"
      FOREIGN KEY ("role_id") REFERENCES "roles"("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT "FK_users_role_id_roles_id"
    `);
    await queryRunner.query(`
      DROP TABLE "users"
    `);
    await queryRunner.query(`
      DROP TABLE "roles"
    `);
  }
}
