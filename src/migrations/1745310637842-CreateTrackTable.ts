import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTrackTable1745310637842 implements MigrationInterface {
    name = 'CreateTrackTable1745310637842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracks" ADD "imageUrl" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tracks" DROP COLUMN "imageUrl"`);
    }

}
