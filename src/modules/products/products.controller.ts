import {
  CategoriesEntity,
  ProductImagesEntity,
  ProductsEntity,
} from "@entities";
import { getRepo, uploadToCloudinary } from "@helpers";
import { TRequest, TResponse } from "@types";
import { NextFunction } from "express";
import { finalDiscountPrice } from "@helpers";
import cloudinary from "configs/cloudinary";
import { TProductDTO } from "./dtos/products-dto";

export async function createProduct(
  req: TRequest<TProductDTO>,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const {
      name,
      categoryId,
      description,
      price,
      discount,
      stock,
      isTrending,
    } = req.dto;

    const productRepository = getRepo(ProductsEntity);
    const product = productRepository.create({
      name,
      category_id: categoryId,
      description,
      price,
      discount,
      stock,
      is_trending: isTrending,
    });
    await productRepository.save(product);

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    next(error);
  }
}

export async function uploadProductImage(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const productId = Number(req.params.productId);
    const imageRepo = getRepo(ProductImagesEntity);
    const files = req.files as Express.Multer.File[];

    const productsRepo = getRepo(ProductsEntity);

    const product = await productsRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }
    const savedImages = [];

    for (const file of files) {
      const result: any = await uploadToCloudinary(file.buffer);

      const image = imageRepo.create({
        product_id: productId,
        image_url: result.secure_url,
        public_id: result.public_id,
      });

      await imageRepo.save(image);

      savedImages.push(image);
    }
    res.json({
      message: "Images uploaded successfully",
      images: savedImages,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const productId = Number(req.params.productId);

    const productRepo = getRepo(ProductsEntity);
    const imagesRepo = getRepo(ProductImagesEntity);

    const product = await productRepo.findOne({
      where: { id: productId },
    });

    const images = await imagesRepo.find({
      where: { product_id: productId },
    });

    for (const img of images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    if (!product) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    await imagesRepo.delete({ product_id: productId });

    await productRepo.delete(productId);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req:TRequest<TProductDTO>,res:TResponse,next:NextFunction){
  try {
    const {name,categoryId,description,price,discount,stock,isTrending} = req.dto;
    const productsRepo = getRepo(ProductsEntity);
    const productId = Number(req.params.productId);

    const product = await productsRepo.findOne({
      where:{id:productId}
    });

    if(!product){
      return res.status(404).json({message:'Product does not exist'});
    }
    
    product.name = name;
    product.category_id = categoryId;
    product.description = description;
    product.price = price;
    product.discount = discount;
    product.stock = stock;
    product.is_trending = isTrending;

    await productsRepo.save(product);

    return res.status(200).json({message:'Product updated successfully',updatedProduct:product});

  } catch (error) {
    next(error);
  }
}

export async function getProducts(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const productsRepo = getRepo(ProductsEntity);

    const { page, limit } = req.pager;

    const skip = (page - 1) * limit;

    const {
      name,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      categoryId,
      sortBy,
      order,
      isTrending,
    } = req.query;

    const query = productsRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect("product.images", "images");

    if (name?.toString().trim()) {
      query.andWhere("product.name LIKE :name", {
        name: `%${name.toString().trim()}%`,
      });
    }

    if (isTrending) {
      query.andWhere("product.is_trending = :isTrending", { isTrending });
    }

    if (Number(minPrice) > 0) {
      query.andWhere(
        "(product.price - (product.price * product.discount / 100)) >= :minPrice",
        { minPrice: Number(minPrice) },
      );
    }

    if (Number(maxPrice) > 0) {
      query.andWhere(
        "(product.price - (product.price * product.discount / 100)) <= :maxPrice",
        { maxPrice: Number(maxPrice) },
      );
    }

    if (
      minRating &&
      minRating !== undefined &&
      minRating !== null &&
      minRating !== "0"
    ) {
      query.andWhere("product.rating >= :minRating", { minRating });
    }

    if (
      minDiscount &&
      minDiscount !== undefined &&
      minDiscount !== null &&
      minDiscount !== "0"
    ) {
      query.andWhere("product.discount >= :minDiscount", { minDiscount });
    }

    if (categoryId) {
      query.andWhere("product.category_id = :categoryId", { categoryId });
    }

    if (sortBy) {
      query.orderBy(`product.${sortBy}`, order === "DESC" ? "DESC" : "ASC");
    }

    query.skip(skip).take(limit);

    const [products, total] = await query.getManyAndCount();

    const productsWithDiscount = products.map((product) => ({
      ...product,
      finalPrice: finalDiscountPrice(
        Number(product.price),
        Number(product.discount || 0),
      ),
    }));

    res.status(200).json({
      message: "Products fetched successfully",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      products: productsWithDiscount,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const productId = Number(req.params.productId);
    const productRepo = getRepo(ProductsEntity);

    const product = await productRepo.findOne({
      where: { id: productId },
      relations: {
        category: true,
        images: true,
        reviews: {
          user: true,
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        rating: true,
        discount: true,
        stock: true,
        is_trending: true,
        category: {
          id: true,
          category_name: true,
        },
        images: {
          id: true,
          image_url: true,
        },
        reviews: {
          id: true,
          comment: true,
          rating: true,
          user: {
            id: true,
            first_name: true,
          },
        },
      },
    });
    if (!product) {
      return res.status(404).json({ message: "Product does not exist" });
    }
    const discountedPrice = finalDiscountPrice(
      Number(product.price),
      Number(product.discount || 0),
    );
    res.status(200).json({
      message: "Product fetched successfully",
      product: {
        ...product,
        finalPrice: discountedPrice,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const categoriesRepo = getRepo(CategoriesEntity);
    const categories = await categoriesRepo.find();
    res
      .status(200)
      .json({ message: "Categories fetched successfully", categories });
  } catch (error) {
    next(error);
  }
}