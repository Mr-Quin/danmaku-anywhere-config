import { z } from 'zod'

const xpathArray = z.array(z.string())
const regexArray = z.array(z.string())

const matcher = z.object({
  selector: xpathArray,
  regex: regexArray,
})

export const integrationPolicySchema = z.object({
  name: z.string().min(1),
  author: z.string().min(1),
  policy: z.object({
    title: z.object({
      selector: z.array(z.string()).min(1),
      regex: z.array(z.string().min(1)).min(1),
    }),
    titleOnly: z.boolean(),
    episode: matcher,
    season: matcher,
    episodeTitle: matcher,
  }),
})

export type IntegrationPolicy = z.infer<typeof integrationPolicySchema>