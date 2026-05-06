import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';

// Custom blocks registered here — blocks package components are rendered by BlockNote
export const editorSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
  },
});
