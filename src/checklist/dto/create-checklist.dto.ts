import {
	ArrayMinSize,
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
    ValidateNested,
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
	@ValidateNested({ each: true })
	@Type(() => CreateChecklistChildDto)
		// 필요 시 최소 1개 요구할 때만 활성화
		@ArrayMinSize(1)
	children: CreateChecklistChildDto[] = [];
}
