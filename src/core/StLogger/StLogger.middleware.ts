import { NextFunction, Request, Response } from "express";
import log from "../log";
import { ContextProvider } from "@smoke-trees/smoke-context";
import { StLoggerDao } from "./StLogger.dao";

export function StLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
  stLoggerDao?: StLoggerDao
) {
  try {
    const originalSend = res.send;
    let sendData = "";
    res.send = function (data) {
      if (typeof data === "string") {
        sendData = data;
      }
      return originalSend.call(this, data);
    };
    res.on("finish", () => {
      const traceId = ContextProvider.getContext().traceId;
      const logValues = {
        status: res.statusCode,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get("user-agent"),
        body:
          req.headers["content-type"]?.toLowerCase() === "application/json"
            ? JSON.stringify(req.body || {})
            : "Non JSON Body",
        queries: JSON.stringify(req.query || {}),
        params: JSON.stringify(req.params || {}),
        responseHeaders: JSON.stringify(res.getHeaders()),
        traceId,
        sendData,
      };
      if (logValues.method !== "GET" && stLoggerDao) {
        stLoggerDao.create(logValues);
      }
      log.info(
        `Request ${req.method} ${req.originalUrl} from ${req.ip} with traceId ${traceId}, response: status: ${res.statusCode} content length: ${sendData.length}`
      );
    });
  } catch (e) {
    log.error("Error in St Logger", "StLoggerMiddleware", e);
  } finally {
    next();
  }
}
