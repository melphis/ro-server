import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { CrawlerService } from '../crawler/crawler.service';
import * as WebSocket from 'ws';
import { Gateway } from './gateway';

@WebSocketGateway({ path: '/api' })
export class EventsGateway
  extends Gateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
  constructor(private crawler: CrawlerService) {
    super();
  }

  @SubscribeMessage('items.list')
  itemsList(client: WebSocket, data: any) {
    console.log('items list');
    return { event: 'items.list', data: [1, 2, 3, 4] };
  }

  afterInit(server: any): any {
    console.log('Socket events init');
    return server;
  }

  handleConnection(client: any, ...args: any[]): any {
    console.log('Client connected');

    this.crawler.wip$.subscribe((wip: boolean) => {
      client.send(this.str('crawler.wip', wip));
    });

    return true;
  }

  handleDisconnect(client: any): any {
    console.log('Client disconnected');
    return true;
  }
}
