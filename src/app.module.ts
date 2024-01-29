import { Module } from '@nestjs/common'
import { CategoryModule } from './rest/category/category.module'
import { DatabaseModule } from './config/database/database.module'
import { ConfigModule } from '@nestjs/config'
import { ProductModule } from './rest/product/product.module'
import { CacheModule } from '@nestjs/cache-manager'
import { PersonalModule } from './rest/personal/personal.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    CategoryModule,
    PersonalModule,
    DatabaseModule,
    ProductModule,
    CacheModule.register(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
