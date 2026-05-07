import { useState, useEffect } from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.lp-section').forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 84;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'lp-features', label: '特性' },
    { id: 'lp-how', label: '工作原理' },
    { id: 'lp-ecosystem', label: '架构' },
  ];

  return (
    <div className="landing-root">
      {/* ══════════ NAV — floating pill ══════════ */}
      <header className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <span className="lp-logo">无界文档 <span className="lp-logo-sub">Boundless</span></span>
        <nav className="lp-nav-links">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => { e.preventDefault(); scrollTo(item.id); }}
            >
              {item.label}
            </a>
          ))}
          <a href="https://github.com/know-ovo/Boundless-Document" target="_blank" rel="noopener">GitHub</a>
        </nav>
        <button className="lp-nav-cta" onClick={onEnter}>进入编辑器</button>
      </header>

      {/* ══════════ HERO ══════════ */}
      <section className="lp-section lp-hero" id="lp-hero">
        <div className="lp-hero-grid">
          <div>
            <p className="lp-eyebrow">Markdown · 超能力</p>
            <h1 className="lp-h1">文档不止于文字。<br/>数据、代码、3D 皆可内嵌。</h1>
            <p className="lp-lede">
              无界文档以纯文本 Markdown 为基底，在正文中直接渲染实时数据面板、可执行代码块、
              三维模型——保留 .md 的可迁移性，同时拥有富应用的表达力。
            </p>
            <div className="lp-hero-cta">
              <button className="lp-btn lp-btn-primary" onClick={onEnter}>开始使用</button>
              <button className="lp-btn lp-btn-ghost" onClick={() => scrollTo('lp-features')}>
                了解特性 <span className="lp-arrow">→</span>
              </button>
            </div>
            <div className="lp-tags">
              <span className="lp-tag blue">开源 · Apache-2.0</span>
              <span className="lp-tag green">本地优先 · 离线可用</span>
              <span className="lp-tag yellow">Tauri 桌面版</span>
            </div>
          </div>
          <div className="lp-editor-mock">
            <div className="lp-editor-bar"><span /><span /><span /></div>
            <div className="lp-editor-body">
              <div className="lp-editor-src">
                <span className="lp-cb">```live-data</span><br/>
                <span className="lp-str">source: https://api.github.com</span><br/>
                <span className="lp-str">mode: polling · interval: 15s</span><br/>
                <span className="lp-cb">```</span><br/><br/>
                <span className="lp-cb">```run-js</span><br/>
                <span className="lp-str">return {`{ time: Date.now() }`}</span><br/>
                <span className="lp-cb">```</span><br/><br/>
                <span className="lp-cb">```model3d</span><br/>
                <span className="lp-str">src: model.glb · autoRotate</span><br/>
                <span className="lp-cb">```</span>
              </div>
              <div className="lp-editor-preview">
                <div className="lp-prev-label">→ 实时预览</div>
                <div className="lp-prev-card">
                  <strong>GitHub API 响应</strong>
                  <div className="lp-mini-bar" />
                  <span className="lp-mini-hint">实时 polling · 15s 间隔</span>
                </div>
                <div className="lp-prev-card">
                  <strong>代码执行结果</strong>
                  <code className="lp-inline-code">{`{ time: 1714896000 }`}</code>
                </div>
                <div className="lp-prev-card">
                  <strong>3D 模型预览</strong>
                  <div className="lp-mini-3d">3D Viewer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section className="lp-section lp-body-section" id="lp-features">
        <div className="lp-container">
          <div className="lp-section-head">
            <p className="lp-eyebrow">核心能力</p>
            <h2 className="lp-h2">在 Markdown 里直接看到数据、运行代码、操纵 3D。</h2>
          </div>
          <div className="lp-feature-grid">
            <div className="lp-feature">
              <div className="lp-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                </svg>
              </div>
              <h3>实时数据展示</h3>
              <p>通过 <code>live-data</code> 代码块接入 HTTP polling、SSE、WebSocket，在文档中原位渲染动态数据面板。</p>
            </div>
            <div className="lp-feature">
              <div className="lp-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <h3>可执行代码块</h3>
              <p><code>run-js</code> 块在 Web Worker 沙箱中安全执行 JavaScript，输出直接呈现在块下方。计划接入 Pyodide。</p>
            </div>
            <div className="lp-feature">
              <div className="lp-feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3>3D 与多模态</h3>
              <p><code>model3d</code> 展示 GLB/glTF 模型，<code>asset</code> 嵌入图片、视频、音频——文档内直接渲染。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="lp-section lp-body-section" id="lp-how">
        <div className="lp-container">
          <div className="lp-section-head-center">
            <p className="lp-eyebrow">工作方式</p>
            <h2 className="lp-h2">源码即文档，预览即应用。</h2>
          </div>
          <div className="lp-how-grid">
            <div className="lp-how-cards">
              <div className="lp-how-card">
                <h3>保持纯文本</h3>
                <p>所有增强块在源码中以代码块存储，任何 Markdown 编辑器都能打开。没有专有格式，没有锁定。</p>
              </div>
              <div className="lp-how-card">
                <h3>原地增强</h3>
                <p>增强块在文档原位置渲染——就像 Markdown 图片，写时是配置，看时是内容。</p>
              </div>
              <div className="lp-how-card">
                <h3>安全沙箱</h3>
                <p>代码执行和数据访问在隔离的 Web Worker / iframe 中完成，本地文件不掉落云端。</p>
              </div>
            </div>
            <div className="lp-code-block">
              <span className="cmt"># 无界文档 — 示例</span><br/><br/>
              <span className="cmt">## 实时系统状态</span><br/><br/>
              <span className="kw">```</span><span className="fn">live-data</span><br/>
              <span className="str">source:</span> https://status.example.com<br/>
              <span className="str">mode:</span> sse<br/>
              <span className="str">view:</span> table<br/>
              <span className="kw">```</span><br/><br/>
              <span className="cmt">## 快速分析</span><br/><br/>
              <span className="kw">```</span><span className="fn">run-js</span><br/>
              <span className="str">const</span> data <span className="str">= await</span> fetchData()<br/>
              <span className="str">return</span> {'{'} rows, summary {'}'}<br/>
              <span className="kw">```</span><br/><br/>
              <span className="cmt">## 3D 原型预览</span><br/><br/>
              <span className="kw">```</span><span className="fn">model3d</span><br/>
              <span className="str">src:</span> ./prototype.glb<br/>
              <span className="str">autoRotate:</span> true<br/>
              <span className="kw">```</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ ECOSYSTEM ══════════ */}
      <section className="lp-section lp-body-section" id="lp-ecosystem">
        <div className="lp-container">
          <div className="lp-section-head-center">
            <p className="lp-eyebrow">架构</p>
            <h2 className="lp-h2">模块化设计，按需组合。</h2>
          </div>
          <div className="lp-eco-grid">
            <div className="lp-eco-card"><h3>editor</h3><p>基于 BlockNote 的 WYSIWYG 编辑器，支持增强块内嵌渲染。</p></div>
            <div className="lp-eco-card"><h3>blocks</h3><p>增强块渲染：实时数据、代码结果、3D 模型、多媒体。</p></div>
            <div className="lp-eco-card"><h3>runtime</h3><p>数据订阅 + Worker 沙箱，隔离执行，安全可控。</p></div>
            <div className="lp-eco-card"><h3>shared</h3><p>共享类型、块解析器、扩展接口——所有包的契约层。</p></div>
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="lp-section lp-body-section lp-cta-section" id="lp-cta">
        <div className="lp-container">
          <h2 className="lp-h2">把文档变成活的。</h2>
          <p className="lp-cta-lede">
            开源、本地优先、纯 Markdown 为底——欢迎贡献和反馈。
          </p>
          <div className="lp-cta-actions">
            <button className="lp-btn lp-btn-primary" onClick={onEnter}>立即开始</button>
            <button className="lp-btn lp-btn-secondary" onClick={() => window.open('https://github.com/know-ovo/Boundless-Document', '_blank')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </button>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="lp-footer">
        <div className="lp-container lp-footer-inner">
          <span>© 无界文档 · Boundless Docs · Apache-2.0</span>
          <span className="lp-meta">以 Markdown 为基底 · 本地优先 · 开源</span>
        </div>
      </footer>
    </div>
  );
}
