import {CreatePersonalDto} from '../dto/create-personal.dto';
import {PersonalEntity} from '../entities/personal.entity';
import {Category} from '../../category/entities/category.entity';
import {ResponsePersonalDto} from '../dto/response-personal.dto';
import {User} from "../../user/entities/user.entity";
import {MapperPersonal} from "./mapperPersonal";

const mockCreatePersonalDto: CreatePersonalDto = {
    dni: 'dni',
    name: 'kevin',
    email: 'email',
    section: 'section',
    isActive: true,
};

const mockCategory: Category = {
    id: 1,
    nameCategory: 'SELLER',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    products: [],
    providers: [],
    personal: [],

};
const mockUser: User = {
    id: 1,
    name: 'John Doe',
    lastname: 'Smith',
    email: 'john.doe@example.com',
    username: 'johndoe',
    password: 'securepassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    rols: [],
    roleNames: [],
};

const mockPersonalEntity: PersonalEntity = {
    id: 'b814e15c-c262-42f1-9168-6ce5f69defe9',
    name: 'kevin',
    dni: 'dni',
    email: 'email',
    startDate: new Date(),
    endDate: new Date(),
    creationDate: new Date(),
    updateDate: new Date(),
    isActive: true,
    user: mockUser,
    section: mockCategory,


};

const mockResponsePersonalDto: ResponsePersonalDto = {
    id: 'b814e15c-c262-42f1-9168-6ce5f69defe9',
    dni: 'dni',
    name: 'kevin',
    section: 'SELLER',
    startDate: new Date(),
    isActive: true,
    userId: 1,
};

describe('MapperPersonal', () => {
    let mapper: MapperPersonal;

    beforeEach(() => {
        mapper = new MapperPersonal();
    });

    describe('toEntity', () => {
        it('should correctly map CreatePersonalDto and Category to PersonalEntity', () => {
            const personalEntity = mapper.toEntity(mockCreatePersonalDto, mockCategory);

            expect(personalEntity).toMatchObject({
                ...mockCreatePersonalDto,
                section: mockCategory,
            });
            expect(personalEntity.id).toBeDefined();
        });
    });

    describe('toResponseDto', () => {
        it('should handle PersonalEntity without a section', () => {
            const personalWithoutSection: PersonalEntity = {...mockPersonalEntity, section: null};
            const dto = mapper.toResponseDto(personalWithoutSection);

            expect(dto.section).toBeNull();
        });
    });
});