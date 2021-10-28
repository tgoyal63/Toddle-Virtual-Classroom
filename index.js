require('dotenv').config({ path: './.env' });

// Importing Node Modules
const express = require('express');
const cors = require('cors');

// Importing File Dependencies
const userRoutes = require('./routes/user.routes');
const db = require('./utils/db.utils');

// App setup
const app = express();
const port = parseInt(process.env.APP_PORT, 10) || 3000;

// Implementing CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({
  extended: true,
}));

/**
 * App Routes
 */
app.get('/', (req, res) => {
  res.send('Welcome to Virtual Classroom. You can access to our documentation by visiting https://documenter.getpostman.com/view/10110440/UV5deEZQ');
});

app.use('/', userRoutes);

app.use((err, req, res) => {
  res.status(500).send({ message: err.message });
});

/**
 * To make sure, app start only if database is found
 */
db.safeConnect().then(
  () => app.listen(port, () => console.log(`Webservice listening on port: ${port}`)),
);
