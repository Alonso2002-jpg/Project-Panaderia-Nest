import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import {ProductService} from "../product.service";
import * as uuid from 'uuid'
@Injectable()
export class ProductExistsGuard implements CanActivate {
    constructor(private readonly productService: ProductService) {
    }
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest()
        const productId : string = request.params.id;

        try{
            uuid.parse(productId)
            return this.productService.exists(productId).then(() => {
                return true;
            }).catch(() => {
                throw new BadRequestException('The Product ID doesn`t exist.')
            })
        } catch (error){
            throw new BadRequestException('Invalid UUID format for Product ID')
        }
    }
}
