import { LikeInsensitive } from './types'

export const likeInsensitive = {
  // converts the input to the filter
  parse: (value: string): LikeInsensitive => ({
    likeInsensitive: value
  }),
  // converts the filter back to the input
  format: (obj: LikeInsensitive) => obj && obj.likeInsensitive
}
