# Contributing Guidelines

Welcome to the Architected Consistency Engine (ACE) project. These guidelines ensure everyone contributes code that aligns with our governance standards.

## Naming Conventions

- **Variables & Functions:** `camelCase`
- **Classes, Interfaces, Types:** `PascalCase`
- **Neo4j Node Labels:** `PascalCase` (e.g., `Faction`, `Resource`, `HistoricalEvent`)
- **Neo4j Relationship Types:** `UPPER_SNAKE_CASE` (e.g., `CONTROLS_RESOURCE`, `IS_ALLY_OF`)
- **Environment Variables:** `UPPER_SNAKE_CASE` (e.g., `ATTENDEE_WEBHOOK_SECRET`)

## Examples

```ts
const factionId = 'HEGEMONY';

interface FactionSummary {
  factionId: string;
  coreMotivation: string;
}

const CONTROLS_RESOURCE = 'CONTROLS_RESOURCE';
const factionNodeLabel = 'Faction';
```

When in doubt, mirror existing patterns. Consistency across code, schemas, and the knowledge graph is critical for reliable structured output.

