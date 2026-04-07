import { TRequest, TResponse } from "@types";
import { NextFunction } from "express";
import {
  CategoriesEntity,
} from "@entities";
import { getRepo } from "@helpers";
import { TCategoryDTO } from "./dtos";

export async function postCategory(
  req: TRequest<TCategoryDTO>,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { categoryName } = req.dto;

    const categoryRepository = getRepo(CategoriesEntity);

    const existingCategory = await categoryRepository.findOne({
      where: { category_name: categoryName.toLowerCase() },
    });

    if (existingCategory) {
      return res.status(409).json({ message: "Category already exist" });
    }

    const category = categoryRepository.create({
      category_name: categoryName.toLowerCase(),
    });

    await categoryRepository.save(category);

    res
      .status(201)
      .json({ message: "Category created successfully", category: category });
  } catch (error) {
    next(error);
  }
}