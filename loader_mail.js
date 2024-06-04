require('dotenv').config();
const { readMail } = require('./mail');

const bootstrap = async () => {
  await readMail();
};

bootstrap();