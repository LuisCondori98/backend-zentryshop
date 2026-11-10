import { Injectable, BadRequestException } from '@nestjs/common'; // <-- Agregamos BadRequestException
import { CreateCartDto } from './dto/create-cart.dto'; // <-- Usamos el DTO correcto
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

@Injectable()
export class CartService {

  constructor(private prisma: PrismaService, private notificationsGateway: NotificationsGateway) {}

  // 👇 1. Agregar al carrito (antes llamado 'create')
  async addItem(userId: string, dto: CreateCartDto) {



    // 1. Buscamos o creamos el carrito
    let cart = await this.prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }

    // 2. Verificamos si la variante ya está en el carrito
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId: dto.variantId,
      },
    });

    // 3. Verificamos el stock de la variante en la base de datos
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
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

    // 4. Si ya existe, sumamos la cantidad
    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: totalQuantity },
      });
    } 

    this.notificationsGateway.notifyAdminCartActivity({
      userName: user?.firstName || 'Cliente Anónimo',
      productName: variant.name,
      action: 'agregó al carrito'
    });
    
    // 5. Si no existe, lo creamos
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId: dto.variantId,
        quantity: dto.quantity,
      },
    });
  }

  // 👇 2. Obtener el carrito (ya lo tenías bien)
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