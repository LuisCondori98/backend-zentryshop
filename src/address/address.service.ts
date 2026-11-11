import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AddressService {

  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateAddressDto) {

    const count = await this.prisma.address.count({ where: { userId } });

    const isDefault = count === 0 ? true : dto.isDefault;

    if (isDefault) {

      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({

      data: { ...dto, userId, isDefault },
    });
  }

  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }, // La default sale primero
    });
  }

  async update(userId: string, id: string, dto: UpdateAddressDto) {

    const address = await this.prisma.address.findFirst({ where: { id, userId } });

    if (!address) throw new NotFoundException('Dirección no encontrada');

    if (dto.isDefault) {

      await this.prisma.address.updateMany({

        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({

      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {

    const address = await this.prisma.address.findFirst({ where: { id, userId } });
    
    if (!address) throw new NotFoundException('Dirección no encontrada');

    return this.prisma.address.delete({ where: { id } });
  }
}
