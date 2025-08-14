import { PartialType } from '@nestjs/mapped-types';
import { CreateTbmLogDto } from './create-tbm-log.dto';

export class UpdateTbmLogDto extends PartialType(CreateTbmLogDto) {}
