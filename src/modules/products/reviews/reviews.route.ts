import { withRoutes } from "@helpers";
import { acl, bodyValidator } from "@middlewares";
import { Router } from "express";
import { RatingDTO } from "../dtos";
import { addReview, deleteReview, getReviews, updateReview } from "./reviews.controller";

const routes = (app:Router)=>{
    app.get('/:productId',acl,getReviews);
    app.post("/:productId",acl,bodyValidator(RatingDTO),addReview);
    app.put('/:productId',acl,bodyValidator(RatingDTO),updateReview);
    app.delete('/:productId',acl,deleteReview);
}

export const reviewRoutes = withRoutes(routes)