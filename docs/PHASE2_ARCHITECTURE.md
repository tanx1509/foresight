# FORESIGHT Phase 2 Architecture

This document outlines the architectural evolution of the FORESIGHT backend retrieval layer.

## Current State (Phase 1 to Phase 2 Transition)

In Phase 1, the `HISTORIAN` agent calculated TF-IDF scores directly against a mock in-memory array (`@foresight/mock-data`). 
In Phase 2, this logic has been decoupled behind a `SearchProvider` interface.

```mermaid
graph TD
    A[HISTORIAN Agent] --> B(SearchProvider Interface)
    B --> C[MockSearchProvider]
    C --> D[(Mock Data Array)]
```

## Document Ingestion Pipeline

To prepare for future cloud indexing, a local chunking and ingestion pipeline has been established.

```mermaid
graph LR
    A[Raw Document Text] --> B[ingestion.ts: ingestDocument]
    B --> C[chunking.ts: chunkDocument]
    C --> D[Regex Sentence Splitter]
    D --> E[Chunk Objects 300-500 chars]
```

## Future Cloud Integrations (Phase 3+)

The `AzureSearchProvider` and `SharePointProvider` stubs exist to seamlessly swap the `MockSearchProvider` when Microsoft 365 and Azure environments are provisioned.

```mermaid
graph TD
    A[HISTORIAN Agent] --> B(SearchProvider Interface)
    B --> C[MockSearchProvider]
    B --> D[AzureSearchProvider]
    B --> E[SharePointProvider]
    D -.-> F[(Azure AI Search Index)]
    E -.-> G[(Microsoft Graph API)]
```
