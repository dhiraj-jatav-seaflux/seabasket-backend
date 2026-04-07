import { withRoutes } from "@helpers";
import { Router } from "express";
import { acl, adminAcl, bodyValidator, upload } from "@middlewares";
import { CategoryDTO, ProductDTO } from "./dtos";
import { postCategory } from "./admin.controller";


const routes = (app:Router)=>{
    app.post("/categories",adminAcl,bodyValidator(CategoryDTO),postCategory);
};

export const adminRoutes = withRoutes(routes)