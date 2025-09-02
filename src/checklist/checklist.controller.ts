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
import { ChecklistService } from './checklist.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { PagePaginationDto } from '../common/dto/page-pagination.dto';
import { ChecklistUserService } from './checklist.user/checklist.user.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('checklist')
export class ChecklistController {
	constructor(
		private readonly checklistService: ChecklistService,
		private readonly checklistUserService: ChecklistUserService,
	) {}

	@Post()
	create(@Request() req: any, @Body() createChecklistDto: CreateChecklistDto) {
		return this.checklistService.create(req, createChecklistDto);
	}

	@Get()
	findAll(@Request() req: any, @Query() dto: PagePaginationDto) {
		return this.checklistService.findAll(req, dto);
	}
	@Get('/user')
	findAllForUser(
		@Request() req: any,
		@Query(
			'taskIds',
			new ParseArrayPipe({ items: Number, separator: ',', optional: true }),
		)
		taskIds?: number[],
	) {
		return this.checklistUserService.findAllForUser(req, taskIds ?? []);
	}
	@Get('/user/:id')
	findOneForUser(@Request() req: any, @Param('id') id: String) {
		return this.checklistUserService.findOneForUser(req, +id);
	}
	@Get('task')
	findForTask(@Request() req: any) {
		return this.checklistService.findForTask(req);
	}

	@Post('generate')
	generate(@Body() dto: CreateChecklistDto) {
		return this.checklistService.generateChecklistItems(dto);
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
