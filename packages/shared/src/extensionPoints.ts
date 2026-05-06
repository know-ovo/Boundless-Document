export interface CollaborationAdapter {
  connect(documentId: string): Promise<void>;
  disconnect(): Promise<void>;
  applyLocalUpdate(update: Uint8Array): void;
  onRemoteUpdate(handler: (update: Uint8Array) => void): () => void;
}

export interface AiDocumentSource {
  documentId: string;
  title: string;
  markdown: string;
}

export interface AiCitation {
  documentId: string;
  blockId?: string;
  quote: string;
}

export interface AiAnswer {
  answer: string;
  citations: AiCitation[];
}

export interface AiAdapter {
  indexDocument(source: AiDocumentSource): Promise<void>;
  answer(question: string, documentId?: string): Promise<AiAnswer>;
  summarize(documentId: string): Promise<string>;
}
