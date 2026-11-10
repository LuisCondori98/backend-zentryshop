import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {

  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {

    const existingUser = await this.prisma.user.findUnique({

      where: { email: createUserDto.email },
    });

    if (existingUser) {

      throw new ConflictException('El correo ya está registrado');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const { password, ...userData } = createUserDto;

    return this.prisma.user.create({
      data: {
        ...userData,
        passwordHash: hashedPassword,
      },
      select: {
        
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        phone: true,
        createdAt: true,
        lastName: true,
        documentNumber: true,
        documentType: true,
        role: true
      }
    });
  }

  async findOne(id: string) {

    const user = await this.prisma.user.findUnique({

      where: {id},
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    return user;
  }

  async findByEmail(email: string) {

    return await this.prisma.user.findUnique({
      
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: string) {

    await this.findOne(id);
    
    return this.prisma.user.delete({ where: { id } });
  }
}
