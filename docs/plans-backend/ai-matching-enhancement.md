# AI Matching Enhancement Plan

## Overview

This document outlines the plan to enhance the Phase 2 matching system with AI-powered semantic search and natural language explanations. Currently, the system uses rule-based matching; this enhancement will add semantic understanding and AI-generated explanations.

## Current Implementation

Phase 2 implements a rule-based matching algorithm with:
- Expertise overlap scoring (weight: 0.4)
- Industry matching (weight: 0.3)
- Stage matching (weight: 0.2)
- Availability scoring (weight: 0.1)
- Rule-based match explanations

See: [`lib/utils/matching.ts`](../../lib/utils/matching.ts) and [`app/api/match/route.ts`](../../app/api/match/route.ts)

## Planned Enhancements

### 1. Semantic Search with Embeddings

**Goal:** Replace keyword-based search with semantic search using OpenAI embeddings.

**Implementation:**
- Use OpenAI `text-embedding-3-small` model for generating embeddings
- Store mentor profile embeddings in database (new `mentor_embeddings` table)
- Generate query embedding on-the-fly for search requests
- Calculate cosine similarity between query and mentor embeddings
- Combine semantic similarity with rule-based scoring

**Dependencies to Add:**
```json
{
  "openai": "^4.0.0",
  "ai": "^3.0.0"  // Vercel AI SDK
}
```

**New Database Schema:**
```sql
CREATE TABLE mentor_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
  embedding VECTOR(1536),  -- OpenAI text-embedding-3-small dimension
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Files to Create/Modify:**
- `lib/ai/embeddings.ts` - OpenAI embedding generation utilities
- `lib/ai/semantic-search.ts` - Semantic search functions
- `app/api/match/route.ts` - Integrate semantic search into matching endpoint
- Database migration for `mentor_embeddings` table

**Reference:** PHASE2.md implementation checklist items 182-188

### 2. AI-Generated Match Explanations

**Goal:** Generate natural, contextual explanations for why mentors were matched using GPT-4o-mini.

**Implementation:**
- Use GPT-4o-mini to generate explanations based on:
  - Query text
  - Mentor profile (bio, expertise, industry, stage)
  - Match scores (expertise, industry, stage, availability)
  - Past session topics (if available)
- Cache explanations to reduce API calls
- Fallback to rule-based explanations if AI fails

**Prompt Template:**
```
You are helping a startup founder find a mentor. Generate a brief, friendly explanation (max 60 words) for why this mentor matches their search.

Query: "{query}"
Mentor: {name}, {title} at {company}
Expertise: {expertise}
Industry: {industry}
Match scores: Expertise {expertiseScore}, Industry {industryScore}, Stage {stageScore}

Generate explanation:
```

**Files to Create/Modify:**
- `lib/ai/explanations.ts` - AI explanation generation
- `app/api/match/route.ts` - Use AI explanations instead of rule-based
- `lib/utils/matching.ts` - Keep rule-based as fallback

**Reference:** PHASE2.md implementation checklist items 182-188

## Implementation Phases

### Phase 1: Embeddings Infrastructure
1. Add OpenAI and Vercel AI SDK dependencies
2. Create embedding generation utilities
3. Create database migration for embeddings table
4. Build background job to generate embeddings for existing mentors
5. Update mentor creation/update flows to generate embeddings

### Phase 2: Semantic Search Integration
1. Integrate semantic search into `/api/match` endpoint
2. Combine semantic similarity with rule-based scoring
3. Test and tune scoring weights
4. Add caching for query embeddings

### Phase 3: AI Explanations
1. Create explanation generation utility
2. Integrate into `/api/match` endpoint
3. Add caching layer for explanations
4. Implement fallback to rule-based explanations
5. Monitor API costs and usage

## Cost Estimates

**OpenAI API Costs (estimated):**
- Embeddings: ~$0.02 per 1M tokens (text-embedding-3-small)
- GPT-4o-mini: ~$0.15 per 1M input tokens, $0.60 per 1M output tokens

**Monthly Estimates (1000 searches/month):**
- Embeddings: ~$5-10/month
- Explanations: ~$10-20/month
- **Total: ~$15-30/month**

## Environment Variables

```bash
OPENAI_API_KEY=sk-...
```

## Testing Strategy

1. **Unit Tests:**
   - Test embedding generation
   - Test semantic similarity calculation
   - Test explanation generation

2. **Integration Tests:**
   - Test end-to-end matching with embeddings
   - Test explanation quality
   - Test fallback mechanisms

3. **Performance Tests:**
   - Measure latency impact
   - Test caching effectiveness
   - Monitor API rate limits

## Rollout Plan

1. **Phase 1:** Deploy embeddings infrastructure (no user-facing changes)
2. **Phase 2:** Enable semantic search for 10% of traffic (A/B test)
3. **Phase 3:** Gradually increase to 100% if metrics improve
4. **Phase 4:** Add AI explanations (can be enabled independently)

## Success Metrics

- **Relevance:** Match quality improves (measured by booking conversion)
- **Latency:** Matching endpoint stays under 2s (with caching)
- **Cost:** Stay within $50/month budget
- **User Satisfaction:** Match explanations rated helpful

## Notes

- Keep rule-based matching as fallback for reliability
- Monitor OpenAI API usage and costs
- Consider using pgvector extension for efficient vector similarity search
- Cache embeddings and explanations aggressively
- Implement rate limiting for AI API calls

