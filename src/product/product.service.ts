import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {

  private readonly logger = new Logger(ProductService.name);

  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {

    this.logger.log(`PRODUCT CREATED WITH A NAME: ${createProductDto.name}`)

    const { variants, images, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        variants: {
          create: variants,
        },
        images: {
          create: images || [],
        },
      },
      include: {
        variants: true,
        images: true,
        category: true,
      },
    });
  }

  async findAll() {

    this.logger.log(`GET ALL PRODUCTS`)

    return await this.prisma.product.findMany({
      include: {
        variants: true,
        images: true,
        category: true,
      },
    });
  }

  async findOne(id: string) {

    this.logger.log(`FIND PRODUCT BY ID: ${[id]}`)

    return await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: true,
        category: true,
      },
    });
  }

    async findBySlug(slug: string) {

    this.logger.log(`FIND PRODUCT BY SLUG: ${slug}`)

    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        category: true,
        variants: true,
      }
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    this.logger.log(`UPDATE PRODUCT BY ID: ${id}`)
    
    const { variants, images, ...productData } = updateProductDto;

    return this.prisma.$transaction(async (prisma) => {
      
      await prisma.product.update({
        where: { id },
        data: productData,
      });

      if (images) {
        await prisma.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await prisma.productImage.createMany({
            data: images.map(img => ({
              url: img.url,
              isMain: img.isMain,
              altText: img.altText,
              productId: id,
            })),
          });
        }
      }

      if (variants && variants.length > 0) {
        for (const v of variants) {
          if (v.id) {
            await prisma.productVariant.update({
              where: { id: v.id },
              data: {
                name: v.name,
                stock: v.stock,
                price: v.price,
                sku: v.sku || null,
              },
            });
          } else {

            await prisma.productVariant.create({
              data: {
                name: v.name,
                stock: v.stock,
                price: v.price,
                sku: v.sku || null,
                productId: id,
              },
            });
          }
        }
      }

      return prisma.product.findUnique({
        where: { id },
        include: { variants: true, images: true, category: true },
      });
    });
  }

  async remove(id: string) {

    this.logger.log(`DELETE PRODUCT BY ID: ${id}`)

    return await this.prisma.product.delete({
      where: { id }
    });
  }
}
