import { DomainEvent } from "../entities/events.ts";
import { MessageQueue } from "../services/message-queue.ts";

import amqp from "amqplib";

export class RabbitMessageQueue implements MessageQueue {
  private chan: amqp.Channel;
  private queueName: string;

  constructor(chan: amqp.Channel, queueName: string) {
    this.chan = chan;
    this.queueName = queueName;
  }

  async Publish(event: DomainEvent): Promise<void> {
    try {
      const payload = Buffer.from(JSON.stringify(event));
      this.chan.sendToQueue(this.queueName, payload, {
        persistent: true,
      });
    } catch (err) {
      console.error(`Failed to send a message to message queue: ${err}`);
      throw err;
    }
  }
}
