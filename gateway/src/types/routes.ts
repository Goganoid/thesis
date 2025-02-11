import { RequestHandler } from 'express';

export type HttpMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';

export interface RouteConfig {
  downstreamPathTemplate: string;
  downstreamScheme: 'https' | 'http';
  downstreamHost: string;
  upstreamPathTemplate: string;
  upstreamHttpMethod: HttpMethod[] | 'all';
  middlewares?: RequestHandler[];
}

export interface GatewayConfig {
  routes: RouteConfig[];
  middlewares?: RequestHandler[];
}
