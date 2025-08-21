import { Module } from '@nestjs/common';
import { DashService } from './dash.service';
import { DashController } from './dash.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { TbmLog } from '../tbm-log/entities/tbm-log.entity';
import { ChecklistLog } from '../checklist-log/entities/checklist-log.entity';
import { Workshop } from '../workshop/entities/workshop.entity';

@Module({
	imports: [TypeOrmModule.forFeature([User, TbmLog, ChecklistLog, Workshop])],
	controllers: [DashController],
	providers: [DashService],
})
export class DashModule {}
