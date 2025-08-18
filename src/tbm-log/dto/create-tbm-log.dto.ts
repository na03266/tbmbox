import { IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTbmLogDto {
	@IsNotEmpty()
	@Type(() => Number)
	tbmId: number;

	@IsOptional()
	@Type(() => Number)
	userId: number;

	@IsOptional()
	@IsNotEmpty()
	note: string;

}
