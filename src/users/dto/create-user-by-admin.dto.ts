import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsString,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { Type } from 'class-transformer';

export class CreateUserByAdminDto {
	@IsString()
	phone: string;

	@IsString()
	password: string;

	@IsNotEmpty()
	@IsString()
	name: string;

	@IsEnum(UserRole)
	@Type(() => Number)
	role: UserRole;

	@IsNotEmpty()
	@IsNumber()
	@Type(() => Number)
	companyId: number;

	@IsNumber()
	@Type(() => Number)
	workshopId: number;

	@IsString()
	icCardNumber: string;

	@IsBoolean()
	@Type(() => Boolean)
	isActivated: boolean;
}
