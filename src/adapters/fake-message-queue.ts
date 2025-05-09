import { DomainEvent } from "../entities/events.ts";
import { MessageQueue } from "../services/message-queue.ts";

export class FakeMessageQueue implements MessageQueue {
  messages: DomainEvent[] = [];

  async Publish(event: DomainEvent): Promise<void> {
    this.messages.push(event);
  }
}
