import "reflect-metadata";
import { initializeDB } from "@db";
import {
  EnvSchema,
  enableCors,
  getLogger,
  handleUnhandledPromise,
} from "@helpers";
import { destructPager, errorHandler } from "@middlewares";
import { json, urlencoded } from "body-parser";
import compression from "compression";
import express from "express";
import helmet from "helmet";
import methodOverride from "method-override";
import morgan from "morgan";
import { configureRoutes } from "./routes";
import cloudinary from "configs/cloudinary";


const logger = getLogger();

export const createServer = async (envs: EnvSchema) => {
  await initializeDB();

  handleUnhandledPromise();

  const app = express();

  enableCors(app);
  app.use(helmet());
  app.use(morgan("tiny"));
  app.use(compression());

  // Enable DELETE and PUT
  app.use(methodOverride());

  // Body Parsing
  app.use((req, res, next) => {
  if (req.originalUrl === "/orders/stripe/webhook") {
      return next(); 
    }
    json({ limit: "50mb" })(req, res, next);
  });
  app.use(urlencoded({ extended: true }));

  app.use(destructPager);

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  app.use("/", configureRoutes);

  app.use(errorHandler);

  app.listen(envs.port, () => {
    logger.info(`The server is running on port localhost: ${envs.port}`);
  });

  return app;
};
