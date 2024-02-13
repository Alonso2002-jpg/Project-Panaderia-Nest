import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { Notification } from './model/notification.model'

const ENDPOINT: string = `/ws/${process.env.API_VERSION || 'v1'}/notification`
@WebSocketGateway({
  namespace: ENDPOINT,
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server
  private readonly logger = new Logger(NotificationGateway.name)

  constructor() {
    this.logger.log(`Inicialization WebSockets on ${ENDPOINT}`)
  }

  sendMessage(notification: Notification<any>) {
    this.server.emit(this.findEntity(notification), notification)
  }

  private handleConnection(client: Socket) {
    // Este método se ejecutará cuando un cliente se conecte al WebSocket
    this.logger.debug('Cliente conectado:', client.id)
    this.server.emit(
      'connection',
      'Updates Notifications WS: Panaderia - Miga de Oro | API NestJS',
    )
  }

  private handleDisconnect(client: Socket) {
    // Este método se ejecutará cuando un cliente se desconecte del WebSocket
    console.log('Cliente desconectado:', client.id)
    this.logger.debug('Cliente desconectado:', client.id)
  }

  findEntity(notification: Notification<any>) {
    if (notification.entity == 'CATEGORY') {
      return 'category'
    }
    return 'product'
  }
  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!'
  // }
}
