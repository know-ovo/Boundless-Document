// Shared package barrel — re-exports the public surface of types, blocks, and extension points.
// Dependency: none (this is the leaf package).

export * from './extensionPoints';
export * from './markdownBlocks';
export * from './types';

// Explicit re-exports for static-analysis visibility
export type { CollaborationAdapter, AiDocumentSource, AiCitation, AiAnswer, AiAdapter } from './extensionPoints';
export type { BoundlessBlock, DocumentFrontmatter, ParsedDocument } from './types';
