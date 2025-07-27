import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendInvoiceMail = async (to, buffer) => {
  await transporter.sendMail({
    from: `"Cuisine Craze" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Order Invoice",
    text: "Thanks for ordering with Cuisine Craze! Find your invoice attached.",
    attachments: [
      {
        filename: "invoice.pdf",
        content: buffer,
        contentType: "application/pdf",
      },
    ],
  });
};
