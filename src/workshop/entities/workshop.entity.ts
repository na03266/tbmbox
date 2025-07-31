import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Company} from "../../company/entities/company.entity";
import {User} from "../../users/entities/user.entity";
import {BaseTable} from "../../common/entity/base-table.entity";

@Entity()
export class Workshop extends BaseTable {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    address: string

    @Column({nullable: true})
    addressDetail: string

    @Column({
        default: false
    })
    isCabinet: boolean

    @Column()
    companyId: number

    @ManyToOne(
        () => Company,
        (company) => company.workshops,
        {
            onDelete: 'SET NULL',
            nullable: true,
        }
    )
    @JoinColumn({name: 'companyId'})
    company: Company

    @OneToMany(
        () => User,
        (user) => user.workshop,
    )
    users: User[]

    // 매니투매니 필요 (작업)
}
