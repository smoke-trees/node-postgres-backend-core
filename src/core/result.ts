export enum ErrorCode {
  Success = '200',
  Created = '201',
  BadRequest = '400',
  NotAuthorized = '401',
  NotFound = '404',
  NoUpdatesPerformed = '405',
  InternalServerError = '500',
  DatabaseError = '500'
}

export enum ErrorCode {
  Test = 1
};


export interface IResult<T> {
  status: {
    code: ErrorCode;
    error: boolean;
  };
  message?: string;
  result?: T | null;
}

export type WithCount<T> = T & { count: number | null }

export class Result<T> implements IResult<T> {
  status: { code: ErrorCode; error: boolean; };
  message?: string;
  result?: T | null

  /**
   * Get the status code of the result 
   * @param error Error flag
   * @param code Error Code
   * @param message Message to return
   * @param result Result for operation 
   */
  constructor(error: boolean, code: ErrorCode, message?: string, result?: T) {
    this.status = {
      code,
      error
    }
    this.message = message;
    this.result = result ?? null
  }
  /**
   * Get the status code of the result 
   * @returns Status Code
   */
  getStatus(): number {
    switch (this.status.code) {
      case ErrorCode.Success:
      case ErrorCode.NoUpdatesPerformed:
        return 200;
      case ErrorCode.Created:
        return 201;
      case ErrorCode.BadRequest:
        return 400;
      case ErrorCode.NotAuthorized:
        return 401;
      case ErrorCode.NotFound:
        return 404;
      case ErrorCode.InternalServerError:
      case ErrorCode.DatabaseError:
      default:
        return 500;

    }
  }
}

export class ResultWithCount<T> extends Result<T> implements WithCount<IResult<T>> {

  count: number | null;

  /**
   * Get the result object
   * @param error Error flag
   * @param code Error Code
   * @param message Message to return
   * @param result Result for operation 
   * @param count Count of items in result
   */
  constructor(error: boolean, code: ErrorCode, message?: string, result?: T, count?: number) {
    super(error, code, message)
    this.status = {
      code,
      error
    }
    this.message = message;
    this.result = result ?? null
    this.count = count ?? null
  }
}