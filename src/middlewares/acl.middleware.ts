import { UserEntity } from "@entities";
import { decode, getRepo } from "@helpers";
import { TRequest, TResponse } from "@types";

export const acl = async (req: TRequest, res: TResponse, next: () => void) => {
  const tokenInfo = decode<any>(req.headers.authorization?.replace("Bearer ", ""));

  if (!tokenInfo) {
    res.status(401).send({ code: 401, reason: "Unauthorized!" });
    return;
  }

  const userRepository = getRepo(UserEntity);
  const user = await userRepository.findOne({
    where: { id: tokenInfo.id },
  });

  if (!user) {
    res.status(401).send({ code: 401, reason: "Unauthorized!" });
    return;
  }

  req.me = user;
  next();
};
