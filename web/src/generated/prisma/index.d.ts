
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model users
 * 
 */
export type users = $Result.DefaultSelection<Prisma.$usersPayload>
/**
 * Model conversations
 * 
 */
export type conversations = $Result.DefaultSelection<Prisma.$conversationsPayload>
/**
 * Model messages
 * 
 */
export type messages = $Result.DefaultSelection<Prisma.$messagesPayload>
/**
 * Model tg_channels
 * 
 */
export type tg_channels = $Result.DefaultSelection<Prisma.$tg_channelsPayload>
/**
 * Model tg_messages
 * 
 */
export type tg_messages = $Result.DefaultSelection<Prisma.$tg_messagesPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.users.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.users.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.users`: Exposes CRUD operations for the **users** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.users.findMany()
    * ```
    */
  get users(): Prisma.usersDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.conversations`: Exposes CRUD operations for the **conversations** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Conversations
    * const conversations = await prisma.conversations.findMany()
    * ```
    */
  get conversations(): Prisma.conversationsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.messages`: Exposes CRUD operations for the **messages** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Messages
    * const messages = await prisma.messages.findMany()
    * ```
    */
  get messages(): Prisma.messagesDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tg_channels`: Exposes CRUD operations for the **tg_channels** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tg_channels
    * const tg_channels = await prisma.tg_channels.findMany()
    * ```
    */
  get tg_channels(): Prisma.tg_channelsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tg_messages`: Exposes CRUD operations for the **tg_messages** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tg_messages
    * const tg_messages = await prisma.tg_messages.findMany()
    * ```
    */
  get tg_messages(): Prisma.tg_messagesDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    users: 'users',
    conversations: 'conversations',
    messages: 'messages',
    tg_channels: 'tg_channels',
    tg_messages: 'tg_messages'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "users" | "conversations" | "messages" | "tg_channels" | "tg_messages"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      users: {
        payload: Prisma.$usersPayload<ExtArgs>
        fields: Prisma.usersFieldRefs
        operations: {
          findUnique: {
            args: Prisma.usersFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.usersFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          findFirst: {
            args: Prisma.usersFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.usersFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          findMany: {
            args: Prisma.usersFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>[]
          }
          create: {
            args: Prisma.usersCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          createMany: {
            args: Prisma.usersCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.usersCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>[]
          }
          delete: {
            args: Prisma.usersDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          update: {
            args: Prisma.usersUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          deleteMany: {
            args: Prisma.usersDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.usersUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.usersUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>[]
          }
          upsert: {
            args: Prisma.usersUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$usersPayload>
          }
          aggregate: {
            args: Prisma.UsersAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsers>
          }
          groupBy: {
            args: Prisma.usersGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsersGroupByOutputType>[]
          }
          count: {
            args: Prisma.usersCountArgs<ExtArgs>
            result: $Utils.Optional<UsersCountAggregateOutputType> | number
          }
        }
      }
      conversations: {
        payload: Prisma.$conversationsPayload<ExtArgs>
        fields: Prisma.conversationsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.conversationsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$conversationsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.conversationsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$conversationsPayload>
          }
          findFirst: {
            args: Prisma.conversationsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$conversationsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.conversationsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$conversationsPayload>
          }
          findMany: {
            args: Prisma.conversationsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$conversationsPayload>[]
          }
          create: {
            args: Prisma.conversationsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$conversationsPayload>
          }
          createMany: {
            args: Prisma.conversationsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.conversationsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$conversationsPayload>[]
          }
          delete: {
            args: Prisma.conversationsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$conversationsPayload>
          }
          update: {
            args: Prisma.conversationsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$conversationsPayload>
          }
          deleteMany: {
            args: Prisma.conversationsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.conversationsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.conversationsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$conversationsPayload>[]
          }
          upsert: {
            args: Prisma.conversationsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$conversationsPayload>
          }
          aggregate: {
            args: Prisma.ConversationsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConversations>
          }
          groupBy: {
            args: Prisma.conversationsGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConversationsGroupByOutputType>[]
          }
          count: {
            args: Prisma.conversationsCountArgs<ExtArgs>
            result: $Utils.Optional<ConversationsCountAggregateOutputType> | number
          }
        }
      }
      messages: {
        payload: Prisma.$messagesPayload<ExtArgs>
        fields: Prisma.messagesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.messagesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$messagesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.messagesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$messagesPayload>
          }
          findFirst: {
            args: Prisma.messagesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$messagesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.messagesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$messagesPayload>
          }
          findMany: {
            args: Prisma.messagesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$messagesPayload>[]
          }
          create: {
            args: Prisma.messagesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$messagesPayload>
          }
          createMany: {
            args: Prisma.messagesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.messagesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$messagesPayload>[]
          }
          delete: {
            args: Prisma.messagesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$messagesPayload>
          }
          update: {
            args: Prisma.messagesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$messagesPayload>
          }
          deleteMany: {
            args: Prisma.messagesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.messagesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.messagesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$messagesPayload>[]
          }
          upsert: {
            args: Prisma.messagesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$messagesPayload>
          }
          aggregate: {
            args: Prisma.MessagesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMessages>
          }
          groupBy: {
            args: Prisma.messagesGroupByArgs<ExtArgs>
            result: $Utils.Optional<MessagesGroupByOutputType>[]
          }
          count: {
            args: Prisma.messagesCountArgs<ExtArgs>
            result: $Utils.Optional<MessagesCountAggregateOutputType> | number
          }
        }
      }
      tg_channels: {
        payload: Prisma.$tg_channelsPayload<ExtArgs>
        fields: Prisma.tg_channelsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tg_channelsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_channelsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tg_channelsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_channelsPayload>
          }
          findFirst: {
            args: Prisma.tg_channelsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_channelsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tg_channelsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_channelsPayload>
          }
          findMany: {
            args: Prisma.tg_channelsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_channelsPayload>[]
          }
          create: {
            args: Prisma.tg_channelsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_channelsPayload>
          }
          createMany: {
            args: Prisma.tg_channelsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.tg_channelsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_channelsPayload>[]
          }
          delete: {
            args: Prisma.tg_channelsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_channelsPayload>
          }
          update: {
            args: Prisma.tg_channelsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_channelsPayload>
          }
          deleteMany: {
            args: Prisma.tg_channelsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tg_channelsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.tg_channelsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_channelsPayload>[]
          }
          upsert: {
            args: Prisma.tg_channelsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_channelsPayload>
          }
          aggregate: {
            args: Prisma.Tg_channelsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTg_channels>
          }
          groupBy: {
            args: Prisma.tg_channelsGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tg_channelsGroupByOutputType>[]
          }
          count: {
            args: Prisma.tg_channelsCountArgs<ExtArgs>
            result: $Utils.Optional<Tg_channelsCountAggregateOutputType> | number
          }
        }
      }
      tg_messages: {
        payload: Prisma.$tg_messagesPayload<ExtArgs>
        fields: Prisma.tg_messagesFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tg_messagesFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_messagesPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tg_messagesFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_messagesPayload>
          }
          findFirst: {
            args: Prisma.tg_messagesFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_messagesPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tg_messagesFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_messagesPayload>
          }
          findMany: {
            args: Prisma.tg_messagesFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_messagesPayload>[]
          }
          create: {
            args: Prisma.tg_messagesCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_messagesPayload>
          }
          createMany: {
            args: Prisma.tg_messagesCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.tg_messagesCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_messagesPayload>[]
          }
          delete: {
            args: Prisma.tg_messagesDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_messagesPayload>
          }
          update: {
            args: Prisma.tg_messagesUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_messagesPayload>
          }
          deleteMany: {
            args: Prisma.tg_messagesDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tg_messagesUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.tg_messagesUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_messagesPayload>[]
          }
          upsert: {
            args: Prisma.tg_messagesUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tg_messagesPayload>
          }
          aggregate: {
            args: Prisma.Tg_messagesAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTg_messages>
          }
          groupBy: {
            args: Prisma.tg_messagesGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tg_messagesGroupByOutputType>[]
          }
          count: {
            args: Prisma.tg_messagesCountArgs<ExtArgs>
            result: $Utils.Optional<Tg_messagesCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    users?: usersOmit
    conversations?: conversationsOmit
    messages?: messagesOmit
    tg_channels?: tg_channelsOmit
    tg_messages?: tg_messagesOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UsersCountOutputType
   */

  export type UsersCountOutputType = {
    conversations: number
  }

  export type UsersCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversations?: boolean | UsersCountOutputTypeCountConversationsArgs
  }

  // Custom InputTypes
  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsersCountOutputType
     */
    select?: UsersCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsersCountOutputType without action
   */
  export type UsersCountOutputTypeCountConversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: conversationsWhereInput
  }


  /**
   * Count Type ConversationsCountOutputType
   */

  export type ConversationsCountOutputType = {
    messages: number
  }

  export type ConversationsCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | ConversationsCountOutputTypeCountMessagesArgs
  }

  // Custom InputTypes
  /**
   * ConversationsCountOutputType without action
   */
  export type ConversationsCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ConversationsCountOutputType
     */
    select?: ConversationsCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ConversationsCountOutputType without action
   */
  export type ConversationsCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: messagesWhereInput
  }


  /**
   * Count Type Tg_channelsCountOutputType
   */

  export type Tg_channelsCountOutputType = {
    messages: number
  }

  export type Tg_channelsCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | Tg_channelsCountOutputTypeCountMessagesArgs
  }

  // Custom InputTypes
  /**
   * Tg_channelsCountOutputType without action
   */
  export type Tg_channelsCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Tg_channelsCountOutputType
     */
    select?: Tg_channelsCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * Tg_channelsCountOutputType without action
   */
  export type Tg_channelsCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tg_messagesWhereInput
  }


  /**
   * Models
   */

  /**
   * Model users
   */

  export type AggregateUsers = {
    _count: UsersCountAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  export type UsersMinAggregateOutputType = {
    id: string | null
    username: string | null
    email: string | null
    api_key: string | null
    api_key_enabled: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UsersMaxAggregateOutputType = {
    id: string | null
    username: string | null
    email: string | null
    api_key: string | null
    api_key_enabled: boolean | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type UsersCountAggregateOutputType = {
    id: number
    username: number
    email: number
    api_key: number
    api_key_enabled: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type UsersMinAggregateInputType = {
    id?: true
    username?: true
    email?: true
    api_key?: true
    api_key_enabled?: true
    created_at?: true
    updated_at?: true
  }

  export type UsersMaxAggregateInputType = {
    id?: true
    username?: true
    email?: true
    api_key?: true
    api_key_enabled?: true
    created_at?: true
    updated_at?: true
  }

  export type UsersCountAggregateInputType = {
    id?: true
    username?: true
    email?: true
    api_key?: true
    api_key_enabled?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type UsersAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which users to aggregate.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned users
    **/
    _count?: true | UsersCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsersMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsersMaxAggregateInputType
  }

  export type GetUsersAggregateType<T extends UsersAggregateArgs> = {
        [P in keyof T & keyof AggregateUsers]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsers[P]>
      : GetScalarType<T[P], AggregateUsers[P]>
  }




  export type usersGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: usersWhereInput
    orderBy?: usersOrderByWithAggregationInput | usersOrderByWithAggregationInput[]
    by: UsersScalarFieldEnum[] | UsersScalarFieldEnum
    having?: usersScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsersCountAggregateInputType | true
    _min?: UsersMinAggregateInputType
    _max?: UsersMaxAggregateInputType
  }

  export type UsersGroupByOutputType = {
    id: string
    username: string
    email: string | null
    api_key: string
    api_key_enabled: boolean
    created_at: Date
    updated_at: Date
    _count: UsersCountAggregateOutputType | null
    _min: UsersMinAggregateOutputType | null
    _max: UsersMaxAggregateOutputType | null
  }

  type GetUsersGroupByPayload<T extends usersGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsersGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsersGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsersGroupByOutputType[P]>
            : GetScalarType<T[P], UsersGroupByOutputType[P]>
        }
      >
    >


  export type usersSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    email?: boolean
    api_key?: boolean
    api_key_enabled?: boolean
    created_at?: boolean
    updated_at?: boolean
    conversations?: boolean | users$conversationsArgs<ExtArgs>
    _count?: boolean | UsersCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["users"]>

  export type usersSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    email?: boolean
    api_key?: boolean
    api_key_enabled?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["users"]>

  export type usersSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    email?: boolean
    api_key?: boolean
    api_key_enabled?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["users"]>

  export type usersSelectScalar = {
    id?: boolean
    username?: boolean
    email?: boolean
    api_key?: boolean
    api_key_enabled?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type usersOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "email" | "api_key" | "api_key_enabled" | "created_at" | "updated_at", ExtArgs["result"]["users"]>
  export type usersInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversations?: boolean | users$conversationsArgs<ExtArgs>
    _count?: boolean | UsersCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type usersIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type usersIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $usersPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "users"
    objects: {
      conversations: Prisma.$conversationsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      username: string
      email: string | null
      api_key: string
      api_key_enabled: boolean
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["users"]>
    composites: {}
  }

  type usersGetPayload<S extends boolean | null | undefined | usersDefaultArgs> = $Result.GetResult<Prisma.$usersPayload, S>

  type usersCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<usersFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UsersCountAggregateInputType | true
    }

  export interface usersDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['users'], meta: { name: 'users' } }
    /**
     * Find zero or one Users that matches the filter.
     * @param {usersFindUniqueArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends usersFindUniqueArgs>(args: SelectSubset<T, usersFindUniqueArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Users that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {usersFindUniqueOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends usersFindUniqueOrThrowArgs>(args: SelectSubset<T, usersFindUniqueOrThrowArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindFirstArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends usersFindFirstArgs>(args?: SelectSubset<T, usersFindFirstArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Users that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindFirstOrThrowArgs} args - Arguments to find a Users
     * @example
     * // Get one Users
     * const users = await prisma.users.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends usersFindFirstOrThrowArgs>(args?: SelectSubset<T, usersFindFirstOrThrowArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.users.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.users.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const usersWithIdOnly = await prisma.users.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends usersFindManyArgs>(args?: SelectSubset<T, usersFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Users.
     * @param {usersCreateArgs} args - Arguments to create a Users.
     * @example
     * // Create one Users
     * const Users = await prisma.users.create({
     *   data: {
     *     // ... data to create a Users
     *   }
     * })
     * 
     */
    create<T extends usersCreateArgs>(args: SelectSubset<T, usersCreateArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {usersCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const users = await prisma.users.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends usersCreateManyArgs>(args?: SelectSubset<T, usersCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {usersCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const users = await prisma.users.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const usersWithIdOnly = await prisma.users.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends usersCreateManyAndReturnArgs>(args?: SelectSubset<T, usersCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Users.
     * @param {usersDeleteArgs} args - Arguments to delete one Users.
     * @example
     * // Delete one Users
     * const Users = await prisma.users.delete({
     *   where: {
     *     // ... filter to delete one Users
     *   }
     * })
     * 
     */
    delete<T extends usersDeleteArgs>(args: SelectSubset<T, usersDeleteArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Users.
     * @param {usersUpdateArgs} args - Arguments to update one Users.
     * @example
     * // Update one Users
     * const users = await prisma.users.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends usersUpdateArgs>(args: SelectSubset<T, usersUpdateArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {usersDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.users.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends usersDeleteManyArgs>(args?: SelectSubset<T, usersDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const users = await prisma.users.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends usersUpdateManyArgs>(args: SelectSubset<T, usersUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {usersUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const users = await prisma.users.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const usersWithIdOnly = await prisma.users.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends usersUpdateManyAndReturnArgs>(args: SelectSubset<T, usersUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Users.
     * @param {usersUpsertArgs} args - Arguments to update or create a Users.
     * @example
     * // Update or create a Users
     * const users = await prisma.users.upsert({
     *   create: {
     *     // ... data to create a Users
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Users we want to update
     *   }
     * })
     */
    upsert<T extends usersUpsertArgs>(args: SelectSubset<T, usersUpsertArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.users.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends usersCountArgs>(
      args?: Subset<T, usersCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsersCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsersAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsersAggregateArgs>(args: Subset<T, UsersAggregateArgs>): Prisma.PrismaPromise<GetUsersAggregateType<T>>

    /**
     * Group by Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {usersGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends usersGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: usersGroupByArgs['orderBy'] }
        : { orderBy?: usersGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, usersGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsersGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the users model
   */
  readonly fields: usersFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for users.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__usersClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    conversations<T extends users$conversationsArgs<ExtArgs> = {}>(args?: Subset<T, users$conversationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$conversationsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the users model
   */
  interface usersFieldRefs {
    readonly id: FieldRef<"users", 'String'>
    readonly username: FieldRef<"users", 'String'>
    readonly email: FieldRef<"users", 'String'>
    readonly api_key: FieldRef<"users", 'String'>
    readonly api_key_enabled: FieldRef<"users", 'Boolean'>
    readonly created_at: FieldRef<"users", 'DateTime'>
    readonly updated_at: FieldRef<"users", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * users findUnique
   */
  export type usersFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users findUniqueOrThrow
   */
  export type usersFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users findFirst
   */
  export type usersFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users findFirstOrThrow
   */
  export type usersFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users findMany
   */
  export type usersFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: usersWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: usersOrderByWithRelationInput | usersOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing users.
     */
    cursor?: usersWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    distinct?: UsersScalarFieldEnum | UsersScalarFieldEnum[]
  }

  /**
   * users create
   */
  export type usersCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * The data needed to create a users.
     */
    data: XOR<usersCreateInput, usersUncheckedCreateInput>
  }

  /**
   * users createMany
   */
  export type usersCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many users.
     */
    data: usersCreateManyInput | usersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * users createManyAndReturn
   */
  export type usersCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * The data used to create many users.
     */
    data: usersCreateManyInput | usersCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * users update
   */
  export type usersUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * The data needed to update a users.
     */
    data: XOR<usersUpdateInput, usersUncheckedUpdateInput>
    /**
     * Choose, which users to update.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users updateMany
   */
  export type usersUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update users.
     */
    data: XOR<usersUpdateManyMutationInput, usersUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: usersWhereInput
    /**
     * Limit how many users to update.
     */
    limit?: number
  }

  /**
   * users updateManyAndReturn
   */
  export type usersUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * The data used to update users.
     */
    data: XOR<usersUpdateManyMutationInput, usersUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: usersWhereInput
    /**
     * Limit how many users to update.
     */
    limit?: number
  }

  /**
   * users upsert
   */
  export type usersUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * The filter to search for the users to update in case it exists.
     */
    where: usersWhereUniqueInput
    /**
     * In case the users found by the `where` argument doesn't exist, create a new users with this data.
     */
    create: XOR<usersCreateInput, usersUncheckedCreateInput>
    /**
     * In case the users was found with the provided `where` argument, update it with this data.
     */
    update: XOR<usersUpdateInput, usersUncheckedUpdateInput>
  }

  /**
   * users delete
   */
  export type usersDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
    /**
     * Filter which users to delete.
     */
    where: usersWhereUniqueInput
  }

  /**
   * users deleteMany
   */
  export type usersDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which users to delete
     */
    where?: usersWhereInput
    /**
     * Limit how many users to delete.
     */
    limit?: number
  }

  /**
   * users.conversations
   */
  export type users$conversationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the conversations
     */
    select?: conversationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the conversations
     */
    omit?: conversationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: conversationsInclude<ExtArgs> | null
    where?: conversationsWhereInput
    orderBy?: conversationsOrderByWithRelationInput | conversationsOrderByWithRelationInput[]
    cursor?: conversationsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ConversationsScalarFieldEnum | ConversationsScalarFieldEnum[]
  }

  /**
   * users without action
   */
  export type usersDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the users
     */
    select?: usersSelect<ExtArgs> | null
    /**
     * Omit specific fields from the users
     */
    omit?: usersOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: usersInclude<ExtArgs> | null
  }


  /**
   * Model conversations
   */

  export type AggregateConversations = {
    _count: ConversationsCountAggregateOutputType | null
    _min: ConversationsMinAggregateOutputType | null
    _max: ConversationsMaxAggregateOutputType | null
  }

  export type ConversationsMinAggregateOutputType = {
    id: string | null
    user_id: string | null
    created_at: Date | null
    status: string | null
  }

  export type ConversationsMaxAggregateOutputType = {
    id: string | null
    user_id: string | null
    created_at: Date | null
    status: string | null
  }

  export type ConversationsCountAggregateOutputType = {
    id: number
    user_id: number
    created_at: number
    status: number
    _all: number
  }


  export type ConversationsMinAggregateInputType = {
    id?: true
    user_id?: true
    created_at?: true
    status?: true
  }

  export type ConversationsMaxAggregateInputType = {
    id?: true
    user_id?: true
    created_at?: true
    status?: true
  }

  export type ConversationsCountAggregateInputType = {
    id?: true
    user_id?: true
    created_at?: true
    status?: true
    _all?: true
  }

  export type ConversationsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which conversations to aggregate.
     */
    where?: conversationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of conversations to fetch.
     */
    orderBy?: conversationsOrderByWithRelationInput | conversationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: conversationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned conversations
    **/
    _count?: true | ConversationsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConversationsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConversationsMaxAggregateInputType
  }

  export type GetConversationsAggregateType<T extends ConversationsAggregateArgs> = {
        [P in keyof T & keyof AggregateConversations]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConversations[P]>
      : GetScalarType<T[P], AggregateConversations[P]>
  }




  export type conversationsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: conversationsWhereInput
    orderBy?: conversationsOrderByWithAggregationInput | conversationsOrderByWithAggregationInput[]
    by: ConversationsScalarFieldEnum[] | ConversationsScalarFieldEnum
    having?: conversationsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConversationsCountAggregateInputType | true
    _min?: ConversationsMinAggregateInputType
    _max?: ConversationsMaxAggregateInputType
  }

  export type ConversationsGroupByOutputType = {
    id: string
    user_id: string
    created_at: Date
    status: string
    _count: ConversationsCountAggregateOutputType | null
    _min: ConversationsMinAggregateOutputType | null
    _max: ConversationsMaxAggregateOutputType | null
  }

  type GetConversationsGroupByPayload<T extends conversationsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConversationsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConversationsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConversationsGroupByOutputType[P]>
            : GetScalarType<T[P], ConversationsGroupByOutputType[P]>
        }
      >
    >


  export type conversationsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    created_at?: boolean
    status?: boolean
    user?: boolean | usersDefaultArgs<ExtArgs>
    messages?: boolean | conversations$messagesArgs<ExtArgs>
    _count?: boolean | ConversationsCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversations"]>

  export type conversationsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    created_at?: boolean
    status?: boolean
    user?: boolean | usersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversations"]>

  export type conversationsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    user_id?: boolean
    created_at?: boolean
    status?: boolean
    user?: boolean | usersDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["conversations"]>

  export type conversationsSelectScalar = {
    id?: boolean
    user_id?: boolean
    created_at?: boolean
    status?: boolean
  }

  export type conversationsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "user_id" | "created_at" | "status", ExtArgs["result"]["conversations"]>
  export type conversationsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | usersDefaultArgs<ExtArgs>
    messages?: boolean | conversations$messagesArgs<ExtArgs>
    _count?: boolean | ConversationsCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type conversationsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | usersDefaultArgs<ExtArgs>
  }
  export type conversationsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | usersDefaultArgs<ExtArgs>
  }

  export type $conversationsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "conversations"
    objects: {
      user: Prisma.$usersPayload<ExtArgs>
      messages: Prisma.$messagesPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      user_id: string
      created_at: Date
      status: string
    }, ExtArgs["result"]["conversations"]>
    composites: {}
  }

  type conversationsGetPayload<S extends boolean | null | undefined | conversationsDefaultArgs> = $Result.GetResult<Prisma.$conversationsPayload, S>

  type conversationsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<conversationsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ConversationsCountAggregateInputType | true
    }

  export interface conversationsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['conversations'], meta: { name: 'conversations' } }
    /**
     * Find zero or one Conversations that matches the filter.
     * @param {conversationsFindUniqueArgs} args - Arguments to find a Conversations
     * @example
     * // Get one Conversations
     * const conversations = await prisma.conversations.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends conversationsFindUniqueArgs>(args: SelectSubset<T, conversationsFindUniqueArgs<ExtArgs>>): Prisma__conversationsClient<$Result.GetResult<Prisma.$conversationsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Conversations that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {conversationsFindUniqueOrThrowArgs} args - Arguments to find a Conversations
     * @example
     * // Get one Conversations
     * const conversations = await prisma.conversations.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends conversationsFindUniqueOrThrowArgs>(args: SelectSubset<T, conversationsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__conversationsClient<$Result.GetResult<Prisma.$conversationsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Conversations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {conversationsFindFirstArgs} args - Arguments to find a Conversations
     * @example
     * // Get one Conversations
     * const conversations = await prisma.conversations.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends conversationsFindFirstArgs>(args?: SelectSubset<T, conversationsFindFirstArgs<ExtArgs>>): Prisma__conversationsClient<$Result.GetResult<Prisma.$conversationsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Conversations that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {conversationsFindFirstOrThrowArgs} args - Arguments to find a Conversations
     * @example
     * // Get one Conversations
     * const conversations = await prisma.conversations.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends conversationsFindFirstOrThrowArgs>(args?: SelectSubset<T, conversationsFindFirstOrThrowArgs<ExtArgs>>): Prisma__conversationsClient<$Result.GetResult<Prisma.$conversationsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Conversations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {conversationsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Conversations
     * const conversations = await prisma.conversations.findMany()
     * 
     * // Get first 10 Conversations
     * const conversations = await prisma.conversations.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const conversationsWithIdOnly = await prisma.conversations.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends conversationsFindManyArgs>(args?: SelectSubset<T, conversationsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$conversationsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Conversations.
     * @param {conversationsCreateArgs} args - Arguments to create a Conversations.
     * @example
     * // Create one Conversations
     * const Conversations = await prisma.conversations.create({
     *   data: {
     *     // ... data to create a Conversations
     *   }
     * })
     * 
     */
    create<T extends conversationsCreateArgs>(args: SelectSubset<T, conversationsCreateArgs<ExtArgs>>): Prisma__conversationsClient<$Result.GetResult<Prisma.$conversationsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Conversations.
     * @param {conversationsCreateManyArgs} args - Arguments to create many Conversations.
     * @example
     * // Create many Conversations
     * const conversations = await prisma.conversations.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends conversationsCreateManyArgs>(args?: SelectSubset<T, conversationsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Conversations and returns the data saved in the database.
     * @param {conversationsCreateManyAndReturnArgs} args - Arguments to create many Conversations.
     * @example
     * // Create many Conversations
     * const conversations = await prisma.conversations.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Conversations and only return the `id`
     * const conversationsWithIdOnly = await prisma.conversations.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends conversationsCreateManyAndReturnArgs>(args?: SelectSubset<T, conversationsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$conversationsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Conversations.
     * @param {conversationsDeleteArgs} args - Arguments to delete one Conversations.
     * @example
     * // Delete one Conversations
     * const Conversations = await prisma.conversations.delete({
     *   where: {
     *     // ... filter to delete one Conversations
     *   }
     * })
     * 
     */
    delete<T extends conversationsDeleteArgs>(args: SelectSubset<T, conversationsDeleteArgs<ExtArgs>>): Prisma__conversationsClient<$Result.GetResult<Prisma.$conversationsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Conversations.
     * @param {conversationsUpdateArgs} args - Arguments to update one Conversations.
     * @example
     * // Update one Conversations
     * const conversations = await prisma.conversations.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends conversationsUpdateArgs>(args: SelectSubset<T, conversationsUpdateArgs<ExtArgs>>): Prisma__conversationsClient<$Result.GetResult<Prisma.$conversationsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Conversations.
     * @param {conversationsDeleteManyArgs} args - Arguments to filter Conversations to delete.
     * @example
     * // Delete a few Conversations
     * const { count } = await prisma.conversations.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends conversationsDeleteManyArgs>(args?: SelectSubset<T, conversationsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {conversationsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Conversations
     * const conversations = await prisma.conversations.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends conversationsUpdateManyArgs>(args: SelectSubset<T, conversationsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Conversations and returns the data updated in the database.
     * @param {conversationsUpdateManyAndReturnArgs} args - Arguments to update many Conversations.
     * @example
     * // Update many Conversations
     * const conversations = await prisma.conversations.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Conversations and only return the `id`
     * const conversationsWithIdOnly = await prisma.conversations.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends conversationsUpdateManyAndReturnArgs>(args: SelectSubset<T, conversationsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$conversationsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Conversations.
     * @param {conversationsUpsertArgs} args - Arguments to update or create a Conversations.
     * @example
     * // Update or create a Conversations
     * const conversations = await prisma.conversations.upsert({
     *   create: {
     *     // ... data to create a Conversations
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Conversations we want to update
     *   }
     * })
     */
    upsert<T extends conversationsUpsertArgs>(args: SelectSubset<T, conversationsUpsertArgs<ExtArgs>>): Prisma__conversationsClient<$Result.GetResult<Prisma.$conversationsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {conversationsCountArgs} args - Arguments to filter Conversations to count.
     * @example
     * // Count the number of Conversations
     * const count = await prisma.conversations.count({
     *   where: {
     *     // ... the filter for the Conversations we want to count
     *   }
     * })
    **/
    count<T extends conversationsCountArgs>(
      args?: Subset<T, conversationsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConversationsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConversationsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ConversationsAggregateArgs>(args: Subset<T, ConversationsAggregateArgs>): Prisma.PrismaPromise<GetConversationsAggregateType<T>>

    /**
     * Group by Conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {conversationsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends conversationsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: conversationsGroupByArgs['orderBy'] }
        : { orderBy?: conversationsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, conversationsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConversationsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the conversations model
   */
  readonly fields: conversationsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for conversations.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__conversationsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends usersDefaultArgs<ExtArgs> = {}>(args?: Subset<T, usersDefaultArgs<ExtArgs>>): Prisma__usersClient<$Result.GetResult<Prisma.$usersPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    messages<T extends conversations$messagesArgs<ExtArgs> = {}>(args?: Subset<T, conversations$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$messagesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the conversations model
   */
  interface conversationsFieldRefs {
    readonly id: FieldRef<"conversations", 'String'>
    readonly user_id: FieldRef<"conversations", 'String'>
    readonly created_at: FieldRef<"conversations", 'DateTime'>
    readonly status: FieldRef<"conversations", 'String'>
  }
    

  // Custom InputTypes
  /**
   * conversations findUnique
   */
  export type conversationsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the conversations
     */
    select?: conversationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the conversations
     */
    omit?: conversationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: conversationsInclude<ExtArgs> | null
    /**
     * Filter, which conversations to fetch.
     */
    where: conversationsWhereUniqueInput
  }

  /**
   * conversations findUniqueOrThrow
   */
  export type conversationsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the conversations
     */
    select?: conversationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the conversations
     */
    omit?: conversationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: conversationsInclude<ExtArgs> | null
    /**
     * Filter, which conversations to fetch.
     */
    where: conversationsWhereUniqueInput
  }

  /**
   * conversations findFirst
   */
  export type conversationsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the conversations
     */
    select?: conversationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the conversations
     */
    omit?: conversationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: conversationsInclude<ExtArgs> | null
    /**
     * Filter, which conversations to fetch.
     */
    where?: conversationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of conversations to fetch.
     */
    orderBy?: conversationsOrderByWithRelationInput | conversationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for conversations.
     */
    cursor?: conversationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of conversations.
     */
    distinct?: ConversationsScalarFieldEnum | ConversationsScalarFieldEnum[]
  }

  /**
   * conversations findFirstOrThrow
   */
  export type conversationsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the conversations
     */
    select?: conversationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the conversations
     */
    omit?: conversationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: conversationsInclude<ExtArgs> | null
    /**
     * Filter, which conversations to fetch.
     */
    where?: conversationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of conversations to fetch.
     */
    orderBy?: conversationsOrderByWithRelationInput | conversationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for conversations.
     */
    cursor?: conversationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of conversations.
     */
    distinct?: ConversationsScalarFieldEnum | ConversationsScalarFieldEnum[]
  }

  /**
   * conversations findMany
   */
  export type conversationsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the conversations
     */
    select?: conversationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the conversations
     */
    omit?: conversationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: conversationsInclude<ExtArgs> | null
    /**
     * Filter, which conversations to fetch.
     */
    where?: conversationsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of conversations to fetch.
     */
    orderBy?: conversationsOrderByWithRelationInput | conversationsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing conversations.
     */
    cursor?: conversationsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` conversations.
     */
    skip?: number
    distinct?: ConversationsScalarFieldEnum | ConversationsScalarFieldEnum[]
  }

  /**
   * conversations create
   */
  export type conversationsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the conversations
     */
    select?: conversationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the conversations
     */
    omit?: conversationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: conversationsInclude<ExtArgs> | null
    /**
     * The data needed to create a conversations.
     */
    data: XOR<conversationsCreateInput, conversationsUncheckedCreateInput>
  }

  /**
   * conversations createMany
   */
  export type conversationsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many conversations.
     */
    data: conversationsCreateManyInput | conversationsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * conversations createManyAndReturn
   */
  export type conversationsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the conversations
     */
    select?: conversationsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the conversations
     */
    omit?: conversationsOmit<ExtArgs> | null
    /**
     * The data used to create many conversations.
     */
    data: conversationsCreateManyInput | conversationsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: conversationsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * conversations update
   */
  export type conversationsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the conversations
     */
    select?: conversationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the conversations
     */
    omit?: conversationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: conversationsInclude<ExtArgs> | null
    /**
     * The data needed to update a conversations.
     */
    data: XOR<conversationsUpdateInput, conversationsUncheckedUpdateInput>
    /**
     * Choose, which conversations to update.
     */
    where: conversationsWhereUniqueInput
  }

  /**
   * conversations updateMany
   */
  export type conversationsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update conversations.
     */
    data: XOR<conversationsUpdateManyMutationInput, conversationsUncheckedUpdateManyInput>
    /**
     * Filter which conversations to update
     */
    where?: conversationsWhereInput
    /**
     * Limit how many conversations to update.
     */
    limit?: number
  }

  /**
   * conversations updateManyAndReturn
   */
  export type conversationsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the conversations
     */
    select?: conversationsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the conversations
     */
    omit?: conversationsOmit<ExtArgs> | null
    /**
     * The data used to update conversations.
     */
    data: XOR<conversationsUpdateManyMutationInput, conversationsUncheckedUpdateManyInput>
    /**
     * Filter which conversations to update
     */
    where?: conversationsWhereInput
    /**
     * Limit how many conversations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: conversationsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * conversations upsert
   */
  export type conversationsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the conversations
     */
    select?: conversationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the conversations
     */
    omit?: conversationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: conversationsInclude<ExtArgs> | null
    /**
     * The filter to search for the conversations to update in case it exists.
     */
    where: conversationsWhereUniqueInput
    /**
     * In case the conversations found by the `where` argument doesn't exist, create a new conversations with this data.
     */
    create: XOR<conversationsCreateInput, conversationsUncheckedCreateInput>
    /**
     * In case the conversations was found with the provided `where` argument, update it with this data.
     */
    update: XOR<conversationsUpdateInput, conversationsUncheckedUpdateInput>
  }

  /**
   * conversations delete
   */
  export type conversationsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the conversations
     */
    select?: conversationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the conversations
     */
    omit?: conversationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: conversationsInclude<ExtArgs> | null
    /**
     * Filter which conversations to delete.
     */
    where: conversationsWhereUniqueInput
  }

  /**
   * conversations deleteMany
   */
  export type conversationsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which conversations to delete
     */
    where?: conversationsWhereInput
    /**
     * Limit how many conversations to delete.
     */
    limit?: number
  }

  /**
   * conversations.messages
   */
  export type conversations$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the messages
     */
    select?: messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the messages
     */
    omit?: messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: messagesInclude<ExtArgs> | null
    where?: messagesWhereInput
    orderBy?: messagesOrderByWithRelationInput | messagesOrderByWithRelationInput[]
    cursor?: messagesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MessagesScalarFieldEnum | MessagesScalarFieldEnum[]
  }

  /**
   * conversations without action
   */
  export type conversationsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the conversations
     */
    select?: conversationsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the conversations
     */
    omit?: conversationsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: conversationsInclude<ExtArgs> | null
  }


  /**
   * Model messages
   */

  export type AggregateMessages = {
    _count: MessagesCountAggregateOutputType | null
    _min: MessagesMinAggregateOutputType | null
    _max: MessagesMaxAggregateOutputType | null
  }

  export type MessagesMinAggregateOutputType = {
    id: string | null
    conversation_id: string | null
    role: string | null
    created_at: Date | null
  }

  export type MessagesMaxAggregateOutputType = {
    id: string | null
    conversation_id: string | null
    role: string | null
    created_at: Date | null
  }

  export type MessagesCountAggregateOutputType = {
    id: number
    conversation_id: number
    role: number
    content: number
    created_at: number
    _all: number
  }


  export type MessagesMinAggregateInputType = {
    id?: true
    conversation_id?: true
    role?: true
    created_at?: true
  }

  export type MessagesMaxAggregateInputType = {
    id?: true
    conversation_id?: true
    role?: true
    created_at?: true
  }

  export type MessagesCountAggregateInputType = {
    id?: true
    conversation_id?: true
    role?: true
    content?: true
    created_at?: true
    _all?: true
  }

  export type MessagesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which messages to aggregate.
     */
    where?: messagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of messages to fetch.
     */
    orderBy?: messagesOrderByWithRelationInput | messagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: messagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned messages
    **/
    _count?: true | MessagesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MessagesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MessagesMaxAggregateInputType
  }

  export type GetMessagesAggregateType<T extends MessagesAggregateArgs> = {
        [P in keyof T & keyof AggregateMessages]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMessages[P]>
      : GetScalarType<T[P], AggregateMessages[P]>
  }




  export type messagesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: messagesWhereInput
    orderBy?: messagesOrderByWithAggregationInput | messagesOrderByWithAggregationInput[]
    by: MessagesScalarFieldEnum[] | MessagesScalarFieldEnum
    having?: messagesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MessagesCountAggregateInputType | true
    _min?: MessagesMinAggregateInputType
    _max?: MessagesMaxAggregateInputType
  }

  export type MessagesGroupByOutputType = {
    id: string
    conversation_id: string
    role: string
    content: JsonValue
    created_at: Date
    _count: MessagesCountAggregateOutputType | null
    _min: MessagesMinAggregateOutputType | null
    _max: MessagesMaxAggregateOutputType | null
  }

  type GetMessagesGroupByPayload<T extends messagesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MessagesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MessagesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MessagesGroupByOutputType[P]>
            : GetScalarType<T[P], MessagesGroupByOutputType[P]>
        }
      >
    >


  export type messagesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    conversation_id?: boolean
    role?: boolean
    content?: boolean
    created_at?: boolean
    conversation?: boolean | conversationsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["messages"]>

  export type messagesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    conversation_id?: boolean
    role?: boolean
    content?: boolean
    created_at?: boolean
    conversation?: boolean | conversationsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["messages"]>

  export type messagesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    conversation_id?: boolean
    role?: boolean
    content?: boolean
    created_at?: boolean
    conversation?: boolean | conversationsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["messages"]>

  export type messagesSelectScalar = {
    id?: boolean
    conversation_id?: boolean
    role?: boolean
    content?: boolean
    created_at?: boolean
  }

  export type messagesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "conversation_id" | "role" | "content" | "created_at", ExtArgs["result"]["messages"]>
  export type messagesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversation?: boolean | conversationsDefaultArgs<ExtArgs>
  }
  export type messagesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversation?: boolean | conversationsDefaultArgs<ExtArgs>
  }
  export type messagesIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversation?: boolean | conversationsDefaultArgs<ExtArgs>
  }

  export type $messagesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "messages"
    objects: {
      conversation: Prisma.$conversationsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      conversation_id: string
      role: string
      content: Prisma.JsonValue
      created_at: Date
    }, ExtArgs["result"]["messages"]>
    composites: {}
  }

  type messagesGetPayload<S extends boolean | null | undefined | messagesDefaultArgs> = $Result.GetResult<Prisma.$messagesPayload, S>

  type messagesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<messagesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MessagesCountAggregateInputType | true
    }

  export interface messagesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['messages'], meta: { name: 'messages' } }
    /**
     * Find zero or one Messages that matches the filter.
     * @param {messagesFindUniqueArgs} args - Arguments to find a Messages
     * @example
     * // Get one Messages
     * const messages = await prisma.messages.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends messagesFindUniqueArgs>(args: SelectSubset<T, messagesFindUniqueArgs<ExtArgs>>): Prisma__messagesClient<$Result.GetResult<Prisma.$messagesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Messages that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {messagesFindUniqueOrThrowArgs} args - Arguments to find a Messages
     * @example
     * // Get one Messages
     * const messages = await prisma.messages.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends messagesFindUniqueOrThrowArgs>(args: SelectSubset<T, messagesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__messagesClient<$Result.GetResult<Prisma.$messagesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Messages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {messagesFindFirstArgs} args - Arguments to find a Messages
     * @example
     * // Get one Messages
     * const messages = await prisma.messages.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends messagesFindFirstArgs>(args?: SelectSubset<T, messagesFindFirstArgs<ExtArgs>>): Prisma__messagesClient<$Result.GetResult<Prisma.$messagesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Messages that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {messagesFindFirstOrThrowArgs} args - Arguments to find a Messages
     * @example
     * // Get one Messages
     * const messages = await prisma.messages.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends messagesFindFirstOrThrowArgs>(args?: SelectSubset<T, messagesFindFirstOrThrowArgs<ExtArgs>>): Prisma__messagesClient<$Result.GetResult<Prisma.$messagesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Messages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {messagesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Messages
     * const messages = await prisma.messages.findMany()
     * 
     * // Get first 10 Messages
     * const messages = await prisma.messages.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const messagesWithIdOnly = await prisma.messages.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends messagesFindManyArgs>(args?: SelectSubset<T, messagesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$messagesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Messages.
     * @param {messagesCreateArgs} args - Arguments to create a Messages.
     * @example
     * // Create one Messages
     * const Messages = await prisma.messages.create({
     *   data: {
     *     // ... data to create a Messages
     *   }
     * })
     * 
     */
    create<T extends messagesCreateArgs>(args: SelectSubset<T, messagesCreateArgs<ExtArgs>>): Prisma__messagesClient<$Result.GetResult<Prisma.$messagesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Messages.
     * @param {messagesCreateManyArgs} args - Arguments to create many Messages.
     * @example
     * // Create many Messages
     * const messages = await prisma.messages.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends messagesCreateManyArgs>(args?: SelectSubset<T, messagesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Messages and returns the data saved in the database.
     * @param {messagesCreateManyAndReturnArgs} args - Arguments to create many Messages.
     * @example
     * // Create many Messages
     * const messages = await prisma.messages.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Messages and only return the `id`
     * const messagesWithIdOnly = await prisma.messages.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends messagesCreateManyAndReturnArgs>(args?: SelectSubset<T, messagesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$messagesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Messages.
     * @param {messagesDeleteArgs} args - Arguments to delete one Messages.
     * @example
     * // Delete one Messages
     * const Messages = await prisma.messages.delete({
     *   where: {
     *     // ... filter to delete one Messages
     *   }
     * })
     * 
     */
    delete<T extends messagesDeleteArgs>(args: SelectSubset<T, messagesDeleteArgs<ExtArgs>>): Prisma__messagesClient<$Result.GetResult<Prisma.$messagesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Messages.
     * @param {messagesUpdateArgs} args - Arguments to update one Messages.
     * @example
     * // Update one Messages
     * const messages = await prisma.messages.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends messagesUpdateArgs>(args: SelectSubset<T, messagesUpdateArgs<ExtArgs>>): Prisma__messagesClient<$Result.GetResult<Prisma.$messagesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Messages.
     * @param {messagesDeleteManyArgs} args - Arguments to filter Messages to delete.
     * @example
     * // Delete a few Messages
     * const { count } = await prisma.messages.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends messagesDeleteManyArgs>(args?: SelectSubset<T, messagesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {messagesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Messages
     * const messages = await prisma.messages.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends messagesUpdateManyArgs>(args: SelectSubset<T, messagesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Messages and returns the data updated in the database.
     * @param {messagesUpdateManyAndReturnArgs} args - Arguments to update many Messages.
     * @example
     * // Update many Messages
     * const messages = await prisma.messages.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Messages and only return the `id`
     * const messagesWithIdOnly = await prisma.messages.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends messagesUpdateManyAndReturnArgs>(args: SelectSubset<T, messagesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$messagesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Messages.
     * @param {messagesUpsertArgs} args - Arguments to update or create a Messages.
     * @example
     * // Update or create a Messages
     * const messages = await prisma.messages.upsert({
     *   create: {
     *     // ... data to create a Messages
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Messages we want to update
     *   }
     * })
     */
    upsert<T extends messagesUpsertArgs>(args: SelectSubset<T, messagesUpsertArgs<ExtArgs>>): Prisma__messagesClient<$Result.GetResult<Prisma.$messagesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {messagesCountArgs} args - Arguments to filter Messages to count.
     * @example
     * // Count the number of Messages
     * const count = await prisma.messages.count({
     *   where: {
     *     // ... the filter for the Messages we want to count
     *   }
     * })
    **/
    count<T extends messagesCountArgs>(
      args?: Subset<T, messagesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MessagesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MessagesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MessagesAggregateArgs>(args: Subset<T, MessagesAggregateArgs>): Prisma.PrismaPromise<GetMessagesAggregateType<T>>

    /**
     * Group by Messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {messagesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends messagesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: messagesGroupByArgs['orderBy'] }
        : { orderBy?: messagesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, messagesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMessagesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the messages model
   */
  readonly fields: messagesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for messages.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__messagesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    conversation<T extends conversationsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, conversationsDefaultArgs<ExtArgs>>): Prisma__conversationsClient<$Result.GetResult<Prisma.$conversationsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the messages model
   */
  interface messagesFieldRefs {
    readonly id: FieldRef<"messages", 'String'>
    readonly conversation_id: FieldRef<"messages", 'String'>
    readonly role: FieldRef<"messages", 'String'>
    readonly content: FieldRef<"messages", 'Json'>
    readonly created_at: FieldRef<"messages", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * messages findUnique
   */
  export type messagesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the messages
     */
    select?: messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the messages
     */
    omit?: messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: messagesInclude<ExtArgs> | null
    /**
     * Filter, which messages to fetch.
     */
    where: messagesWhereUniqueInput
  }

  /**
   * messages findUniqueOrThrow
   */
  export type messagesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the messages
     */
    select?: messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the messages
     */
    omit?: messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: messagesInclude<ExtArgs> | null
    /**
     * Filter, which messages to fetch.
     */
    where: messagesWhereUniqueInput
  }

  /**
   * messages findFirst
   */
  export type messagesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the messages
     */
    select?: messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the messages
     */
    omit?: messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: messagesInclude<ExtArgs> | null
    /**
     * Filter, which messages to fetch.
     */
    where?: messagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of messages to fetch.
     */
    orderBy?: messagesOrderByWithRelationInput | messagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for messages.
     */
    cursor?: messagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of messages.
     */
    distinct?: MessagesScalarFieldEnum | MessagesScalarFieldEnum[]
  }

  /**
   * messages findFirstOrThrow
   */
  export type messagesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the messages
     */
    select?: messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the messages
     */
    omit?: messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: messagesInclude<ExtArgs> | null
    /**
     * Filter, which messages to fetch.
     */
    where?: messagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of messages to fetch.
     */
    orderBy?: messagesOrderByWithRelationInput | messagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for messages.
     */
    cursor?: messagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of messages.
     */
    distinct?: MessagesScalarFieldEnum | MessagesScalarFieldEnum[]
  }

  /**
   * messages findMany
   */
  export type messagesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the messages
     */
    select?: messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the messages
     */
    omit?: messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: messagesInclude<ExtArgs> | null
    /**
     * Filter, which messages to fetch.
     */
    where?: messagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of messages to fetch.
     */
    orderBy?: messagesOrderByWithRelationInput | messagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing messages.
     */
    cursor?: messagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` messages.
     */
    skip?: number
    distinct?: MessagesScalarFieldEnum | MessagesScalarFieldEnum[]
  }

  /**
   * messages create
   */
  export type messagesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the messages
     */
    select?: messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the messages
     */
    omit?: messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: messagesInclude<ExtArgs> | null
    /**
     * The data needed to create a messages.
     */
    data: XOR<messagesCreateInput, messagesUncheckedCreateInput>
  }

  /**
   * messages createMany
   */
  export type messagesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many messages.
     */
    data: messagesCreateManyInput | messagesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * messages createManyAndReturn
   */
  export type messagesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the messages
     */
    select?: messagesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the messages
     */
    omit?: messagesOmit<ExtArgs> | null
    /**
     * The data used to create many messages.
     */
    data: messagesCreateManyInput | messagesCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: messagesIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * messages update
   */
  export type messagesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the messages
     */
    select?: messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the messages
     */
    omit?: messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: messagesInclude<ExtArgs> | null
    /**
     * The data needed to update a messages.
     */
    data: XOR<messagesUpdateInput, messagesUncheckedUpdateInput>
    /**
     * Choose, which messages to update.
     */
    where: messagesWhereUniqueInput
  }

  /**
   * messages updateMany
   */
  export type messagesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update messages.
     */
    data: XOR<messagesUpdateManyMutationInput, messagesUncheckedUpdateManyInput>
    /**
     * Filter which messages to update
     */
    where?: messagesWhereInput
    /**
     * Limit how many messages to update.
     */
    limit?: number
  }

  /**
   * messages updateManyAndReturn
   */
  export type messagesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the messages
     */
    select?: messagesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the messages
     */
    omit?: messagesOmit<ExtArgs> | null
    /**
     * The data used to update messages.
     */
    data: XOR<messagesUpdateManyMutationInput, messagesUncheckedUpdateManyInput>
    /**
     * Filter which messages to update
     */
    where?: messagesWhereInput
    /**
     * Limit how many messages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: messagesIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * messages upsert
   */
  export type messagesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the messages
     */
    select?: messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the messages
     */
    omit?: messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: messagesInclude<ExtArgs> | null
    /**
     * The filter to search for the messages to update in case it exists.
     */
    where: messagesWhereUniqueInput
    /**
     * In case the messages found by the `where` argument doesn't exist, create a new messages with this data.
     */
    create: XOR<messagesCreateInput, messagesUncheckedCreateInput>
    /**
     * In case the messages was found with the provided `where` argument, update it with this data.
     */
    update: XOR<messagesUpdateInput, messagesUncheckedUpdateInput>
  }

  /**
   * messages delete
   */
  export type messagesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the messages
     */
    select?: messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the messages
     */
    omit?: messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: messagesInclude<ExtArgs> | null
    /**
     * Filter which messages to delete.
     */
    where: messagesWhereUniqueInput
  }

  /**
   * messages deleteMany
   */
  export type messagesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which messages to delete
     */
    where?: messagesWhereInput
    /**
     * Limit how many messages to delete.
     */
    limit?: number
  }

  /**
   * messages without action
   */
  export type messagesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the messages
     */
    select?: messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the messages
     */
    omit?: messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: messagesInclude<ExtArgs> | null
  }


  /**
   * Model tg_channels
   */

  export type AggregateTg_channels = {
    _count: Tg_channelsCountAggregateOutputType | null
    _avg: Tg_channelsAvgAggregateOutputType | null
    _sum: Tg_channelsSumAggregateOutputType | null
    _min: Tg_channelsMinAggregateOutputType | null
    _max: Tg_channelsMaxAggregateOutputType | null
  }

  export type Tg_channelsAvgAggregateOutputType = {
    id: number | null
    subscription_fee: Decimal | null
  }

  export type Tg_channelsSumAggregateOutputType = {
    id: number | null
    subscription_fee: Decimal | null
  }

  export type Tg_channelsMinAggregateOutputType = {
    id: number | null
    channel_id: string | null
    user_id: string | null
    data_type: string | null
    data_id: string | null
    is_public: boolean | null
    is_free: boolean | null
    subscription_fee: Decimal | null
    last_synced_at: Date | null
    status: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Tg_channelsMaxAggregateOutputType = {
    id: number | null
    channel_id: string | null
    user_id: string | null
    data_type: string | null
    data_id: string | null
    is_public: boolean | null
    is_free: boolean | null
    subscription_fee: Decimal | null
    last_synced_at: Date | null
    status: string | null
    created_at: Date | null
    updated_at: Date | null
  }

  export type Tg_channelsCountAggregateOutputType = {
    id: number
    channel_id: number
    user_id: number
    data_type: number
    data_id: number
    metadata: number
    is_public: number
    is_free: number
    subscription_fee: number
    last_synced_at: number
    status: number
    created_at: number
    updated_at: number
    _all: number
  }


  export type Tg_channelsAvgAggregateInputType = {
    id?: true
    subscription_fee?: true
  }

  export type Tg_channelsSumAggregateInputType = {
    id?: true
    subscription_fee?: true
  }

  export type Tg_channelsMinAggregateInputType = {
    id?: true
    channel_id?: true
    user_id?: true
    data_type?: true
    data_id?: true
    is_public?: true
    is_free?: true
    subscription_fee?: true
    last_synced_at?: true
    status?: true
    created_at?: true
    updated_at?: true
  }

  export type Tg_channelsMaxAggregateInputType = {
    id?: true
    channel_id?: true
    user_id?: true
    data_type?: true
    data_id?: true
    is_public?: true
    is_free?: true
    subscription_fee?: true
    last_synced_at?: true
    status?: true
    created_at?: true
    updated_at?: true
  }

  export type Tg_channelsCountAggregateInputType = {
    id?: true
    channel_id?: true
    user_id?: true
    data_type?: true
    data_id?: true
    metadata?: true
    is_public?: true
    is_free?: true
    subscription_fee?: true
    last_synced_at?: true
    status?: true
    created_at?: true
    updated_at?: true
    _all?: true
  }

  export type Tg_channelsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tg_channels to aggregate.
     */
    where?: tg_channelsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tg_channels to fetch.
     */
    orderBy?: tg_channelsOrderByWithRelationInput | tg_channelsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tg_channelsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tg_channels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tg_channels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tg_channels
    **/
    _count?: true | Tg_channelsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tg_channelsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tg_channelsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tg_channelsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tg_channelsMaxAggregateInputType
  }

  export type GetTg_channelsAggregateType<T extends Tg_channelsAggregateArgs> = {
        [P in keyof T & keyof AggregateTg_channels]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTg_channels[P]>
      : GetScalarType<T[P], AggregateTg_channels[P]>
  }




  export type tg_channelsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tg_channelsWhereInput
    orderBy?: tg_channelsOrderByWithAggregationInput | tg_channelsOrderByWithAggregationInput[]
    by: Tg_channelsScalarFieldEnum[] | Tg_channelsScalarFieldEnum
    having?: tg_channelsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tg_channelsCountAggregateInputType | true
    _avg?: Tg_channelsAvgAggregateInputType
    _sum?: Tg_channelsSumAggregateInputType
    _min?: Tg_channelsMinAggregateInputType
    _max?: Tg_channelsMaxAggregateInputType
  }

  export type Tg_channelsGroupByOutputType = {
    id: number
    channel_id: string
    user_id: string
    data_type: string
    data_id: string
    metadata: JsonValue
    is_public: boolean
    is_free: boolean
    subscription_fee: Decimal
    last_synced_at: Date
    status: string
    created_at: Date
    updated_at: Date
    _count: Tg_channelsCountAggregateOutputType | null
    _avg: Tg_channelsAvgAggregateOutputType | null
    _sum: Tg_channelsSumAggregateOutputType | null
    _min: Tg_channelsMinAggregateOutputType | null
    _max: Tg_channelsMaxAggregateOutputType | null
  }

  type GetTg_channelsGroupByPayload<T extends tg_channelsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tg_channelsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tg_channelsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tg_channelsGroupByOutputType[P]>
            : GetScalarType<T[P], Tg_channelsGroupByOutputType[P]>
        }
      >
    >


  export type tg_channelsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    channel_id?: boolean
    user_id?: boolean
    data_type?: boolean
    data_id?: boolean
    metadata?: boolean
    is_public?: boolean
    is_free?: boolean
    subscription_fee?: boolean
    last_synced_at?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
    messages?: boolean | tg_channels$messagesArgs<ExtArgs>
    _count?: boolean | Tg_channelsCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tg_channels"]>

  export type tg_channelsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    channel_id?: boolean
    user_id?: boolean
    data_type?: boolean
    data_id?: boolean
    metadata?: boolean
    is_public?: boolean
    is_free?: boolean
    subscription_fee?: boolean
    last_synced_at?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["tg_channels"]>

  export type tg_channelsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    channel_id?: boolean
    user_id?: boolean
    data_type?: boolean
    data_id?: boolean
    metadata?: boolean
    is_public?: boolean
    is_free?: boolean
    subscription_fee?: boolean
    last_synced_at?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["tg_channels"]>

  export type tg_channelsSelectScalar = {
    id?: boolean
    channel_id?: boolean
    user_id?: boolean
    data_type?: boolean
    data_id?: boolean
    metadata?: boolean
    is_public?: boolean
    is_free?: boolean
    subscription_fee?: boolean
    last_synced_at?: boolean
    status?: boolean
    created_at?: boolean
    updated_at?: boolean
  }

  export type tg_channelsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "channel_id" | "user_id" | "data_type" | "data_id" | "metadata" | "is_public" | "is_free" | "subscription_fee" | "last_synced_at" | "status" | "created_at" | "updated_at", ExtArgs["result"]["tg_channels"]>
  export type tg_channelsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    messages?: boolean | tg_channels$messagesArgs<ExtArgs>
    _count?: boolean | Tg_channelsCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type tg_channelsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type tg_channelsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $tg_channelsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tg_channels"
    objects: {
      messages: Prisma.$tg_messagesPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      channel_id: string
      user_id: string
      data_type: string
      data_id: string
      metadata: Prisma.JsonValue
      is_public: boolean
      is_free: boolean
      subscription_fee: Prisma.Decimal
      last_synced_at: Date
      status: string
      created_at: Date
      updated_at: Date
    }, ExtArgs["result"]["tg_channels"]>
    composites: {}
  }

  type tg_channelsGetPayload<S extends boolean | null | undefined | tg_channelsDefaultArgs> = $Result.GetResult<Prisma.$tg_channelsPayload, S>

  type tg_channelsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tg_channelsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tg_channelsCountAggregateInputType | true
    }

  export interface tg_channelsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tg_channels'], meta: { name: 'tg_channels' } }
    /**
     * Find zero or one Tg_channels that matches the filter.
     * @param {tg_channelsFindUniqueArgs} args - Arguments to find a Tg_channels
     * @example
     * // Get one Tg_channels
     * const tg_channels = await prisma.tg_channels.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tg_channelsFindUniqueArgs>(args: SelectSubset<T, tg_channelsFindUniqueArgs<ExtArgs>>): Prisma__tg_channelsClient<$Result.GetResult<Prisma.$tg_channelsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tg_channels that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tg_channelsFindUniqueOrThrowArgs} args - Arguments to find a Tg_channels
     * @example
     * // Get one Tg_channels
     * const tg_channels = await prisma.tg_channels.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tg_channelsFindUniqueOrThrowArgs>(args: SelectSubset<T, tg_channelsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tg_channelsClient<$Result.GetResult<Prisma.$tg_channelsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tg_channels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tg_channelsFindFirstArgs} args - Arguments to find a Tg_channels
     * @example
     * // Get one Tg_channels
     * const tg_channels = await prisma.tg_channels.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tg_channelsFindFirstArgs>(args?: SelectSubset<T, tg_channelsFindFirstArgs<ExtArgs>>): Prisma__tg_channelsClient<$Result.GetResult<Prisma.$tg_channelsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tg_channels that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tg_channelsFindFirstOrThrowArgs} args - Arguments to find a Tg_channels
     * @example
     * // Get one Tg_channels
     * const tg_channels = await prisma.tg_channels.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tg_channelsFindFirstOrThrowArgs>(args?: SelectSubset<T, tg_channelsFindFirstOrThrowArgs<ExtArgs>>): Prisma__tg_channelsClient<$Result.GetResult<Prisma.$tg_channelsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tg_channels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tg_channelsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tg_channels
     * const tg_channels = await prisma.tg_channels.findMany()
     * 
     * // Get first 10 Tg_channels
     * const tg_channels = await prisma.tg_channels.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tg_channelsWithIdOnly = await prisma.tg_channels.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends tg_channelsFindManyArgs>(args?: SelectSubset<T, tg_channelsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tg_channelsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tg_channels.
     * @param {tg_channelsCreateArgs} args - Arguments to create a Tg_channels.
     * @example
     * // Create one Tg_channels
     * const Tg_channels = await prisma.tg_channels.create({
     *   data: {
     *     // ... data to create a Tg_channels
     *   }
     * })
     * 
     */
    create<T extends tg_channelsCreateArgs>(args: SelectSubset<T, tg_channelsCreateArgs<ExtArgs>>): Prisma__tg_channelsClient<$Result.GetResult<Prisma.$tg_channelsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tg_channels.
     * @param {tg_channelsCreateManyArgs} args - Arguments to create many Tg_channels.
     * @example
     * // Create many Tg_channels
     * const tg_channels = await prisma.tg_channels.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tg_channelsCreateManyArgs>(args?: SelectSubset<T, tg_channelsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tg_channels and returns the data saved in the database.
     * @param {tg_channelsCreateManyAndReturnArgs} args - Arguments to create many Tg_channels.
     * @example
     * // Create many Tg_channels
     * const tg_channels = await prisma.tg_channels.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tg_channels and only return the `id`
     * const tg_channelsWithIdOnly = await prisma.tg_channels.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends tg_channelsCreateManyAndReturnArgs>(args?: SelectSubset<T, tg_channelsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tg_channelsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tg_channels.
     * @param {tg_channelsDeleteArgs} args - Arguments to delete one Tg_channels.
     * @example
     * // Delete one Tg_channels
     * const Tg_channels = await prisma.tg_channels.delete({
     *   where: {
     *     // ... filter to delete one Tg_channels
     *   }
     * })
     * 
     */
    delete<T extends tg_channelsDeleteArgs>(args: SelectSubset<T, tg_channelsDeleteArgs<ExtArgs>>): Prisma__tg_channelsClient<$Result.GetResult<Prisma.$tg_channelsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tg_channels.
     * @param {tg_channelsUpdateArgs} args - Arguments to update one Tg_channels.
     * @example
     * // Update one Tg_channels
     * const tg_channels = await prisma.tg_channels.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tg_channelsUpdateArgs>(args: SelectSubset<T, tg_channelsUpdateArgs<ExtArgs>>): Prisma__tg_channelsClient<$Result.GetResult<Prisma.$tg_channelsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tg_channels.
     * @param {tg_channelsDeleteManyArgs} args - Arguments to filter Tg_channels to delete.
     * @example
     * // Delete a few Tg_channels
     * const { count } = await prisma.tg_channels.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tg_channelsDeleteManyArgs>(args?: SelectSubset<T, tg_channelsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tg_channels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tg_channelsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tg_channels
     * const tg_channels = await prisma.tg_channels.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tg_channelsUpdateManyArgs>(args: SelectSubset<T, tg_channelsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tg_channels and returns the data updated in the database.
     * @param {tg_channelsUpdateManyAndReturnArgs} args - Arguments to update many Tg_channels.
     * @example
     * // Update many Tg_channels
     * const tg_channels = await prisma.tg_channels.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tg_channels and only return the `id`
     * const tg_channelsWithIdOnly = await prisma.tg_channels.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends tg_channelsUpdateManyAndReturnArgs>(args: SelectSubset<T, tg_channelsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tg_channelsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tg_channels.
     * @param {tg_channelsUpsertArgs} args - Arguments to update or create a Tg_channels.
     * @example
     * // Update or create a Tg_channels
     * const tg_channels = await prisma.tg_channels.upsert({
     *   create: {
     *     // ... data to create a Tg_channels
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tg_channels we want to update
     *   }
     * })
     */
    upsert<T extends tg_channelsUpsertArgs>(args: SelectSubset<T, tg_channelsUpsertArgs<ExtArgs>>): Prisma__tg_channelsClient<$Result.GetResult<Prisma.$tg_channelsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tg_channels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tg_channelsCountArgs} args - Arguments to filter Tg_channels to count.
     * @example
     * // Count the number of Tg_channels
     * const count = await prisma.tg_channels.count({
     *   where: {
     *     // ... the filter for the Tg_channels we want to count
     *   }
     * })
    **/
    count<T extends tg_channelsCountArgs>(
      args?: Subset<T, tg_channelsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tg_channelsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tg_channels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tg_channelsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Tg_channelsAggregateArgs>(args: Subset<T, Tg_channelsAggregateArgs>): Prisma.PrismaPromise<GetTg_channelsAggregateType<T>>

    /**
     * Group by Tg_channels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tg_channelsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends tg_channelsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tg_channelsGroupByArgs['orderBy'] }
        : { orderBy?: tg_channelsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, tg_channelsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTg_channelsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tg_channels model
   */
  readonly fields: tg_channelsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tg_channels.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tg_channelsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    messages<T extends tg_channels$messagesArgs<ExtArgs> = {}>(args?: Subset<T, tg_channels$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tg_messagesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the tg_channels model
   */
  interface tg_channelsFieldRefs {
    readonly id: FieldRef<"tg_channels", 'Int'>
    readonly channel_id: FieldRef<"tg_channels", 'String'>
    readonly user_id: FieldRef<"tg_channels", 'String'>
    readonly data_type: FieldRef<"tg_channels", 'String'>
    readonly data_id: FieldRef<"tg_channels", 'String'>
    readonly metadata: FieldRef<"tg_channels", 'Json'>
    readonly is_public: FieldRef<"tg_channels", 'Boolean'>
    readonly is_free: FieldRef<"tg_channels", 'Boolean'>
    readonly subscription_fee: FieldRef<"tg_channels", 'Decimal'>
    readonly last_synced_at: FieldRef<"tg_channels", 'DateTime'>
    readonly status: FieldRef<"tg_channels", 'String'>
    readonly created_at: FieldRef<"tg_channels", 'DateTime'>
    readonly updated_at: FieldRef<"tg_channels", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * tg_channels findUnique
   */
  export type tg_channelsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_channels
     */
    select?: tg_channelsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_channels
     */
    omit?: tg_channelsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_channelsInclude<ExtArgs> | null
    /**
     * Filter, which tg_channels to fetch.
     */
    where: tg_channelsWhereUniqueInput
  }

  /**
   * tg_channels findUniqueOrThrow
   */
  export type tg_channelsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_channels
     */
    select?: tg_channelsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_channels
     */
    omit?: tg_channelsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_channelsInclude<ExtArgs> | null
    /**
     * Filter, which tg_channels to fetch.
     */
    where: tg_channelsWhereUniqueInput
  }

  /**
   * tg_channels findFirst
   */
  export type tg_channelsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_channels
     */
    select?: tg_channelsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_channels
     */
    omit?: tg_channelsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_channelsInclude<ExtArgs> | null
    /**
     * Filter, which tg_channels to fetch.
     */
    where?: tg_channelsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tg_channels to fetch.
     */
    orderBy?: tg_channelsOrderByWithRelationInput | tg_channelsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tg_channels.
     */
    cursor?: tg_channelsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tg_channels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tg_channels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tg_channels.
     */
    distinct?: Tg_channelsScalarFieldEnum | Tg_channelsScalarFieldEnum[]
  }

  /**
   * tg_channels findFirstOrThrow
   */
  export type tg_channelsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_channels
     */
    select?: tg_channelsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_channels
     */
    omit?: tg_channelsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_channelsInclude<ExtArgs> | null
    /**
     * Filter, which tg_channels to fetch.
     */
    where?: tg_channelsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tg_channels to fetch.
     */
    orderBy?: tg_channelsOrderByWithRelationInput | tg_channelsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tg_channels.
     */
    cursor?: tg_channelsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tg_channels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tg_channels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tg_channels.
     */
    distinct?: Tg_channelsScalarFieldEnum | Tg_channelsScalarFieldEnum[]
  }

  /**
   * tg_channels findMany
   */
  export type tg_channelsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_channels
     */
    select?: tg_channelsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_channels
     */
    omit?: tg_channelsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_channelsInclude<ExtArgs> | null
    /**
     * Filter, which tg_channels to fetch.
     */
    where?: tg_channelsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tg_channels to fetch.
     */
    orderBy?: tg_channelsOrderByWithRelationInput | tg_channelsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tg_channels.
     */
    cursor?: tg_channelsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tg_channels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tg_channels.
     */
    skip?: number
    distinct?: Tg_channelsScalarFieldEnum | Tg_channelsScalarFieldEnum[]
  }

  /**
   * tg_channels create
   */
  export type tg_channelsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_channels
     */
    select?: tg_channelsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_channels
     */
    omit?: tg_channelsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_channelsInclude<ExtArgs> | null
    /**
     * The data needed to create a tg_channels.
     */
    data: XOR<tg_channelsCreateInput, tg_channelsUncheckedCreateInput>
  }

  /**
   * tg_channels createMany
   */
  export type tg_channelsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tg_channels.
     */
    data: tg_channelsCreateManyInput | tg_channelsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * tg_channels createManyAndReturn
   */
  export type tg_channelsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_channels
     */
    select?: tg_channelsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tg_channels
     */
    omit?: tg_channelsOmit<ExtArgs> | null
    /**
     * The data used to create many tg_channels.
     */
    data: tg_channelsCreateManyInput | tg_channelsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * tg_channels update
   */
  export type tg_channelsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_channels
     */
    select?: tg_channelsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_channels
     */
    omit?: tg_channelsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_channelsInclude<ExtArgs> | null
    /**
     * The data needed to update a tg_channels.
     */
    data: XOR<tg_channelsUpdateInput, tg_channelsUncheckedUpdateInput>
    /**
     * Choose, which tg_channels to update.
     */
    where: tg_channelsWhereUniqueInput
  }

  /**
   * tg_channels updateMany
   */
  export type tg_channelsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tg_channels.
     */
    data: XOR<tg_channelsUpdateManyMutationInput, tg_channelsUncheckedUpdateManyInput>
    /**
     * Filter which tg_channels to update
     */
    where?: tg_channelsWhereInput
    /**
     * Limit how many tg_channels to update.
     */
    limit?: number
  }

  /**
   * tg_channels updateManyAndReturn
   */
  export type tg_channelsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_channels
     */
    select?: tg_channelsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tg_channels
     */
    omit?: tg_channelsOmit<ExtArgs> | null
    /**
     * The data used to update tg_channels.
     */
    data: XOR<tg_channelsUpdateManyMutationInput, tg_channelsUncheckedUpdateManyInput>
    /**
     * Filter which tg_channels to update
     */
    where?: tg_channelsWhereInput
    /**
     * Limit how many tg_channels to update.
     */
    limit?: number
  }

  /**
   * tg_channels upsert
   */
  export type tg_channelsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_channels
     */
    select?: tg_channelsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_channels
     */
    omit?: tg_channelsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_channelsInclude<ExtArgs> | null
    /**
     * The filter to search for the tg_channels to update in case it exists.
     */
    where: tg_channelsWhereUniqueInput
    /**
     * In case the tg_channels found by the `where` argument doesn't exist, create a new tg_channels with this data.
     */
    create: XOR<tg_channelsCreateInput, tg_channelsUncheckedCreateInput>
    /**
     * In case the tg_channels was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tg_channelsUpdateInput, tg_channelsUncheckedUpdateInput>
  }

  /**
   * tg_channels delete
   */
  export type tg_channelsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_channels
     */
    select?: tg_channelsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_channels
     */
    omit?: tg_channelsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_channelsInclude<ExtArgs> | null
    /**
     * Filter which tg_channels to delete.
     */
    where: tg_channelsWhereUniqueInput
  }

  /**
   * tg_channels deleteMany
   */
  export type tg_channelsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tg_channels to delete
     */
    where?: tg_channelsWhereInput
    /**
     * Limit how many tg_channels to delete.
     */
    limit?: number
  }

  /**
   * tg_channels.messages
   */
  export type tg_channels$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_messages
     */
    select?: tg_messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_messages
     */
    omit?: tg_messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_messagesInclude<ExtArgs> | null
    where?: tg_messagesWhereInput
    orderBy?: tg_messagesOrderByWithRelationInput | tg_messagesOrderByWithRelationInput[]
    cursor?: tg_messagesWhereUniqueInput
    take?: number
    skip?: number
    distinct?: Tg_messagesScalarFieldEnum | Tg_messagesScalarFieldEnum[]
  }

  /**
   * tg_channels without action
   */
  export type tg_channelsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_channels
     */
    select?: tg_channelsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_channels
     */
    omit?: tg_channelsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_channelsInclude<ExtArgs> | null
  }


  /**
   * Model tg_messages
   */

  export type AggregateTg_messages = {
    _count: Tg_messagesCountAggregateOutputType | null
    _avg: Tg_messagesAvgAggregateOutputType | null
    _sum: Tg_messagesSumAggregateOutputType | null
    _min: Tg_messagesMinAggregateOutputType | null
    _max: Tg_messagesMaxAggregateOutputType | null
  }

  export type Tg_messagesAvgAggregateOutputType = {
    id: number | null
    message_timestamp: number | null
  }

  export type Tg_messagesSumAggregateOutputType = {
    id: number | null
    message_timestamp: bigint | null
  }

  export type Tg_messagesMinAggregateOutputType = {
    id: number | null
    message_id: string | null
    channel_id: string | null
    chat_id: string | null
    message_text: string | null
    message_timestamp: bigint | null
    sender_id: string | null
    reply_to: string | null
    topic_id: string | null
    is_pinned: boolean | null
    media_type: string | null
    media_file_id: string | null
    media_url: string | null
    created_at: Date | null
    updated_at: Date | null
    send_username: string | null
    send_firstname: string | null
    send_lastname: string | null
  }

  export type Tg_messagesMaxAggregateOutputType = {
    id: number | null
    message_id: string | null
    channel_id: string | null
    chat_id: string | null
    message_text: string | null
    message_timestamp: bigint | null
    sender_id: string | null
    reply_to: string | null
    topic_id: string | null
    is_pinned: boolean | null
    media_type: string | null
    media_file_id: string | null
    media_url: string | null
    created_at: Date | null
    updated_at: Date | null
    send_username: string | null
    send_firstname: string | null
    send_lastname: string | null
  }

  export type Tg_messagesCountAggregateOutputType = {
    id: number
    message_id: number
    channel_id: number
    chat_id: number
    message_text: number
    message_timestamp: number
    sender_id: number
    sender: number
    reply_to: number
    topic_id: number
    buttons: number
    reactions: number
    is_pinned: number
    media_type: number
    media_file_id: number
    media_url: number
    media_metadata: number
    created_at: number
    updated_at: number
    send_username: number
    send_firstname: number
    send_lastname: number
    _all: number
  }


  export type Tg_messagesAvgAggregateInputType = {
    id?: true
    message_timestamp?: true
  }

  export type Tg_messagesSumAggregateInputType = {
    id?: true
    message_timestamp?: true
  }

  export type Tg_messagesMinAggregateInputType = {
    id?: true
    message_id?: true
    channel_id?: true
    chat_id?: true
    message_text?: true
    message_timestamp?: true
    sender_id?: true
    reply_to?: true
    topic_id?: true
    is_pinned?: true
    media_type?: true
    media_file_id?: true
    media_url?: true
    created_at?: true
    updated_at?: true
    send_username?: true
    send_firstname?: true
    send_lastname?: true
  }

  export type Tg_messagesMaxAggregateInputType = {
    id?: true
    message_id?: true
    channel_id?: true
    chat_id?: true
    message_text?: true
    message_timestamp?: true
    sender_id?: true
    reply_to?: true
    topic_id?: true
    is_pinned?: true
    media_type?: true
    media_file_id?: true
    media_url?: true
    created_at?: true
    updated_at?: true
    send_username?: true
    send_firstname?: true
    send_lastname?: true
  }

  export type Tg_messagesCountAggregateInputType = {
    id?: true
    message_id?: true
    channel_id?: true
    chat_id?: true
    message_text?: true
    message_timestamp?: true
    sender_id?: true
    sender?: true
    reply_to?: true
    topic_id?: true
    buttons?: true
    reactions?: true
    is_pinned?: true
    media_type?: true
    media_file_id?: true
    media_url?: true
    media_metadata?: true
    created_at?: true
    updated_at?: true
    send_username?: true
    send_firstname?: true
    send_lastname?: true
    _all?: true
  }

  export type Tg_messagesAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tg_messages to aggregate.
     */
    where?: tg_messagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tg_messages to fetch.
     */
    orderBy?: tg_messagesOrderByWithRelationInput | tg_messagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tg_messagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tg_messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tg_messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tg_messages
    **/
    _count?: true | Tg_messagesCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tg_messagesAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tg_messagesSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tg_messagesMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tg_messagesMaxAggregateInputType
  }

  export type GetTg_messagesAggregateType<T extends Tg_messagesAggregateArgs> = {
        [P in keyof T & keyof AggregateTg_messages]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTg_messages[P]>
      : GetScalarType<T[P], AggregateTg_messages[P]>
  }




  export type tg_messagesGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tg_messagesWhereInput
    orderBy?: tg_messagesOrderByWithAggregationInput | tg_messagesOrderByWithAggregationInput[]
    by: Tg_messagesScalarFieldEnum[] | Tg_messagesScalarFieldEnum
    having?: tg_messagesScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tg_messagesCountAggregateInputType | true
    _avg?: Tg_messagesAvgAggregateInputType
    _sum?: Tg_messagesSumAggregateInputType
    _min?: Tg_messagesMinAggregateInputType
    _max?: Tg_messagesMaxAggregateInputType
  }

  export type Tg_messagesGroupByOutputType = {
    id: number
    message_id: string
    channel_id: string
    chat_id: string
    message_text: string
    message_timestamp: bigint
    sender_id: string | null
    sender: JsonValue | null
    reply_to: string | null
    topic_id: string | null
    buttons: JsonValue | null
    reactions: JsonValue | null
    is_pinned: boolean
    media_type: string | null
    media_file_id: string | null
    media_url: string | null
    media_metadata: JsonValue | null
    created_at: Date
    updated_at: Date
    send_username: string | null
    send_firstname: string | null
    send_lastname: string | null
    _count: Tg_messagesCountAggregateOutputType | null
    _avg: Tg_messagesAvgAggregateOutputType | null
    _sum: Tg_messagesSumAggregateOutputType | null
    _min: Tg_messagesMinAggregateOutputType | null
    _max: Tg_messagesMaxAggregateOutputType | null
  }

  type GetTg_messagesGroupByPayload<T extends tg_messagesGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tg_messagesGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tg_messagesGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tg_messagesGroupByOutputType[P]>
            : GetScalarType<T[P], Tg_messagesGroupByOutputType[P]>
        }
      >
    >


  export type tg_messagesSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    message_id?: boolean
    channel_id?: boolean
    chat_id?: boolean
    message_text?: boolean
    message_timestamp?: boolean
    sender_id?: boolean
    sender?: boolean
    reply_to?: boolean
    topic_id?: boolean
    buttons?: boolean
    reactions?: boolean
    is_pinned?: boolean
    media_type?: boolean
    media_file_id?: boolean
    media_url?: boolean
    media_metadata?: boolean
    created_at?: boolean
    updated_at?: boolean
    send_username?: boolean
    send_firstname?: boolean
    send_lastname?: boolean
    channels?: boolean | tg_channelsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tg_messages"]>

  export type tg_messagesSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    message_id?: boolean
    channel_id?: boolean
    chat_id?: boolean
    message_text?: boolean
    message_timestamp?: boolean
    sender_id?: boolean
    sender?: boolean
    reply_to?: boolean
    topic_id?: boolean
    buttons?: boolean
    reactions?: boolean
    is_pinned?: boolean
    media_type?: boolean
    media_file_id?: boolean
    media_url?: boolean
    media_metadata?: boolean
    created_at?: boolean
    updated_at?: boolean
    send_username?: boolean
    send_firstname?: boolean
    send_lastname?: boolean
    channels?: boolean | tg_channelsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tg_messages"]>

  export type tg_messagesSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    message_id?: boolean
    channel_id?: boolean
    chat_id?: boolean
    message_text?: boolean
    message_timestamp?: boolean
    sender_id?: boolean
    sender?: boolean
    reply_to?: boolean
    topic_id?: boolean
    buttons?: boolean
    reactions?: boolean
    is_pinned?: boolean
    media_type?: boolean
    media_file_id?: boolean
    media_url?: boolean
    media_metadata?: boolean
    created_at?: boolean
    updated_at?: boolean
    send_username?: boolean
    send_firstname?: boolean
    send_lastname?: boolean
    channels?: boolean | tg_channelsDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tg_messages"]>

  export type tg_messagesSelectScalar = {
    id?: boolean
    message_id?: boolean
    channel_id?: boolean
    chat_id?: boolean
    message_text?: boolean
    message_timestamp?: boolean
    sender_id?: boolean
    sender?: boolean
    reply_to?: boolean
    topic_id?: boolean
    buttons?: boolean
    reactions?: boolean
    is_pinned?: boolean
    media_type?: boolean
    media_file_id?: boolean
    media_url?: boolean
    media_metadata?: boolean
    created_at?: boolean
    updated_at?: boolean
    send_username?: boolean
    send_firstname?: boolean
    send_lastname?: boolean
  }

  export type tg_messagesOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "message_id" | "channel_id" | "chat_id" | "message_text" | "message_timestamp" | "sender_id" | "sender" | "reply_to" | "topic_id" | "buttons" | "reactions" | "is_pinned" | "media_type" | "media_file_id" | "media_url" | "media_metadata" | "created_at" | "updated_at" | "send_username" | "send_firstname" | "send_lastname", ExtArgs["result"]["tg_messages"]>
  export type tg_messagesInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    channels?: boolean | tg_channelsDefaultArgs<ExtArgs>
  }
  export type tg_messagesIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    channels?: boolean | tg_channelsDefaultArgs<ExtArgs>
  }
  export type tg_messagesIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    channels?: boolean | tg_channelsDefaultArgs<ExtArgs>
  }

  export type $tg_messagesPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tg_messages"
    objects: {
      channels: Prisma.$tg_channelsPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      message_id: string
      channel_id: string
      chat_id: string
      message_text: string
      message_timestamp: bigint
      sender_id: string | null
      sender: Prisma.JsonValue | null
      reply_to: string | null
      topic_id: string | null
      buttons: Prisma.JsonValue | null
      reactions: Prisma.JsonValue | null
      is_pinned: boolean
      media_type: string | null
      media_file_id: string | null
      media_url: string | null
      media_metadata: Prisma.JsonValue | null
      created_at: Date
      updated_at: Date
      send_username: string | null
      send_firstname: string | null
      send_lastname: string | null
    }, ExtArgs["result"]["tg_messages"]>
    composites: {}
  }

  type tg_messagesGetPayload<S extends boolean | null | undefined | tg_messagesDefaultArgs> = $Result.GetResult<Prisma.$tg_messagesPayload, S>

  type tg_messagesCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tg_messagesFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tg_messagesCountAggregateInputType | true
    }

  export interface tg_messagesDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tg_messages'], meta: { name: 'tg_messages' } }
    /**
     * Find zero or one Tg_messages that matches the filter.
     * @param {tg_messagesFindUniqueArgs} args - Arguments to find a Tg_messages
     * @example
     * // Get one Tg_messages
     * const tg_messages = await prisma.tg_messages.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tg_messagesFindUniqueArgs>(args: SelectSubset<T, tg_messagesFindUniqueArgs<ExtArgs>>): Prisma__tg_messagesClient<$Result.GetResult<Prisma.$tg_messagesPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tg_messages that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tg_messagesFindUniqueOrThrowArgs} args - Arguments to find a Tg_messages
     * @example
     * // Get one Tg_messages
     * const tg_messages = await prisma.tg_messages.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tg_messagesFindUniqueOrThrowArgs>(args: SelectSubset<T, tg_messagesFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tg_messagesClient<$Result.GetResult<Prisma.$tg_messagesPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tg_messages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tg_messagesFindFirstArgs} args - Arguments to find a Tg_messages
     * @example
     * // Get one Tg_messages
     * const tg_messages = await prisma.tg_messages.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tg_messagesFindFirstArgs>(args?: SelectSubset<T, tg_messagesFindFirstArgs<ExtArgs>>): Prisma__tg_messagesClient<$Result.GetResult<Prisma.$tg_messagesPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tg_messages that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tg_messagesFindFirstOrThrowArgs} args - Arguments to find a Tg_messages
     * @example
     * // Get one Tg_messages
     * const tg_messages = await prisma.tg_messages.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tg_messagesFindFirstOrThrowArgs>(args?: SelectSubset<T, tg_messagesFindFirstOrThrowArgs<ExtArgs>>): Prisma__tg_messagesClient<$Result.GetResult<Prisma.$tg_messagesPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tg_messages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tg_messagesFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tg_messages
     * const tg_messages = await prisma.tg_messages.findMany()
     * 
     * // Get first 10 Tg_messages
     * const tg_messages = await prisma.tg_messages.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tg_messagesWithIdOnly = await prisma.tg_messages.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends tg_messagesFindManyArgs>(args?: SelectSubset<T, tg_messagesFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tg_messagesPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tg_messages.
     * @param {tg_messagesCreateArgs} args - Arguments to create a Tg_messages.
     * @example
     * // Create one Tg_messages
     * const Tg_messages = await prisma.tg_messages.create({
     *   data: {
     *     // ... data to create a Tg_messages
     *   }
     * })
     * 
     */
    create<T extends tg_messagesCreateArgs>(args: SelectSubset<T, tg_messagesCreateArgs<ExtArgs>>): Prisma__tg_messagesClient<$Result.GetResult<Prisma.$tg_messagesPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tg_messages.
     * @param {tg_messagesCreateManyArgs} args - Arguments to create many Tg_messages.
     * @example
     * // Create many Tg_messages
     * const tg_messages = await prisma.tg_messages.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tg_messagesCreateManyArgs>(args?: SelectSubset<T, tg_messagesCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tg_messages and returns the data saved in the database.
     * @param {tg_messagesCreateManyAndReturnArgs} args - Arguments to create many Tg_messages.
     * @example
     * // Create many Tg_messages
     * const tg_messages = await prisma.tg_messages.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tg_messages and only return the `id`
     * const tg_messagesWithIdOnly = await prisma.tg_messages.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends tg_messagesCreateManyAndReturnArgs>(args?: SelectSubset<T, tg_messagesCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tg_messagesPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tg_messages.
     * @param {tg_messagesDeleteArgs} args - Arguments to delete one Tg_messages.
     * @example
     * // Delete one Tg_messages
     * const Tg_messages = await prisma.tg_messages.delete({
     *   where: {
     *     // ... filter to delete one Tg_messages
     *   }
     * })
     * 
     */
    delete<T extends tg_messagesDeleteArgs>(args: SelectSubset<T, tg_messagesDeleteArgs<ExtArgs>>): Prisma__tg_messagesClient<$Result.GetResult<Prisma.$tg_messagesPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tg_messages.
     * @param {tg_messagesUpdateArgs} args - Arguments to update one Tg_messages.
     * @example
     * // Update one Tg_messages
     * const tg_messages = await prisma.tg_messages.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tg_messagesUpdateArgs>(args: SelectSubset<T, tg_messagesUpdateArgs<ExtArgs>>): Prisma__tg_messagesClient<$Result.GetResult<Prisma.$tg_messagesPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tg_messages.
     * @param {tg_messagesDeleteManyArgs} args - Arguments to filter Tg_messages to delete.
     * @example
     * // Delete a few Tg_messages
     * const { count } = await prisma.tg_messages.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tg_messagesDeleteManyArgs>(args?: SelectSubset<T, tg_messagesDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tg_messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tg_messagesUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tg_messages
     * const tg_messages = await prisma.tg_messages.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tg_messagesUpdateManyArgs>(args: SelectSubset<T, tg_messagesUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tg_messages and returns the data updated in the database.
     * @param {tg_messagesUpdateManyAndReturnArgs} args - Arguments to update many Tg_messages.
     * @example
     * // Update many Tg_messages
     * const tg_messages = await prisma.tg_messages.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tg_messages and only return the `id`
     * const tg_messagesWithIdOnly = await prisma.tg_messages.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends tg_messagesUpdateManyAndReturnArgs>(args: SelectSubset<T, tg_messagesUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tg_messagesPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tg_messages.
     * @param {tg_messagesUpsertArgs} args - Arguments to update or create a Tg_messages.
     * @example
     * // Update or create a Tg_messages
     * const tg_messages = await prisma.tg_messages.upsert({
     *   create: {
     *     // ... data to create a Tg_messages
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tg_messages we want to update
     *   }
     * })
     */
    upsert<T extends tg_messagesUpsertArgs>(args: SelectSubset<T, tg_messagesUpsertArgs<ExtArgs>>): Prisma__tg_messagesClient<$Result.GetResult<Prisma.$tg_messagesPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tg_messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tg_messagesCountArgs} args - Arguments to filter Tg_messages to count.
     * @example
     * // Count the number of Tg_messages
     * const count = await prisma.tg_messages.count({
     *   where: {
     *     // ... the filter for the Tg_messages we want to count
     *   }
     * })
    **/
    count<T extends tg_messagesCountArgs>(
      args?: Subset<T, tg_messagesCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tg_messagesCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tg_messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tg_messagesAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Tg_messagesAggregateArgs>(args: Subset<T, Tg_messagesAggregateArgs>): Prisma.PrismaPromise<GetTg_messagesAggregateType<T>>

    /**
     * Group by Tg_messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tg_messagesGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends tg_messagesGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tg_messagesGroupByArgs['orderBy'] }
        : { orderBy?: tg_messagesGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, tg_messagesGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTg_messagesGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tg_messages model
   */
  readonly fields: tg_messagesFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tg_messages.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tg_messagesClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    channels<T extends tg_channelsDefaultArgs<ExtArgs> = {}>(args?: Subset<T, tg_channelsDefaultArgs<ExtArgs>>): Prisma__tg_channelsClient<$Result.GetResult<Prisma.$tg_channelsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the tg_messages model
   */
  interface tg_messagesFieldRefs {
    readonly id: FieldRef<"tg_messages", 'Int'>
    readonly message_id: FieldRef<"tg_messages", 'String'>
    readonly channel_id: FieldRef<"tg_messages", 'String'>
    readonly chat_id: FieldRef<"tg_messages", 'String'>
    readonly message_text: FieldRef<"tg_messages", 'String'>
    readonly message_timestamp: FieldRef<"tg_messages", 'BigInt'>
    readonly sender_id: FieldRef<"tg_messages", 'String'>
    readonly sender: FieldRef<"tg_messages", 'Json'>
    readonly reply_to: FieldRef<"tg_messages", 'String'>
    readonly topic_id: FieldRef<"tg_messages", 'String'>
    readonly buttons: FieldRef<"tg_messages", 'Json'>
    readonly reactions: FieldRef<"tg_messages", 'Json'>
    readonly is_pinned: FieldRef<"tg_messages", 'Boolean'>
    readonly media_type: FieldRef<"tg_messages", 'String'>
    readonly media_file_id: FieldRef<"tg_messages", 'String'>
    readonly media_url: FieldRef<"tg_messages", 'String'>
    readonly media_metadata: FieldRef<"tg_messages", 'Json'>
    readonly created_at: FieldRef<"tg_messages", 'DateTime'>
    readonly updated_at: FieldRef<"tg_messages", 'DateTime'>
    readonly send_username: FieldRef<"tg_messages", 'String'>
    readonly send_firstname: FieldRef<"tg_messages", 'String'>
    readonly send_lastname: FieldRef<"tg_messages", 'String'>
  }
    

  // Custom InputTypes
  /**
   * tg_messages findUnique
   */
  export type tg_messagesFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_messages
     */
    select?: tg_messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_messages
     */
    omit?: tg_messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_messagesInclude<ExtArgs> | null
    /**
     * Filter, which tg_messages to fetch.
     */
    where: tg_messagesWhereUniqueInput
  }

  /**
   * tg_messages findUniqueOrThrow
   */
  export type tg_messagesFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_messages
     */
    select?: tg_messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_messages
     */
    omit?: tg_messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_messagesInclude<ExtArgs> | null
    /**
     * Filter, which tg_messages to fetch.
     */
    where: tg_messagesWhereUniqueInput
  }

  /**
   * tg_messages findFirst
   */
  export type tg_messagesFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_messages
     */
    select?: tg_messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_messages
     */
    omit?: tg_messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_messagesInclude<ExtArgs> | null
    /**
     * Filter, which tg_messages to fetch.
     */
    where?: tg_messagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tg_messages to fetch.
     */
    orderBy?: tg_messagesOrderByWithRelationInput | tg_messagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tg_messages.
     */
    cursor?: tg_messagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tg_messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tg_messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tg_messages.
     */
    distinct?: Tg_messagesScalarFieldEnum | Tg_messagesScalarFieldEnum[]
  }

  /**
   * tg_messages findFirstOrThrow
   */
  export type tg_messagesFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_messages
     */
    select?: tg_messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_messages
     */
    omit?: tg_messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_messagesInclude<ExtArgs> | null
    /**
     * Filter, which tg_messages to fetch.
     */
    where?: tg_messagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tg_messages to fetch.
     */
    orderBy?: tg_messagesOrderByWithRelationInput | tg_messagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tg_messages.
     */
    cursor?: tg_messagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tg_messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tg_messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tg_messages.
     */
    distinct?: Tg_messagesScalarFieldEnum | Tg_messagesScalarFieldEnum[]
  }

  /**
   * tg_messages findMany
   */
  export type tg_messagesFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_messages
     */
    select?: tg_messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_messages
     */
    omit?: tg_messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_messagesInclude<ExtArgs> | null
    /**
     * Filter, which tg_messages to fetch.
     */
    where?: tg_messagesWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tg_messages to fetch.
     */
    orderBy?: tg_messagesOrderByWithRelationInput | tg_messagesOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tg_messages.
     */
    cursor?: tg_messagesWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tg_messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tg_messages.
     */
    skip?: number
    distinct?: Tg_messagesScalarFieldEnum | Tg_messagesScalarFieldEnum[]
  }

  /**
   * tg_messages create
   */
  export type tg_messagesCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_messages
     */
    select?: tg_messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_messages
     */
    omit?: tg_messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_messagesInclude<ExtArgs> | null
    /**
     * The data needed to create a tg_messages.
     */
    data: XOR<tg_messagesCreateInput, tg_messagesUncheckedCreateInput>
  }

  /**
   * tg_messages createMany
   */
  export type tg_messagesCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tg_messages.
     */
    data: tg_messagesCreateManyInput | tg_messagesCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * tg_messages createManyAndReturn
   */
  export type tg_messagesCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_messages
     */
    select?: tg_messagesSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tg_messages
     */
    omit?: tg_messagesOmit<ExtArgs> | null
    /**
     * The data used to create many tg_messages.
     */
    data: tg_messagesCreateManyInput | tg_messagesCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_messagesIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * tg_messages update
   */
  export type tg_messagesUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_messages
     */
    select?: tg_messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_messages
     */
    omit?: tg_messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_messagesInclude<ExtArgs> | null
    /**
     * The data needed to update a tg_messages.
     */
    data: XOR<tg_messagesUpdateInput, tg_messagesUncheckedUpdateInput>
    /**
     * Choose, which tg_messages to update.
     */
    where: tg_messagesWhereUniqueInput
  }

  /**
   * tg_messages updateMany
   */
  export type tg_messagesUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tg_messages.
     */
    data: XOR<tg_messagesUpdateManyMutationInput, tg_messagesUncheckedUpdateManyInput>
    /**
     * Filter which tg_messages to update
     */
    where?: tg_messagesWhereInput
    /**
     * Limit how many tg_messages to update.
     */
    limit?: number
  }

  /**
   * tg_messages updateManyAndReturn
   */
  export type tg_messagesUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_messages
     */
    select?: tg_messagesSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tg_messages
     */
    omit?: tg_messagesOmit<ExtArgs> | null
    /**
     * The data used to update tg_messages.
     */
    data: XOR<tg_messagesUpdateManyMutationInput, tg_messagesUncheckedUpdateManyInput>
    /**
     * Filter which tg_messages to update
     */
    where?: tg_messagesWhereInput
    /**
     * Limit how many tg_messages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_messagesIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * tg_messages upsert
   */
  export type tg_messagesUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_messages
     */
    select?: tg_messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_messages
     */
    omit?: tg_messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_messagesInclude<ExtArgs> | null
    /**
     * The filter to search for the tg_messages to update in case it exists.
     */
    where: tg_messagesWhereUniqueInput
    /**
     * In case the tg_messages found by the `where` argument doesn't exist, create a new tg_messages with this data.
     */
    create: XOR<tg_messagesCreateInput, tg_messagesUncheckedCreateInput>
    /**
     * In case the tg_messages was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tg_messagesUpdateInput, tg_messagesUncheckedUpdateInput>
  }

  /**
   * tg_messages delete
   */
  export type tg_messagesDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_messages
     */
    select?: tg_messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_messages
     */
    omit?: tg_messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_messagesInclude<ExtArgs> | null
    /**
     * Filter which tg_messages to delete.
     */
    where: tg_messagesWhereUniqueInput
  }

  /**
   * tg_messages deleteMany
   */
  export type tg_messagesDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tg_messages to delete
     */
    where?: tg_messagesWhereInput
    /**
     * Limit how many tg_messages to delete.
     */
    limit?: number
  }

  /**
   * tg_messages without action
   */
  export type tg_messagesDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tg_messages
     */
    select?: tg_messagesSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tg_messages
     */
    omit?: tg_messagesOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: tg_messagesInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UsersScalarFieldEnum: {
    id: 'id',
    username: 'username',
    email: 'email',
    api_key: 'api_key',
    api_key_enabled: 'api_key_enabled',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type UsersScalarFieldEnum = (typeof UsersScalarFieldEnum)[keyof typeof UsersScalarFieldEnum]


  export const ConversationsScalarFieldEnum: {
    id: 'id',
    user_id: 'user_id',
    created_at: 'created_at',
    status: 'status'
  };

  export type ConversationsScalarFieldEnum = (typeof ConversationsScalarFieldEnum)[keyof typeof ConversationsScalarFieldEnum]


  export const MessagesScalarFieldEnum: {
    id: 'id',
    conversation_id: 'conversation_id',
    role: 'role',
    content: 'content',
    created_at: 'created_at'
  };

  export type MessagesScalarFieldEnum = (typeof MessagesScalarFieldEnum)[keyof typeof MessagesScalarFieldEnum]


  export const Tg_channelsScalarFieldEnum: {
    id: 'id',
    channel_id: 'channel_id',
    user_id: 'user_id',
    data_type: 'data_type',
    data_id: 'data_id',
    metadata: 'metadata',
    is_public: 'is_public',
    is_free: 'is_free',
    subscription_fee: 'subscription_fee',
    last_synced_at: 'last_synced_at',
    status: 'status',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  export type Tg_channelsScalarFieldEnum = (typeof Tg_channelsScalarFieldEnum)[keyof typeof Tg_channelsScalarFieldEnum]


  export const Tg_messagesScalarFieldEnum: {
    id: 'id',
    message_id: 'message_id',
    channel_id: 'channel_id',
    chat_id: 'chat_id',
    message_text: 'message_text',
    message_timestamp: 'message_timestamp',
    sender_id: 'sender_id',
    sender: 'sender',
    reply_to: 'reply_to',
    topic_id: 'topic_id',
    buttons: 'buttons',
    reactions: 'reactions',
    is_pinned: 'is_pinned',
    media_type: 'media_type',
    media_file_id: 'media_file_id',
    media_url: 'media_url',
    media_metadata: 'media_metadata',
    created_at: 'created_at',
    updated_at: 'updated_at',
    send_username: 'send_username',
    send_firstname: 'send_firstname',
    send_lastname: 'send_lastname'
  };

  export type Tg_messagesScalarFieldEnum = (typeof Tg_messagesScalarFieldEnum)[keyof typeof Tg_messagesScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type usersWhereInput = {
    AND?: usersWhereInput | usersWhereInput[]
    OR?: usersWhereInput[]
    NOT?: usersWhereInput | usersWhereInput[]
    id?: StringFilter<"users"> | string
    username?: StringFilter<"users"> | string
    email?: StringNullableFilter<"users"> | string | null
    api_key?: StringFilter<"users"> | string
    api_key_enabled?: BoolFilter<"users"> | boolean
    created_at?: DateTimeFilter<"users"> | Date | string
    updated_at?: DateTimeFilter<"users"> | Date | string
    conversations?: ConversationsListRelationFilter
  }

  export type usersOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    email?: SortOrderInput | SortOrder
    api_key?: SortOrder
    api_key_enabled?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    conversations?: conversationsOrderByRelationAggregateInput
  }

  export type usersWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    username?: string
    email?: string
    api_key?: string
    AND?: usersWhereInput | usersWhereInput[]
    OR?: usersWhereInput[]
    NOT?: usersWhereInput | usersWhereInput[]
    api_key_enabled?: BoolFilter<"users"> | boolean
    created_at?: DateTimeFilter<"users"> | Date | string
    updated_at?: DateTimeFilter<"users"> | Date | string
    conversations?: ConversationsListRelationFilter
  }, "id" | "username" | "email" | "api_key">

  export type usersOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    email?: SortOrderInput | SortOrder
    api_key?: SortOrder
    api_key_enabled?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: usersCountOrderByAggregateInput
    _max?: usersMaxOrderByAggregateInput
    _min?: usersMinOrderByAggregateInput
  }

  export type usersScalarWhereWithAggregatesInput = {
    AND?: usersScalarWhereWithAggregatesInput | usersScalarWhereWithAggregatesInput[]
    OR?: usersScalarWhereWithAggregatesInput[]
    NOT?: usersScalarWhereWithAggregatesInput | usersScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"users"> | string
    username?: StringWithAggregatesFilter<"users"> | string
    email?: StringNullableWithAggregatesFilter<"users"> | string | null
    api_key?: StringWithAggregatesFilter<"users"> | string
    api_key_enabled?: BoolWithAggregatesFilter<"users"> | boolean
    created_at?: DateTimeWithAggregatesFilter<"users"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"users"> | Date | string
  }

  export type conversationsWhereInput = {
    AND?: conversationsWhereInput | conversationsWhereInput[]
    OR?: conversationsWhereInput[]
    NOT?: conversationsWhereInput | conversationsWhereInput[]
    id?: StringFilter<"conversations"> | string
    user_id?: StringFilter<"conversations"> | string
    created_at?: DateTimeFilter<"conversations"> | Date | string
    status?: StringFilter<"conversations"> | string
    user?: XOR<UsersScalarRelationFilter, usersWhereInput>
    messages?: MessagesListRelationFilter
  }

  export type conversationsOrderByWithRelationInput = {
    id?: SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    status?: SortOrder
    user?: usersOrderByWithRelationInput
    messages?: messagesOrderByRelationAggregateInput
  }

  export type conversationsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: conversationsWhereInput | conversationsWhereInput[]
    OR?: conversationsWhereInput[]
    NOT?: conversationsWhereInput | conversationsWhereInput[]
    user_id?: StringFilter<"conversations"> | string
    created_at?: DateTimeFilter<"conversations"> | Date | string
    status?: StringFilter<"conversations"> | string
    user?: XOR<UsersScalarRelationFilter, usersWhereInput>
    messages?: MessagesListRelationFilter
  }, "id">

  export type conversationsOrderByWithAggregationInput = {
    id?: SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    status?: SortOrder
    _count?: conversationsCountOrderByAggregateInput
    _max?: conversationsMaxOrderByAggregateInput
    _min?: conversationsMinOrderByAggregateInput
  }

  export type conversationsScalarWhereWithAggregatesInput = {
    AND?: conversationsScalarWhereWithAggregatesInput | conversationsScalarWhereWithAggregatesInput[]
    OR?: conversationsScalarWhereWithAggregatesInput[]
    NOT?: conversationsScalarWhereWithAggregatesInput | conversationsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"conversations"> | string
    user_id?: StringWithAggregatesFilter<"conversations"> | string
    created_at?: DateTimeWithAggregatesFilter<"conversations"> | Date | string
    status?: StringWithAggregatesFilter<"conversations"> | string
  }

  export type messagesWhereInput = {
    AND?: messagesWhereInput | messagesWhereInput[]
    OR?: messagesWhereInput[]
    NOT?: messagesWhereInput | messagesWhereInput[]
    id?: StringFilter<"messages"> | string
    conversation_id?: StringFilter<"messages"> | string
    role?: StringFilter<"messages"> | string
    content?: JsonFilter<"messages">
    created_at?: DateTimeFilter<"messages"> | Date | string
    conversation?: XOR<ConversationsScalarRelationFilter, conversationsWhereInput>
  }

  export type messagesOrderByWithRelationInput = {
    id?: SortOrder
    conversation_id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    created_at?: SortOrder
    conversation?: conversationsOrderByWithRelationInput
  }

  export type messagesWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: messagesWhereInput | messagesWhereInput[]
    OR?: messagesWhereInput[]
    NOT?: messagesWhereInput | messagesWhereInput[]
    conversation_id?: StringFilter<"messages"> | string
    role?: StringFilter<"messages"> | string
    content?: JsonFilter<"messages">
    created_at?: DateTimeFilter<"messages"> | Date | string
    conversation?: XOR<ConversationsScalarRelationFilter, conversationsWhereInput>
  }, "id">

  export type messagesOrderByWithAggregationInput = {
    id?: SortOrder
    conversation_id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    created_at?: SortOrder
    _count?: messagesCountOrderByAggregateInput
    _max?: messagesMaxOrderByAggregateInput
    _min?: messagesMinOrderByAggregateInput
  }

  export type messagesScalarWhereWithAggregatesInput = {
    AND?: messagesScalarWhereWithAggregatesInput | messagesScalarWhereWithAggregatesInput[]
    OR?: messagesScalarWhereWithAggregatesInput[]
    NOT?: messagesScalarWhereWithAggregatesInput | messagesScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"messages"> | string
    conversation_id?: StringWithAggregatesFilter<"messages"> | string
    role?: StringWithAggregatesFilter<"messages"> | string
    content?: JsonWithAggregatesFilter<"messages">
    created_at?: DateTimeWithAggregatesFilter<"messages"> | Date | string
  }

  export type tg_channelsWhereInput = {
    AND?: tg_channelsWhereInput | tg_channelsWhereInput[]
    OR?: tg_channelsWhereInput[]
    NOT?: tg_channelsWhereInput | tg_channelsWhereInput[]
    id?: IntFilter<"tg_channels"> | number
    channel_id?: StringFilter<"tg_channels"> | string
    user_id?: StringFilter<"tg_channels"> | string
    data_type?: StringFilter<"tg_channels"> | string
    data_id?: StringFilter<"tg_channels"> | string
    metadata?: JsonFilter<"tg_channels">
    is_public?: BoolFilter<"tg_channels"> | boolean
    is_free?: BoolFilter<"tg_channels"> | boolean
    subscription_fee?: DecimalFilter<"tg_channels"> | Decimal | DecimalJsLike | number | string
    last_synced_at?: DateTimeFilter<"tg_channels"> | Date | string
    status?: StringFilter<"tg_channels"> | string
    created_at?: DateTimeFilter<"tg_channels"> | Date | string
    updated_at?: DateTimeFilter<"tg_channels"> | Date | string
    messages?: Tg_messagesListRelationFilter
  }

  export type tg_channelsOrderByWithRelationInput = {
    id?: SortOrder
    channel_id?: SortOrder
    user_id?: SortOrder
    data_type?: SortOrder
    data_id?: SortOrder
    metadata?: SortOrder
    is_public?: SortOrder
    is_free?: SortOrder
    subscription_fee?: SortOrder
    last_synced_at?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    messages?: tg_messagesOrderByRelationAggregateInput
  }

  export type tg_channelsWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    channel_id?: string
    user_id_data_id?: tg_channelsUser_idData_idCompoundUniqueInput
    AND?: tg_channelsWhereInput | tg_channelsWhereInput[]
    OR?: tg_channelsWhereInput[]
    NOT?: tg_channelsWhereInput | tg_channelsWhereInput[]
    user_id?: StringFilter<"tg_channels"> | string
    data_type?: StringFilter<"tg_channels"> | string
    data_id?: StringFilter<"tg_channels"> | string
    metadata?: JsonFilter<"tg_channels">
    is_public?: BoolFilter<"tg_channels"> | boolean
    is_free?: BoolFilter<"tg_channels"> | boolean
    subscription_fee?: DecimalFilter<"tg_channels"> | Decimal | DecimalJsLike | number | string
    last_synced_at?: DateTimeFilter<"tg_channels"> | Date | string
    status?: StringFilter<"tg_channels"> | string
    created_at?: DateTimeFilter<"tg_channels"> | Date | string
    updated_at?: DateTimeFilter<"tg_channels"> | Date | string
    messages?: Tg_messagesListRelationFilter
  }, "id" | "channel_id" | "user_id_data_id">

  export type tg_channelsOrderByWithAggregationInput = {
    id?: SortOrder
    channel_id?: SortOrder
    user_id?: SortOrder
    data_type?: SortOrder
    data_id?: SortOrder
    metadata?: SortOrder
    is_public?: SortOrder
    is_free?: SortOrder
    subscription_fee?: SortOrder
    last_synced_at?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    _count?: tg_channelsCountOrderByAggregateInput
    _avg?: tg_channelsAvgOrderByAggregateInput
    _max?: tg_channelsMaxOrderByAggregateInput
    _min?: tg_channelsMinOrderByAggregateInput
    _sum?: tg_channelsSumOrderByAggregateInput
  }

  export type tg_channelsScalarWhereWithAggregatesInput = {
    AND?: tg_channelsScalarWhereWithAggregatesInput | tg_channelsScalarWhereWithAggregatesInput[]
    OR?: tg_channelsScalarWhereWithAggregatesInput[]
    NOT?: tg_channelsScalarWhereWithAggregatesInput | tg_channelsScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"tg_channels"> | number
    channel_id?: StringWithAggregatesFilter<"tg_channels"> | string
    user_id?: StringWithAggregatesFilter<"tg_channels"> | string
    data_type?: StringWithAggregatesFilter<"tg_channels"> | string
    data_id?: StringWithAggregatesFilter<"tg_channels"> | string
    metadata?: JsonWithAggregatesFilter<"tg_channels">
    is_public?: BoolWithAggregatesFilter<"tg_channels"> | boolean
    is_free?: BoolWithAggregatesFilter<"tg_channels"> | boolean
    subscription_fee?: DecimalWithAggregatesFilter<"tg_channels"> | Decimal | DecimalJsLike | number | string
    last_synced_at?: DateTimeWithAggregatesFilter<"tg_channels"> | Date | string
    status?: StringWithAggregatesFilter<"tg_channels"> | string
    created_at?: DateTimeWithAggregatesFilter<"tg_channels"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"tg_channels"> | Date | string
  }

  export type tg_messagesWhereInput = {
    AND?: tg_messagesWhereInput | tg_messagesWhereInput[]
    OR?: tg_messagesWhereInput[]
    NOT?: tg_messagesWhereInput | tg_messagesWhereInput[]
    id?: IntFilter<"tg_messages"> | number
    message_id?: StringFilter<"tg_messages"> | string
    channel_id?: StringFilter<"tg_messages"> | string
    chat_id?: StringFilter<"tg_messages"> | string
    message_text?: StringFilter<"tg_messages"> | string
    message_timestamp?: BigIntFilter<"tg_messages"> | bigint | number
    sender_id?: StringNullableFilter<"tg_messages"> | string | null
    sender?: JsonNullableFilter<"tg_messages">
    reply_to?: StringNullableFilter<"tg_messages"> | string | null
    topic_id?: StringNullableFilter<"tg_messages"> | string | null
    buttons?: JsonNullableFilter<"tg_messages">
    reactions?: JsonNullableFilter<"tg_messages">
    is_pinned?: BoolFilter<"tg_messages"> | boolean
    media_type?: StringNullableFilter<"tg_messages"> | string | null
    media_file_id?: StringNullableFilter<"tg_messages"> | string | null
    media_url?: StringNullableFilter<"tg_messages"> | string | null
    media_metadata?: JsonNullableFilter<"tg_messages">
    created_at?: DateTimeFilter<"tg_messages"> | Date | string
    updated_at?: DateTimeFilter<"tg_messages"> | Date | string
    send_username?: StringNullableFilter<"tg_messages"> | string | null
    send_firstname?: StringNullableFilter<"tg_messages"> | string | null
    send_lastname?: StringNullableFilter<"tg_messages"> | string | null
    channels?: XOR<Tg_channelsScalarRelationFilter, tg_channelsWhereInput>
  }

  export type tg_messagesOrderByWithRelationInput = {
    id?: SortOrder
    message_id?: SortOrder
    channel_id?: SortOrder
    chat_id?: SortOrder
    message_text?: SortOrder
    message_timestamp?: SortOrder
    sender_id?: SortOrderInput | SortOrder
    sender?: SortOrderInput | SortOrder
    reply_to?: SortOrderInput | SortOrder
    topic_id?: SortOrderInput | SortOrder
    buttons?: SortOrderInput | SortOrder
    reactions?: SortOrderInput | SortOrder
    is_pinned?: SortOrder
    media_type?: SortOrderInput | SortOrder
    media_file_id?: SortOrderInput | SortOrder
    media_url?: SortOrderInput | SortOrder
    media_metadata?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    send_username?: SortOrderInput | SortOrder
    send_firstname?: SortOrderInput | SortOrder
    send_lastname?: SortOrderInput | SortOrder
    channels?: tg_channelsOrderByWithRelationInput
  }

  export type tg_messagesWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    channel_id_message_id?: tg_messagesChannel_idMessage_idCompoundUniqueInput
    AND?: tg_messagesWhereInput | tg_messagesWhereInput[]
    OR?: tg_messagesWhereInput[]
    NOT?: tg_messagesWhereInput | tg_messagesWhereInput[]
    message_id?: StringFilter<"tg_messages"> | string
    channel_id?: StringFilter<"tg_messages"> | string
    chat_id?: StringFilter<"tg_messages"> | string
    message_text?: StringFilter<"tg_messages"> | string
    message_timestamp?: BigIntFilter<"tg_messages"> | bigint | number
    sender_id?: StringNullableFilter<"tg_messages"> | string | null
    sender?: JsonNullableFilter<"tg_messages">
    reply_to?: StringNullableFilter<"tg_messages"> | string | null
    topic_id?: StringNullableFilter<"tg_messages"> | string | null
    buttons?: JsonNullableFilter<"tg_messages">
    reactions?: JsonNullableFilter<"tg_messages">
    is_pinned?: BoolFilter<"tg_messages"> | boolean
    media_type?: StringNullableFilter<"tg_messages"> | string | null
    media_file_id?: StringNullableFilter<"tg_messages"> | string | null
    media_url?: StringNullableFilter<"tg_messages"> | string | null
    media_metadata?: JsonNullableFilter<"tg_messages">
    created_at?: DateTimeFilter<"tg_messages"> | Date | string
    updated_at?: DateTimeFilter<"tg_messages"> | Date | string
    send_username?: StringNullableFilter<"tg_messages"> | string | null
    send_firstname?: StringNullableFilter<"tg_messages"> | string | null
    send_lastname?: StringNullableFilter<"tg_messages"> | string | null
    channels?: XOR<Tg_channelsScalarRelationFilter, tg_channelsWhereInput>
  }, "id" | "channel_id_message_id">

  export type tg_messagesOrderByWithAggregationInput = {
    id?: SortOrder
    message_id?: SortOrder
    channel_id?: SortOrder
    chat_id?: SortOrder
    message_text?: SortOrder
    message_timestamp?: SortOrder
    sender_id?: SortOrderInput | SortOrder
    sender?: SortOrderInput | SortOrder
    reply_to?: SortOrderInput | SortOrder
    topic_id?: SortOrderInput | SortOrder
    buttons?: SortOrderInput | SortOrder
    reactions?: SortOrderInput | SortOrder
    is_pinned?: SortOrder
    media_type?: SortOrderInput | SortOrder
    media_file_id?: SortOrderInput | SortOrder
    media_url?: SortOrderInput | SortOrder
    media_metadata?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    send_username?: SortOrderInput | SortOrder
    send_firstname?: SortOrderInput | SortOrder
    send_lastname?: SortOrderInput | SortOrder
    _count?: tg_messagesCountOrderByAggregateInput
    _avg?: tg_messagesAvgOrderByAggregateInput
    _max?: tg_messagesMaxOrderByAggregateInput
    _min?: tg_messagesMinOrderByAggregateInput
    _sum?: tg_messagesSumOrderByAggregateInput
  }

  export type tg_messagesScalarWhereWithAggregatesInput = {
    AND?: tg_messagesScalarWhereWithAggregatesInput | tg_messagesScalarWhereWithAggregatesInput[]
    OR?: tg_messagesScalarWhereWithAggregatesInput[]
    NOT?: tg_messagesScalarWhereWithAggregatesInput | tg_messagesScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"tg_messages"> | number
    message_id?: StringWithAggregatesFilter<"tg_messages"> | string
    channel_id?: StringWithAggregatesFilter<"tg_messages"> | string
    chat_id?: StringWithAggregatesFilter<"tg_messages"> | string
    message_text?: StringWithAggregatesFilter<"tg_messages"> | string
    message_timestamp?: BigIntWithAggregatesFilter<"tg_messages"> | bigint | number
    sender_id?: StringNullableWithAggregatesFilter<"tg_messages"> | string | null
    sender?: JsonNullableWithAggregatesFilter<"tg_messages">
    reply_to?: StringNullableWithAggregatesFilter<"tg_messages"> | string | null
    topic_id?: StringNullableWithAggregatesFilter<"tg_messages"> | string | null
    buttons?: JsonNullableWithAggregatesFilter<"tg_messages">
    reactions?: JsonNullableWithAggregatesFilter<"tg_messages">
    is_pinned?: BoolWithAggregatesFilter<"tg_messages"> | boolean
    media_type?: StringNullableWithAggregatesFilter<"tg_messages"> | string | null
    media_file_id?: StringNullableWithAggregatesFilter<"tg_messages"> | string | null
    media_url?: StringNullableWithAggregatesFilter<"tg_messages"> | string | null
    media_metadata?: JsonNullableWithAggregatesFilter<"tg_messages">
    created_at?: DateTimeWithAggregatesFilter<"tg_messages"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"tg_messages"> | Date | string
    send_username?: StringNullableWithAggregatesFilter<"tg_messages"> | string | null
    send_firstname?: StringNullableWithAggregatesFilter<"tg_messages"> | string | null
    send_lastname?: StringNullableWithAggregatesFilter<"tg_messages"> | string | null
  }

  export type usersCreateInput = {
    id?: string
    username: string
    email?: string | null
    api_key?: string
    api_key_enabled?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    conversations?: conversationsCreateNestedManyWithoutUserInput
  }

  export type usersUncheckedCreateInput = {
    id?: string
    username: string
    email?: string | null
    api_key?: string
    api_key_enabled?: boolean
    created_at?: Date | string
    updated_at?: Date | string
    conversations?: conversationsUncheckedCreateNestedManyWithoutUserInput
  }

  export type usersUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    api_key?: StringFieldUpdateOperationsInput | string
    api_key_enabled?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    conversations?: conversationsUpdateManyWithoutUserNestedInput
  }

  export type usersUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    api_key?: StringFieldUpdateOperationsInput | string
    api_key_enabled?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    conversations?: conversationsUncheckedUpdateManyWithoutUserNestedInput
  }

  export type usersCreateManyInput = {
    id?: string
    username: string
    email?: string | null
    api_key?: string
    api_key_enabled?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type usersUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    api_key?: StringFieldUpdateOperationsInput | string
    api_key_enabled?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type usersUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    api_key?: StringFieldUpdateOperationsInput | string
    api_key_enabled?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type conversationsCreateInput = {
    id?: string
    created_at?: Date | string
    status?: string
    user: usersCreateNestedOneWithoutConversationsInput
    messages?: messagesCreateNestedManyWithoutConversationInput
  }

  export type conversationsUncheckedCreateInput = {
    id?: string
    user_id: string
    created_at?: Date | string
    status?: string
    messages?: messagesUncheckedCreateNestedManyWithoutConversationInput
  }

  export type conversationsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    user?: usersUpdateOneRequiredWithoutConversationsNestedInput
    messages?: messagesUpdateManyWithoutConversationNestedInput
  }

  export type conversationsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    messages?: messagesUncheckedUpdateManyWithoutConversationNestedInput
  }

  export type conversationsCreateManyInput = {
    id?: string
    user_id: string
    created_at?: Date | string
    status?: string
  }

  export type conversationsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
  }

  export type conversationsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
  }

  export type messagesCreateInput = {
    id?: string
    role: string
    content: JsonNullValueInput | InputJsonValue
    created_at?: Date | string
    conversation: conversationsCreateNestedOneWithoutMessagesInput
  }

  export type messagesUncheckedCreateInput = {
    id?: string
    conversation_id: string
    role: string
    content: JsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type messagesUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    conversation?: conversationsUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type messagesUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    conversation_id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type messagesCreateManyInput = {
    id?: string
    conversation_id: string
    role: string
    content: JsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type messagesUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type messagesUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    conversation_id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tg_channelsCreateInput = {
    channel_id: string
    user_id: string
    data_type: string
    data_id: string
    metadata?: JsonNullValueInput | InputJsonValue
    is_public?: boolean
    is_free?: boolean
    subscription_fee?: Decimal | DecimalJsLike | number | string
    last_synced_at?: Date | string
    status?: string
    created_at?: Date | string
    updated_at?: Date | string
    messages?: tg_messagesCreateNestedManyWithoutChannelsInput
  }

  export type tg_channelsUncheckedCreateInput = {
    id?: number
    channel_id: string
    user_id: string
    data_type: string
    data_id: string
    metadata?: JsonNullValueInput | InputJsonValue
    is_public?: boolean
    is_free?: boolean
    subscription_fee?: Decimal | DecimalJsLike | number | string
    last_synced_at?: Date | string
    status?: string
    created_at?: Date | string
    updated_at?: Date | string
    messages?: tg_messagesUncheckedCreateNestedManyWithoutChannelsInput
  }

  export type tg_channelsUpdateInput = {
    channel_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    data_type?: StringFieldUpdateOperationsInput | string
    data_id?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    is_public?: BoolFieldUpdateOperationsInput | boolean
    is_free?: BoolFieldUpdateOperationsInput | boolean
    subscription_fee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    last_synced_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: tg_messagesUpdateManyWithoutChannelsNestedInput
  }

  export type tg_channelsUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    channel_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    data_type?: StringFieldUpdateOperationsInput | string
    data_id?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    is_public?: BoolFieldUpdateOperationsInput | boolean
    is_free?: BoolFieldUpdateOperationsInput | boolean
    subscription_fee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    last_synced_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: tg_messagesUncheckedUpdateManyWithoutChannelsNestedInput
  }

  export type tg_channelsCreateManyInput = {
    id?: number
    channel_id: string
    user_id: string
    data_type: string
    data_id: string
    metadata?: JsonNullValueInput | InputJsonValue
    is_public?: boolean
    is_free?: boolean
    subscription_fee?: Decimal | DecimalJsLike | number | string
    last_synced_at?: Date | string
    status?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type tg_channelsUpdateManyMutationInput = {
    channel_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    data_type?: StringFieldUpdateOperationsInput | string
    data_id?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    is_public?: BoolFieldUpdateOperationsInput | boolean
    is_free?: BoolFieldUpdateOperationsInput | boolean
    subscription_fee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    last_synced_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tg_channelsUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    channel_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    data_type?: StringFieldUpdateOperationsInput | string
    data_id?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    is_public?: BoolFieldUpdateOperationsInput | boolean
    is_free?: BoolFieldUpdateOperationsInput | boolean
    subscription_fee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    last_synced_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tg_messagesCreateInput = {
    message_id: string
    chat_id: string
    message_text: string
    message_timestamp: bigint | number
    sender_id?: string | null
    sender?: NullableJsonNullValueInput | InputJsonValue
    reply_to?: string | null
    topic_id?: string | null
    buttons?: NullableJsonNullValueInput | InputJsonValue
    reactions?: NullableJsonNullValueInput | InputJsonValue
    is_pinned?: boolean
    media_type?: string | null
    media_file_id?: string | null
    media_url?: string | null
    media_metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    send_username?: string | null
    send_firstname?: string | null
    send_lastname?: string | null
    channels: tg_channelsCreateNestedOneWithoutMessagesInput
  }

  export type tg_messagesUncheckedCreateInput = {
    id?: number
    message_id: string
    channel_id: string
    chat_id: string
    message_text: string
    message_timestamp: bigint | number
    sender_id?: string | null
    sender?: NullableJsonNullValueInput | InputJsonValue
    reply_to?: string | null
    topic_id?: string | null
    buttons?: NullableJsonNullValueInput | InputJsonValue
    reactions?: NullableJsonNullValueInput | InputJsonValue
    is_pinned?: boolean
    media_type?: string | null
    media_file_id?: string | null
    media_url?: string | null
    media_metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    send_username?: string | null
    send_firstname?: string | null
    send_lastname?: string | null
  }

  export type tg_messagesUpdateInput = {
    message_id?: StringFieldUpdateOperationsInput | string
    chat_id?: StringFieldUpdateOperationsInput | string
    message_text?: StringFieldUpdateOperationsInput | string
    message_timestamp?: BigIntFieldUpdateOperationsInput | bigint | number
    sender_id?: NullableStringFieldUpdateOperationsInput | string | null
    sender?: NullableJsonNullValueInput | InputJsonValue
    reply_to?: NullableStringFieldUpdateOperationsInput | string | null
    topic_id?: NullableStringFieldUpdateOperationsInput | string | null
    buttons?: NullableJsonNullValueInput | InputJsonValue
    reactions?: NullableJsonNullValueInput | InputJsonValue
    is_pinned?: BoolFieldUpdateOperationsInput | boolean
    media_type?: NullableStringFieldUpdateOperationsInput | string | null
    media_file_id?: NullableStringFieldUpdateOperationsInput | string | null
    media_url?: NullableStringFieldUpdateOperationsInput | string | null
    media_metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    send_username?: NullableStringFieldUpdateOperationsInput | string | null
    send_firstname?: NullableStringFieldUpdateOperationsInput | string | null
    send_lastname?: NullableStringFieldUpdateOperationsInput | string | null
    channels?: tg_channelsUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type tg_messagesUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    message_id?: StringFieldUpdateOperationsInput | string
    channel_id?: StringFieldUpdateOperationsInput | string
    chat_id?: StringFieldUpdateOperationsInput | string
    message_text?: StringFieldUpdateOperationsInput | string
    message_timestamp?: BigIntFieldUpdateOperationsInput | bigint | number
    sender_id?: NullableStringFieldUpdateOperationsInput | string | null
    sender?: NullableJsonNullValueInput | InputJsonValue
    reply_to?: NullableStringFieldUpdateOperationsInput | string | null
    topic_id?: NullableStringFieldUpdateOperationsInput | string | null
    buttons?: NullableJsonNullValueInput | InputJsonValue
    reactions?: NullableJsonNullValueInput | InputJsonValue
    is_pinned?: BoolFieldUpdateOperationsInput | boolean
    media_type?: NullableStringFieldUpdateOperationsInput | string | null
    media_file_id?: NullableStringFieldUpdateOperationsInput | string | null
    media_url?: NullableStringFieldUpdateOperationsInput | string | null
    media_metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    send_username?: NullableStringFieldUpdateOperationsInput | string | null
    send_firstname?: NullableStringFieldUpdateOperationsInput | string | null
    send_lastname?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tg_messagesCreateManyInput = {
    id?: number
    message_id: string
    channel_id: string
    chat_id: string
    message_text: string
    message_timestamp: bigint | number
    sender_id?: string | null
    sender?: NullableJsonNullValueInput | InputJsonValue
    reply_to?: string | null
    topic_id?: string | null
    buttons?: NullableJsonNullValueInput | InputJsonValue
    reactions?: NullableJsonNullValueInput | InputJsonValue
    is_pinned?: boolean
    media_type?: string | null
    media_file_id?: string | null
    media_url?: string | null
    media_metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    send_username?: string | null
    send_firstname?: string | null
    send_lastname?: string | null
  }

  export type tg_messagesUpdateManyMutationInput = {
    message_id?: StringFieldUpdateOperationsInput | string
    chat_id?: StringFieldUpdateOperationsInput | string
    message_text?: StringFieldUpdateOperationsInput | string
    message_timestamp?: BigIntFieldUpdateOperationsInput | bigint | number
    sender_id?: NullableStringFieldUpdateOperationsInput | string | null
    sender?: NullableJsonNullValueInput | InputJsonValue
    reply_to?: NullableStringFieldUpdateOperationsInput | string | null
    topic_id?: NullableStringFieldUpdateOperationsInput | string | null
    buttons?: NullableJsonNullValueInput | InputJsonValue
    reactions?: NullableJsonNullValueInput | InputJsonValue
    is_pinned?: BoolFieldUpdateOperationsInput | boolean
    media_type?: NullableStringFieldUpdateOperationsInput | string | null
    media_file_id?: NullableStringFieldUpdateOperationsInput | string | null
    media_url?: NullableStringFieldUpdateOperationsInput | string | null
    media_metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    send_username?: NullableStringFieldUpdateOperationsInput | string | null
    send_firstname?: NullableStringFieldUpdateOperationsInput | string | null
    send_lastname?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tg_messagesUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    message_id?: StringFieldUpdateOperationsInput | string
    channel_id?: StringFieldUpdateOperationsInput | string
    chat_id?: StringFieldUpdateOperationsInput | string
    message_text?: StringFieldUpdateOperationsInput | string
    message_timestamp?: BigIntFieldUpdateOperationsInput | bigint | number
    sender_id?: NullableStringFieldUpdateOperationsInput | string | null
    sender?: NullableJsonNullValueInput | InputJsonValue
    reply_to?: NullableStringFieldUpdateOperationsInput | string | null
    topic_id?: NullableStringFieldUpdateOperationsInput | string | null
    buttons?: NullableJsonNullValueInput | InputJsonValue
    reactions?: NullableJsonNullValueInput | InputJsonValue
    is_pinned?: BoolFieldUpdateOperationsInput | boolean
    media_type?: NullableStringFieldUpdateOperationsInput | string | null
    media_file_id?: NullableStringFieldUpdateOperationsInput | string | null
    media_url?: NullableStringFieldUpdateOperationsInput | string | null
    media_metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    send_username?: NullableStringFieldUpdateOperationsInput | string | null
    send_firstname?: NullableStringFieldUpdateOperationsInput | string | null
    send_lastname?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ConversationsListRelationFilter = {
    every?: conversationsWhereInput
    some?: conversationsWhereInput
    none?: conversationsWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type conversationsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type usersCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    api_key?: SortOrder
    api_key_enabled?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type usersMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    api_key?: SortOrder
    api_key_enabled?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type usersMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    email?: SortOrder
    api_key?: SortOrder
    api_key_enabled?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type UsersScalarRelationFilter = {
    is?: usersWhereInput
    isNot?: usersWhereInput
  }

  export type MessagesListRelationFilter = {
    every?: messagesWhereInput
    some?: messagesWhereInput
    none?: messagesWhereInput
  }

  export type messagesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type conversationsCountOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    status?: SortOrder
  }

  export type conversationsMaxOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    status?: SortOrder
  }

  export type conversationsMinOrderByAggregateInput = {
    id?: SortOrder
    user_id?: SortOrder
    created_at?: SortOrder
    status?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ConversationsScalarRelationFilter = {
    is?: conversationsWhereInput
    isNot?: conversationsWhereInput
  }

  export type messagesCountOrderByAggregateInput = {
    id?: SortOrder
    conversation_id?: SortOrder
    role?: SortOrder
    content?: SortOrder
    created_at?: SortOrder
  }

  export type messagesMaxOrderByAggregateInput = {
    id?: SortOrder
    conversation_id?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
  }

  export type messagesMinOrderByAggregateInput = {
    id?: SortOrder
    conversation_id?: SortOrder
    role?: SortOrder
    created_at?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type Tg_messagesListRelationFilter = {
    every?: tg_messagesWhereInput
    some?: tg_messagesWhereInput
    none?: tg_messagesWhereInput
  }

  export type tg_messagesOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type tg_channelsUser_idData_idCompoundUniqueInput = {
    user_id: string
    data_id: string
  }

  export type tg_channelsCountOrderByAggregateInput = {
    id?: SortOrder
    channel_id?: SortOrder
    user_id?: SortOrder
    data_type?: SortOrder
    data_id?: SortOrder
    metadata?: SortOrder
    is_public?: SortOrder
    is_free?: SortOrder
    subscription_fee?: SortOrder
    last_synced_at?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type tg_channelsAvgOrderByAggregateInput = {
    id?: SortOrder
    subscription_fee?: SortOrder
  }

  export type tg_channelsMaxOrderByAggregateInput = {
    id?: SortOrder
    channel_id?: SortOrder
    user_id?: SortOrder
    data_type?: SortOrder
    data_id?: SortOrder
    is_public?: SortOrder
    is_free?: SortOrder
    subscription_fee?: SortOrder
    last_synced_at?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type tg_channelsMinOrderByAggregateInput = {
    id?: SortOrder
    channel_id?: SortOrder
    user_id?: SortOrder
    data_type?: SortOrder
    data_id?: SortOrder
    is_public?: SortOrder
    is_free?: SortOrder
    subscription_fee?: SortOrder
    last_synced_at?: SortOrder
    status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
  }

  export type tg_channelsSumOrderByAggregateInput = {
    id?: SortOrder
    subscription_fee?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type Tg_channelsScalarRelationFilter = {
    is?: tg_channelsWhereInput
    isNot?: tg_channelsWhereInput
  }

  export type tg_messagesChannel_idMessage_idCompoundUniqueInput = {
    channel_id: string
    message_id: string
  }

  export type tg_messagesCountOrderByAggregateInput = {
    id?: SortOrder
    message_id?: SortOrder
    channel_id?: SortOrder
    chat_id?: SortOrder
    message_text?: SortOrder
    message_timestamp?: SortOrder
    sender_id?: SortOrder
    sender?: SortOrder
    reply_to?: SortOrder
    topic_id?: SortOrder
    buttons?: SortOrder
    reactions?: SortOrder
    is_pinned?: SortOrder
    media_type?: SortOrder
    media_file_id?: SortOrder
    media_url?: SortOrder
    media_metadata?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    send_username?: SortOrder
    send_firstname?: SortOrder
    send_lastname?: SortOrder
  }

  export type tg_messagesAvgOrderByAggregateInput = {
    id?: SortOrder
    message_timestamp?: SortOrder
  }

  export type tg_messagesMaxOrderByAggregateInput = {
    id?: SortOrder
    message_id?: SortOrder
    channel_id?: SortOrder
    chat_id?: SortOrder
    message_text?: SortOrder
    message_timestamp?: SortOrder
    sender_id?: SortOrder
    reply_to?: SortOrder
    topic_id?: SortOrder
    is_pinned?: SortOrder
    media_type?: SortOrder
    media_file_id?: SortOrder
    media_url?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    send_username?: SortOrder
    send_firstname?: SortOrder
    send_lastname?: SortOrder
  }

  export type tg_messagesMinOrderByAggregateInput = {
    id?: SortOrder
    message_id?: SortOrder
    channel_id?: SortOrder
    chat_id?: SortOrder
    message_text?: SortOrder
    message_timestamp?: SortOrder
    sender_id?: SortOrder
    reply_to?: SortOrder
    topic_id?: SortOrder
    is_pinned?: SortOrder
    media_type?: SortOrder
    media_file_id?: SortOrder
    media_url?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    send_username?: SortOrder
    send_firstname?: SortOrder
    send_lastname?: SortOrder
  }

  export type tg_messagesSumOrderByAggregateInput = {
    id?: SortOrder
    message_timestamp?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type conversationsCreateNestedManyWithoutUserInput = {
    create?: XOR<conversationsCreateWithoutUserInput, conversationsUncheckedCreateWithoutUserInput> | conversationsCreateWithoutUserInput[] | conversationsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: conversationsCreateOrConnectWithoutUserInput | conversationsCreateOrConnectWithoutUserInput[]
    createMany?: conversationsCreateManyUserInputEnvelope
    connect?: conversationsWhereUniqueInput | conversationsWhereUniqueInput[]
  }

  export type conversationsUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<conversationsCreateWithoutUserInput, conversationsUncheckedCreateWithoutUserInput> | conversationsCreateWithoutUserInput[] | conversationsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: conversationsCreateOrConnectWithoutUserInput | conversationsCreateOrConnectWithoutUserInput[]
    createMany?: conversationsCreateManyUserInputEnvelope
    connect?: conversationsWhereUniqueInput | conversationsWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type conversationsUpdateManyWithoutUserNestedInput = {
    create?: XOR<conversationsCreateWithoutUserInput, conversationsUncheckedCreateWithoutUserInput> | conversationsCreateWithoutUserInput[] | conversationsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: conversationsCreateOrConnectWithoutUserInput | conversationsCreateOrConnectWithoutUserInput[]
    upsert?: conversationsUpsertWithWhereUniqueWithoutUserInput | conversationsUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: conversationsCreateManyUserInputEnvelope
    set?: conversationsWhereUniqueInput | conversationsWhereUniqueInput[]
    disconnect?: conversationsWhereUniqueInput | conversationsWhereUniqueInput[]
    delete?: conversationsWhereUniqueInput | conversationsWhereUniqueInput[]
    connect?: conversationsWhereUniqueInput | conversationsWhereUniqueInput[]
    update?: conversationsUpdateWithWhereUniqueWithoutUserInput | conversationsUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: conversationsUpdateManyWithWhereWithoutUserInput | conversationsUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: conversationsScalarWhereInput | conversationsScalarWhereInput[]
  }

  export type conversationsUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<conversationsCreateWithoutUserInput, conversationsUncheckedCreateWithoutUserInput> | conversationsCreateWithoutUserInput[] | conversationsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: conversationsCreateOrConnectWithoutUserInput | conversationsCreateOrConnectWithoutUserInput[]
    upsert?: conversationsUpsertWithWhereUniqueWithoutUserInput | conversationsUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: conversationsCreateManyUserInputEnvelope
    set?: conversationsWhereUniqueInput | conversationsWhereUniqueInput[]
    disconnect?: conversationsWhereUniqueInput | conversationsWhereUniqueInput[]
    delete?: conversationsWhereUniqueInput | conversationsWhereUniqueInput[]
    connect?: conversationsWhereUniqueInput | conversationsWhereUniqueInput[]
    update?: conversationsUpdateWithWhereUniqueWithoutUserInput | conversationsUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: conversationsUpdateManyWithWhereWithoutUserInput | conversationsUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: conversationsScalarWhereInput | conversationsScalarWhereInput[]
  }

  export type usersCreateNestedOneWithoutConversationsInput = {
    create?: XOR<usersCreateWithoutConversationsInput, usersUncheckedCreateWithoutConversationsInput>
    connectOrCreate?: usersCreateOrConnectWithoutConversationsInput
    connect?: usersWhereUniqueInput
  }

  export type messagesCreateNestedManyWithoutConversationInput = {
    create?: XOR<messagesCreateWithoutConversationInput, messagesUncheckedCreateWithoutConversationInput> | messagesCreateWithoutConversationInput[] | messagesUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: messagesCreateOrConnectWithoutConversationInput | messagesCreateOrConnectWithoutConversationInput[]
    createMany?: messagesCreateManyConversationInputEnvelope
    connect?: messagesWhereUniqueInput | messagesWhereUniqueInput[]
  }

  export type messagesUncheckedCreateNestedManyWithoutConversationInput = {
    create?: XOR<messagesCreateWithoutConversationInput, messagesUncheckedCreateWithoutConversationInput> | messagesCreateWithoutConversationInput[] | messagesUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: messagesCreateOrConnectWithoutConversationInput | messagesCreateOrConnectWithoutConversationInput[]
    createMany?: messagesCreateManyConversationInputEnvelope
    connect?: messagesWhereUniqueInput | messagesWhereUniqueInput[]
  }

  export type usersUpdateOneRequiredWithoutConversationsNestedInput = {
    create?: XOR<usersCreateWithoutConversationsInput, usersUncheckedCreateWithoutConversationsInput>
    connectOrCreate?: usersCreateOrConnectWithoutConversationsInput
    upsert?: usersUpsertWithoutConversationsInput
    connect?: usersWhereUniqueInput
    update?: XOR<XOR<usersUpdateToOneWithWhereWithoutConversationsInput, usersUpdateWithoutConversationsInput>, usersUncheckedUpdateWithoutConversationsInput>
  }

  export type messagesUpdateManyWithoutConversationNestedInput = {
    create?: XOR<messagesCreateWithoutConversationInput, messagesUncheckedCreateWithoutConversationInput> | messagesCreateWithoutConversationInput[] | messagesUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: messagesCreateOrConnectWithoutConversationInput | messagesCreateOrConnectWithoutConversationInput[]
    upsert?: messagesUpsertWithWhereUniqueWithoutConversationInput | messagesUpsertWithWhereUniqueWithoutConversationInput[]
    createMany?: messagesCreateManyConversationInputEnvelope
    set?: messagesWhereUniqueInput | messagesWhereUniqueInput[]
    disconnect?: messagesWhereUniqueInput | messagesWhereUniqueInput[]
    delete?: messagesWhereUniqueInput | messagesWhereUniqueInput[]
    connect?: messagesWhereUniqueInput | messagesWhereUniqueInput[]
    update?: messagesUpdateWithWhereUniqueWithoutConversationInput | messagesUpdateWithWhereUniqueWithoutConversationInput[]
    updateMany?: messagesUpdateManyWithWhereWithoutConversationInput | messagesUpdateManyWithWhereWithoutConversationInput[]
    deleteMany?: messagesScalarWhereInput | messagesScalarWhereInput[]
  }

  export type messagesUncheckedUpdateManyWithoutConversationNestedInput = {
    create?: XOR<messagesCreateWithoutConversationInput, messagesUncheckedCreateWithoutConversationInput> | messagesCreateWithoutConversationInput[] | messagesUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: messagesCreateOrConnectWithoutConversationInput | messagesCreateOrConnectWithoutConversationInput[]
    upsert?: messagesUpsertWithWhereUniqueWithoutConversationInput | messagesUpsertWithWhereUniqueWithoutConversationInput[]
    createMany?: messagesCreateManyConversationInputEnvelope
    set?: messagesWhereUniqueInput | messagesWhereUniqueInput[]
    disconnect?: messagesWhereUniqueInput | messagesWhereUniqueInput[]
    delete?: messagesWhereUniqueInput | messagesWhereUniqueInput[]
    connect?: messagesWhereUniqueInput | messagesWhereUniqueInput[]
    update?: messagesUpdateWithWhereUniqueWithoutConversationInput | messagesUpdateWithWhereUniqueWithoutConversationInput[]
    updateMany?: messagesUpdateManyWithWhereWithoutConversationInput | messagesUpdateManyWithWhereWithoutConversationInput[]
    deleteMany?: messagesScalarWhereInput | messagesScalarWhereInput[]
  }

  export type conversationsCreateNestedOneWithoutMessagesInput = {
    create?: XOR<conversationsCreateWithoutMessagesInput, conversationsUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: conversationsCreateOrConnectWithoutMessagesInput
    connect?: conversationsWhereUniqueInput
  }

  export type conversationsUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<conversationsCreateWithoutMessagesInput, conversationsUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: conversationsCreateOrConnectWithoutMessagesInput
    upsert?: conversationsUpsertWithoutMessagesInput
    connect?: conversationsWhereUniqueInput
    update?: XOR<XOR<conversationsUpdateToOneWithWhereWithoutMessagesInput, conversationsUpdateWithoutMessagesInput>, conversationsUncheckedUpdateWithoutMessagesInput>
  }

  export type tg_messagesCreateNestedManyWithoutChannelsInput = {
    create?: XOR<tg_messagesCreateWithoutChannelsInput, tg_messagesUncheckedCreateWithoutChannelsInput> | tg_messagesCreateWithoutChannelsInput[] | tg_messagesUncheckedCreateWithoutChannelsInput[]
    connectOrCreate?: tg_messagesCreateOrConnectWithoutChannelsInput | tg_messagesCreateOrConnectWithoutChannelsInput[]
    createMany?: tg_messagesCreateManyChannelsInputEnvelope
    connect?: tg_messagesWhereUniqueInput | tg_messagesWhereUniqueInput[]
  }

  export type tg_messagesUncheckedCreateNestedManyWithoutChannelsInput = {
    create?: XOR<tg_messagesCreateWithoutChannelsInput, tg_messagesUncheckedCreateWithoutChannelsInput> | tg_messagesCreateWithoutChannelsInput[] | tg_messagesUncheckedCreateWithoutChannelsInput[]
    connectOrCreate?: tg_messagesCreateOrConnectWithoutChannelsInput | tg_messagesCreateOrConnectWithoutChannelsInput[]
    createMany?: tg_messagesCreateManyChannelsInputEnvelope
    connect?: tg_messagesWhereUniqueInput | tg_messagesWhereUniqueInput[]
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type tg_messagesUpdateManyWithoutChannelsNestedInput = {
    create?: XOR<tg_messagesCreateWithoutChannelsInput, tg_messagesUncheckedCreateWithoutChannelsInput> | tg_messagesCreateWithoutChannelsInput[] | tg_messagesUncheckedCreateWithoutChannelsInput[]
    connectOrCreate?: tg_messagesCreateOrConnectWithoutChannelsInput | tg_messagesCreateOrConnectWithoutChannelsInput[]
    upsert?: tg_messagesUpsertWithWhereUniqueWithoutChannelsInput | tg_messagesUpsertWithWhereUniqueWithoutChannelsInput[]
    createMany?: tg_messagesCreateManyChannelsInputEnvelope
    set?: tg_messagesWhereUniqueInput | tg_messagesWhereUniqueInput[]
    disconnect?: tg_messagesWhereUniqueInput | tg_messagesWhereUniqueInput[]
    delete?: tg_messagesWhereUniqueInput | tg_messagesWhereUniqueInput[]
    connect?: tg_messagesWhereUniqueInput | tg_messagesWhereUniqueInput[]
    update?: tg_messagesUpdateWithWhereUniqueWithoutChannelsInput | tg_messagesUpdateWithWhereUniqueWithoutChannelsInput[]
    updateMany?: tg_messagesUpdateManyWithWhereWithoutChannelsInput | tg_messagesUpdateManyWithWhereWithoutChannelsInput[]
    deleteMany?: tg_messagesScalarWhereInput | tg_messagesScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type tg_messagesUncheckedUpdateManyWithoutChannelsNestedInput = {
    create?: XOR<tg_messagesCreateWithoutChannelsInput, tg_messagesUncheckedCreateWithoutChannelsInput> | tg_messagesCreateWithoutChannelsInput[] | tg_messagesUncheckedCreateWithoutChannelsInput[]
    connectOrCreate?: tg_messagesCreateOrConnectWithoutChannelsInput | tg_messagesCreateOrConnectWithoutChannelsInput[]
    upsert?: tg_messagesUpsertWithWhereUniqueWithoutChannelsInput | tg_messagesUpsertWithWhereUniqueWithoutChannelsInput[]
    createMany?: tg_messagesCreateManyChannelsInputEnvelope
    set?: tg_messagesWhereUniqueInput | tg_messagesWhereUniqueInput[]
    disconnect?: tg_messagesWhereUniqueInput | tg_messagesWhereUniqueInput[]
    delete?: tg_messagesWhereUniqueInput | tg_messagesWhereUniqueInput[]
    connect?: tg_messagesWhereUniqueInput | tg_messagesWhereUniqueInput[]
    update?: tg_messagesUpdateWithWhereUniqueWithoutChannelsInput | tg_messagesUpdateWithWhereUniqueWithoutChannelsInput[]
    updateMany?: tg_messagesUpdateManyWithWhereWithoutChannelsInput | tg_messagesUpdateManyWithWhereWithoutChannelsInput[]
    deleteMany?: tg_messagesScalarWhereInput | tg_messagesScalarWhereInput[]
  }

  export type tg_channelsCreateNestedOneWithoutMessagesInput = {
    create?: XOR<tg_channelsCreateWithoutMessagesInput, tg_channelsUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: tg_channelsCreateOrConnectWithoutMessagesInput
    connect?: tg_channelsWhereUniqueInput
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type tg_channelsUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<tg_channelsCreateWithoutMessagesInput, tg_channelsUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: tg_channelsCreateOrConnectWithoutMessagesInput
    upsert?: tg_channelsUpsertWithoutMessagesInput
    connect?: tg_channelsWhereUniqueInput
    update?: XOR<XOR<tg_channelsUpdateToOneWithWhereWithoutMessagesInput, tg_channelsUpdateWithoutMessagesInput>, tg_channelsUncheckedUpdateWithoutMessagesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type conversationsCreateWithoutUserInput = {
    id?: string
    created_at?: Date | string
    status?: string
    messages?: messagesCreateNestedManyWithoutConversationInput
  }

  export type conversationsUncheckedCreateWithoutUserInput = {
    id?: string
    created_at?: Date | string
    status?: string
    messages?: messagesUncheckedCreateNestedManyWithoutConversationInput
  }

  export type conversationsCreateOrConnectWithoutUserInput = {
    where: conversationsWhereUniqueInput
    create: XOR<conversationsCreateWithoutUserInput, conversationsUncheckedCreateWithoutUserInput>
  }

  export type conversationsCreateManyUserInputEnvelope = {
    data: conversationsCreateManyUserInput | conversationsCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type conversationsUpsertWithWhereUniqueWithoutUserInput = {
    where: conversationsWhereUniqueInput
    update: XOR<conversationsUpdateWithoutUserInput, conversationsUncheckedUpdateWithoutUserInput>
    create: XOR<conversationsCreateWithoutUserInput, conversationsUncheckedCreateWithoutUserInput>
  }

  export type conversationsUpdateWithWhereUniqueWithoutUserInput = {
    where: conversationsWhereUniqueInput
    data: XOR<conversationsUpdateWithoutUserInput, conversationsUncheckedUpdateWithoutUserInput>
  }

  export type conversationsUpdateManyWithWhereWithoutUserInput = {
    where: conversationsScalarWhereInput
    data: XOR<conversationsUpdateManyMutationInput, conversationsUncheckedUpdateManyWithoutUserInput>
  }

  export type conversationsScalarWhereInput = {
    AND?: conversationsScalarWhereInput | conversationsScalarWhereInput[]
    OR?: conversationsScalarWhereInput[]
    NOT?: conversationsScalarWhereInput | conversationsScalarWhereInput[]
    id?: StringFilter<"conversations"> | string
    user_id?: StringFilter<"conversations"> | string
    created_at?: DateTimeFilter<"conversations"> | Date | string
    status?: StringFilter<"conversations"> | string
  }

  export type usersCreateWithoutConversationsInput = {
    id?: string
    username: string
    email?: string | null
    api_key?: string
    api_key_enabled?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type usersUncheckedCreateWithoutConversationsInput = {
    id?: string
    username: string
    email?: string | null
    api_key?: string
    api_key_enabled?: boolean
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type usersCreateOrConnectWithoutConversationsInput = {
    where: usersWhereUniqueInput
    create: XOR<usersCreateWithoutConversationsInput, usersUncheckedCreateWithoutConversationsInput>
  }

  export type messagesCreateWithoutConversationInput = {
    id?: string
    role: string
    content: JsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type messagesUncheckedCreateWithoutConversationInput = {
    id?: string
    role: string
    content: JsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type messagesCreateOrConnectWithoutConversationInput = {
    where: messagesWhereUniqueInput
    create: XOR<messagesCreateWithoutConversationInput, messagesUncheckedCreateWithoutConversationInput>
  }

  export type messagesCreateManyConversationInputEnvelope = {
    data: messagesCreateManyConversationInput | messagesCreateManyConversationInput[]
    skipDuplicates?: boolean
  }

  export type usersUpsertWithoutConversationsInput = {
    update: XOR<usersUpdateWithoutConversationsInput, usersUncheckedUpdateWithoutConversationsInput>
    create: XOR<usersCreateWithoutConversationsInput, usersUncheckedCreateWithoutConversationsInput>
    where?: usersWhereInput
  }

  export type usersUpdateToOneWithWhereWithoutConversationsInput = {
    where?: usersWhereInput
    data: XOR<usersUpdateWithoutConversationsInput, usersUncheckedUpdateWithoutConversationsInput>
  }

  export type usersUpdateWithoutConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    api_key?: StringFieldUpdateOperationsInput | string
    api_key_enabled?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type usersUncheckedUpdateWithoutConversationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    email?: NullableStringFieldUpdateOperationsInput | string | null
    api_key?: StringFieldUpdateOperationsInput | string
    api_key_enabled?: BoolFieldUpdateOperationsInput | boolean
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type messagesUpsertWithWhereUniqueWithoutConversationInput = {
    where: messagesWhereUniqueInput
    update: XOR<messagesUpdateWithoutConversationInput, messagesUncheckedUpdateWithoutConversationInput>
    create: XOR<messagesCreateWithoutConversationInput, messagesUncheckedCreateWithoutConversationInput>
  }

  export type messagesUpdateWithWhereUniqueWithoutConversationInput = {
    where: messagesWhereUniqueInput
    data: XOR<messagesUpdateWithoutConversationInput, messagesUncheckedUpdateWithoutConversationInput>
  }

  export type messagesUpdateManyWithWhereWithoutConversationInput = {
    where: messagesScalarWhereInput
    data: XOR<messagesUpdateManyMutationInput, messagesUncheckedUpdateManyWithoutConversationInput>
  }

  export type messagesScalarWhereInput = {
    AND?: messagesScalarWhereInput | messagesScalarWhereInput[]
    OR?: messagesScalarWhereInput[]
    NOT?: messagesScalarWhereInput | messagesScalarWhereInput[]
    id?: StringFilter<"messages"> | string
    conversation_id?: StringFilter<"messages"> | string
    role?: StringFilter<"messages"> | string
    content?: JsonFilter<"messages">
    created_at?: DateTimeFilter<"messages"> | Date | string
  }

  export type conversationsCreateWithoutMessagesInput = {
    id?: string
    created_at?: Date | string
    status?: string
    user: usersCreateNestedOneWithoutConversationsInput
  }

  export type conversationsUncheckedCreateWithoutMessagesInput = {
    id?: string
    user_id: string
    created_at?: Date | string
    status?: string
  }

  export type conversationsCreateOrConnectWithoutMessagesInput = {
    where: conversationsWhereUniqueInput
    create: XOR<conversationsCreateWithoutMessagesInput, conversationsUncheckedCreateWithoutMessagesInput>
  }

  export type conversationsUpsertWithoutMessagesInput = {
    update: XOR<conversationsUpdateWithoutMessagesInput, conversationsUncheckedUpdateWithoutMessagesInput>
    create: XOR<conversationsCreateWithoutMessagesInput, conversationsUncheckedCreateWithoutMessagesInput>
    where?: conversationsWhereInput
  }

  export type conversationsUpdateToOneWithWhereWithoutMessagesInput = {
    where?: conversationsWhereInput
    data: XOR<conversationsUpdateWithoutMessagesInput, conversationsUncheckedUpdateWithoutMessagesInput>
  }

  export type conversationsUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    user?: usersUpdateOneRequiredWithoutConversationsNestedInput
  }

  export type conversationsUncheckedUpdateWithoutMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
  }

  export type tg_messagesCreateWithoutChannelsInput = {
    message_id: string
    chat_id: string
    message_text: string
    message_timestamp: bigint | number
    sender_id?: string | null
    sender?: NullableJsonNullValueInput | InputJsonValue
    reply_to?: string | null
    topic_id?: string | null
    buttons?: NullableJsonNullValueInput | InputJsonValue
    reactions?: NullableJsonNullValueInput | InputJsonValue
    is_pinned?: boolean
    media_type?: string | null
    media_file_id?: string | null
    media_url?: string | null
    media_metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    send_username?: string | null
    send_firstname?: string | null
    send_lastname?: string | null
  }

  export type tg_messagesUncheckedCreateWithoutChannelsInput = {
    id?: number
    message_id: string
    chat_id: string
    message_text: string
    message_timestamp: bigint | number
    sender_id?: string | null
    sender?: NullableJsonNullValueInput | InputJsonValue
    reply_to?: string | null
    topic_id?: string | null
    buttons?: NullableJsonNullValueInput | InputJsonValue
    reactions?: NullableJsonNullValueInput | InputJsonValue
    is_pinned?: boolean
    media_type?: string | null
    media_file_id?: string | null
    media_url?: string | null
    media_metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    send_username?: string | null
    send_firstname?: string | null
    send_lastname?: string | null
  }

  export type tg_messagesCreateOrConnectWithoutChannelsInput = {
    where: tg_messagesWhereUniqueInput
    create: XOR<tg_messagesCreateWithoutChannelsInput, tg_messagesUncheckedCreateWithoutChannelsInput>
  }

  export type tg_messagesCreateManyChannelsInputEnvelope = {
    data: tg_messagesCreateManyChannelsInput | tg_messagesCreateManyChannelsInput[]
    skipDuplicates?: boolean
  }

  export type tg_messagesUpsertWithWhereUniqueWithoutChannelsInput = {
    where: tg_messagesWhereUniqueInput
    update: XOR<tg_messagesUpdateWithoutChannelsInput, tg_messagesUncheckedUpdateWithoutChannelsInput>
    create: XOR<tg_messagesCreateWithoutChannelsInput, tg_messagesUncheckedCreateWithoutChannelsInput>
  }

  export type tg_messagesUpdateWithWhereUniqueWithoutChannelsInput = {
    where: tg_messagesWhereUniqueInput
    data: XOR<tg_messagesUpdateWithoutChannelsInput, tg_messagesUncheckedUpdateWithoutChannelsInput>
  }

  export type tg_messagesUpdateManyWithWhereWithoutChannelsInput = {
    where: tg_messagesScalarWhereInput
    data: XOR<tg_messagesUpdateManyMutationInput, tg_messagesUncheckedUpdateManyWithoutChannelsInput>
  }

  export type tg_messagesScalarWhereInput = {
    AND?: tg_messagesScalarWhereInput | tg_messagesScalarWhereInput[]
    OR?: tg_messagesScalarWhereInput[]
    NOT?: tg_messagesScalarWhereInput | tg_messagesScalarWhereInput[]
    id?: IntFilter<"tg_messages"> | number
    message_id?: StringFilter<"tg_messages"> | string
    channel_id?: StringFilter<"tg_messages"> | string
    chat_id?: StringFilter<"tg_messages"> | string
    message_text?: StringFilter<"tg_messages"> | string
    message_timestamp?: BigIntFilter<"tg_messages"> | bigint | number
    sender_id?: StringNullableFilter<"tg_messages"> | string | null
    sender?: JsonNullableFilter<"tg_messages">
    reply_to?: StringNullableFilter<"tg_messages"> | string | null
    topic_id?: StringNullableFilter<"tg_messages"> | string | null
    buttons?: JsonNullableFilter<"tg_messages">
    reactions?: JsonNullableFilter<"tg_messages">
    is_pinned?: BoolFilter<"tg_messages"> | boolean
    media_type?: StringNullableFilter<"tg_messages"> | string | null
    media_file_id?: StringNullableFilter<"tg_messages"> | string | null
    media_url?: StringNullableFilter<"tg_messages"> | string | null
    media_metadata?: JsonNullableFilter<"tg_messages">
    created_at?: DateTimeFilter<"tg_messages"> | Date | string
    updated_at?: DateTimeFilter<"tg_messages"> | Date | string
    send_username?: StringNullableFilter<"tg_messages"> | string | null
    send_firstname?: StringNullableFilter<"tg_messages"> | string | null
    send_lastname?: StringNullableFilter<"tg_messages"> | string | null
  }

  export type tg_channelsCreateWithoutMessagesInput = {
    channel_id: string
    user_id: string
    data_type: string
    data_id: string
    metadata?: JsonNullValueInput | InputJsonValue
    is_public?: boolean
    is_free?: boolean
    subscription_fee?: Decimal | DecimalJsLike | number | string
    last_synced_at?: Date | string
    status?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type tg_channelsUncheckedCreateWithoutMessagesInput = {
    id?: number
    channel_id: string
    user_id: string
    data_type: string
    data_id: string
    metadata?: JsonNullValueInput | InputJsonValue
    is_public?: boolean
    is_free?: boolean
    subscription_fee?: Decimal | DecimalJsLike | number | string
    last_synced_at?: Date | string
    status?: string
    created_at?: Date | string
    updated_at?: Date | string
  }

  export type tg_channelsCreateOrConnectWithoutMessagesInput = {
    where: tg_channelsWhereUniqueInput
    create: XOR<tg_channelsCreateWithoutMessagesInput, tg_channelsUncheckedCreateWithoutMessagesInput>
  }

  export type tg_channelsUpsertWithoutMessagesInput = {
    update: XOR<tg_channelsUpdateWithoutMessagesInput, tg_channelsUncheckedUpdateWithoutMessagesInput>
    create: XOR<tg_channelsCreateWithoutMessagesInput, tg_channelsUncheckedCreateWithoutMessagesInput>
    where?: tg_channelsWhereInput
  }

  export type tg_channelsUpdateToOneWithWhereWithoutMessagesInput = {
    where?: tg_channelsWhereInput
    data: XOR<tg_channelsUpdateWithoutMessagesInput, tg_channelsUncheckedUpdateWithoutMessagesInput>
  }

  export type tg_channelsUpdateWithoutMessagesInput = {
    channel_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    data_type?: StringFieldUpdateOperationsInput | string
    data_id?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    is_public?: BoolFieldUpdateOperationsInput | boolean
    is_free?: BoolFieldUpdateOperationsInput | boolean
    subscription_fee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    last_synced_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tg_channelsUncheckedUpdateWithoutMessagesInput = {
    id?: IntFieldUpdateOperationsInput | number
    channel_id?: StringFieldUpdateOperationsInput | string
    user_id?: StringFieldUpdateOperationsInput | string
    data_type?: StringFieldUpdateOperationsInput | string
    data_id?: StringFieldUpdateOperationsInput | string
    metadata?: JsonNullValueInput | InputJsonValue
    is_public?: BoolFieldUpdateOperationsInput | boolean
    is_free?: BoolFieldUpdateOperationsInput | boolean
    subscription_fee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    last_synced_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type conversationsCreateManyUserInput = {
    id?: string
    created_at?: Date | string
    status?: string
  }

  export type conversationsUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    messages?: messagesUpdateManyWithoutConversationNestedInput
  }

  export type conversationsUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
    messages?: messagesUncheckedUpdateManyWithoutConversationNestedInput
  }

  export type conversationsUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    status?: StringFieldUpdateOperationsInput | string
  }

  export type messagesCreateManyConversationInput = {
    id?: string
    role: string
    content: JsonNullValueInput | InputJsonValue
    created_at?: Date | string
  }

  export type messagesUpdateWithoutConversationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type messagesUncheckedUpdateWithoutConversationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type messagesUncheckedUpdateManyWithoutConversationInput = {
    id?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    content?: JsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tg_messagesCreateManyChannelsInput = {
    id?: number
    message_id: string
    chat_id: string
    message_text: string
    message_timestamp: bigint | number
    sender_id?: string | null
    sender?: NullableJsonNullValueInput | InputJsonValue
    reply_to?: string | null
    topic_id?: string | null
    buttons?: NullableJsonNullValueInput | InputJsonValue
    reactions?: NullableJsonNullValueInput | InputJsonValue
    is_pinned?: boolean
    media_type?: string | null
    media_file_id?: string | null
    media_url?: string | null
    media_metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    send_username?: string | null
    send_firstname?: string | null
    send_lastname?: string | null
  }

  export type tg_messagesUpdateWithoutChannelsInput = {
    message_id?: StringFieldUpdateOperationsInput | string
    chat_id?: StringFieldUpdateOperationsInput | string
    message_text?: StringFieldUpdateOperationsInput | string
    message_timestamp?: BigIntFieldUpdateOperationsInput | bigint | number
    sender_id?: NullableStringFieldUpdateOperationsInput | string | null
    sender?: NullableJsonNullValueInput | InputJsonValue
    reply_to?: NullableStringFieldUpdateOperationsInput | string | null
    topic_id?: NullableStringFieldUpdateOperationsInput | string | null
    buttons?: NullableJsonNullValueInput | InputJsonValue
    reactions?: NullableJsonNullValueInput | InputJsonValue
    is_pinned?: BoolFieldUpdateOperationsInput | boolean
    media_type?: NullableStringFieldUpdateOperationsInput | string | null
    media_file_id?: NullableStringFieldUpdateOperationsInput | string | null
    media_url?: NullableStringFieldUpdateOperationsInput | string | null
    media_metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    send_username?: NullableStringFieldUpdateOperationsInput | string | null
    send_firstname?: NullableStringFieldUpdateOperationsInput | string | null
    send_lastname?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tg_messagesUncheckedUpdateWithoutChannelsInput = {
    id?: IntFieldUpdateOperationsInput | number
    message_id?: StringFieldUpdateOperationsInput | string
    chat_id?: StringFieldUpdateOperationsInput | string
    message_text?: StringFieldUpdateOperationsInput | string
    message_timestamp?: BigIntFieldUpdateOperationsInput | bigint | number
    sender_id?: NullableStringFieldUpdateOperationsInput | string | null
    sender?: NullableJsonNullValueInput | InputJsonValue
    reply_to?: NullableStringFieldUpdateOperationsInput | string | null
    topic_id?: NullableStringFieldUpdateOperationsInput | string | null
    buttons?: NullableJsonNullValueInput | InputJsonValue
    reactions?: NullableJsonNullValueInput | InputJsonValue
    is_pinned?: BoolFieldUpdateOperationsInput | boolean
    media_type?: NullableStringFieldUpdateOperationsInput | string | null
    media_file_id?: NullableStringFieldUpdateOperationsInput | string | null
    media_url?: NullableStringFieldUpdateOperationsInput | string | null
    media_metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    send_username?: NullableStringFieldUpdateOperationsInput | string | null
    send_firstname?: NullableStringFieldUpdateOperationsInput | string | null
    send_lastname?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tg_messagesUncheckedUpdateManyWithoutChannelsInput = {
    id?: IntFieldUpdateOperationsInput | number
    message_id?: StringFieldUpdateOperationsInput | string
    chat_id?: StringFieldUpdateOperationsInput | string
    message_text?: StringFieldUpdateOperationsInput | string
    message_timestamp?: BigIntFieldUpdateOperationsInput | bigint | number
    sender_id?: NullableStringFieldUpdateOperationsInput | string | null
    sender?: NullableJsonNullValueInput | InputJsonValue
    reply_to?: NullableStringFieldUpdateOperationsInput | string | null
    topic_id?: NullableStringFieldUpdateOperationsInput | string | null
    buttons?: NullableJsonNullValueInput | InputJsonValue
    reactions?: NullableJsonNullValueInput | InputJsonValue
    is_pinned?: BoolFieldUpdateOperationsInput | boolean
    media_type?: NullableStringFieldUpdateOperationsInput | string | null
    media_file_id?: NullableStringFieldUpdateOperationsInput | string | null
    media_url?: NullableStringFieldUpdateOperationsInput | string | null
    media_metadata?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    send_username?: NullableStringFieldUpdateOperationsInput | string | null
    send_firstname?: NullableStringFieldUpdateOperationsInput | string | null
    send_lastname?: NullableStringFieldUpdateOperationsInput | string | null
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}