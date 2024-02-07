import { Module } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CategoryController } from './category.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from './entities/category.entity'
import { CategoryMapper } from './mapper/category-mapper.service'
import { NotificationGateway } from '../../websockets/notification/notification.gateway'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [TypeOrmModule.forFeature([Category]), CacheModule.register()],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryMapper, NotificationGateway],
})
export class CategoryModule {}
