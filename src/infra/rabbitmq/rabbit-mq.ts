import amqp from "amqplib";

export class RabbitMQClient {
  private static instance: RabbitMQClient;
  private connection?: amqp.ChannelModel;
  private channel?: amqp.Channel;
  private readonly url: string;

  private constructor(
    url: string = process.env.RABBITMQ_URL || "amqp://localhost"
  ) {
    this.url = url;
  }

  public static getInstance(url?: string): RabbitMQClient {
    if (!RabbitMQClient.instance) {
      RabbitMQClient.instance = new RabbitMQClient(url);
    }
    return RabbitMQClient.instance;
  }

  public async connect(): Promise<void> {
    if (!this.connection) {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      console.log("RabbitMQ connected!");
    }
  }

  public async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = undefined;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = undefined;
    }
  }

  public async getChannel(queue: string): Promise<amqp.Channel> {
    if (!this.channel) {
      await this.connect();
    }
    await this.channel!.assertQueue(queue, { durable: true });
    return this.channel!;
  }
}
