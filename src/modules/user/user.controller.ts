import { UserEntity } from "@entities";
import { encode, getRepo, hashPassword, verifyPassword } from "@helpers";
import { TRequest, TResponse } from "@types";
import { NextFunction } from "express";
import { TSignInUserDTO, TSignUpUserDTO } from "./dtos";

export async function signUpUser(req: TRequest<TSignUpUserDTO>, res: TResponse, next: NextFunction) {
  try {
    const { name, email, password } = req.dto;
    const userRepository = getRepo(UserEntity);

    const hasedPassword = await hashPassword(password);

    const user = userRepository.create({
      name,
      email,
      password: hasedPassword,
    });

    await userRepository.save(user);

    const token = encode({ id: user.id });

    const createdUser = await userRepository.findOne({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    res.status(200).json({ data: { ...createdUser, token } });
  } catch (err) {
    next(err);
  }
}

export async function signInUser(req: TRequest<TSignInUserDTO>, res: TResponse, next: NextFunction) {
  try {
    const { email, password } = req.dto;
    const userRepository = getRepo(UserEntity);

    const user = await userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return next({ status: 400, message: "Please verify email account!" });
    }

    const compare = await verifyPassword(password, user.password);

    if (!compare) {
      return next({ status: 400, message: "Please check your password!" });
    }

    const token = encode({ id: user.id });

    res.status(200).json({ data: { id: user.id, name: user.name, email: user.email, token } });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: TRequest, res: TResponse, next: NextFunction) {
  try {
    const { id, name, email } = req.me;
    res.status(200).json({
      data: {
        id,
        name,
        email,
      },
    });
  } catch (err) {
    next(err);
  }
}
