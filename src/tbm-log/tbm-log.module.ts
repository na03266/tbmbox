import { Module } from '@nestjs/common';
import { TbmLogService } from './tbm-log.service';
import { TbmLogController } from './tbm-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbmLog } from './entities/tbm-log.entity';
import { User } from '../users/entities/user.entity';
import { Tbm } from '../tbm/entities/tbm.entity';

@Module({
	imports: [TypeOrmModule.forFeature([TbmLog, User, Tbm])],
	controllers: [TbmLogController],
	providers: [TbmLogService],
})
export class TbmLogModule {}
