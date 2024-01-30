import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { OrderByValues } from '../orders.service'

@Injectable()
export class OrderByValidatePipe implements PipeTransform{
    transform(value: any){
        value = value || OrderByValues[0]
        if(!OrderByValues.includes(value)){
            throw new BadRequestException(
                `No valid sort field specified: ${OrderByValues.join(
                    `, `,
                )}`,
            )
        }
        return value;
    }
}