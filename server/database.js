import path from "path";
import { config } from "dotenv";
import {createClient} from "redis";
import { Sequelize } from "sequelize";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

config({ path: path.join(__dirname, "..", ".env") });

const dbName = process.env.POSTGRES_DB;
const dbUser = process.env.POSTGRES_USER;
const dbPassword = process.env.POSTGRES_PASSWORD;

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "postgres",
  timezone: "-03:00",
  logging: false,
});

export const redis = createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
})