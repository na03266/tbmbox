import { Module } from '@nestjs/common';
import { TbmSnapshotService } from './tbm-snapshot.service';
import { TbmSnapshotController } from './tbm-snapshot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbmSnapshot } from './entities/tbm-snapshot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TbmSnapshot])],
  controllers: [TbmSnapshotController],
  providers: [TbmSnapshotService],
})
export class TbmSnapshotModule {}
