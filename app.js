const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('config');

const v1 = require('./apiVersions/v1');
const {
  refreshTokenMiddleware,
  errorMiddleware,
  finalResponseMiddleware,
} = require('./middleware');

const app = express();

app.use(express.json());

app.use(bodyParser.urlencoded({extended: true}));

app.use(
  cors({
    exposedHeaders: [config.get('tokenVariable')],
  })
);

v1.prepareV1Routes(app);

app.use(refreshTokenMiddleware);

app.use(errorMiddleware);

app.use(finalResponseMiddleware);

app.get('/awake', (req, res) => {
  res.json();
});

// All other GET requests not handled before will return simple HTML
app.use((req, res, next) => {
  res.status(200).setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>This is an Express Server</h1></body></html>');
});

const PORT = config.get('port') || 3001;

module.exports = app;
