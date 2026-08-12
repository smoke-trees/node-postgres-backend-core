# AGENTS.md — @smoke-trees/postgres-backend Core Guide

This document serves as the authoritative reference for AI agents (and human developers) creating microservices or backends that consume `@smoke-trees/postgres-backend`. Reading this document eliminates the need to inspect the core library source code.

---

## 1. Overview & Architecture

`@smoke-trees/postgres-backend` provides an enterprise-ready, multi-tiered backend architecture built on **TypeScript**, **Express 5**, and **TypeORM**.

Downstream applications structure feature modules around a strict 5-tier architecture:

```
          ┌──────────────────────────────────────────┐
          │               Application                │
          └─────────────────────┬────────────────────┘
                                │
          ┌─────────────────────▼────────────────────┘
          │          Controller / ServiceController  │
          └─────────────────────┬────────────────────┘
                                │
          ┌─────────────────────▼────────────────────┘
          │             Service<Entity>              │
          └─────────────────────┬────────────────────┘
                                │
          ┌─────────────────────▼────────────────────┘
          │               Dao<Entity>                │
          └─────────────────────┬────────────────────┘
                                │
          ┌─────────────────────▼────────────────────┘
          │           BaseEntity / TypeORM           │
          └──────────────────────────────────────────┘
```

---

## 2. Exports Summary (`@smoke-trees/postgres-backend`)

All public symbols are exported from `index.ts`:

```typescript
import {
  Application,
  BaseEntity,
  BaseEntityConstructor,
  Controller,
  createEntity,
  Dao,
  Database,
  defaultValidator,
  Documentation,
  ErrorCode,
  ILocalMiddleware,
  IPathsOptions,
  IResult,
  IServiceControllerOptions,
  IServiceControllerPathOptions,
  ISettings,
  log,
  Methods,
  QueryOption,
  ReadManyOption,
  Result,
  ResultWithCount,
  Route,
  SelectedFields,
  SelectedRead,
  Sequence,
  Service,
  ServiceController,
  Settings,
  Validator,
  ValidatorFunction,
  ValidatorOptions,
  WithCount
} from "@smoke-trees/postgres-backend";
```

---

## 3. Core Components Reference

### 3.1 `BaseEntity`
- **Location**: `src/core/BaseEntity.ts`
- **Purpose**: Base class for TypeORM entities.
- **Fields**:
  - `id`: `string | number` (Primary key)
  - `updatedAt`: `Date` (`@UpdateDateColumn({ name: "updated_at", type: "timestamp" })`)
  - `createdAt`: `Date` (`@CreateDateColumn({ name: "created_at", type: "timestamp" })`)
- **Helper**: `createEntity<T>(ctor: BaseEntityConstructor<T>, data: any)` instantiates an entity.

### 3.2 `Dao<Entity extends BaseEntity>`
- **Location**: `src/core/Dao.ts`
- **Purpose**: Data Access Object wrapping TypeORM `Repository` operations.
- **Constructor**: `new Dao(database: Database, entity: EntityTarget<Entity>, name: string)`
- **Methods**:
  - `create(value, manager?)`: Inserts partial entity or array of entities into DB. Returns `Promise<Result<number | string>>`.
  - `read(value, manager?)`: Fetches single entity by ID (`string | number`) or `FindOneOptions`. Returns `Promise<Result<SelectedRead<Entity>>>`.
  - `update(id, values, manager?)`: Updates entity by ID or `FindOptionsWhere`. Returns `Promise<Result<number | null>>` (affected rows).
  - `delete(id, manager?)`: Deletes entity by ID(s) or `FindOptionsWhere`. Returns `Promise<Result<number>>`.
  - `readMany(options?, manager?)`: Performs paginated queries. Returns `Promise<WithCount<Result<SelectedRead<Entity>[]>>>`.
- **Query Parser Helpers**:
  - `parseFilter(where)`: Converts string booleans (`"true"`/`"false"`) to booleans and arrays to TypeORM `In(...)`.
  - `parseForSort(field, order)`: Transforms dot-notation string fields (`"user.name"`) into nested TypeORM order objects.
  - `parseForLike(like, likeBehaviour)`: Converts search values into case-insensitive `ILike`.
  - `parseForDates(field, from, to, where)`: Wraps dates with `Between`, `MoreThanOrEqual`, or `LessThanOrEqual`.
