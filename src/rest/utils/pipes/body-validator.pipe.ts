import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class BodyValidatorPipe implements PipeTransform {
    transform(body: any, metadata: ArgumentMetadata) {
        if (!body || Object.keys(body).length === 0) {
            throw new BadRequestException('The request body cannot be empty.');
        }
        return body;
    }
}