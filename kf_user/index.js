const express = require('express');
const axios = require('axios');
const { createLogger, transports, format } = require('winston');
const {ElasticsearchTransport} = require('winston-elasticsearch');

const app = express();
const port = 3002;

// const esClient = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });

const esTransportOpts = {
  level: 'info',
  clientOpts: { node: 'http://elasticsearch:9200' },
  indexPrefix: 'kf_info_logs',
  transformer: (logData) => ({
    '@timestamp': new Date().toISOString(),
    severity: logData.level,
    message: logData.message,
    fields: logData.meta,
  }),
};

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new ElasticsearchTransport(esTransportOpts)
  ]
});

// const createIndex = async () => {
//   const indexName = 'kf_user_logs';
//   try {
//     const { body: exists } = await esClient.indices.exists({ index: indexName });
//     if (!exists) {
//       await esClient.indices.create({ index: indexName });
//       console.log(`Index ${indexName} created`);
//     }
//   } catch (error) {
//     console.error('Error creating index:', error);
//   }
// };

// createIndex().catch(console.error);

app.use((req, res, next) => {
  // logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.get('/call-kf-info', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3001/api');
    logger.info({message: 'Successfully called kf_info', severity: 'info'});
    res.send(response.data);
  } catch (error) {
    logger.error('Error calling kf_info', { error: error.message });
    res.status(500).send('Error calling kf_info');
  }
});

app.listen(port, () => {
  console.log(port);
  logger.info(`KF User started on port ${port}`);
});
