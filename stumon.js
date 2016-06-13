/* 
 * Copyright (C) 2016 Daan Pape
 * 
 * Written by Daan Pape <daan@dptechnics.com>
 */

var express = require('express');
var app = express();

app.get('/userapi/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Stumon server started listening on port 3000');
});
