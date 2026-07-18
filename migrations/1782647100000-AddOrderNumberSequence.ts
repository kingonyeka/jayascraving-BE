import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Previously, order numbers were generated via
 *   `JC-${(await orderRepo.count()) + 1}`
 * which has a read-then-use race condition — two concurrent checkouts can
 * read the same count before either inserts, producing duplicate order
 * numbers. A DB sequence guarantees atomic, gap-tolerant uniqueness under
 * concurrency without needing an app-level lock.
 */
export class AddOrderNumberSequence1782647100000 implements MigrationInterface {
    name = 'AddOrderNumberSequence1782647100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP SEQUENCE IF EXISTS order_number_seq`);
    }
}
