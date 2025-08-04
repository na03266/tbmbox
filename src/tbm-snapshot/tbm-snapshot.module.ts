import { Module } from '@nestjs/common';
import { TbmSnapshotService } from './tbm-snapshot.service';
import { TbmSnapshotController } from './tbm-snapshot.controller';

@Module({
  controllers: [TbmSnapshotController],
  providers: [TbmSnapshotService],
})
export class TbmSnapshotModule {}
