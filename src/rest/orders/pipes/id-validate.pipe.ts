import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ObjectId } from 'mongodb'

@Injectable()
export class IdValidatePipe implements PipeTransform{
    transform(value: any){
        if(!ObjectId.isValid(value)){
            throw new BadRequestException(
                `The specified id is invalid or malformed`
            )
        }
        return value;
    }
}