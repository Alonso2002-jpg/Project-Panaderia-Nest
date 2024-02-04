import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Category } from '../../category/entities/category.entity'
import { ProvidersEntity } from '../../Providers/entities/Providers.entity'

@Entity({ name: 'products' })
export class Product {
  public static IMAGE_DEFAULT: string = 'https://via.placeholder.com/150'
  @PrimaryColumn({ type: 'uuid' })
  id: string
  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  name: string
  @Column({ type: 'double precision', default: 0.0 })
  price: number
  @Column({ type: 'integer', default: 0 })
  stock: number
  @Column({ type: 'text', default: Product.IMAGE_DEFAULT })
  image: string
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

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category

  @ManyToOne(() => ProvidersEntity, (provider) => provider.products)
  @JoinColumn({ name: 'provider_id' })
  provider: ProvidersEntity

  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean
}
