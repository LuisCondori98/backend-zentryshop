import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {

  constructor(private readonly cartService: CartService) {}

  @Post('add')
  create(@Request() req ,@Body() createCartDto: CreateCartDto) {
    
    const userIdReal = req.user.userId; 

    console.log('User ID:', req.user.userId);
    console.log('DTO:', createCartDto); 
    
    return this.cartService.addItem(userIdReal, createCartDto);
  }

  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete('item/:id')
  removeItem(@Request() req, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.userId, id); // <-- Llama a removeItem
  }
}
