import {z} from "zod"

export const UpdateUserDTO = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone:z.string().max(15),
})

export type TUpdateUserDTO = z.infer<typeof UpdateUserDTO>