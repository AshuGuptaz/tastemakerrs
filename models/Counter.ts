import mongoose, { Schema, Model } from "mongoose";

export interface ICounter {
  _id: string;
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

export const Counter: Model<ICounter> =
  (mongoose.models.Counter as Model<ICounter>) || mongoose.model<ICounter>("Counter", CounterSchema);

export async function nextSeq(name: string): Promise<number> {
  const doc = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return doc!.seq;
}
