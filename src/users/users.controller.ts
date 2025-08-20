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
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { PagePaginationDto } from '../common/dto/page-pagination.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	create(@Body() createUserByAdminDto: CreateUserByAdminDto) {
		return this.usersService.create(createUserByAdminDto);
	}

	@Post(':id/reset')
	resetPassword(@Param('id', new ParseIntPipe()) id: number) {
		return this.usersService.resetPassword(id);
	}

	@Get()
	findAll(@Request() req: any, @Query() dto: PagePaginationDto) {
		return this.usersService.findAll(req, dto);
	}

	@Get(':id')
	findOne(@Param('id', new ParseIntPipe()) id: number) {
		return this.usersService.findOne(id);
	}

	@Patch(':id')
	update(
		@Param('id', new ParseIntPipe()) id: number,
		@Body() updateUserDto: UpdateUserDto,
	) {
		return this.usersService.update(id, updateUserDto);
	}

	@Delete(':id')
	remove(@Param('id', new ParseIntPipe()) id: number) {
		return this.usersService.remove(id);
	}
}
