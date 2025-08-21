import {
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateChecklistChildDto } from './create-checklist-child.dto';

export class CreateChecklistDto {
	@IsNotEmpty()
	@IsNumber()
	@Type(() => Number)
	taskId: number;

	@IsOptional()
	@IsString()
	note: string;

	@IsOptional()
	@IsArray()
	children: CreateChecklistChildDto[];
}
