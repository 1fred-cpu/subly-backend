import { Injectable, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Decorator that marks a class as a Nest gateway that enables real-time, bidirectional and event-based communication between the browser and the server.
@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
@Injectable()
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private logger = new Logger(RealtimeGateway.name);

  // Websocket server
  @WebSocketServer() server: Server;

  // Calls when a client connect
  handleConnection(client: Socket) {
    this.logger.log('a user connected: ' + client.id);
  }

  // Calls when a client disconnect
  handleDisconnect(client: Socket) {
    this.logger.log('a user disconnected: ' + client.id);
  }
}
