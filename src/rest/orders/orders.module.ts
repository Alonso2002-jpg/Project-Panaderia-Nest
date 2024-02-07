import { Module } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { OrdersController } from './orders.controller'
import { Order } from './schemas/order.schema'
import { Product } from '../product/entities/product.entity'
import { OrderMapper } from './mappers/orders.mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose'
import { User } from '../user/entities/user.entity'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Order.name,
        useFactory: () => {
          const schema = SchemaFactory.createForClass(Order)
          schema.plugin(mongoosePaginate)
          return schema
        },
      },
    ]),
    TypeOrmModule.forFeature([Product]),
    TypeOrmModule.forFeature([User]),
    CacheModule.register(),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderMapper],
  exports: [OrdersService],
})
export class OrdersModule {}
