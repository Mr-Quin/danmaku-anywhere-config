import { z } from 'zod'

const regexString = z.string().refine(
  (v) => {
    if (v.length === 0) return true
    try {
      new RegExp(v)
      return true
    } catch {
      return false
    }
  },
  {
    message: 'Invalid regex string',
  }
)

const selectorSchema = z.object({
  value: z.string(),
  quick: z.boolean(),
})

const regexSchema = z.object({
  value: regexString,
  quick: z.boolean(),
})

const matcherSchema = z.object({
  selector: z.array(selectorSchema),
  regex: z.array(regexSchema),
})

const optionsSchema = z.object({
  titleOnly: z.boolean(),
  useAI: z.boolean(),
  dandanplay: z.object({
    useMatchApi: z.boolean(),
  }),
})

const zIntegrationPolicy = z.object({
  title: z.object({
    selector: z.array(selectorSchema).min(1),
    regex: z.array(regexSchema).min(1),
  }),
  episode: matcherSchema,
  season: matcherSchema,
  episodeTitle: matcherSchema,
  options: optionsSchema,
})

const zIntegration = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  policy: zIntegrationPolicy,
})

export const zCombinedPolicy = z.object({
  id: z.string().uuid(),
  author: z.string().optional(),
  description: z.string().optional(),
  patterns: z.array(z.string()),
  mediaQuery: z.string(),
  enabled: z.boolean(),
  name: z.string(),
  integration: zIntegration.optional(),
})

export type CombinedPolicy = z.output<typeof zCombinedPolicy>
