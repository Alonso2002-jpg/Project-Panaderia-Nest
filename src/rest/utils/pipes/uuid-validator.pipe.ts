import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ParseUUIDPipe,
  PipeTransform,
} from '@nestjs/common'

@Injectable()
export class UuidValidatorPipe implements PipeTransform {
  constructor(private errorMessage = 'Invalid or incorrectly formatted UUID') {}
  async transform(id: string, metadata: ArgumentMetadata) {
    const uuidPipe = new ParseUUIDPipe()
    try {
      return await uuidPipe.transform(id, metadata)
    } catch (error) {
      throw new BadRequestException(this.errorMessage)
    }
  }
}
