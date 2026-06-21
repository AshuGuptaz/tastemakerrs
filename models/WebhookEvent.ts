import mongoose, { Schema, Model } from "mongoose";

export interface IWebhookEvent {
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    eventId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const WebhookEvent: Model<IWebhookEvent> =
  (mongoose.models.WebhookEvent as Model<IWebhookEvent>) ||
  mongoose.model<IWebhookEvent>("WebhookEvent", WebhookEventSchema);
