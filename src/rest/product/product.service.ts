import {Injectable, Logger} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {ProductMapper} from "./mappers/product-mapper";
import {Product} from "./entities/product.entity";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {Category} from "../category/entities/category.entity";

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name)

  constructor(
      @InjectRepository(Product)
      private readonly productRepository: Repository<Product>,
      @InjectRepository(Category)
      private readonly categoryRepository: Repository<Category>,
      private readonly productMapper: ProductMapper) {
  }
  async create(createProductDto: CreateProductDto) {

    return 'This action adds a new product';
  }

  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
