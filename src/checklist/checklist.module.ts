import { Module } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { ChecklistController } from './checklist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checklist } from './entities/checklist.entity';
import { Task } from '../task/entities/task.entity';
import { Workshop } from '../workshop/entities/workshop.entity';
import { User } from '../users/entities/user.entity';
import { ChecklistChild } from './entities/checklistchildren.entity';
import { CommonModule } from '../common/common.module';
import { ChecklistUserService } from './checklist.user/checklist.user.service';
import { ChecklistLog } from '../checklist-log/entities/checklist-log.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Checklist,
			ChecklistChild,
			Task,
			Workshop,
			User,
			ChecklistLog,
		]),
		CommonModule,
	],
	controllers: [ChecklistController],
	providers: [ChecklistService, ChecklistUserService],
})
export class ChecklistModule {}
