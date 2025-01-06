import { NextFunction, Request, Response } from "express";
import log from "../log";
import { ContextProvider } from "@smoke-trees/smoke-context";
import { StLoggerDao } from "./StLogger.dao";
import { Settings } from "../settings";

export function StLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
  stLoggerDao?: StLoggerDao,
  setting?: Settings
) {
  try {
    const originalSend = res.send;
    let sendData = "";
    res.send = function(data) {
      if (typeof data === "string") {
        sendData = data;
      }
      return originalSend.call(this, data);
    };
    res.on("finish", () => {
      const context = ContextProvider.getContext();
      const traceId = context?.traceId
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
        userId: context?.values?.id || context?.values?.userId
      };
      if (logValues.method !== "GET" && stLoggerDao && setting?.loggerEnable) {
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
