import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateToolDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsOptional()
	@IsString()
	manual: string;

	@IsNotEmpty()
	@IsNumber()
	companyId: number;
}
