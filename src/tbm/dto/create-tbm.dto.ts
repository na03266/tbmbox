import {
	IsArray,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator';

export class CreateTbmDto {
	@IsNotEmpty()
	@IsString()
	title: string;

	@IsString()
	content: string;

	@IsInt()
	workshopId: number;

	@IsOptional()
	@IsInt()
	createdBy: number;

	@IsOptional()
	@IsArray()
	taskIds?: number[];
}
