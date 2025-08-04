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
	findAll(@Request() req) {
		switch (req.user.role) {
			case UserRole.MASTER:
				return this.usersService.findAll();
			case UserRole.ADMIN:
			case UserRole.SUPERADMIN:
				return this.usersService.findForAdmin(req.user.id);
			case UserRole.USER:
				return this.usersService.findOne(req.user.id);
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
