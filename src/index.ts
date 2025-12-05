import express from "express";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

const createEmailTemplate = (name: string, email: string, message: string) => {
  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #9c3232ff;">New Message from Portfolio Website</h2>
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

app.get("/", (_, res) => {
  try {
    res.status(200).json({ status: "API is live ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "API is Failed" });
  }
});

app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  const msg = {
    to: process.env.MY_EMAIL || "",
    from: process.env.MY_EMAIL || "",
    replyTo: email,
    subject: "Contact Form Portfolio",
    html: `<p><strong>${name}</strong></p><p>${message}</p>`,
  };

  try {
    await sgMail.send(msg);
    res.json({ status: "success", message: "Email sent ✔" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Email send failed" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
