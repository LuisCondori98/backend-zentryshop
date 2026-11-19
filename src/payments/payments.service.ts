import { Injectable, BadRequestException } from '@nestjs/common';
import { CulqiClient } from 'culqi-sdk';

@Injectable()
export class PaymentsService {
  private culqi: CulqiClient;

  constructor() {
    this.culqi = new CulqiClient({
      secretKey: process.env.CULQI_SECRET_KEY as string, // Tu llave sk_test_...
    });
  }

  async createOrder(amount: number, userEmail: string) {
    try {
      // La orden es una "intención de pago", NO un pago confirmado.
      const orden = await this.culqi.createOrder({
        amount: Math.round(amount * 100), // Culqi usa centavos: S/ 65.00 -> 6500
        currency_code: 'PEN',
        description: 'Pedido en ZentryShop',
        order_number: `ORD-${Date.now()}`, // Un ID único para tu orden
        expiration_date: Math.floor(Date.now() / 1000) + 3600, // Expira en 1 hora
        confirm: true, // La orden queda lista para pagar
        client_details: {
          first_name: 'Cliente',
          last_name: 'ZentryShop',
          email: userEmail,
          // 👇 ESTE CAMPO ES OBLIGATORIO PARA YAPE/PLIN
          phone_number: '+51999999999', 
        },
      });

      // Devolvemos el ID de la orden a Angular
      return { orderId: orden.id };
    } catch (error) {
      console.error('Error creando orden Culqi:', error);
      throw new BadRequestException('No se pudo iniciar el pago');
    }
  }
}