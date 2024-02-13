import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import {OrderValues} from "../orders.service";


@Injectable()
export class OrderValidatePipe implements PipeTransform{
    transform(value: any){
        value = value || OrderValues[0]
        if(!OrderValues.includes(value)){
            throw new BadRequestException(
                `No valid order specified: ${OrderValues.join(
                    ', ',
                )}`,
            )
        }
        return value;
    }
}