import {PartialType} from '@nestjs/mapped-types'
import {CreatePersonalDto} from './create-personal.dto'
import {IsBoolean, IsOptional, MinLength} from 'class-validator'
import {ApiPropertyOptional} from "@nestjs/swagger";

/**
 * Data Transfer Object for updating personal details.
 * It extends the CreatePersonalDto, making all fields optional.
 */
export class UpdatePersonalDto extends PartialType(CreatePersonalDto) {
    /**
     * Optional full name of the personal, requires at least 3 characters if provided.
     * @example 'Juan Carlos'
     */
    @ApiPropertyOptional({example: 'Juan Carlos', description: 'Full name of the personal', minLength: 3})
    @IsOptional()
    @MinLength(3, {message: 'Name must contain at least 3 letters'})
    name?: string;

    /**
     * Optional section of the company to which the personal is assigned.
     * @example 'BAKER'
     */
    @ApiPropertyOptional({example: 'BAKER', description: 'Section of the personal'})
    @IsOptional()
    section?: string;

    /**
     * Optional active status indicating if the personal is currently active.
     * @example true
     */
    @ApiPropertyOptional({example: true, description: 'Active status of the personal'})
    @IsOptional()
    @IsBoolean({message: 'Active status must be specified'})
    isActive?: boolean;
}