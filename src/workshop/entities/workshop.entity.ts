import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Company} from "../../company/entities/company.entity";
import {User} from "../../users/entities/user.entity";

@Entity()
export class Workshop {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    address: string

    @Column({
        default: false
    })
    isCabinet: boolean

    @ManyToOne(
        () => Company,
        (company) => company.workshops,
        {
            onDelete: 'SET NULL',
            nullable: true,
        }
    )
    company: Company

    @OneToMany(
        () => User,
        (user) => user.workshop,
    )
    users: User[]

    // 매니투매니 필요 (작업)
}
