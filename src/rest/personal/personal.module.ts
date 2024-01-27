import {Module} from '@nestjs/common';
import {PersonalService} from './personal.service';
import {PersonalController} from './personal.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {CacheModule} from '@nestjs/cache-manager'
import {PersonalEntity} from "./entities/personal.entity";
import {Category} from "../category/entities/category.entity";
import {MapperPersonal} from "./mapper/mapperPersonal";

@Module({
    imports: [
        TypeOrmModule.forFeature([Category, PersonalEntity]),
        CacheModule.register(),
    ],

    controllers: [PersonalController],
    providers: [PersonalService, MapperPersonal],
})
export class PersonalModule {
}
