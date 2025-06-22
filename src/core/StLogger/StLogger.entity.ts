import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../BaseEntity";

interface IStLogger {
  id?: number;
  status?: number;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  body?: string;
  queries?: string;
  params?: string;
  responseHeaders?: string;
  traceId?: string;
  sendData?: string;
  userId?: string;
}

@Entity({ name: "st_logger" })
export class StLogger extends BaseEntity implements IStLogger {
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ name: "status", type: "integer", nullable: true })
  status?: number | undefined;

  @Column({ name: "method", type: "varchar", nullable: true })
  method?: string | undefined;

  @Column({ name: "url", type: "varchar", nullable: true })
  url?: string | undefined;

  @Column({ name: "ip", type: "varchar", nullable: true })
  ip?: string | undefined;

  @Column({ name: "user_agent", type: "varchar", nullable: true })
  userAgent?: string | undefined;

  @Column({ name: "body", type: "varchar", nullable: true })
  body?: string | undefined;

  @Column({ name: "queries", type: "varchar", nullable: true })
  queries?: string | undefined;

  @Column({ name: "params", type: "varchar", nullable: true })
  params?: string | undefined;

  @Column({ name: "response_headers", type: "varchar", nullable: true })
  responseHeaders?: string | undefined;

  @Column({ name: "trace_id", type: "varchar", nullable: true })
  traceId?: string | undefined;

  @Column({ name: "send_data", type: "varchar", nullable: true })
  sendData?: string | undefined;

  @Column({ name: "user_id", type: "varchar", nullable: true })
  userId?: string | undefined;

  constructor(data?: IStLogger) {
    super();
    if (data) {
      this.status = data.status;
      this.method = data.method;
      this.url = data.url;
      this.ip = data.ip;
      this.userAgent = data.userAgent;
      this.body = data.body;
      this.queries = data.queries;
      this.params = data.params;
      this.responseHeaders = data.responseHeaders;
      this.traceId = data.traceId;
      this.sendData = data.sendData;
      this.userId = data.userId;
    }
  }
}
