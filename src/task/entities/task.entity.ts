import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Workshop } from '../../workshop/entities/workshop.entity';

@Entity()
export class Task extends BaseTable {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column({
		nullable: true,
		type: 'text',
	})
	description: string;

	@ManyToMany(() => Workshop, (workshop) => workshop.tasks)
	workshops: Workshop[];
}
