import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { ProvidersEntity } from './entities/providers.entity';

describe('ProvidersController', () => {
  let controller: ProvidersController;
  let service: ProvidersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProvidersController],
      providers: [ProvidersService],
    }).compile();

    controller = module.get<ProvidersController>(ProvidersController);
    service = module.get<ProvidersService>(ProvidersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of Providers', async () => {
      const result: ProvidersEntity[] = [];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a Providers by ID', async () => {
      const result: ProvidersEntity = <ProvidersEntity>{};
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne('1')).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new Provider', async () => {
      const result: ProvidersEntity = <ProvidersEntity>{};
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(result)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a Provider by ID', async () => {
      const result: ProvidersEntity = <ProvidersEntity>{};
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update('1', result)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a Provider by ID', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue();

      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
