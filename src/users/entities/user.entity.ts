import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Company} from "../../company/entities/company.entity";
import {Workshop} from "../../workshop/entities/workshop.entity";
import {Exclude} from "class-transformer";
import {BaseTable} from "../../common/entity/base-table.entity";

export enum UserRole {
    MASTER = 'master',
    SUPERADMIN = 'superAdmin',
    ADMIN = 'admin',
    USER = 'user',
}

@Entity()
export class User extends BaseTable {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true,
    })
    phone: string

    @Column()
    name: string

    @Column()
    @Exclude({
        toPlainOnly: true
    })
    password: string

    @Column({default: false})
    isActivated: boolean

    @Column({nullable: true})
    icCardNumber: string

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole

    @Column()
    companyId: number

    @ManyToOne(
        () => Company,
        (company) => company.users,
        {
            onDelete: 'SET NULL',
            nullable: true,
        }
    )
    @JoinColumn({name: 'companyId'})
    company: Company


    @Column({nullable: true})
    workshopId: number

    @ManyToOne(
        () => Workshop,
        (workshop) => workshop.users,
        {
            onDelete: 'SET NULL',
            nullable: true,
        }
    )
    @JoinColumn({name: 'workshopId'})
    workshop: Workshop
}
