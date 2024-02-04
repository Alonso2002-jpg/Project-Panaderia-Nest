import {CreatePersonalDto} from '../dto/create-personal.dto'
import {PersonalEntity} from '../entities/personal.entity'
import {plainToClass} from 'class-transformer'
import {v4 as uuidv4} from 'uuid'
import {ResponsePersonalDto} from '../dto/response-personal.dto'
import {Injectable} from '@nestjs/common'
import {Category} from "../../category/entities/category.entity";

/**
 * Service class for mapping between DTOs and the PersonalEntity.
 */
@Injectable()
export class MapperPersonal {
    /**
     * Maps a CreatePersonalDto and a Category to a new PersonalEntity.
     * @param createPersonalDto DTO containing the data to create a new personal.
     * @param categoria The category entity to which the personal belongs.
     * @returns {PersonalEntity} A new instance of PersonalEntity.
     */
    toEntity(
        createPersonalDto: CreatePersonalDto,
        categoria: Category,
    ): PersonalEntity {
        // Create a new PersonalEntity instance from the CreatePersonalDto.
        const personalEntity = plainToClass(PersonalEntity, createPersonalDto);
        // Assign the provided Category to the new entity.
        personalEntity.section = categoria;
        // Generate a new UUID for the personal entity.
        personalEntity.id = uuidv4();
        return personalEntity;
    }

    /**
     * Maps a PersonalEntity to a ResponsePersonalDto.
     * @param personal The PersonalEntity to be mapped.
     * @returns {ResponsePersonalDto} The mapped ResponsePersonalDto.
     */
    toResponseDto(personal: PersonalEntity): ResponsePersonalDto {
        // Create a new ResponsePersonalDto instance from the PersonalEntity.
        const dto = plainToClass(ResponsePersonalDto, personal);
        // If the entity has an associated section, map the name to the DTO's section field.
        if (personal.section) {
            dto.section = personal.section.nameCategory;
        } else {
            dto.section = null;
        }
        return dto;
    }
}