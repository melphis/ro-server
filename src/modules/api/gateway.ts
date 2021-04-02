export abstract class Gateway {
  protected static clients: WebSocket[] = [];

  static str(eventName: string, data: any = undefined): string {
    return JSON.stringify({
      event: eventName,
      data,
    });
  }

  push(client: WebSocket) {
    Gateway.clients.push(client);
  }

  remove(client: WebSocket) {
    const clientIndex = Gateway.clients.indexOf(client);

    if (clientIndex >= 0) {
      Gateway.clients.splice(clientIndex, 1);
    }
  }

  all(eventName: string, data: any = undefined) {
    const event = Gateway.str(eventName, data);

    Gateway.clients.forEach((client) => {
      client.send(event);
    });
  }
}
