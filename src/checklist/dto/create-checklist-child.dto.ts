import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChecklistChildDto {
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	id: number;

	@IsOptional()
	@IsString()
	content: string;
}
