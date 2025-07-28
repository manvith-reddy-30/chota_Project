import nodemailer from "nodemailer";

// ✅ Configure mail transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Send invoice email with PDF attachment
export const sendInvoiceMail = async (to, buffer) => {
  try {
    await transporter.sendMail({
      from: `"Cuisine Craze" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Order Invoice",
      text: "Thanks for ordering with Cuisine Craze! Please find your invoice attached.",
      attachments: [
        {
          filename: "invoice.pdf",
          content: buffer,
          contentType: "application/pdf",
        },
      ],
    });
    console.log(`📧 Invoice email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send invoice email to ${to}:`, error);
    // You may want to log this somewhere or retry later in production
  }
};
