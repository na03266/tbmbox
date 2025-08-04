import { BaseTable } from '../../common/entity/base-table.entity';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class TbmSnapshot extends BaseTable {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	tbmId: number;

	@Column()
	name: string;

	@Column()
	content: string;

	@Column()
	workshopId: number;

	@Column()
	action: 'UPDATE' | 'DELETE';

}
