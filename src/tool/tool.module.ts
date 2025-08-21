import { Module } from '@nestjs/common';
import { ToolService } from './tool.service';
import { ToolController } from './tool.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tool } from './entities/tool.entity';
import { Task } from '../task/entities/task.entity';
import { Workshop } from '../workshop/entities/workshop.entity';
import { CommonModule } from '../common/common.module';
import { Company } from '../company/entities/company.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Tool, Task, Workshop, Company]), CommonModule],
	controllers: [ToolController],
	providers: [ToolService],
})
export class ToolModule {}
