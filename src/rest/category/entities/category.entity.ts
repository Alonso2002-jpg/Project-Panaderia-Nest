import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
    name: 'nameCategory',
  })
  nameCategory: string
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  private updatedAt: Date
  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean
}
