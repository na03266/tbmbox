import { Module } from '@nestjs/common';
import { TbmLogService } from './tbm-log.service';
import { TbmLogController } from './tbm-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TbmLog } from './entities/tbm-log.entity';
import { User } from '../users/entities/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([TbmLog, User])],
	controllers: [TbmLogController],
	providers: [TbmLogService],
})
export class TbmLogModule {}
