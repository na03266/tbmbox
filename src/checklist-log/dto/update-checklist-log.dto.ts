import { PartialType } from '@nestjs/mapped-types';
import { CreateChecklistLogDto } from './create-checklist-log.dto';

export class UpdateChecklistLogDto extends PartialType(CreateChecklistLogDto) {}
