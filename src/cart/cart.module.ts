import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

@Module({
  controllers: [CartController],
  providers: [CartService, NotificationsGateway],
})
export class CartModule {}
