import {
	Body, ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Request, UseInterceptors,
} from '@nestjs/common';
import { ToolService } from './tool.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { UpdateToolDto } from './dto/update-tool.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('tool')
export class ToolController {
	constructor(private readonly toolService: ToolService) {}

	@Post()
	create(@Body() createToolDto: CreateToolDto) {
		return this.toolService.create(createToolDto);
	}

	@Get()
	findAll(@Request() req) {
		return this.toolService.findAll(req);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.toolService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateToolDto: UpdateToolDto) {
		return this.toolService.update(+id, updateToolDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.toolService.remove(+id);
	}
}
