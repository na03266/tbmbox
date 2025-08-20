import { Module } from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { WorkshopController } from './workshop.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workshop } from './entities/workshop.entity';
import { User } from '../users/entities/user.entity';
import { Task } from '../task/entities/task.entity';
import { CommonModule } from '../common/common.module';

@Module({
	imports: [TypeOrmModule.forFeature([Workshop, User, Task]), CommonModule],
	controllers: [WorkshopController],
	providers: [WorkshopService],
})
export class WorkshopModule {}
