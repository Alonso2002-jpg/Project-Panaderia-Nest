import { Module } from '@nestjs/common'
import { CategoryModule } from './rest/category/category.module'
import { PersonalModule } from './personal/personal.module'
import { DatabaseModule } from './config/database/database.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    CategoryModule,
    PersonalModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
