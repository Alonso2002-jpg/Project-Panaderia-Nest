import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersService } from './providers.service';
import { ProvidersEntity } from './entities/providers.entity';

describe('ProvidersService', () => {
  let service: ProvidersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProvidersService],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new Provider', async () => {
    const Providers: ProvidersEntity = <ProvidersEntity>{};
    const createdProviders = await service.create(Providers);
    expect(createdProviders).toEqual({ ...Providers, id: expect.any(Number) });
  });

  it('should find all Providers', async () => {
    const Providers = await service.findAll();
    expect(Providers).toBeInstanceOf(Array);
  });

  it('should find a Providers by ID', async () => {
    const Providers: ProvidersEntity = <ProvidersEntity>{};
    const createdProviders = await service.create(Providers);
    const foundProviders = await service.findOne(createdProviders.id);
    expect(foundProviders).toEqual(createdProviders);
  });

  it('should update a Providers', async () => {
    const Providers: ProvidersEntity = <ProvidersEntity>{};
    const createdProviders = await service.create(Providers);

    const updatedProvidersData: ProvidersEntity = <ProvidersEntity>{};
    const updatedProviders = await service.update(
      createdProviders.id,
      updatedProvidersData,
    );

    expect(updatedProviders).toEqual({
      ...createdProviders,
      ...updatedProvidersData,
    });
  });

  it('should remove a ProvidersProviders', async () => {
    const Providers: ProvidersEntity = <ProvidersEntity>{};
    const createdProviders = await service.create(Providers);

    await service.remove(createdProviders.id);
    const ProvidersAfterRemoval = await service.findAll();

    expect(ProvidersAfterRemoval).not.toContain(createdProviders);
  });
});
