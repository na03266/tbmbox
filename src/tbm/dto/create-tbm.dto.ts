import { Type } from 'class-transformer';
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

	@IsNotEmpty()
	@IsString()
	content: string;

	@IsInt()
	@Type(() => Number)
	workshopId: number;

	@IsOptional()
	@IsArray()
	@IsInt({ each: true })
	taskIds?: number[];
}
