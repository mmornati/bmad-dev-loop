import DefaultTheme from 'vitepress/theme';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return;

    let mermaidPromise = null;
    const getMermaid = () => {
      if (!mermaidPromise) {
        mermaidPromise = import('mermaid').then((m) => m.default);
      }
      return mermaidPromise;
    };

    const init = (mermaid) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        themeVariables: {
          primaryColor: '#161d3a',
          primaryTextColor: '#e6ecff',
          primaryBorderColor: '#00d4ff',
          lineColor: '#7c5cff',
          secondaryColor: '#11172e',
          tertiaryColor: '#0b1020',
          edgeLabelBackground: '#0b1020',
          clusterBkg: '#11172e',
          clusterBorder: '#2a325a',
          titleColor: '#00d4ff',
          textColor: '#e6ecff',
        },
      });
    };

    const renderMermaid = async () => {
      const mermaid = await getMermaid();
      init(mermaid);
      const wrappers = document.querySelectorAll(
        '.vp-doc div.language-mermaid',
      );
      const targets = [];
      wrappers.forEach((wrapper) => {
        const source = wrapper.querySelector('code')?.textContent ?? '';
        if (!source.trim()) return;
        const container = document.createElement('div');
        container.className = 'mermaid';
        container.textContent = source;
        wrapper.replaceWith(container);
        targets.push(container);
      });
      if (targets.length === 0) return;
      try {
        await mermaid.run({ nodes: targets });
      } catch (e) {
        targets.forEach((el) => el.removeAttribute('data-processed'));
        console.error('mermaid render failed', e);
      }
    };

    if (document.readyState === 'complete') {
      renderMermaid();
    } else {
      window.addEventListener('DOMContentLoaded', renderMermaid);
    }

    if (router && typeof router.onAfterRouteChanged === 'function') {
      const original = router.onAfterRouteChanged;
      router.onAfterRouteChanged = (...args) => {
        if (typeof original === 'function') original(...args);
        renderMermaid();
      };
    }
  },
};
