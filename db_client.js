/*
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'devices_db',
  password: '321',
  port: 5432,
});

module.exports = {
  pool,
};
*/

const { Client } = require('pg');
require('dotenv').config();

module.exports.getClient = async () => {
  const client = new Client({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
	ssl: false,
  });
  /*client.connect(function () {
        console.log("connected");
    });*/
  await client.connect();
  return client;
};