import { BaseTable } from '../../common/entity/base-table.entity';
import {
	Column,
	Entity,
	JoinColumn,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { Task } from '../../task/entities/task.entity';

@Entity()
export class Tool extends BaseTable {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({
		type: 'text',
		nullable: true,
	})
	manual: string;

	@Column()
	companyId: number;

	@ManyToMany(() => Task, (task) => task.tools)
	tasks: Task[];

	@ManyToOne(() => Company, (company) => company.tools)
	@JoinColumn({ name: 'companyId' })
	company: Company;
}
