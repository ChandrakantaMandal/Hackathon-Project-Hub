import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

export const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_API_TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};

const recipients = [
  {
    email: "haboloh582@agenra.com",
  }
];
