import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import {ProductMapper} from "./mappers/product-mapper";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Product} from "./entities/product.entity";
import {Category} from "../category/entities/category.entity";

@Module({
  imports: [
      TypeOrmModule.forFeature([Product]),
      TypeOrmModule.forFeature([Category]),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductMapper],
})
export class ProductModule {}
