import { Module } from '@nestjs/common';
import { ChecklistLogService } from './checklist-log.service';
import { ChecklistLogController } from './checklist-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checklist } from '../checklist/entities/checklist.entity';
import { ChecklistChild } from '../checklist/entities/checklistchildren.entity';
import { User } from '../users/entities/user.entity';
import { ChecklistLog } from './entities/checklist-log.entity';
import { ChecklistLogChild } from './entities/checklist-log-child.entity';
import { CommonModule } from '../common/common.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Checklist,
			ChecklistChild,
			ChecklistLog,
			ChecklistLogChild,
			User,
		]),
		CommonModule,
	],
	controllers: [ChecklistLogController],
	providers: [ChecklistLogService],
})
export class ChecklistLogModule {}
