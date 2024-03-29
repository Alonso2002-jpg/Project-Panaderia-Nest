import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Category } from '../../category/entities/category.entity'
import { Product } from '../../product/entities/product.entity'

/**
 * Entidad de Proveedores a cargo de las propiedades de Providers
 */
@Entity('providers')
export class ProvidersEntity {
  /**
   * Clave primaria de proveedores
   */
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: 'integer', description: 'The id of the provider' })
  id: number

  /**
   * NIF del proveedor
   */
  @Column('varchar', { length: 9, nullable: false, name: 'nif' })
  @ApiProperty({ description: 'NIF of the provider' })
  NIF: string

  /**
   * Numero del proveedor
   */
  @Column({ type: 'varchar' })
  @ApiProperty({ description: 'Number of the provider' })
  number: string

  /**
   * Nombre del proveedor
   */
  @Column('varchar', { length: 50, nullable: false, name: 'Name' })
  @ApiProperty({
    description: 'Name of the provider',
    minLength: 2,
    maxLength: 50,
  })
  name: string

  /**
   * Fecha de creacion del proveedor
   */
  @Column('timestamp', {
    default: () => 'CURRENT_TIMESTAMP',
    name: 'CreationDate',
  })
  @ApiProperty({ type: Date, description: 'Creation date of the provider' })
  CreationDate: Date

  /**
   * Fecha de actualizacion del proveedor
   */
  @Column('timestamp', {
    default: () => 'CURRENT_TIMESTAMP',
    name: 'UpdateDate',
  })
  @ApiProperty({ type: Date, description: 'Update date of the provider' })
  UpdateDate: Date

  @ManyToOne(() => Category, (category) => category.providers)
  @JoinColumn({ name: 'type' })
  type: Category

  @OneToMany(() => Product, (product) => product.provider)
  products: Product[]
}
