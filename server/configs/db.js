import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL);
console.log("DB URL:", process.env.DATABASE_URL);

async function testDB() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log("DB connected:", result);
  } catch (err) {
    console.error("DB connection error:", err.message);
  }
}

testDB();
export default sql;