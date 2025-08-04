import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTaskListDto {
	@IsNotEmpty()
	workshopId: number;

	@IsNumber({}, { each: true })
	@Type(() => Number)
	tasks: number[];
}