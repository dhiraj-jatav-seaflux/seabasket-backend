import { z } from "zod";

export const SignUpUserDTO = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export type TSignUpUserDTO = z.infer<typeof SignUpUserDTO>;
