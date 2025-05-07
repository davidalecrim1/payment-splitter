import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";

let conn: amqp.ChannelModel;
let chan: amqp.Channel;

export async function initRabbitMQ(): Promise<void> {
  conn = await amqp.connect(RABBITMQ_URL);
  chan = await conn.createChannel();
}

export async function closeRabbitMQ(): Promise<void> {
  await chan.close();
  await conn.close();
}

export async function getChannel(queueName: string): Promise<amqp.Channel> {
  if (chan === undefined) {
    await initRabbitMQ();
  }

  await chan.assertQueue(queueName, { durable: true });
  return chan;
}
