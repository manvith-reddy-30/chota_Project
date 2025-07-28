import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import invoiceModel from "../models/invoiceModel.js";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import { generateInvoicePDF } from "../utils/pdf.js";
import { sendInvoiceMail } from "../utils/email.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Place Order
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL;
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { items, amount, address } = req.body;

    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      payment: false,
      status: "pending",
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add delivery charge
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery Charges" },
        unit_amount: 200,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.status(201).json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ success: false, message: "Error placing order" });
  }
};

// Verify Order Payment
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;

  try {
    if (!orderId) return res.status(400).json({ success: false, message: "Order ID missing" });

    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (success) {
      order.payment = true;
      order.status = "paid";
      await order.save();

      const user = await userModel.findById(order.userId);
      if (user) {
        const invoiceData = {
          customerName: user.name,
          customerEmail: user.email,
          items: order.items,
          totalPrice: order.amount,
          orderId: order._id.toString(),
        };

        const pdfBuffer = await generateInvoicePDF(invoiceData);
        await sendInvoiceMail(user.email, pdfBuffer);

        const invoiceDoc = new invoiceModel({
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          orderId: order._id.toString(),
          userId: user._id.toString(),
          invoiceData: pdfBuffer,
          createdAt: new Date(),
        });

        await invoiceDoc.save();
        console.log("✅ Invoice saved to DB & email sent to:", user.email);
      }

      res.status(200).json({ success: true, message: "Payment verified, invoice sent." });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.status(200).json({ success: false, message: "Payment failed, order removed." });
    }
  } catch (error) {
    console.error("Verify order error:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};

// Get orders of logged-in user
const userOrders = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const orders = await orderModel.find({ userId });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("User orders error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Admin: List all orders
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("List orders error:", error);
    res.status(500).json({ success: false, message: "Error listing orders" });
  }
};

// Admin: Update order status
const updateStatus = async (req, res) => {
  const { orderId, status } = req.body;
  try {
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.status(200).json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
