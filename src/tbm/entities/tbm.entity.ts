import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Workshop } from '../../workshop/entities/workshop.entity';
import { BaseTable } from '../../common/entity/base-table.entity';

@Entity()
export class Tbm extends BaseTable {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	content: string;

	@Column()
	workshopId: number;

	@ManyToOne(() => Workshop, (workshop) => workshop.tbms)
	workshop: Workshop;

}
