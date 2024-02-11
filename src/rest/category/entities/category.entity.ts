import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Product } from '../../product/entities/product.entity'
import { ProvidersEntity } from '../../providers/entities/providers.entity'
import { PersonalEntity } from '../../personal/entities/personal.entity'


@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
    name: 'name_category',
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
  updatedAt: Date
  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean
  @OneToMany(() => Product, (product) => product.category)
  products: Product[]
  @OneToMany(() => ProvidersEntity, (provider) => provider.type)
  providers: ProvidersEntity[]
  @OneToMany(() => PersonalEntity, (personal) => personal.section)
  personal: PersonalEntity[]
}
