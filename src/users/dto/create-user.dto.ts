import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { Type } from 'class-transformer';

export class CreateUserDto {
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

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	workshopId: number;

	@IsOptional()
	@IsString()
	icCardNumber: string;

	@IsBoolean()
	@Type(() => Boolean)
	isActivated: boolean;
}
