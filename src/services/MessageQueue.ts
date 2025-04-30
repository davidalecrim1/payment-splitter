import { DomainEvent } from "../entities/Events.ts";

export interface MessageQueue {
  Publish(event: DomainEvent): Promise<void>;
}
