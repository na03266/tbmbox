import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChecklistChildDto {
	@IsOptional()
	@IsNumber()
	id: number;

	@IsNotEmpty()
	@IsString()
	content: string;
}
