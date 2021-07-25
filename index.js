const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const calendarRouter = require('./routers/calendarRouter')

const PORT = process.env.PORT || 3001

const app = express();
mongoose.connect(process.env.MONGO, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
mongoose.Promise = global.Promise;
app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use('/api', calendarRouter);

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})