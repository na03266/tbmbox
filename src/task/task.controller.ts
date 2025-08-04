import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
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
		return this.taskService.findAll(name);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.taskService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
		return this.taskService.update(+id, updateTaskDto);
	}

	@Patch(':workshopId/')
	updateSelectedItems(
		@Param('workshopId') workshopId: string,
		@Param('id') id: string,
		@Body() updateTaskDto: UpdateTaskDto,
	) {}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.taskService.remove(+id);
	}

	@Delete('multiple')
	removeMultiple(@Body('ids') ids: number[]) {
		return this.taskService.removeMultiple(ids);
	}
}
