import '@google/model-viewer';
import type { Model3dBlock } from '@boundless-docs/shared';

export function Model3dBlockView({ block }: { block: Model3dBlock }) {
  if (!block.config.src) {
    return <div className="block-error">model3d 缺少 src</div>;
  }

  return (
    <model-viewer
      src={block.config.src}
      poster={block.config.poster}
      auto-rotate={block.config.autoRotate}
      camera-controls={block.config.cameraControls}
      style={{
        width: '100%',
        height: `${block.config.height}px`,
        borderRadius: '14px',
        background: '#0f172a',
      }}
    />
  );
}
