import { Module } from '@nestjs/common';
import { ToolService } from './tool.service';
import { ToolController } from './tool.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tool } from './entities/tool.entity';
import { Task } from '../task/entities/task.entity';
import { Workshop } from '../workshop/entities/workshop.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Tool, Task, Workshop])],
	controllers: [ToolController],
	providers: [ToolService],
})
export class ToolModule {}
