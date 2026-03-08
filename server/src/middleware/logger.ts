import { Request, Response, NextFunction } from 'express';

/** Structured request/response logger. Outputs one JSON line per request. */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: res.statusCode,
        latencyMs: Date.now() - start,
        ip: req.ip,
      }),
    );
  });

  next();
}
