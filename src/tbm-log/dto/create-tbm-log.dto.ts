import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTbmLogDto {
	@IsNotEmpty()
	tbmId: number;

	@IsNotEmpty()
	note: string;

	@IsNotEmpty()
	userId: number;

	@IsOptional()
	createdBy: number;

	@IsOptional()
	companyId: number;

	@IsOptional()
	workShopId: number;
}
