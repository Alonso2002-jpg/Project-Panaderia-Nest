import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import {Category} from '../../category/entities/category.entity'
import {User} from "../../user/entities/user.entity";


/**
 * Personal entity representing a record of an employee or staff member.
 */
@Entity('PERSONAL')
export class PersonalEntity {
    /**
     * Unique identifier for the personal, generated as a UUID.
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * Full name of the personal.
     */
    @Column({name: 'name', nullable: false})
    name: string;

    /**
     * DNI (National ID number) of the personal, unique for each record.
     */
    @Column({name: 'dni', nullable: false, unique: true})
    dni: string;

    /**
     * Email address of the personal, unique for each record.
     */
    @Column({name: 'email', nullable: false, unique: true})
    email: string;

    /**
     * The date when the personal started working in the company.
     */
    @CreateDateColumn({name: 'start_date'})
    startDate: Date;

    /**
     * The date when the personal ended their service, if applicable.
     */
    @Column({name: 'end_date', nullable: true})
    endDate: Date;

    /**
     * The date when the record was created.
     */
    @CreateDateColumn({name: 'creation_date'})
    creationDate: Date;

    /**
     * The last date when the record was updated.
     */
    @UpdateDateColumn({name: 'update_date'})
    updateDate: Date;

    /**
     * Active status indicating if the personal is currently active.
     */
    @Column({name: 'active', default: true})
    isActive: boolean;

    /**
     * The user account associated with the personal.
     */
    @OneToOne((type) => User)
    @JoinColumn({name: 'user_id'})
    user: User;

    /**
     * The category or section within the company to which the personal belongs.
     */
    @ManyToOne(() => Category, (category) => category.personal)
    @JoinColumn({name: 'section'})
    section: Category;
}