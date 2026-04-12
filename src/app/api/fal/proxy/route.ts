import { createRouteHandler } from '@fal-ai/server-proxy/nextjs'

// INFRA-07: FAL_KEY is server-only env var (no NEXT_PUBLIC_ prefix)
// This proxy handles all fal.ai requests, injecting the key server-side
export const { GET, POST, PUT } = createRouteHandler()
