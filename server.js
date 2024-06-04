const express = require('express');
const app = express();
const port = 3000;
const queryMix = `select dev.id, 
	                     dev.serijski_broj, 
	                     dev.poveznica, 
	                     vu.marka, 
	                     vu.model, 
	                     pro.prostor, 
	                     pro.detaljni_smjestaj,
						 pro.prostorna_odrednica,
	                     obj.lokacija
                    from public.prostorija pro
                    join public.uredaj dev
                      on pro.id = dev.prostorija_id
                    join public.vrsta_uredaja vu
                      on vu.id = dev.vrsta_id
                    join public.objekt obj
                      on pro.objekt_id = obj.id
	            order by dev.id ASC`;

app.get('/', (req, res) => {
  res.send('Hello World from Node.js server!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

var connection = require('./db_connect');
connection.pool;

app.get('/api/devices', (req, res) => {
  pool.query('SELECT * FROM uredaj', (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result.rows);
    }
  });
});

app.get('/api/locations', (req, res) => {
  pool.query('SELECT * FROM prostorija', (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result.rows);
    }
  });
});

app.get('/api/mix', (req, res) => {
  pool.query(queryMix, (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result.rows);
    }
  });
});