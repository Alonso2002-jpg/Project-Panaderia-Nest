import { Module } from '@nestjs/common'
import { CategoryModule } from './rest/category/category.module'
import { DatabaseModule } from './config/database/database.module'
import { ConfigModule } from '@nestjs/config'
import { PersonalModule } from './personal/personal.module';
import { ProductModule } from './rest/product/product.module';
import { OrdersModule } from './rest/orders/orders.module';
import { ProductModule } from './rest/product/product.module'
import { CacheModule } from '@nestjs/cache-manager'
import { PersonalModule } from './rest/personal/personal.module'
import { ProvidersModule } from "./rest/providers/providers.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    CategoryModule,
    PersonalModule,
    DatabaseModule,
    ProductModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
