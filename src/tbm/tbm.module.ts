import { Module } from '@nestjs/common';
import { TbmService } from './tbm.service';
import { TbmController } from './tbm.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tbm } from './entities/tbm.entity';
import { Task } from '../task/entities/task.entity';
import { Workshop } from '../workshop/entities/workshop.entity';
import { CommonModule } from '../common/common.module';
import { TbmUserService } from './tbm.user/tbm.user.service';
import { User } from '../users/entities/user.entity';
import { TbmLog } from '../tbm-log/entities/tbm-log.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Tbm, Task, Workshop, User, TbmLog]),
		CommonModule,
	],
	controllers: [TbmController],
	providers: [TbmService, TbmUserService],
})
export class TbmModule {}
