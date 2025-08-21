import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChecklistChildDto {
	@IsOptional()
	@IsNumber()
	id: number;

	@IsOptional()
	@IsString()
	content: string;
}
