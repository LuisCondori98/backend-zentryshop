import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateCartDto {

  @IsString()
  @IsNotEmpty({ message: 'El ID de la variante es obligatorio' })
  variantId!: string;

  @IsNumber()
  @Min(1, { message: 'La cantidad mínima es 1' })
  quantity!: number;
}
