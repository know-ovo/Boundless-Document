import '@google/model-viewer';
import type { Model3dBlock } from '@boundless-docs/shared';
import { useEffect, useRef } from 'react';

export function Model3dBlockView({ block }: { block: Model3dBlock }) {
  const ref = useRef<HTMLElement | null>(null);

  if (!block.config.src) {
    return <div className="block-error">model3d 缺少 src</div>;
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.setAttribute('src', block.config.src);

    if (block.config.poster) {
      el.setAttribute('poster', block.config.poster);
    } else {
      el.removeAttribute('poster');
    }

    // Boolean attributes: present = true, absent = false
    if (block.config.autoRotate) {
      el.setAttribute('auto-rotate', '');
    } else {
      el.removeAttribute('auto-rotate');
    }

    if (block.config.cameraControls) {
      el.setAttribute('camera-controls', '');
    } else {
      el.removeAttribute('camera-controls');
    }
  }, [block.config.src, block.config.poster, block.config.autoRotate, block.config.cameraControls]);

  return (
    <model-viewer
      ref={ref}
      style={{
        width: '100%',
        height: `${block.config.height}px`,
        borderRadius: '14px',
        background: '#0f172a',
      }}
    />
  );
}
