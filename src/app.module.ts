import { Module } from '@nestjs/common'
import { CategoryModule } from './rest/category/category.module'
import { DatabaseModule } from './config/database/database.module'
import { ConfigModule } from '@nestjs/config'
import { OrdersModule } from './rest/orders/orders.module'
import { ProductModule } from './rest/product/product.module'
import { PersonalModule } from './rest/personal/personal.module'
import { ProvidersModule } from './rest/providers/providers.module'
import { StorageModule } from './rest/storage/storage.module'
import { NotificationGateway } from './websockets/notification/notification.gateway'

@Module({
  imports: [
    ConfigModule.forRoot(
      process.env.NODE_ENV === 'dev'
        ? { envFilePath: '.env' }
        : { envFilePath: '.env.prod' },
    ),
    CategoryModule,
    PersonalModule,
    DatabaseModule,
    ProductModule,
    OrdersModule,
    ProvidersModule,
    StorageModule,
  ],
  controllers: [],
  providers: [NotificationGateway],
})
export class AppModule {
}
