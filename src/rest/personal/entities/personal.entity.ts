import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import {Category} from "../../category/entities/category.entity";
//import { User } from './user.entity'
// import { Category } from './category.entity'

@Entity('PERSONAL')
export class PersonalEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({name: 'name', nullable: false})
    name: string

    @Column({name: 'dni', nullable: false, unique: true})
    dni: string

    @Column({name: 'email', nullable: false, unique: true})
    email: string

    @CreateDateColumn({name: 'start_date'})
    startDate: Date

    @Column({name: 'end_date', nullable: true})
    endDate: Date

    @CreateDateColumn({name: 'creation_date'})
    creationDate: Date

    @UpdateDateColumn({name: 'update_date'})
    updateDate: Date

    @Column({name: 'active', default: true})
    isActive: boolean

    // @OneToOne((type) => User)
    // @JoinColumn({ name: 'user_id' })
    // user: User

    @ManyToOne((type) => Category)
    @JoinColumn({name: 'section'})
    section: Category
}
