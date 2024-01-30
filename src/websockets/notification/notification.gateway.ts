import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'

const ENDPOINT: string = `/ws/${process.env.API_VERSION || 'v1'}/notification`
@WebSocketGateway({
  namespace: ENDPOINT,
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server
  private readonly logger = new Logger(NotificationGateway.name)
  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!'
  // }
}
