import {ApiProperty} from "@nestjs/swagger";

/**
 * Data Transfer Object for the response of personal details.
 */
export class ResponsePersonalDto {
    /**
     * Unique identifier for the personal.
     * @example 'b814e15c-c262-42f1-9168-6ce5f69defe9'
     */
    @ApiProperty({example: 'b814e15c-c262-42f1-9168-6ce5f69defe9', description: 'Unique identifier of the personal'})
    id: string;

    /**
     * DNI (National ID number) of the personal.
     * @example '03488998J'
     */
    @ApiProperty({example: '03488998J', description: 'DNI of the personal'})
    dni: string;

    /**
     * Full name of the personal.
     * @example 'Juan Carlos'
     */
    @ApiProperty({example: 'Juan Carlos', description: 'Full name of the personal'})
    name: string;

    /**
     * The company section to which the personal is assigned.
     * @example 'BAKER'
     */
    @ApiProperty({example: 'BAKER', description: 'Section of the personal'})
    section: string;

    /**
     * The date when the personal started working in the company.
     * @example '2022-01-01T00:00:00.000Z'
     */
    @ApiProperty({
        example: '2022-01-01T00:00:00.000Z',
        description: 'Start date of the personal in the company',
        type: 'string',
        format: 'date-time'
    })
    startDate: Date;

    /**
     * Active status indicating if the personal is currently active.
     * @example true
     */
    @ApiProperty({example: true, description: 'Active status of the personal'})
    isActive: boolean;

    // The userId can be uncommented if it should be part of the response
    // /**
    //  * The identifier for the user associated with the personal.
    //  * @example 101
    //  */
    // @ApiProperty({ example: 101, description: 'User identifier associated with the personal' })
    // userId: number;
}