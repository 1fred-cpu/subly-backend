import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RealtimeService {
  private server: Server;
  private clientRooms = new Map<string, string>();

  constructor(private redis: RedisService) {
    //  Subscribe to Redis channel for delivery between instances
    this.redis.subscriber.on('message', (channel, message) => {
      const { roomId, payload } = JSON.parse(message);
      this.server?.to(roomId).emit('message', payload);
    });
  }

  setServer(server: Server) {
    this.server = server;
  }

  // Register client
  async registerClient(client: any) {
    await this.redis.publisher.sadd('online_users', client.id);
  }

  // Unregister client
  async unregisterClient(client) {
    await this.redis.publisher.srem('online_users', client.id);
    this.clientRooms.delete(client.id);
  }

  async joinRoom(client: any, roomId: string) {
    this.clientRooms.set(client.id, roomId);
  }

  async publishMessage(roomId: string, payload: any) {
    await this.redis.publisher.publish(
      'room_messages',
      JSON.stringify({ roomId, payload }),
    );
  }
}
