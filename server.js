var express = require('express');
var bodyParser = require('body-parser');
var app  = express();
var cors = require('cors');
var morgan = require('morgan')
var config = require('./src/config/config');
var connection = require('./src/config/connection');
var userRoute = require('./src/routes/userRoute');
var adminRoute = require('./src/routes/adminRoute');

app.use(bodyParser.json({limit:"100mb"}));

app.use(cors());
app.use(morgan('dev'));

app.use('/user', userRoute);
app.use('/admin', adminRoute);

app.listen(config.PORT, ()=>{
    console.log("server listening on port ",config.PORT)
});