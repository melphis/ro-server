import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { CrawlerService } from '../crawler/crawler.service';

@WebSocketGateway({ path: '/api' })
export class EventsGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
  constructor(private crawler: CrawlerService) {}

  @SubscribeMessage('items.list')
  itemsList(@MessageBody() data: any) {
    console.log('items list');
    return [1,2,3,4];
  }

  afterInit(server: any): any {
    console.log('Socket events init');
    return server;
  }

  handleConnection(client: any, ...args: any[]): any {
    this.crawler.wip$.subscribe((wip: boolean) =>
      client.emit('crawler.wip', { wip: wip }),
    );
    return true;
  }

  handleDisconnect(client: any): any {
    console.log('Client disconnected');
    return true;
  }
}
