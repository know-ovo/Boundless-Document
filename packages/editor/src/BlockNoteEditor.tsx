import { useEffect, useRef } from 'react';
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

// Translate default BlockNote slash-menu items
const titleZh: Record<string, string> = {
  'Heading 1': '一级标题',
  'Heading 2': '二级标题',
  'Heading 3': '三级标题',
  'Bullet List': '无序列表',
  'Numbered List': '有序列表',
  'Check List': '任务列表',
  'Block Quote': '引用块',
  'Code Block': '代码块',
  'Table': '表格',
  'Image': '图片',
  'Divider': '分割线',
  'Video': '视频',
  'Audio': '音频',
  'File': '文件',
  'Emoji': '表情',
};
const groupZh: Record<string, string> = {
  'Headings': '标题',
  'Basic Blocks': '基础块',
  'Media': '媒体',
};

function translateDefaultItems(items: any[], lang?: 'zh-CN' | 'en'): any[] {
  if (lang === 'en') return items;
  return items.map((item) => ({
    ...item,
    title: titleZh[item.title] ?? item.title,
    subtext: item.subtext ? (titleZh[item.subtext] ?? item.subtext) : item.subtext,
    group: groupZh[item.group] ?? item.group,
  }));
}

export interface BlockNoteEditorProps {
  /** Markdown body (no YAML frontmatter) — parsed once into BlockNote blocks on mount. */
  initialMarkdown?: string;
  /** Fired when the document changes (lossy markdown export). */
  onMarkdownChange?: (markdown: string) => void;
  /** UI language for slash menu items ('zh-CN' | 'en'). */
  language?: 'zh-CN' | 'en';
}

export function BlockNoteEditor(props: BlockNoteEditorProps = {}) {
  const { initialMarkdown, onMarkdownChange, language } = props;
  const { colorScheme } = useMantineColorScheme();
  const collabRef = useRef<any>(null);
  const hydratedRef = useRef(false);

  if (!isTest && !collabRef.current) {
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
  }

  const editor = useCreateBlockNote({
    schema: editorSchema as any,
    collaboration: collabRef.current ?? undefined,
  });

  useEffect(() => {
    if (!editor || initialMarkdown === undefined || hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const blocks = editor.tryParseMarkdownToBlocks(initialMarkdown);
      if (blocks.length > 0) {
        editor.replaceBlocks(editor.document, blocks);
        // Clear undo history so Ctrl+Z doesn't revert initial content
        queueMicrotask(() => {
          try {
            const tt = (editor as any)?._tiptapEditor;
            if (tt) {
              tt.commands?.clearHistory?.();
              const yUndoManager = tt.extensionStorage?.collaboration?.undoManager;
              if (yUndoManager) yUndoManager.clear();
            }
          } catch { /* best effort */ }
        });
      }
    } catch {
      /* keep default empty document */
    }
  }, [editor, initialMarkdown]);

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
          const defaultItems = translateDefaultItems(
            getDefaultReactSlashMenuItems(editor as any),
            language,
          );
          const customItems = getCustomSlashMenuItems(editor, language);
          return filterSuggestionItems([...defaultItems, ...customItems], query) as any;
        }}
        {...{ suggestionMenuComponent: undefined as any, onItemClick: undefined as any }}
      />
    </BlockNoteView>
  );
}

export { BlockNoteEditor as MarkdownEditor };
