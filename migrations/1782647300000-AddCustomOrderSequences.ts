import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Same fix as AddOrderNumberSequence — generateRequestNumber() and
 * generateAgreementNumber() in CustomOrdersService used
 * `(await repo.count()) + 1`, which races under concurrency.
 */
export class AddCustomOrderSequences1782647300000 implements MigrationInterface {
    name = 'AddCustomOrderSequences1782647300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS custom_order_request_seq START 1`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS custom_order_agreement_seq START 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SEQUENCE IF EXISTS custom_order_request_seq`);
        await queryRunner.query(`DROP SEQUENCE IF EXISTS custom_order_agreement_seq`);
    }
}
