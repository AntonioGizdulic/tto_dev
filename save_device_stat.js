const { getClient } = require('./db_client');
/*
(async () => {
  const client = await getClient();
  const name = process.argv[2] ?? 'john';
  let insertRow = await client.query('INSERT INTO my_table(name) VALUES($1);', [`${name}`]);
  console.log(`Inserted ${insertRow.rowCount} row`);
  await client.end();
})();
*/

async function saveDeviceStat(datum, ukupno, boja, crno, u_id) {
  const client = await getClient();

  let insertRow = await client.query('INSERT INTO statistika (datum, ukupno_sve, ukupno_color, ukupno_black, uredaj_id) VALUES($1, $2, $3, $4, $5);', [`${datum}`, `${ukupno}`, `${boja}`, `${crno}`, `${u_id}`]);
  console.log(`Inserted ${insertRow.rowCount} row`);
  await client.end();
}

module.exports = { saveDeviceStat };