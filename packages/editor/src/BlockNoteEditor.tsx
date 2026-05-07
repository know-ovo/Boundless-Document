import { useEffect, useRef, useMemo } from 'react';
import { useMantineColorScheme } from '@mantine/core';
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { filterSuggestionItems } from '@blocknote/core';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { editorSchema } from './schema';
import { getCustomSlashMenuItems } from './slash-menu';

const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';

export interface BlockNoteEditorProps {
  /** Markdown body (no YAML frontmatter) — parsed once into BlockNote blocks on mount. */
  initialMarkdown?: string;
  /** Fired when the document changes (lossy markdown export). */
  onMarkdownChange?: (markdown: string) => void;
  /** When initial Markdown fails to parse into blocks (falls back to empty document). */
  onMarkdownParseError?: (error: unknown) => void;
  /**
   * Enable Yjs WebRTC real-time collaboration.
   * OFF by default. When enabled, the document is shared via public y-webrtc signaling servers.
   * Only enable if you understand the privacy implications.
   */
  collaboration?: boolean;
}

export function BlockNoteEditor(props: BlockNoteEditorProps = {}) {
  const { initialMarkdown, onMarkdownChange, onMarkdownParseError, collaboration } = props;
  const { colorScheme } = useMantineColorScheme();
  const collabRef = useRef<any>(null);
  const hydratedRef = useRef(false);

  const collab = useMemo(() => {
    if (isTest || !collaboration) return undefined;
    if (collabRef.current) return collabRef.current;
    const doc = new Y.Doc();
    const provider = new WebrtcProvider(
      `wujie-doc-pi-${Math.random().toString(36).slice(2, 8)}`,
      doc,
    );
    collabRef.current = {
      provider,
      fragment: doc.getXmlFragment('document-store'),
      user: {
        name: `User-${Math.floor(Math.random() * 1000)}`,
        color: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`,
      },
    };
    return collabRef.current;
  }, [collaboration]);

  const editor = useCreateBlockNote({
    schema: editorSchema as any,
    collaboration: collab,
  });

  useEffect(() => {
    if (!editor || initialMarkdown === undefined || hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const blocks = editor.tryParseMarkdownToBlocks(initialMarkdown);
      if (blocks.length > 0) {
        editor.replaceBlocks(editor.document, blocks);
      }
    } catch (error) {
      console.warn('[BlockNoteEditor] tryParseMarkdownToBlocks failed', error);
      onMarkdownParseError?.(error);
    }
  }, [editor, initialMarkdown, onMarkdownParseError]);

  useEffect(() => {
    if (!editor || !onMarkdownChange) return;
    return editor.onChange(() => {
      onMarkdownChange(editor.blocksToMarkdownLossy());
    });
  }, [editor, onMarkdownChange]);

  return (
    <BlockNoteView
      editor={editor as any}
      slashMenu={false}
      data-color-scheme={colorScheme}
      className="bn-editor-wrapper"
    >
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query: string) => {
          const defaultItems = getDefaultReactSlashMenuItems(editor as any);
          const customItems = getCustomSlashMenuItems(editor);
          return filterSuggestionItems([...defaultItems, ...customItems], query) as any;
        }}
        {...{ suggestionMenuComponent: undefined as any, onItemClick: undefined as any }}
      />
    </BlockNoteView>
  );
}

export { BlockNoteEditor as MarkdownEditor };
