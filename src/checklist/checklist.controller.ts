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
import { ChecklistService } from './checklist.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('checklist')
export class ChecklistController {
	constructor(private readonly checklistService: ChecklistService) {}

	@Post()
	create(@Body() createChecklistDto: CreateChecklistDto, @Request() req: any) {
		return this.checklistService.create(req, createChecklistDto);
	}

	@Get()
	findAll(
		@Request() req: any,
		@Query('searchKey') searchKey?: string,
		@Query('searchValue') searchValue?: string,
	) {
		return this.checklistService.findAll(
			req,
			searchKey,
			searchValue,
		);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.checklistService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateChecklistDto: UpdateChecklistDto,
	) {
		return this.checklistService.update(+id, updateChecklistDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.checklistService.remove(+id);
	}
}
