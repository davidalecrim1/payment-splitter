import mongoose from "mongoose";

export class MongoDbClient {
  private static instance: MongoDbClient;
  private url: string;
  private connected = false;

  private constructor(url?: string) {
    this.url =
      url ??
      (process.env.MONGODB_URL || "mongodb://localhost:27017/payment-splitter");
  }

  public static getInstance(url?: string): MongoDbClient {
    if (!MongoDbClient.instance) {
      MongoDbClient.instance = new MongoDbClient(url);
    }
    return MongoDbClient.instance;
  }

  public async connect(): Promise<void> {
    if (this.connected || mongoose.connection.readyState >= 1) {
      return;
    }
    try {
      await mongoose.connect(this.url);
      this.connected = true;
      console.log("MongoDB connected!");
    } catch (err) {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.connected) return;
    await mongoose.disconnect();
    this.connected = false;
    console.log("MongoDB disconnected!");
  }
}
