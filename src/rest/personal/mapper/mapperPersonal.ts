import {CreatePersonalDto} from '../dto/create-personal.dto'
import {PersonalEntity} from '../entities/personal.entity'
import {plainToClass} from 'class-transformer'
import {v4 as uuidv4} from 'uuid'
import {ResponsePersonalDto} from '../dto/response-personal.dto'
import {Injectable} from '@nestjs/common'
import {Category} from "../../category/entities/category.entity";

@Injectable()
export class MapperPersonal {
    toEntity(
        createPersonalDto: CreatePersonalDto,
        categoria: Category,
    ): PersonalEntity {
        const personalEntity = plainToClass(PersonalEntity, createPersonalDto)
        personalEntity.section = categoria
        personalEntity.id = uuidv4()
        return personalEntity
    }

    toResponseDto(personal: PersonalEntity): ResponsePersonalDto {
        const dto = plainToClass(ResponsePersonalDto, personal)
        if (personal.section) {
            dto.section = personal.section.nameCategory
        } else {
            dto.section = null
        }
        return dto
    }
}
