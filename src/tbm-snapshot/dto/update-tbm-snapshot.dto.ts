import { PartialType } from '@nestjs/mapped-types';
import { CreateTbmSnapshotDto } from './create-tbm-snapshot.dto';

export class UpdateTbmSnapshotDto extends PartialType(CreateTbmSnapshotDto) {}
