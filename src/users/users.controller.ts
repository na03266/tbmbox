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
import { UserRole } from './entities/user.entity';

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
	findAll(
		@Request() req,
		@Query('searchKey') searchKey?: string,
		@Query('searchValue') searchValue?: string,
	) {
		switch (req.user.role) {
			case UserRole.USER:
				return this.usersService.findOne(req.user.id);
			default:
				return this.usersService.findAll(req.user.id, searchKey, searchValue);
		}
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
