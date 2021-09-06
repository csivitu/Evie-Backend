const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
require('./mongoinit');

const calendarRouter = require('./routers/calendarRouter');
const adminRouter = require('./routers/adminRouter');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', calendarRouter);
app.use('/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