- **Transaction Support**: Every method takes an optional `manager?: EntityManager`. Pass this parameter down when executing operations within a transaction.

### 3.3 `Service<Entity extends BaseEntity>`
- **Location**: `src/core/Service.ts`
- **Purpose**: Encapsulates business logic, delegating CRUD operations to `Dao<Entity>` and wrapping outcomes in standardized `Result` types.
- **Constructor**: `constructor(dao: Dao<Entity>)`
- **Methods**:
  - `readOne(filter, manager?)`: Returns `Promise<Result<SelectedRead<Entity> | null>>`.
  - `readMany(options?, manager?)`: Returns `Promise<WithCount<Result<SelectedRead<Entity>[]>>>`.
  - `create(value, manager?)`: Returns `Promise<Result<number | string | null>>`.
  - `update(id, values, manager?)`: Checks if record exists first via `readOne`, then delegates to `dao.update`.
  - `delete(id, manager?)`: Returns `Promise<Result<number | null>>`.

### 3.4 `Controller` & `ServiceController<Entity extends BaseEntity>`
- **Location**: `src/core/controller.ts` & `src/core/ServiceController.ts`
- **`Controller`**: Abstract base for custom HTTP routers.
  - Subclasses must implement `public abstract path: string` and `protected abstract controllers: Controller[]`.
  - `addRoutes(...routes: Route[])`: Registers custom handlers.
  - `handleException(handler)`: Wraps route handlers in try/catch, auto-returning HTTP 500 `Result` on uncaught exceptions.
  - `Methods` Enum: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`, `HEAD`, `ALL`.
- **`ServiceController<Entity>`**: Extends `Controller` to provide built-in REST endpoints:
  - `POST /` -> `create`
  - `GET /` -> `readMany` (Paginated, filtered, sorted)
  - `GET /:id` -> `readById`
  - `PUT /:id` -> `update`
  - `DELETE /:id` -> `delete`
- **Options (`IServiceControllerOptions`)**:
  - Toggle specific endpoints on/off via `paths`:
    ```typescript
    { paths: { create: true, delete: false, update: true, read: true, readMany: true, readManyWithoutPagination: true } }
    ```
- **Local Middleware (`ILocalMiddleware`)**:
  - Attach Express middleware per-path (e.g. `{ read: [authMiddleware] }`).

### 3.5 `Application` & `Settings`
- **Location**: `src/core/app.ts` & `src/core/settings.ts`
- **`Settings`**: Abstract class for configuration loaded via `dotenv`. Subclasses must supply DB credentials:
  - `databaseType`: `"postgres" | "mysql"`
  - `dbPassword`, `dbUser`, `dbHost`, `dbPort`, `database`
  - Default flags: `production`, `port` (default `"8080"`), `syncDatabase` (`!production`), `runMigrations` (`production`), `loggerEnable` (`true`).
- **`Application`**: Express wrapper.
  - Constructor: `new Application(settings: Settings, database?: Database)`
  - `addController(controller)`: Mounts controller and triggers OpenAPI documentation loading.
  - `addMiddleWare(...middleware)`: Adds global Express middleware.
  - `loadControllers()`: Registers routes and health check endpoint `/health`.
  - `run()`: Starts listening on `process.env.PORT` or default `"8080"`.

### 3.6 `Database`
- **Location**: `src/core/database.ts`
- **Purpose**: TypeORM `DataSource` wrapper.
- **Methods**:
  - `addEntity(...entity)`: Registers entities before connecting.
  - `addMigration(...migration)`: Registers migrations.
  - `connect()`: Connects to DB and initializes schema/migrations.
  - `getConnection()`: Returns raw TypeORM `DataSource`.

### 3.7 `Result`, `ResultWithCount`, and `ErrorCode`
- **Location**: `src/core/result.ts`
- **Response Format**:
  ```json
  {
    "status": {
      "code": "200",
      "error": false
    },
    "message": "Success message",
    "result": { ... }
  }
  ```
- **`ErrorCode` Values**:
  - `"200"`: `ErrorCode.Success` (HTTP 200)
  - `"201"`: `ErrorCode.Created` (HTTP 201)
  - `"400"`: `ErrorCode.BadRequest` (HTTP 400)
  - `"401"`: `ErrorCode.NotAuthorized` (HTTP 401)
  - `"404"`: `ErrorCode.NotFound` (HTTP 404)
  - `"405"`: `ErrorCode.NoUpdatesPerformed` (HTTP 200)
  - `"500"`: `ErrorCode.InternalServerError` (HTTP 500)

### 3.8 `Documentation` (`SmokeDocs`)
- **Location**: `src/core/documentation/SmokeDocs.ts`
- **Purpose**: Auto-generates OpenAPI 3.0 documentation.
- **Decorators & API**:
  - `@Documentation.addSchema()`: Decorate entity classes.
  - `@Documentation.addField({ type, description, format? })`: Decorate entity fields.
  - `@Documentation.addRoute({ path, method, description, tags, requestBody, responses })`: Decorate custom controller endpoints.
  - `Documentation.getAPIJson()`: Returns the complete OpenAPI JSON spec.

### 3.9 `Sequence`
- **Location**: `src/core/sequence.ts`
- **Purpose**: Helper for Postgres sequences.
- `getNextValue(manager?)`: Runs `SELECT nextval('sequence_name')`.
- `getLastValue(manager?)`: Runs `SELECT currval('sequence_name')`.

---

## 4. End-to-End Module Template

Below is the standard structure for implementing a feature module (e.g. `User`) downstream.

### Step 1: Define Entity (`user.entity.ts`)
```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity, Documentation } from "@smoke-trees/postgres-backend";

