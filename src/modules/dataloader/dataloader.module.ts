import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductLoader } from './product.loader';
import { UserLoader } from './user.loader';
import { OrderLoader } from './order.loader';
import { Product } from '../products/entities/product.entity';
import { Category } from '../products/entities/category.entity';
import { ProductMedia } from '../products/entities/product-media.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

const entities = TypeOrmModule.forFeature([
  Product,
  Category,
  ProductMedia,
  ProductVariant,
  User,
  Order,
  OrderItem,
]);

@Module({
  imports: [entities],
  providers: [ProductLoader, UserLoader, OrderLoader],
  // Re-export TypeOrmModule's repository providers (not just the loader
  // classes) so app.module.ts's GraphQLModule.forRootAsync can inject the
  // raw repositories and build a fresh DataLoader instance per request
  // inside the `context` factory — see app.module.ts for why loaders can't
  // safely be injected as Scope.REQUEST providers into a forRootAsync.
  exports: [ProductLoader, UserLoader, OrderLoader, entities],
})
export class DataloaderModule {}