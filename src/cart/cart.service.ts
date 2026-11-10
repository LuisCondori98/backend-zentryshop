import { Injectable, BadRequestException } from '@nestjs/common'; // <-- Agregamos BadRequestException
import { CreateCartDto } from './dto/create-cart.dto'; // <-- Usamos el DTO correcto
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

@Injectable()
export class CartService {

  constructor(private prisma: PrismaService, private notificationsGateway: NotificationsGateway) {}

  async addItem(userId: string, dto: CreateCartDto) {

    let cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId: dto.variantId,
      },
    });

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: {
        product: true,
      }
    });

    if (!variant) {
      throw new BadRequestException('La variante del producto no existe');
    }

    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const totalQuantity = currentQuantity + dto.quantity;

    if (totalQuantity > variant.stock) {
      throw new BadRequestException(`Solo quedan ${variant.stock} unidades en stock.`);
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: totalQuantity },
      });
    } 

    this.notificationsGateway.notifyAdminCartActivity({
      userName: user?.firstName || 'Cliente Anónimo',
      productName: variant.product.name,
      action: `agregó al carrito (${variant.name})`
    });
    
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: dto.variantId,
        quantity: dto.quantity,
      },
    });
  }

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }
    return cart;
  }

  // 👇 3. NUEVO MÉTODO: Eliminar un ítem del carrito
  async removeItem(userId: string, itemId: string) {
    // Verificamos que el ítem realmente pertenezca al carrito de este usuario
    // (Por seguridad, para que nadie borre el carrito de otro)
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    
    if (!cart) {
      throw new BadRequestException('Carrito no encontrado');
    }

    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new BadRequestException('El producto no está en tu carrito');
    }

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  // Métodos genéricos (puedes dejarlos o borrarlos si no los usas)
  findAll() {
    return `This action returns all cart`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  update(id: number, updateCartDto: any) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}