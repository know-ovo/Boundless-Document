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

/** 保存结果：`cancelled` 表示用户在「另存为」对话框中取消（仅 Tauri 首次保存）。 */
export interface SaveMarkdownResult {
  path?: string;
  cancelled?: boolean;
}

export async function saveMarkdownFile(
  content: string,
  currentPath?: string,
): Promise<SaveMarkdownResult> {
  if (isTauri()) {
    const path =
      currentPath ??
      (await save({
        filters: [{ name: 'Markdown', extensions: ['md'] }],
        defaultPath: 'boundless-doc.md',
      }));

    if (!path) {
      return { path: currentPath, cancelled: true };
    }
    await writeTextFile(path, content);
    return { path };
  }

  downloadInBrowser(content);
  return { path: currentPath };
}

/** 桌面版从已知路径重新读取（侧栏「最近」）；网页版无持久路径，不可用。 */
export async function readMarkdownFromPath(filePath: string): Promise<string> {
  if (!isTauri()) {
    throw new Error('网页预览版无法从路径打开文件，请使用「打开」选择文件。');
  }
  return readTextFile(filePath);
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
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'boundless-doc.md';
  link.click();
  URL.revokeObjectURL(url);
}
