import { ContextProvider } from "@smoke-trees/smoke-context";
import { NextFunction, Request, Response } from "express";
import log from "../log";
import { Settings } from "../settings";
import { StLoggerDao } from "./StLogger.dao";

export let cbCount = 0;
let circuitBreakerEnabled = false;

export function enableLoggerCircuitBreaker(
  settings: Settings,
  circuitBreakerCallback?: Function
) {
  if (circuitBreakerEnabled) {
    return;
  }
  circuitBreakerEnabled = true;
  if (settings.loggerEnable) {
    setInterval(() => {
      if (cbCount < settings.loggerCircuitBreakerCount) {
        cbCount = 0;
        return;
      }

      cbCount = 0;
      settings.loggerEnable = false;
      if (circuitBreakerCallback) {
        circuitBreakerCallback();
      }
    }, settings.loggerCircuitBreakerTime);
  }
}

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
    res.send = function (data) {
      if (typeof data === "string") {
        sendData = data;
      }
      return originalSend.call(this, data);
    };
    res.on("finish", () => {
      const context = ContextProvider.getContext();
      const traceId = context?.traceId;
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
        userId: context?.values?.id || context?.values?.userId,
      };

      // Code is bad for optimization reason. Talk to @achhapolia10 for more info.
      if (setting?.loggerEnable) {
        if (
          (res.statusCode < 200 || res.statusCode > 399) &&
          res.statusCode !== 404
        ) {
          if (stLoggerDao) {
            console.log("count ++");
            cbCount++;
            stLoggerDao.create(logValues);
          }
        }
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
