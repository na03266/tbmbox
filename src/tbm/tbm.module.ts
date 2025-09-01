import { Module } from '@nestjs/common';
import { TbmService } from './tbm.service';
import { TbmController } from './tbm.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tbm } from './entities/tbm.entity';
import { Task } from '../task/entities/task.entity';
import { Workshop } from '../workshop/entities/workshop.entity';
import { CommonModule } from '../common/common.module';
import { TbmUserService } from './tbm.user/tbm.user.service';

@Module({
	imports: [TypeOrmModule.forFeature([Tbm, Task, Workshop]), CommonModule],
	controllers: [TbmController],
	providers: [TbmService, TbmUserService],
})
export class TbmModule {}
