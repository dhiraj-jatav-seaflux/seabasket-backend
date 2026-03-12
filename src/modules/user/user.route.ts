import { withRoutes } from "@helpers";
import { acl, bodyValidator } from "@middlewares";
import { Router } from "express";
import { SignInUserDTO, SignUpUserDTO } from "./dtos";
import { getUser, signInUser, signUpUser } from "./user.controller";

const routes = (app: Router) => {
  app.post("/sign-up", bodyValidator(SignUpUserDTO), signUpUser);
  app.post("/sign-in", bodyValidator(SignInUserDTO), signInUser);
  app.get("/me", acl, getUser);
};

export const userRoutes = withRoutes(routes);
