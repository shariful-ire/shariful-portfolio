import express from "express";
import cors from "cors";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { attachSession } from "./middleware/rbac.js";
import routes from "./routes/index.js";
import webhookRoutes from "./routes/webhook.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN,
      credentials: true,
    })
  );
  app.use(morgan("dev"));

  // BetterAuth owns its own body parsing; mount before express.json().
  app.all("/api/auth/*", toNodeHandler(auth));

  // Stripe needs the untouched raw body to verify its signature, and
  // SSLCommerz posts form-urlencoded — both mounted ahead of the global
  // JSON parser so it never consumes their request stream first.
  app.use("/api/webhooks", webhookRoutes);

  app.use(express.json());
  app.use(attachSession);
  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
