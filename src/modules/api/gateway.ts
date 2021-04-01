export abstract class Gateway {
  str(eventName: string, data: any = undefined): string {
    return JSON.stringify({
      event: eventName,
      data,
    });
  }
}
