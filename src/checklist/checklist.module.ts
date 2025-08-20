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

@Module({
	imports: [
		TypeOrmModule.forFeature([Checklist, ChecklistChild, Task, Workshop, User]),
		CommonModule,
	],
	controllers: [ChecklistController],
	providers: [ChecklistService],
})
export class ChecklistModule {}
