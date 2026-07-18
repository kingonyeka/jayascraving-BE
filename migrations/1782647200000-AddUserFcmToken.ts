import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserFcmToken1782647200000 implements MigrationInterface {
    name = 'AddUserFcmToken1782647200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "fcmToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "fcmToken"`);
    }
}
