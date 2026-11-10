import { Injectable, NotFoundException } from '@nestjs/common'; // <-- Importamos NotFoundException
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {

  constructor(private prisma: PrismaService) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto
    });
  }

  async findAll() {
    return await this.prisma.category.findMany({
      orderBy: { name: 'asc' } // <-- Opcional: para que salgan ordenadas alfabéticamente
    });
  }

  // 👇 CORREGIDO: Ahora busca de verdad en la BD
  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  // 👇 AGREGADO: La lógica para actualizar
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Verificamos que exista antes de actualizar
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto
    });
  }

  async remove(id: number) {
    // Verificamos que exista antes de borrar
    await this.findOne(id);

    return this.prisma.category.delete({
      where: { id }
    });
  }
}