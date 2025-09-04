import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChecklistLogChild } from './checklist-log-child.entity';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Company } from '../../company/entities/company.entity';
import { Workshop } from '../../workshop/entities/workshop.entity';
import { Task } from '../../task/entities/task.entity';

@Entity()
export class ChecklistLog extends BaseTable {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	userId: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'userId' })
	user: User;

	@Column()
	checklistId: number;

	@Column()
	taskId: number;

	@ManyToOne(() => Task, (task) => task.checklist)
	@JoinColumn({ name: 'taskId' })
	task: Task;

	@Column()
	title: string;

	@Column()
	checklistVersion: number;

	@OneToMany(() => ChecklistLogChild, (child) => child.parent)
	children: ChecklistLogChild[];

	@Column()
	companyId: number;

	@ManyToOne(() => Company)
	@JoinColumn({ name: 'companyId' })
	company: Company;

	@Column()
	workshopId: number;

	@ManyToOne(() => Workshop)
	@JoinColumn({ name: 'workshopId' })
	workshop: Workshop;
}
