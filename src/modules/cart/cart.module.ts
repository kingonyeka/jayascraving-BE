import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductsModule } from '../products/products.module';
import { AbandonedCartModule } from '../abandoned-cart/abandoned-cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Product]),
    ProductsModule,
    AbandonedCartModule, // lets CartService schedule/cancel abandoned-cart recovery emails
  ],
  providers: [CartService, CartResolver],
  exports: [CartService],
})
export class CartModule {}
