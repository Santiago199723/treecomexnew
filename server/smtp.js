import { config } from "dotenv";
import nodemailer from "nodemailer"
import { resetPassword } from "./messages.js"

import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: join(__dirname, "..", ".env") });

export let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
})

export function sendRecoveryEmail(to, url) {
    const text =  resetPassword.replace("%e", to).replace("%l", url)

    const opts = {
        from: process.env.SMTP_EMAIL,
        to: to,
        subject: "REDIFINIÇÃO DE SENHA",
        text: text
    }

    try {
        transporter.sendMail(opts, (err, _) => {
            if (err) {
                throw new Error(err)
            }
        })

        return true
    } catch (_) {
        return false;
    }
}