@Documentation.addSchema()
@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("increment", { name: "id" })
  @Documentation.addField({ type: "number", description: "User ID" })
  id!: number;

  @Column("varchar", { name: "name", length: 255 })
  @Documentation.addField({ type: "string", description: "Full Name" })
  name!: string;

  @Column("varchar", { name: "email", length: 255, unique: true })
  @Documentation.addField({ type: "string", description: "User Email" })
  email!: string;

  constructor(data?: Partial<User>) {
    super(data);
    if (data) {
      if (data.name) this.name = data.name;
      if (data.email) this.email = data.email;
    }
  }
}
```

### Step 2: Define DAO (`user.dao.ts`)
```typescript
import { Dao, Database } from "@smoke-trees/postgres-backend";
import { User } from "./user.entity";

export class UserDao extends Dao<User> {
  constructor(database: Database) {
    super(database, User, "user");
  }

  // Add custom data-access methods here if needed
}
```

### Step 3: Define Service (`user.service.ts`)
```typescript
import { Service } from "@smoke-trees/postgres-backend";
import { UserDao } from "./user.dao";
import { User } from "./user.entity";

export class UserService extends Service<User> {
  dao: UserDao;

  constructor(userDao: UserDao) {
    super(userDao);
    this.dao = userDao;
  }

  // Add custom business logic here if needed
}
```

### Step 4: Define Controller (`user.controller.ts`)
```typescript
import {
  Application,
  Controller,
  Documentation,
  Methods,
  ServiceController
} from "@smoke-trees/postgres-backend";
import { User } from "./user.entity";
import { UserService } from "./user.service";

export class UserController extends ServiceController<User> {
  public path = "/users";
  protected controllers: Controller[] = [];
  protected mw = [];
  public service: UserService;

  constructor(app: Application, userService: UserService) {
    super(app, User, userService);
    this.service = userService;

    // Register custom routes if necessary:
    this.addRoutes({
      path: "/custom-action",
      method: Methods.GET,
      localMiddleware: [],
      handler: this.customAction.bind(this)
    });

    this.loadDocumentation();
  }

  @Documentation.addRoute({
    path: "/users/custom-action",
    method: Methods.GET,
    description: "Custom user action",
    tags: ["User"],
    responses: {
      "200": { description: "Success", value: { type: "string" } }
    }
  })
  async customAction(req: any, res: any) {
    res.status(200).json({ status: { code: "200", error: false }, message: "OK" });
  }
}
```

### Step 5: Application Bootstrap (`index.ts`)
```typescript
import express from "express";
import {
  Application,
  Database,
  Documentation,
  Settings
} from "@smoke-trees/postgres-backend";
import { User } from "./users/user.entity";
import { UserDao } from "./users/user.dao";
import { UserService } from "./users/user.service";
import { UserController } from "./users/user.controller";

