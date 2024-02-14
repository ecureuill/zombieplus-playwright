import { Pool } from 'pg';
import dotenv from 'dotenv';
import { expect } from '@playwright/test';

dotenv.config();

const DbConfig = {
  host: process.env.DB_HOST?? "",
  user: process.env.DB_USER?? "",
  password: process.env.DB_PASS?? "",
  port:  process.env.DB_PORT? parseInt(process.env.DB_PORT): 5432,
  database: process.env.DB_NAME?? ""
};

export const API_HOST = process.env.API_HOST?? "";
export const API_USER = process.env.API_USER?? "";
export const API_PWD = process.env.API_PWD?? "";

export const executeSQL = async (script: string) => {
  
  try {
    const pool = new Pool(DbConfig);
    const client = await pool.connect();
  
    console.info(`SQL EXECUTION using config
      ${DbConfig.host}:${DbConfig.port};${DbConfig.user};${DbConfig.password};${DbConfig.database}`);

    const result = await client.query(script);
    console.info(`SQL query '${script}' run with success`);
    expect(result.rowCount).toBeGreaterThanOrEqual(0);
  
  } catch (error) {
    console.error(`SQL execution error while running query "${script}" using config
      ${DbConfig.host}:${DbConfig.port};${DbConfig.user};${DbConfig.password};${DbConfig.database} \n${error}`);
  }

}