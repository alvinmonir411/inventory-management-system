import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Company } from '../../modules/companies/entities/company.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductUnit } from '../../modules/products/entities/product-unit.enum';
import { Route } from '../../modules/routes/entities/route.entity';
import { Shop } from '../../modules/shops/entities/shop.entity';
import { StockMovement } from '../../modules/stock/entities/stock-movement.entity';
import { StockMovementType } from '../../modules/stock/enums/stock-movement-type.enum';

@Injectable()
export class DemoSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoSeedService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const shouldSeed = this.configService.get<boolean>(
      'database.seedDemo',
      true,
    );

    if (!shouldSeed) {
      this.logger.log('Demo seed skipped because DB_SEED_DEMO=false.');
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const companiesTableExists = await queryRunner.hasTable('companies');
    const routesTableExists = await queryRunner.hasTable('routes');
    const shopsTableExists = await queryRunner.hasTable('shops');
    await queryRunner.release();

    if (!companiesTableExists) {
      this.logger.warn(
        'Demo seed skipped because the companies table does not exist yet.',
      );
      return;
    }

    if (!routesTableExists || !shopsTableExists) {
      this.logger.warn(
        'Demo seed for routes/shops skipped because required tables do not exist yet.',
      );
    } else {
      await this.ensureDemoRoutesAndShops();
    }

    const companyRepository = this.dataSource.getRepository(Company);
    const companyCount = await companyRepository.count();

    if (companyCount > 0) {
      return;
    }

    this.logger.log('No companies found. Seeding phase 1 demo data...');

    await this.dataSource.transaction(async (manager) => {
      const companyNames = [
        'Apex Traders',
        'BlueWave Distribution',
        'Crown Mart Supply',
        'Delta Retail Link',
        'Evergreen Wholesale',
      ];
      const units = Object.values(ProductUnit);

      for (
        let companyIndex = 0;
        companyIndex < companyNames.length;
        companyIndex += 1
      ) {
        const company = await manager.save(
          manager.create(Company, {
            name: companyNames[companyIndex],
            code: `CMP-${companyIndex + 1}`,
            address: `${10 + companyIndex} Commerce Avenue, Dhaka`,
            phone: `0170000000${companyIndex + 1}`,
            isActive: true,
          }),
        );

        const products = Array.from({ length: 200 }, (_, productIndex) => {
          const buyPrice = this.randomInRange(40, 1500, 2);
          const salePrice = this.randomInRange(
            buyPrice + 10,
            buyPrice * 1.35,
            2,
          );

          return manager.create(Product, {
            companyId: company.id,
            name: `${company.name} Product ${productIndex + 1}`,
            sku: `${company.code}-SKU-${String(productIndex + 1).padStart(4, '0')}`,
            unit: units[productIndex % units.length],
            buyPrice,
            salePrice,
            isActive: true,
          });
        });

        const savedProducts = await manager.save(Product, products);

        const openingStockMovements = savedProducts.map(
          (product, productIndex) =>
            manager.create(StockMovement, {
              companyId: company.id,
              productId: product.id,
              type: StockMovementType.OPENING,
              quantity: this.randomInRange(
                10,
                250 + (productIndex % 20) * 5,
                3,
              ),
              note: 'Demo opening stock',
              movementDate: new Date('2026-01-01T09:00:00.000Z'),
            }),
        );

        await manager.save(StockMovement, openingStockMovements);
      }
    });

    this.logger.log('Phase 1 demo data seeded successfully.');
  }

  private async ensureDemoRoutesAndShops() {
    const routeRepository = this.dataSource.getRepository(Route);
    const shopRepository = this.dataSource.getRepository(Shop);
    const demoRoutes = [
      'Pirgachha Bazar',
      'Chowdhurani',
      'Damurchakla',
      'Kaliganj',
      'Kandirhat',
      'Paotanahat',
      'Annodanagar',
    ];

    for (const routeName of demoRoutes) {
      let route = await routeRepository.findOne({
        where: { name: routeName },
      });

      if (!route) {
        route = await routeRepository.save(
          routeRepository.create({
            name: routeName,
            area: `${routeName} Area`,
            isActive: true,
          }),
        );
      }

      const existingShopCount = await shopRepository.count({
        where: { routeId: route.id },
      });

      if (existingShopCount > 0) {
        continue;
      }

      const demoShops = Array.from({ length: 5 }, (_, index) =>
        shopRepository.create({
          routeId: route.id,
          name: `${routeName} Shop ${index + 1}`,
          ownerName: `Owner ${index + 1}`,
          phone: `018000000${index + 1}`,
          address: `${routeName} Road, Shop Block ${index + 1}`,
          isActive: true,
        }),
      );

      await shopRepository.save(demoShops);
    }

    this.logger.log('Phase 2 demo routes and shops ensured successfully.');
  }

  private randomInRange(min: number, max: number, decimalPlaces: number) {
    const randomValue = Math.random() * (max - min) + min;
    return Number(randomValue.toFixed(decimalPlaces));
  }
}
