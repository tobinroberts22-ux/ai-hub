import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const MODEL = 'claude-sonnet-4-6'

export const PLAN_LIMITS: Record<string, number> = {
  trialing: 20,
  starter: 100,
  growth: 300,
  pro: 1000,
}
