import { DomainEvent } from "../entities/Events.ts";
import { MessageQueue } from "../services/MessageQueue.ts";

export class FakeMessageQueue implements MessageQueue {
  messages: DomainEvent[] = [];

  Publish(event: DomainEvent): Promise<void> {
    this.messages.push(event);
    return Promise.resolve();
  }
}
