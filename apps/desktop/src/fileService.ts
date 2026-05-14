import { open, save } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

export interface OpenedDocument {
  path?: string;
  name: string;
  content: string;
}

export async function openMarkdownFile(): Promise<OpenedDocument | null> {
  if (isTauri()) {
    const path = await open({
      multiple: false,
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
    });
    if (typeof path !== 'string') {
      return null;
    }
    return {
      path,
      name: path.split(/[\\/]/).pop() ?? '未命名.md',
      content: await readTextFile(path),
    };
  }

  return openFromBrowser();
}

export async function saveMarkdownFile(content: string, currentPath?: string): Promise<string | undefined> {
  if (isTauri()) {
    const path =
      currentPath ??
      (await save({
        filters: [{ name: 'Markdown', extensions: ['md'] }],
        defaultPath: 'boundless-doc.md',
      }));

    if (!path) {
      return currentPath;
    }
    await writeTextFile(path, content);
    return path;
  }

  downloadInBrowser(content);
  return currentPath;
}

function isTauri(): boolean {
  return '__TAURI_INTERNALS__' in window;
}

function openFromBrowser(): Promise<OpenedDocument | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,text/markdown,text/plain';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      resolve({
        name: file.name,
        content: await file.text(),
      });
    };
    input.click();
  });
}

function downloadInBrowser(content: string) {
  downloadMarkdownFile(content, 'boundless-doc.md');
}

export function downloadMarkdownFile(content: string, fileName: string) {
  const name = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
