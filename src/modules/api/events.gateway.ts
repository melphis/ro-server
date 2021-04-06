import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

import { CrawlerService } from '../crawler/crawler.service';
import * as WebSocket from 'ws';
import { Gateway } from './gateway';
import { first } from 'rxjs/operators';

@WebSocketGateway({ path: '/api' })
export class EventsGateway
  extends Gateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
  constructor(private crawler: CrawlerService) {
    super();
  }

  @SubscribeMessage('items.list')
  itemsList(client: WebSocket, data: any) {
    return { event: 'items.list', data: [1, 2, 3, 4] };
  }

  afterInit(server: any): any {
    console.log('Socket events init');

    this.crawler.wip$.subscribe((wip: boolean) => {
      this.all('crawler.wip', wip);
    });

    this.crawler.pageParsed$.subscribe((pageNumber: number) => {
      this.all('crawler.pageParsed', pageNumber);
    });

    return server;
  }

  handleConnection(client: WebSocket, ...args: any[]): any {
    console.log('Client connected');
    this.push(client);

    this.crawler.wip$.pipe(first()).subscribe((wip: boolean) => {
      client.send(Gateway.str('crawler.wip', wip));
    });

    return true;
  }

  handleDisconnect(client: WebSocket): any {
    console.log('Client disconnected');
    this.remove(client);
    return true;
  }
}
