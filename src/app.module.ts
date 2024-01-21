import { Module } from '@nestjs/common';
import { CategoriaModule } from './categoria/categoria.module';
import { PersonalModule } from './personal/personal.module';

@Module({
  imports: [CategoriaModule, PersonalModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