class AppSettings extends Settings {
  databaseType: "postgres" = "postgres";
  dbPassword = process.env.DB_PASSWORD || "postgres";
  dbUser = process.env.DB_USER || "postgres";
  dbHost = process.env.DB_HOST || "localhost";
  dbPort = process.env.DB_PORT || "5432";
  database = process.env.DB_NAME || "my_db";
}

async function bootstrap() {
  const settings = new AppSettings();
  const database = new Database(settings);

  // 1. Register entities
  database.addEntity(User);

  // 2. Connect DB
  await database.connect();

  // 3. Initialize App
  const app = new Application(settings, database);

  // 4. Middlewares
  app.addMiddleWare(express.json());

  // 5. Instantiate & Add Controllers
  const userDao = new UserDao(database);
  const userService = new UserService(userDao);
  const userController = new UserController(app, userService);

  app.addController(userController);

  // 6. Setup Documentation & Start
  Documentation.addInfo({
    title: "My Service API",
    version: "1.0.0",
    description: "Backend service API"
  });

  app.loadMiddleware();
  app.loadControllers();
  await app.run();
}

bootstrap();
```

---

## 5. Query Parameter Reference (`GET /`)

When `ServiceController` handles `GET /` endpoints, it parses query string parameters into `readMany` options:

| Query Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | `number` | `1` | Page number |
| `count` | `number` | `10` | Number of items per page |
| `order` | `"ASC" \| "DESC"` | `"DESC"` | Sort order |
| `orderBy` | `string` | `"createdAt"` | Field name or dot-notation path to sort by |
| `select` | `string` | `undefined` | Comma-separated fields to select (e.g. `id,name`) |
| `relations` | `string` | `undefined` | Comma-separated relations to join (e.g. `address,orders`) |
| `like` | `object` | `undefined` | Field search object |
| `likeBehaviour` | `"and" \| "or"` | `"and"` | Logic for combining multiple like searches |
| `fromCreatedDate` | `ISO Date string` | `undefined` | Filter records created on or after date |
| `toCreatedDate` | `ISO Date string` | `undefined` | Filter records created before date |
| `nonPaginated` | `"true" \| "false"` | `"false"` | If `"true"`, disables page skip/take limits |
| `<any_other_key>` | `string` | - | Applied as exact match filter in `where` condition |

---

## 6. Transactions Example

To perform multi-step database operations in a transaction, obtain an `EntityManager` from `database.getConnection()` and pass it to Service/DAO methods:

```typescript
const queryRunner = database.getConnection().createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  const userResult = await userService.create({ name: "John" }, queryRunner.manager);
  const addressResult = await addressService.create({ userId: userResult.result }, queryRunner.manager);

  await queryRunner.commitTransaction();
} catch (err) {
  await queryRunner.rollbackTransaction();
  throw err;
} finally {
  await queryRunner.release();
}
```

---

## 7. Rules & Best Practices for AI Agents

1. **Inherit, Don't Re-implement**:
   - Always extend `ServiceController<Entity>` for standard REST controllers. Do NOT manually re-create CRUD endpoints (`POST /`, `GET /`, `GET /:id`, `PUT /:id`, `DELETE /:id`).
2. **Proper Super Calls**:
   - Always pass `(app, EntityClass, serviceInstance)` to `super()` inside a `ServiceController` constructor.
3. **Always Bind Handlers**:
   - When adding custom routes in a `Controller`, always bind `this`:
     `handler: this.myHandler.bind(this)`.
4. **Use Result Objects**:
   - Return `Result` or `ResultWithCount` from service and controller methods. Avoid throwing unhandled exceptions.
5. **Propagate `manager?: EntityManager`**:
   - When extending `Dao` or `Service` with custom methods, always include `manager?: EntityManager` as the final optional argument so transaction contexts can be forwarded down.
6. **OpenAPI Decorators**:
   - Decorate entities with `@Documentation.addSchema()` and property fields with `@Documentation.addField(...)` to ensure API documentation builds accurately.
