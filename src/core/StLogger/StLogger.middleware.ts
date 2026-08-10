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
export type StLoggerValues = {
  status: number;
  method: string;
  url: string;
  ip?: string;
  userAgent?: string;
  body: string;
  queries: string;
  params: string;
  responseHeaders: string;
  traceId: string;
  sendData: string;
  userId: string;
  length: number;
};

export function StLoggerMiddleware({
  stLoggerDao,
  setting,
  extractStLoggerValues,
  valueLogger = (values: StLoggerValues) => {
    log.info(
      `Request ${values.method} ${values.url} from ${values.ip} with traceId ${values.traceId}, response: status: ${values.status} content length: ${values.length}`
    );
  },
}: {
  stLoggerDao?: StLoggerDao;
  setting?: Settings;
  extractStLoggerValues?: (req: Request, res: Response) => StLoggerValues;
  valueLogger?: (values: StLoggerValues) => void;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
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
        let logValues: StLoggerValues;
        if (extractStLoggerValues) {
          logValues = extractStLoggerValues(req, res);
        } else {
          logValues = {
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
            length: sendData.length,
          };
        }

        // Code is bad for optimization reason. Talk to @achhapolia10 for more info.
        if (setting?.loggerEnable) {
          if (
            (res.statusCode < 200 || res.statusCode > 399) &&
            res.statusCode !== 404
          ) {
            if (stLoggerDao) {
              cbCount++;
              stLoggerDao.create(logValues);
            }
          }
        }

        valueLogger(logValues);
      });
    } catch (e) {
      log.error("Error in St Logger", "StLoggerMiddleware", e);
    } finally {
      next();
    }
  };
}
