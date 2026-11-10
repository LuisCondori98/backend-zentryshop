import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: 'http://localhost:4200' }, // Permite a Angular conectarse
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`Admin o Cliente conectado al WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Desconectado: ${client.id}`);
  }

  // Esta función la llamaremos desde el CartService
  notifyAdminCartActivity(data: { userName: string; productName: string; action: string }) {
    this.server.emit('admin:cart-activity', data); 
  }
}