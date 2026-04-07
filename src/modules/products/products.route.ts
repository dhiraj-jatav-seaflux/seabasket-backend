import { withRoutes } from "@helpers";
import { adminAcl, bodyValidator, destructPager, upload } from "@middlewares";
import { Router } from "express";
import { createProduct, deleteProduct, getCategories, getProduct, getProducts, updateProduct, uploadProductImage } from "./products.controller";
import { reviewRoutes } from "./reviews";
import { ProductDTO } from "./dtos/products-dto";

const routes = (app: Router) => {
  app.get("/", destructPager, getProducts);
  app.get("/categories", getCategories);
  app.post('/',adminAcl,bodyValidator(ProductDTO),createProduct);
  app.use('/review',reviewRoutes);
  app.post('/:productId/images',adminAcl,upload.array("images",5),uploadProductImage)
  app.get("/:productId", getProduct);
  app.delete('/:productId',adminAcl,deleteProduct)
  app.put('/:productId',adminAcl,bodyValidator(ProductDTO),updateProduct)
};

export const productRoutes = withRoutes(routes);