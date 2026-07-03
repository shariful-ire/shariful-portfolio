import express from "express";
import cors from "cors";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { attachSession } from "./middleware/rbac.js";
import routes from "./routes/index.js";
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

  app.use(express.json());
  app.use(attachSession);
  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
