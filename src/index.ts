import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const createEmailTemplate = (name: string, email: string, message: string) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #0a74da;">New Message from Portfolio Website</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Message:</strong></p>
    <p style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${message}</p>
    <hr />
    <p style="font-size: 0.9rem; color: #888;">Sent via My Portfolio Contact Form</p>
  </div>
  `;
};

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`, // your verified email
      to: process.env.MY_EMAIL, // your inbox
      replyTo: email, // visitor's email
      subject: "Contact From Portfolio Website",
      text: message,
      html: createEmailTemplate(name, email, message),
    });

    res
      .status(200)
      .json({ status: "success", message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Failed to send email" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
