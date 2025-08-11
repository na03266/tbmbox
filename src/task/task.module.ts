import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from './entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workshop } from '../workshop/entities/workshop.entity';
import { User } from '../users/entities/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Task, Workshop, User])],
	controllers: [TaskController],
	providers: [TaskService],
})
export class TaskModule {}
