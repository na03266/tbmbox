import {
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Task } from '../../task/entities/task.entity';
import { Tbm } from '../../tbm/entities/tbm.entity';

@Entity()
export class Workshop extends BaseTable {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column()
	address: string;

	@Column({ nullable: true })
	addressDetail: string;

	@Column({
		default: false,
	})
	isCabinet: boolean;

	@Column()
	companyId: number;

	@ManyToOne(() => Company, (company) => company.workshops, {
		onDelete: 'SET NULL',
		nullable: true,
	})
	@JoinColumn({ name: 'companyId' })
	company: Company;

	@OneToMany(() => User, (user) => user.workshop)
	users: User[];

	@ManyToMany(() => Task, (task) => task.workshops)
	@JoinTable()
	tasks: Task[];

	@OneToMany(() => Tbm, (tbm) => tbm.workshop)
	tbms: Tbm[];
}
