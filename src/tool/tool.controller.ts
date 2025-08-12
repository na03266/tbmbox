import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	ParseArrayPipe,
	Patch,
	Post,
	Query,
	Request,
	UseInterceptors,
} from '@nestjs/common';
import { ToolService } from './tool.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('tool')
export class ToolController {
	constructor(private readonly toolService: ToolService) {}

	@Post()
	create(@Request() req: any, @Body() createToolDto: CreateToolDto) {
		return this.toolService.create(req.user.companyId, createToolDto);
	}

	@Get()
	findAll(@Request() req: any) {
		return this.toolService.findAll(req);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.toolService.findOne(+id);
	}

	@Get(':taskId/task')
	findByTask(@Param('taskId') taskId: string, @Query('name') name?: string) {
		return this.toolService.findByTask(+taskId, name);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateToolDto: UpdateToolDto) {
		return this.toolService.update(+id, updateToolDto);
	}

	@Delete('multiple')
	removeMultiple(
		@Body('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
		ids: number[],
	) {
		return this.toolService.removeMultiple(ids);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.toolService.remove(+id);
	}
}
