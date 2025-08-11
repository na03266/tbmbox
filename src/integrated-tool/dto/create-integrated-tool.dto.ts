import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIntegratedToolDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsString()
	@IsOptional()
	manual: string;
}
