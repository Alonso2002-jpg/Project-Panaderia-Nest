import { Module } from '@nestjs/common'
import { PersonalService } from './personal.service'
import { PersonalController } from './personal.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CacheModule } from '@nestjs/cache-manager'
import { PersonalEntity } from './entities/personal.entity'
import { Category } from '../category/entities/category.entity'
import { MapperPersonal } from './mapper/mapperPersonal'
import { UserModule } from '../user/user.module'
import { UsersService } from '../user/user.service'
import { User } from '../user/entities/user.entity'
import { UserRole } from '../user/entities/user.roles.entity'
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose'
import { Order } from '../orders/schemas/order.schema'
import * as mongoosePaginate from 'mongoose-paginate-v2'
import { OrdersService } from '../orders/orders.service'
import { UsersMapper } from '../user/mapper/users.mapper'
import { BcryptService } from '../utils/bcrypt/bcrypt.services'
import { Product } from '../product/entities/product.entity'
import { OrderMapper } from '../orders/mappers/orders.mapper'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
      PersonalEntity,
      User,
      UserRole,
      Product,
    ]),
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
    CacheModule.register(),
    UserModule,
  ],

  controllers: [PersonalController],
  providers: [
    PersonalService,
    MapperPersonal,
    UsersService,
    OrderMapper,
    OrdersService,
    UsersMapper,
    BcryptService,
  ],
})
export class PersonalModule {}
