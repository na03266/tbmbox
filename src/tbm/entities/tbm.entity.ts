import {
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
} from 'typeorm';
import { Workshop } from '../../workshop/entities/workshop.entity';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Task } from '../../task/entities/task.entity';
import { Company } from '../../company/entities/company.entity';
import { User } from '../../users/entities/user.entity'; // 추가

@Unique(['title', 'workshopId'])
@Entity()
export class Tbm extends BaseTable {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	title: string;

	@Column({ type: 'text' })
	content: string;

	@Column()
	workshopId: number;

	@Column({
		nullable: true,
	})
	createdBy: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'createdBy' })
	creator: User;

	@ManyToOne(() => Workshop, (workshop) => workshop.tbms)
	@JoinColumn({ name: 'workshopId' })
	workshop: Workshop;

	@Column()
	companyId: number;

	@ManyToOne(() => Company)
	@JoinColumn({ name: 'companyId' })
	company: Company;

	@ManyToMany(() => Task, (task) => task.tbms)
	@JoinTable()
	tasks: Task[];
}
