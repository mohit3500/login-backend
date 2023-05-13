const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const port = process.env.Port || 8000;

app.use(express.json());
app.use(cors({ credentials: true, origin: 'http://127.0.0.1:5173' }));
app.use(morgan('tiny'));

app.use('/api', require('./routes/route'));

mongoose
  .connect(process.env.MongoURl)
  .then(() => {
    console.log('Database Connected');
    app.listen(port, () => {
      console.log(`Server running at ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
