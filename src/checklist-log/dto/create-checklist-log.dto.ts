import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateChecklistLogDto {
	@IsNotEmpty()
	@IsNumber()
	checklistId: number;
}
