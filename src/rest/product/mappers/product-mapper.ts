import {Injectable} from "@nestjs/common";
import {Product} from "../entities/product.entity";
import {CreateProductDto} from "../dto/create-product.dto";
import {Category} from "../../category/entities/category.entity";
import {UpdateProductDto} from "../dto/update-product.dto";
import {ResponseProductDto} from "../dto/response-product.dto";
import {ProvidersEntity} from "../../Providers/entities/Providers.entity";

@Injectable()
export class ProductMapper{
    toProductCreate( createProductDto : CreateProductDto, category : Category, provider : ProvidersEntity) : Product {
        const newProduct = new Product();
        newProduct.name = createProductDto.name;
        newProduct.price = createProductDto.price;
        newProduct.stock = createProductDto.stock;
        newProduct.image = Product.IMAGE_DEFAULT;
        newProduct.createdAt = new Date();
        newProduct.updatedAt = new Date();
        newProduct.category = category;
        newProduct.provider = provider;
        newProduct.isDeleted = false;
        return newProduct;
    }

    toProductUpdate(updateProductDto: UpdateProductDto, actualProduct : Product, category: Category, provider: ProvidersEntity) : Product {
        actualProduct.name = updateProductDto.name ?? actualProduct.name;
        actualProduct.price = updateProductDto.price ?? actualProduct.price;
        actualProduct.stock = updateProductDto.stock ?? actualProduct.stock;
        actualProduct.updatedAt = new Date();
        actualProduct.category = category;
        actualProduct.provider = provider;
        actualProduct.isDeleted = updateProductDto.isDeleted ?? actualProduct.isDeleted;
        return actualProduct;
    }

    toProductResponse(product : Product) : ResponseProductDto {
        const response = new ResponseProductDto();
        response.name = product.name;
        response.price = product.price;
        response.stock = product.stock;
        response.image = product.image;
        response.category = product.category?.nameCategory ?? null;
        response.provider = product.provider?.NIF ?? null;
        response.isDeleted = product.isDeleted;
        return response;
    }
}