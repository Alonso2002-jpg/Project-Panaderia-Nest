import { Module } from '@nestjs/common'
import { ProductService } from './product.service'
import { ProductController } from './product.controller'
import { ProductMapper } from './mappers/product-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from './entities/product.entity'
import { Category } from '../category/entities/category.entity'
import { CacheModule } from '@nestjs/cache-manager'
import { ProvidersEntity } from '../Providers/entities/Providers.entity'
import { StorageModule } from '../storage/storage.module'
import { NotificationModule } from '../../websockets/notification/notification.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    TypeOrmModule.forFeature([Category]),
    TypeOrmModule.forFeature([ProvidersEntity]),
    CacheModule.register(),
    NotificationModule,
    StorageModule,
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductMapper],
})
export class ProductModule {}
