import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  public publisher: Redis;
  public subscriber: Redis;

  async onModuleInit() {
    // Create two separate Redis connections
    this.publisher = new Redis('redis://localhost:6379');
    this.subscriber = new Redis('redis://localhost:6379');

    // Subscribe to a channel
    await this.subscriber.subscribe('room_messages');

    // Listen for published messages
    this.subscriber.on('message', (channel, message) => {
      console.log(`📩 Received on ${channel}:`, message);
      // you can handle delivery logic here
    });
  }

  //   // Helper to publish messages easily
  //   async publish(channel: string, message: string) {
  //     await this.publisher.publish(channel, message);
  //   }
}
