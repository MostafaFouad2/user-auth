const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');

const app = express();

const MONGODB_URI =
  'mongodb://127.0.0.1:27017/userAuth';



app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json())

app.use(authRoutes);



mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(result => {
    console.log("App lissten 3000");
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
