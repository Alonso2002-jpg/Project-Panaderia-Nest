import {PartialType} from '@nestjs/mapped-types'
import {CreatePersonalDto} from './create-personal.dto'
import {IsBoolean, IsOptional, MinLength} from 'class-validator'

export class UpdatePersonalDto extends PartialType(CreatePersonalDto) {
    @IsOptional()
    @MinLength(3, {message: 'Name must contain at least 3 letters'})
    name?: string

    @IsOptional()
    section?: string

    @IsOptional()
    @IsBoolean({message: 'Active status must be specified'})
    isActive?: boolean
}
