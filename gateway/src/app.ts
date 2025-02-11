import express from 'express';
import bodyParser from 'body-parser';
import { initGatewayRouter } from './init';
const app = express();

const port = 6006;

const router = initGatewayRouter({
  routes: [
    {
      downstreamHost: 'localhost:3566',
      downstreamScheme: 'http',
      downstreamPathTemplate: 'abc',
      upstreamHttpMethod: 'all',
      upstreamPathTemplate: '/hello/*',
    },
    {
      downstreamHost: 'localhost:3566',
      downstreamScheme: 'http',
      downstreamPathTemplate: 'abc',
      upstreamHttpMethod: 'all',
      upstreamPathTemplate: '/world/:id',
    },
  ],
  // TODO: add cors
  middlewares: [
    bodyParser.json(),
    (req, res, next) => {
      console.log('Express received request', req.url);
      next();
    },
  ],
});

app.use(router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
