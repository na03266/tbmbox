import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	ParseArrayPipe,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Request,
	UseInterceptors,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('task')
export class TaskController {
	constructor(private readonly taskService: TaskService) {}

	@Post()
	create(@Body() createTaskDto: CreateTaskDto) {
		return this.taskService.create(createTaskDto);
	}

	@Get()
	findAll(@Request() req, @Query('name') name?: string) {
		/// 관리자용, 하위 관리자용, 사용자용
		return this.taskService.findAll(req, name);
	}

	@Get(':id/workshop')
	findByWorkshop(
		@Param('id', ParseIntPipe) id: number,
		@Query('title') title?: string,
	) {
		return this.taskService.findByWorkshop(id, title);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.taskService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id', ParseIntPipe) id: string,
		@Body() updateTaskDto: UpdateTaskDto,
	) {
		return this.taskService.update(+id, updateTaskDto);
	}
	@Patch(':id/tools')
	updateTools(
		@Param('id', ParseIntPipe) id: number,
		@Body('toolIds', new ParseArrayPipe({ items: Number, separator: ',' }))
		toolIds: number[],
	) {
		return this.taskService.updateTools(id, toolIds);
	}

	@Delete('multiple')
	removeMultiple(
		@Body('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
		ids: number[],
	) {
		return this.taskService.removeMultiple(ids);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.taskService.remove(+id);
	}
}
