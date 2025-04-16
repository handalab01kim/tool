const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const { db, tablesToWatch } = require('./config');

const app = express();
const pool = new Pool(db);
const PORT = 5000;

app.use(cors());
app.use(express.static('public')); // index.html

// query string을 받기 위해 필요
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  

app.get('/data', async (req, res) => {
  const result = {};

  for (let table of tablesToWatch) {
    try {
        let query;
        if(table!=="member")
            query = `SELECT * FROM "${table}" ORDER BY id ASC;`;
        else
            query = `SELECT * FROM "${table}" ORDER BY admin DESC, email ASC;`;
      const { rows } = await pool.query(query);
      result[table] = rows;
    } catch (err) {
      result[table] = { error: err.message };
    }
  }

  res.json(result);
});

app.get('/systemlog', async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const result = {
      rows: [],
      total: 0
    };
  
    try {
      const countQuery = `SELECT COUNT(*) FROM private.systemlog`;
    //   const dataQuery = `SELECT idx, process, message, to_char(time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Seoul', 'YYYY-MM-DD HH24:MI:SS.MS') time FROM private.systemlog ORDER BY idx DESC LIMIT $1 OFFSET $2`;
      const dataQuery = `SELECT idx, process, message, to_char(time, 'YYYY-MM-DD HH24:MI:SS.MS') time FROM private.systemlog ORDER BY idx DESC LIMIT $1 OFFSET $2`;
  
      const countResult = await pool.query(countQuery);
      const dataResult = await pool.query(dataQuery, [limit, offset]);
  
      result.total = parseInt(countResult.rows[0].count);
      result.rows = dataResult.rows;
  
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

app.get('/histories', async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const result = {
      rows: [],
      total: 0
    };
  
    try {
      const countQuery = `SELECT COUNT(*) FROM public."history"`;
      const dataQuery = `SELECT idx, id, name, to_char(time, 'YYYY-MM-DD HH24:MI:SS.MS') time FROM public."history" ORDER BY idx DESC LIMIT $1 OFFSET $2`;
  
      const countResult = await pool.query(countQuery);
      const dataResult = await pool.query(dataQuery, [limit, offset]);
  
      result.total = parseInt(countResult.rows[0].count);
      result.rows = dataResult.rows;
  
      res.json(result);
    } catch (err) {
        console.log(err);
      res.status(500).json({ error: err.message });
    }
});




// sql 실행 라우터
app.post('/execute-sql', async (req, res) => {
    const { query } = req.body;
  
    if (typeof query !== 'string') return res.status(400).send('Invalid query');
  
    try {
      const result = await pool.query(query);
      res.status(200).json({ result });
    } catch (err) {
      console.error('SQL Error:', err);
      res.status(500).send('Query failed');
    }
});
  




app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
