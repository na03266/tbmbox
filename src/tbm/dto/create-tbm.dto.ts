import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateTbmDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsString()
	content: string;

	@IsInt()
	@Min(1)
	workshopId: number;

	@IsOptional()
	@IsArray()
	taskIds?: number[];
}
