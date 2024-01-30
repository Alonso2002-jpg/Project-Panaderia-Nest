import {ArgumentMetadata, BadRequestException, Injectable, ParseIntPipe, PipeTransform} from "@nestjs/common";

@Injectable()
export class IntValidatorPipe implements PipeTransform {
    constructor(private errorMessage = 'Invalid ID, it must be an integer greater than 0.') {
    }
    async transform(id: string, metadata: ArgumentMetadata) {
        const intPipe = new ParseIntPipe();
        try{
            const parsedValue = await intPipe.transform(id, metadata);
            if (parsedValue > 0) {
                return parsedValue;
            } else {
                throw new BadRequestException(this.errorMessage);
            }
        } catch (error) {
            throw new BadRequestException(this.errorMessage);
        }
    }
}