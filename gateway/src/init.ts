import express, { Request as ExpressRequest, RequestHandler } from 'express';
import { IncomingHttpHeaders } from 'http';
import { GatewayConfig, HttpMethod, RouteConfig } from './types/routes';

const mapExpressToFetchHeaders = (headers: IncomingHttpHeaders) => {
  const fetchHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') {
      headers[key] = value;
    }
  }
  return new Headers(fetchHeaders);
};

const getDownstreamRequest = (
  upstreamRequest: ExpressRequest,
  route: RouteConfig,
): { url: string; init: RequestInit } => {
  // TODO: replace params
  const url = `${route.downstreamScheme}://${route.downstreamHost}/${route.downstreamPathTemplate}`;
  return {
    url,
    init: {
      body: upstreamRequest.body ? JSON.stringify(upstreamRequest.body) : null,
      headers: mapExpressToFetchHeaders(upstreamRequest.headers),
      method: upstreamRequest.method,
    },
  };
};

const appendRouteHandler = (router: express.Router, route: RouteConfig) => {
  const handler: RequestHandler = async (req, res) => {
    try {
      const { init, url } = getDownstreamRequest(req, route);
      const downstreamResponse = await fetch(url, init);
      const body = await downstreamResponse.json();
      res.status(downstreamResponse.status).json(body);
    } catch (e) {
      console.log('Unexpected error', e);
      res.status(500).json({ message: 'Internal server error' });
    }
    res.send();
  };
  const params: [string, ...handlers: RequestHandler[]] = [
    route.upstreamPathTemplate,
    ...(route.middlewares ?? []),
    handler,
  ];
  const methodHandlers: Record<HttpMethod | 'all', () => void> = {
    DELETE: () => router.delete(...params),
    GET: () => router.get(...params),
    PATCH: () => router.patch(...params),
    POST: () => router.post(...params),
    PUT: () => router.put(...params),
    all: () => router.all(...params),
  };
  if (Array.isArray(route.upstreamHttpMethod)) {
    route.upstreamHttpMethod.forEach((method) => methodHandlers[method]());
  } else {
    methodHandlers['all']();
  }
};

export const initGatewayRouter = (config: GatewayConfig) => {
  const router = express.Router();
  if (config.middlewares?.length) {
    for (const middleware of config.middlewares) {
      router.use(middleware);
    }
  }

  for (const route of config.routes) {
    appendRouteHandler(router, route);
  }
  return router;
};
