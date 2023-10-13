const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const app = express();

require('dotenv').config(); // Load environment variables from .env file if present

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files (like HTML, CSS, JS) from the "public" directory

// const dbConfig = {
//     user: 'your_username',
//     password: 'your_password',
//     server: 'localhost',
//     database: 'YourDB',
//     options: {
//         encrypt: false,
//         trustServerCertificate: true, // Use only for development and be cautious of security implications
//     },
// };

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),  // Ensure the port is an integer
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false, // or true if you're on Windows Azure
    trustServerCertificate: true, // Use only for development and be cautious of security implications
  },
};

// Establish database connection
sql.connect(dbConfig).catch(err => console.error('Database connection error:', err));

// Endpoint to get all table names
app.get('/tables', async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query(`
            SELECT t.name
            FROM sys.tables t
            INNER JOIN sys.schemas s 
            ON t.schema_id = s.schema_id
            WHERE t.type_desc = 'USER_TABLE'
        `);

    console.log(result.recordset);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Endpoint to get data from a specific table
app.get('/data/:tableName', async (req, res) => {
  try {
    // // Validate and sanitize inputs to prevent SQL injection
    // const validTableNames = ['table1', 'table2']; // Replace with your actual table names
    // if (!validTableNames.includes(req.params.tableName)) {
    //     return res.status(400).send('Invalid table name');
    // }

    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query(`SELECT * FROM ${req.params.tableName}`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.post('/query', async (req, res) => {
  try {
    const userQuery = stripLineBreaks(req.body.query);

    // WARNING: Allowing user-supplied input in a SQL query like this is insecure 
    // and opens your app to SQL Injection attacks. Never do this in production code.

    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query(userQuery);

    // if result.recordset is undefined, then the query was not a SELECT statement
    // so we return the number of rows affected by the query
    if (!result.recordset) {
      return res.json({ rowsAffected: result.rowsAffected[0] });
    }

    res.json(result.recordset);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// helper function to strip line breaks
function stripLineBreaks(str) {
  // Replace line breaks with a space
  return str.replace(/[\r\n]+/g, ' ');
}
