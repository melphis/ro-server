import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway({ path: '/api' })
export class EventsGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
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
    console.log('Handle connection');
    return true;
  }

  handleDisconnect(client: any): any {
    console.log('Client disconnected');
    return true;
  }
}
