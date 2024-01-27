import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import {ProductMapper} from "./mappers/product-mapper";

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductMapper],
})
export class ProductModule {}
