import {Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {CreateUserByAdminDto} from "./dto/create-user-by-admin.dto";

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserByAdminDto: CreateUserByAdminDto) {
    return this.usersService.create(createUserByAdminDto);
  }

  @Get()
  findByCompany(@Param('id', new ParseIntPipe()) id: number) {
    return this.usersService.findByCompany(id);
  }

  @Get(':phone')
  findOne(@Param('phone') phone: string) {
    return this.usersService.findOne(phone);
  }

  @Patch(':phone')
  update(@Param('phone') phone: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(phone, updateUserDto);
  }

  @Delete(':phone')
  remove(@Param('phone') phone: string) {
    return this.usersService.remove(phone);
  }
}
