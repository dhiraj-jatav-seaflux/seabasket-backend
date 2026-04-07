import { TRequest, TResponse } from "@types";
import { TRatingDTO } from "../dtos";
import { NextFunction } from "express";
import { getRepo } from "@helpers";
import { ProductsEntity, ReviewsEntity } from "@entities";

export async function getReviews(req:TRequest,res:TResponse,next:NextFunction){
    try {
        const productId = Number(req.params.productId);
        const reviewsRepo = getRepo(ReviewsEntity);

        const reviews = await reviewsRepo.find({
            where:{product_id:productId}
        })

        return res.status(200).json({message:'Reviews fetched successfully',reviews:reviews})

    } catch (error) {
        next(error);
    }
}

export async function addReview(
  req: TRequest<TRatingDTO>,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const productId = Number(req.params.productId);
    const { id } = req.me;

    const { comment, rating } = req.dto;

    const productRepo = getRepo(ProductsEntity);
    const reviewsRepo = getRepo(ReviewsEntity);

    const product = await productRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    const alreadyReviewed = await reviewsRepo.findOne({
      where: {
        product_id: productId,
        user_id: id,
      },
    });

    if (alreadyReviewed) {
      return res
        .status(409)
        .json({ message: "Review already added for this product" });
    }

    const review = reviewsRepo.create({
      product_id: productId,
      user_id: id,
      rating: rating,
      comment,
    });

    await reviewsRepo.save(review);

    const result = await reviewsRepo
      .createQueryBuilder("review")
      .select("AVG(review.rating)", "avg")
      .where("review.product_id = :productId", { productId })
      .getRawOne();

    product.rating = Number(result.avg) || 0;

    await productRepo.save(product);

    res.status(200).json({ message: "Review added", review: review });
  } catch (error) {
    next(error);
  }
}

export async function updateReview(
  req: TRequest<TRatingDTO>,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { id } = req.me;
    const productId = Number(req.params.productId);

    const { rating, comment } = req.dto;

    const reviewsRepo = getRepo(ReviewsEntity);
    const productRepo = getRepo(ProductsEntity);

    const product = await productRepo.findOne({
      where:{id:productId}
    })

    if(!product){
      return res.status(404).json({message:'Product does not exist'})
    }

    const review = await reviewsRepo.findOne({
      where: { product_id: productId, user_id: id },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.rating = rating;
    review.comment = comment;

    await reviewsRepo.save(review);

    const result = await reviewsRepo
      .createQueryBuilder("review")
      .select("AVG(review.rating)", "avg")
      .where("review.product_id = :productId", { productId })
      .getRawOne();

    product.rating = Number(result.avg) || 0;

    await productRepo.save(product);

    return res
      .status(200)
      .json({ message: "Review updated successfully", updatedReview: review });
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { id } = req.me;
    const productId = Number(req.params.productId);

    const reviewsRepo = getRepo(ReviewsEntity);
    const productRepo = getRepo(ProductsEntity);

    const product =  await productRepo.findOne({
      where:{id:productId}
    })

    if(!product){
      return res.status(404).json({message:'Product does not exist'})
    }

    const review = await reviewsRepo.findOne({
      where: { product_id: productId, user_id: id },
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await reviewsRepo.delete(review);

    const result = await reviewsRepo
      .createQueryBuilder("review")
      .select("AVG(review.rating)", "avg")
      .where("review.product_id = :productId", { productId })
      .getRawOne();

    product.rating = Number(result.avg) || 0;

    await productRepo.save(product);

    return res
      .status(200)
      .json({ message: "Review deleted successfully", deletedReview: review });
  } catch (error) {
    next(error);
  }
}