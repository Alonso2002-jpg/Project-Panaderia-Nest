import { Module } from '@nestjs/common'
import { CategoryModule } from './rest/category/category.module'
import { PersonalModule } from './personal/personal.module'
import { DatabaseModule } from './config/database/database.module'
import { ConfigModule } from '@nestjs/config'
import { PersonalModule } from './personal/personal.module';
import { ProductModule } from './rest/product/product.module';
import { OrdersModule } from './rest/orders/orders.module';
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
    ProvidersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
