import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToTrackTitle1745310637843
  implements MigrationInterface
{
  name = 'AddUniqueConstraintToTrackTitle1745310637843';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tracks" ADD CONSTRAINT "UQ_tracks_title" UNIQUE ("title")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tracks" DROP CONSTRAINT "UQ_tracks_title"`,
    );
  }
}
