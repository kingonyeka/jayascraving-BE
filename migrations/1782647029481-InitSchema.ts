import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1782647029481 implements MigrationInterface {
    name = 'InitSchema1782647029481'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delivery_slots" ALTER COLUMN "availableDays" SET DEFAULT '["MON","TUE","WED","THU","FRI","SAT","SUN"]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delivery_slots" ALTER COLUMN "availableDays" SET DEFAULT '["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]'`);
    }

}
