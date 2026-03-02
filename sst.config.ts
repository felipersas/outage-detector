/// <reference path=".sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "my-app",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    // ─── Cognito Auth ────────────────────────────────────────────────────────

    const userPool = new sst.aws.CognitoUserPool("UserPool", {
      usernames: ["email"],
    });

    const userPoolClient = userPool.addClient("WebClient", {
      transform: {
        client: (args) => {
          args.explicitAuthFlows = [
            "ALLOW_USER_PASSWORD_AUTH",
            "ALLOW_REFRESH_TOKEN_AUTH",
            "ALLOW_USER_SRP_AUTH",
          ];
          args.generateSecret = false;
        },
      },
    });

    // ─── DynamoDB Tables ─────────────────────────────────────────────────────

    const table = new sst.aws.Dynamo("OutageTable", {
      fields: {
        id: "string",
        userId: "string",
        status: "string",
      },
      primaryIndex: { hashKey: "id", rangeKey: "userId" },
      globalIndexes: {
        byUser: {
          hashKey: "userId",
          rangeKey: "id",
        },
        ByStatus: {
          hashKey: "status",
          rangeKey: "id",
        },
      },
    });

    const usersTable = new sst.aws.Dynamo("UsersTable", {
      fields: { userId: "string" },
      primaryIndex: { hashKey: "userId" },
    });

    // ─── Secrets ─────────────────────────────────────────────────────────────

    const telegramBotToken = new sst.Secret("TelegramBotToken");

    // ─── API Gateway (Backend) ───────────────────────────────────────────────

    const api = new sst.aws.ApiGatewayV2("OutageDetectorAPI", {
      cors: {
        allowOrigins: ["*"],
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
      },
    });

    // ── Cognito JWT Authorizer ───────────────────────────────────────────────

    const cognitoAuthorizer = api.addAuthorizer({
      name: "CognitoAuthorizer",
      jwt: {
        issuer: $interpolate`https://cognito-idp.${aws.getRegionOutput().name}.amazonaws.com/${userPool.id}`,
        audiences: [userPoolClient.id],
      },
    });

    const jwtAuth = {
      auth: { jwt: { authorizer: cognitoAuthorizer.id } },
    };

    // ── Protected Routes (require Cognito JWT) ──────────────────────────────

    api.route("POST /urls", {
      handler: "backend/functions/create-url.handler",
      link: [table, usersTable],
    }, jwtAuth);

    api.route("GET /urls", {
      handler: "backend/functions/get-urls.handler",
      link: [table, usersTable],
    }, jwtAuth);

    api.route("DELETE /urls/{id}", {
      handler: "backend/functions/delete-url.handler",
      link: [table],
    }, jwtAuth);

    api.route("POST /register-telegram", {
      handler: "backend/functions/register-telegram.handler",
      link: [usersTable],
    }, jwtAuth);

    // ── Public Routes (no auth) ──────────────────────────────────────────────

    api.route("POST /telegram-webhook", {
      handler: "backend/functions/telegram-webhook.handler",
      link: [usersTable, telegramBotToken],
    });

    // ─── SNS + Cron (Background Jobs) ────────────────────────────────────────

    const alertTopic = new sst.aws.SnsTopic("AlertTopic");

    const alertOutageHandler = {
      handler: "backend/functions/check-outages.handler",
      link: [table, alertTopic],
    };

    const notifyUserHandler = {
      handler: "backend/functions/notify-user.handler",
      link: [alertTopic, usersTable, telegramBotToken],
    };

    new sst.aws.Cron("OutageChecker", {
      schedule: "rate(1 minute)",
      function: alertOutageHandler,
    });

    alertTopic.subscribe("NotifyUser", notifyUserHandler);

    // ─── Next.js Frontend ────────────────────────────────────────────────────

    const web = new sst.aws.Nextjs("Web", {
      path: "frontend",
      link: [userPool, userPoolClient],
      environment: {
        API_URL: api.url,
      },
    });

    // ─── Outputs ─────────────────────────────────────────────────────────────

    return {
      api: api.url,
      web: web.url,
      tableName: table.name,
      usersTableName: usersTable.name,
      userPoolId: userPool.id,
      userPoolClientId: userPoolClient.id,
    };
  },
});