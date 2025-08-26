import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ChecklistChild } from './checklistchildren.entity';
import { Task } from '../../task/entities/task.entity';
import { BaseTable } from '../../common/entity/base-table.entity';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../company/entities/company.entity';

@Entity()
export class Checklist extends BaseTable {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	taskId: number;

	@Column({
		type: 'text',
	})
	note: string;

	@ManyToOne(() => Task, (task) => task.checklist)
	@JoinColumn({ name: 'taskId' })
	task: Task;

	@OneToMany(() => ChecklistChild, (child) => child.parent)
	children: ChecklistChild[];

	@Column()
	createdBy: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'createdBy' })
	createUserInfo: User;

	@Column()
	companyId: number;

	@ManyToOne(() => Company)
	@JoinColumn({ name: 'companyId' })
	company: Company;
}
