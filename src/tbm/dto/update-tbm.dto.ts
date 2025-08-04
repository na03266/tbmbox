import { PartialType } from '@nestjs/mapped-types';
import { CreateTbmDto } from './create-tbm.dto';

export class UpdateTbmDto extends PartialType(CreateTbmDto) {}
