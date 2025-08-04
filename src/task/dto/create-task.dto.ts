import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
	@IsNotEmpty()
	@IsString()
	title: string;

	@IsString()
	description: string;

	@IsNumber()
	@IsNotEmpty()
	@Type(() => Number)
	companyId: number;
}
