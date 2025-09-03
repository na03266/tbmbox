import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Request,
} from '@nestjs/common';
import { DashService } from './dash.service';
import { CreateDashDto } from './dto/create-dash.dto';
import { UpdateDashDto } from './dto/update-dash.dto';

@Controller('dash')
export class DashController {
	constructor(private readonly dashService: DashService) {}

	@Post()
	create(@Body() createDashDto: CreateDashDto) {
		return this.dashService.create(createDashDto);
	}

	@Get()
	findAll(@Request() req: any) {
		return this.dashService.findAll(req);
	}

	@Get('user')
	findForUser(@Request() req: any) {
		return this.dashService.findAllForUser(req);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.dashService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateDashDto: UpdateDashDto) {
		return this.dashService.update(+id, updateDashDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.dashService.remove(+id);
	}
}
