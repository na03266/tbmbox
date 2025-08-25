import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
	@IsNotEmpty()
	@IsString()
	title: string;

	@IsString()
	description: string;

	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	companyId: number;
}
