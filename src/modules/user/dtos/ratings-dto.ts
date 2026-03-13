import {z} from "zod"

export const RatingsDTO = z.object({
    rating: z.coerce.number().min(1).max(5)
})

export type TRatingsDTO = z.infer<typeof RatingsDTO>