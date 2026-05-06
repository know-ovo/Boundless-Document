import type { AssetBlock } from '@boundless-docs/shared';

export function AssetBlockView({ block }: { block: AssetBlock }) {
  const { src, type, title } = block.config;
  if (!src) {
    return <div className="block-error">asset 缺少 src</div>;
  }

  if (type === 'image') {
    return <img className="asset-image" src={src} alt={title ?? src} loading="lazy" />;
  }

  if (type === 'video') {
    return <video className="asset-media" src={src} controls preload="metadata" />;
  }

  if (type === 'audio') {
    return <audio className="asset-audio" src={src} controls />;
  }

  if (type === 'pdf') {
    return <iframe className="asset-frame" src={src} title={title ?? src} />;
  }

  return (
    <a href={src} target="_blank" rel="noreferrer">
      打开资源：{title ?? src}
    </a>
  );
}
