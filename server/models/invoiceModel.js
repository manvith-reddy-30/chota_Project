import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  userId: { type: String, required: true },
  invoiceData: { type: Buffer, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Invoice", invoiceSchema);
