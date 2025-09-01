import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from './entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workshop } from '../workshop/entities/workshop.entity';
import { User } from '../users/entities/user.entity';
import { Tool } from '../tool/entities/tool.entity';
import { CommonModule } from '../common/common.module';
import { TaskUserService } from './task.user/task.user.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Task, Workshop, User, Tool]),
		CommonModule,
	],
	controllers: [TaskController],
	providers: [TaskService, TaskUserService],
})
export class TaskModule {}
