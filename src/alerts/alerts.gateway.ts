import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { AlertDto } from './dto/alert.dto';

@WebSocketGateway({
  cors: {
    origin: (
      process.env.CORS_ORIGIN ??
      'http://localhost:4200,http://localhost:5173,https://infra-watch-eta.vercel.app'
    )
      .split(',')
      .map((o) => o.trim()),
  },
})
export class AlertsGateway {
  @WebSocketServer()
  server!: Server;

  emitNewAlert(alert: AlertDto): void {
    this.server.emit('alert:new', alert);
  }

  emitAlertUpdated(alert: AlertDto): void {
    this.server.emit('alert:updated', alert);
  }
}
