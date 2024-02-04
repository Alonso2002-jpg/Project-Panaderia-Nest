import {INestApplication, NotFoundException} from "@nestjs/common";
import {ResponsePersonalDto} from "../../src/rest/personal/dto/response-personal.dto";
import {CreatePersonalDto} from "../../src/rest/personal/dto/create-personal.dto";
import {UpdatePersonalDto} from "../../src/rest/personal/dto/update-personal.dto";
import {Test, TestingModule} from "@nestjs/testing";
import {PersonalController} from "../../src/rest/personal/personal.controller";
import {PersonalService} from "../../src/rest/personal/personal.service";
import * as request from 'supertest'
import {CacheModule} from "@nestjs/common/cache";
import {RolesAuthGuard} from "../../src/rest/auth/guards/rols-auth.guard";
import {JwtAuthGuard} from "../../src/rest/auth/guards/jwt-auth.guard";

describe('PersonalController (e2e)', () => {
    let app: INestApplication
    const myEndpoint = `/personal`

    const myPersonalResponse: ResponsePersonalDto = {
        id: 'b814e15c-c262-42f1-9168-6ce5f69defe9',
        dni: 'dni',
        name: 'kevin',
        section: 'section',
        startDate: new Date(),
        isActive: true,
        userId: 1,
    }
    const createPersonalDto: CreatePersonalDto = {
        dni: 'dni',
        name: 'kevin',
        email: 'email',
        section: 'section',
        isActive: true,
    }
    const updatePersonalDto: UpdatePersonalDto = {
        name: 'kevin',
        section: 'section',
        isActive: true,
    }
    const mockPersonalService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        removeSoft: jest.fn(),
        exists: jest.fn(),
    }
    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [CacheModule.register()],
            controllers: [PersonalController],
            providers: [
                PersonalService,
                {provide: PersonalService, useValue: mockPersonalService},
            ],
        })

            .overrideGuard(JwtAuthGuard)
            .useValue({canActivate: () => true})
            .overrideGuard(RolesAuthGuard)
            .useValue({canActivate: () => true})
            .compile()

        app = moduleFixture.createNestApplication()
        await app.init()
    })
    afterAll(async () => {
        await app.close()
    })
    describe('GET /personal', () => {
        it('should return a page of personal', async () => {
            mockPersonalService.findAll.mockResolvedValue([myPersonalResponse])

            const {body} = await request(app.getHttpServer())
                .get(myEndpoint)
                .expect(200)
            expect(() => {
                expect(body).toEqual([myPersonalResponse])
                expect(mockPersonalService.findAll).toHaveBeenCalled()
            })
        })
        it('should return a page of personal with query', async () => {
            mockPersonalService.findAll.mockResolvedValue([myPersonalResponse])

            const {body} = await request(app.getHttpServer())
                .get(`${myEndpoint}?page=1&limit=10`)
                .expect(200)
            expect(() => {
                expect(body).toEqual([myPersonalResponse])
                expect(mockPersonalService.findAll).toHaveBeenCalled()
            })
        })
    })
    describe('GET /personal/:id', () => {
        it('should return a personal', async () => {
            mockPersonalService.findOne.mockResolvedValue(myPersonalResponse)

            const {body} = await request(app.getHttpServer())
                .get(`${myEndpoint}/${myPersonalResponse.id}`)
                .expect(200)
            expect(() => {
                expect(body).toEqual(myPersonalResponse)
                expect(mockPersonalService.findOne).toHaveBeenCalled()
            })
        })
        it('should throw an error if the personal does not exist', async () => {
            mockPersonalService.findOne.mockRejectedValue(new NotFoundException())

            await request(app.getHttpServer())
                .get(`${myEndpoint}/${myPersonalResponse.id}`)
                .expect(404)
        })
    })
    describe('POST /personal', () => {
        it('should create a new personal', async () => {
            mockPersonalService.create.mockResolvedValue(myPersonalResponse)

            const {body} = await request(app.getHttpServer())
                .post(myEndpoint)
                .send(createPersonalDto)
            //  .expect(201)
            expect(() => {
                expect(body).toEqual(myPersonalResponse)
                expect(mockPersonalService.create).toHaveBeenCalledWith(
                    createPersonalDto,
                )
            })
        })
    })
    describe('PUT /personal/:id', () => {
        it('should update a personal', async () => {
            mockPersonalService.update.mockResolvedValue(myPersonalResponse)

            const {body} = await request(app.getHttpServer())
                .put(`${myEndpoint}/${myPersonalResponse.id}`)
                .send(updatePersonalDto)
            //   .expect(200)
            expect(() => {
                expect(body).toEqual(myPersonalResponse)
                expect(mockPersonalService.update).toHaveBeenCalledWith(
                    myPersonalResponse.id,
                    updatePersonalDto,
                )
            })
        })
        it('should throw an error if the personal does not exist', async () => {
            mockPersonalService.update.mockRejectedValue(new NotFoundException())
            await request(app.getHttpServer())
                .put(`${myEndpoint}/${myPersonalResponse.id}`)
                .send(mockPersonalService)
                .expect(404)
        })
    })
    describe('DELETE /personal/:id', () => {
        it('should remove a personal', async () => {
            mockPersonalService.remove.mockResolvedValue(myPersonalResponse)

            await request(app.getHttpServer())
                .delete(`${myEndpoint}/${myPersonalResponse.id}`)
                .expect(204)
        })

        it('should throw an error if the personal does not exist', async () => {
            mockPersonalService.removeSoft.mockRejectedValue(new NotFoundException())
            await request(app.getHttpServer())
                .delete(`${myEndpoint}/${myPersonalResponse.id}`)
                .expect(404)
        })
    })
})
