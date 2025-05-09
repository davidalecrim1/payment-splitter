import { DomainEvent } from "../entities/events.ts";

export interface MessageQueue {
  Publish(event: DomainEvent): Promise<void>;
}
