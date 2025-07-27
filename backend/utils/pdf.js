import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

const generateInvoicePDF = async ({ customerName, customerEmail, items, totalPrice, orderId }) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 900]);
  const { height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 40;

  const drawText = (text, x, y, size = 12, bold = false, color = rgb(0, 0, 0)) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: bold ? boldFont : font,
      color,
    });
  };

  // 🔵 Title
  drawText("Cuisine Craze - Tax Invoice", 160, y, 16, true, rgb(0, 0, 1));

  // 🟢 Company info
  y -= 30;
  drawText("Cuisine Craze Restaurant", 50, y, 12, true);
  drawText("123 Street Name, City, India - 500001", 50, y - 15);
  drawText("Contact: +91-9876543210 | support@cuisinecraze.com", 50, y - 30);

  // 🔹 Invoice details
  y -= 60;
  drawText(`Invoice No: INV-${Date.now().toString().slice(-6)}`, 50, y);
  drawText("Payment Method: Online", 50, y - 20);
  drawText(`Date: ${new Date().toLocaleDateString()}`, 400, y);

  // 🔸 Customer info
  y -= 50;
  drawText(`Customer Name: ${customerName}`, 50, y);
  drawText(`Customer Email: ${customerEmail}`, 50, y - 20);

  // 📦 Item Table Header
  y -= 50;
  drawText("Item", 50, y, 12, true);
  drawText("Qty", 300, y, 12, true);
  drawText("Price (Rs.)", 400, y, 12, true);

  // 🛒 Items
  y -= 20;
  items.forEach((item) => {
    drawText(item.name, 50, y);
    drawText(String(item.quantity), 300, y);
    drawText(item.price.toFixed(2), 400, y);
    y -= 20;
  });

  drawText("__________________________________________________", 50, y);
  y -= 20;

  // 💰 Totals
  drawText(`Subtotal: Rs. ${totalPrice.toFixed(2)}`, 50, y, 12, true);
  drawText(`GST: Rs. 0.00`, 50, y - 20, 12, true);
  drawText(`Total Amount: Rs. ${totalPrice.toFixed(2)}`, 50, y - 40, 14, true, rgb(0, 0.6, 0));

  // 💡 Quote + Thanks
  y -= 80;
  drawText(`"Good food is the foundation of genuine happiness." – Auguste Escoffier`, 50, y, 10);
  drawText(`Thank you for ordering with Cuisine Craze!`, 50, y - 20, 12, false, rgb(0, 0.6, 0));

  // 🧾 Optional QR (if image exists)
  const qrPath = path.resolve("assets", "qr.png");
  if (fs.existsSync(qrPath)) {
    const qrBytes = fs.readFileSync(qrPath);
    const qrImage = await pdfDoc.embedPng(qrBytes);
    const qrDims = qrImage.scale(1.2);
    page.drawImage(qrImage, {
      x: 440,
      y: 90,
      width: qrDims.width,
      height: qrDims.height,
    });
    drawText("Scan for Support", 440, 85);
  }

  // ✍️ Signature (if image exists)
  const signaturePath = path.resolve("assets", "signature.png");
  if (fs.existsSync(signaturePath)) {
    const sigBytes = fs.readFileSync(signaturePath);
    const sigImage = await pdfDoc.embedPng(sigBytes);
    const sigDims = sigImage.scale(0.5);
    page.drawImage(sigImage, {
      x: 440,
      y: 30,
      width: sigDims.width,
      height: sigDims.height,
    });
    drawText("Authorized Signature", 440, 25 - sigDims.height, 10);
  }

  // 🧾 Footer
  drawText("This is a system-generated invoice. No signature required.", 50, 15, 8, false, rgb(0.4, 0.4, 0.4));

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

export { generateInvoicePDF };
