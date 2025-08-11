import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Request,
	UseInterceptors,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('company')
export class CompanyController {
	constructor(private readonly companyService: CompanyService) {}

	@Post()
	create(@Body() createCompanyDto: CreateCompanyDto) {
		return this.companyService.create(createCompanyDto);
	}

	@Get()
	findAll(
		@Request() req,
		@Query('searchKey') searchKey?: string,
		@Query('searchValue') searchValue?: string,
	) {
		return this.companyService.findAll(req.user.id, searchKey, searchValue);
	}

	@Get(':id')
	findOne(@Param('id', new ParseIntPipe()) id: number) {
		return this.companyService.findOne(id);
	}

	@Patch(':id')
	update(
		@Param('id', new ParseIntPipe()) id: number,
		@Body() updateCompanyDto: UpdateCompanyDto,
	) {
		return this.companyService.update(id, updateCompanyDto);
	}

	@Delete(':id')
	remove(@Param('id', new ParseIntPipe()) id: number) {
		return this.companyService.remove(id);
	}
}
