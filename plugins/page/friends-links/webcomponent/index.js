(function() {
  if (customElements.get('blog-friends-links')) return;
  class FriendsLinks extends HTMLElement {
    constructor() { super(); }
    connectedCallback() { this._render(); }
    async _render() {
      const cfg = (window.__BLOG_PLUGIN_CONFIG__ || {})['friends-links'] || {};
      const title = cfg.title || '友链';
      const desc = cfg.description || '交换友链请留言~';
      
      // 获取友链数据
      let links = [];
      try {
        const res = await fetch('/api/plugin-data/friends-links/links');
        const data = await res.json();
        links = Array.isArray(data?.data) ? data.data : [];
      } catch {}
      
      // 只显示审核通过的
      const approved = links.filter(l => l.approved !== false);
      
      this.innerHTML = `
        <style>
          .fl-wrap { max-width: 800px; margin: 0 auto; padding: 48px 24px; font-family: var(--blog-font-body, sans-serif); }
          .fl-header { text-align: center; margin-bottom: 40px; }
          .fl-title { font-size: 32px; font-weight: 700; color: var(--blog-color-text, #111); margin: 0 0 12px; font-family: var(--blog-font-heading, sans-serif); }
          .fl-desc { color: var(--blog-color-text-muted, #666); font-size: 16px; }
          .fl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-bottom: 48px; }
          .fl-card { 
            display: block; padding: 20px; border-radius: var(--blog-radius, 8px); 
            border: 1px solid var(--blog-color-border, #e5e7eb); 
            background: var(--blog-color-surface, #fff);
            text-decoration: none; transition: all 0.2s;
          }
          .fl-card:hover { border-color: var(--blog-color-primary, #3b82f6); transform: translateY(-2px); box-shadow: var(--blog-shadow, 0 4px 12px rgba(0,0,0,0.08)); }
          .fl-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--blog-color-primary, #3b82f6); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; margin-bottom: 12px; }
          .fl-name { font-weight: 600; font-size: 16px; color: var(--blog-color-text, #111); margin-bottom: 4px; }
          .fl-bio { font-size: 13px; color: var(--blog-color-text-muted, #666); line-height: 1.4; }
          .fl-empty { text-align: center; padding: 40px; color: var(--blog-color-text-muted, #666); }
          .fl-apply { text-align: center; padding: 24px; background: var(--blog-color-surface, #f9f9f9); border-radius: var(--blog-radius, 8px); }
          .fl-apply-btn { display: inline-block; padding: 12px 32px; background: var(--blog-color-primary, #3b82f6); color: #fff; border-radius: var(--blog-radius-sm, 4px); text-decoration: none; font-weight: 500; transition: opacity 0.2s; }
          .fl-apply-btn:hover { opacity: 0.85; }
        </style>
        <div class="fl-wrap">
          <div class="fl-header">
            <h1 class="fl-title">${title}</h1>
            <p class="fl-desc">${desc}</p>
          </div>
          ${approved.length > 0 ? `
            <div class="fl-grid">
              ${approved.map(l => `
                <a href="${l.url || '#'}" target="_blank" rel="noopener" class="fl-card">
                  <div class="fl-avatar">${(l.name || '?')[0].toUpperCase()}</div>
                  <div class="fl-name">${l.name || ''}</div>
                  <div class="fl-bio">${l.bio || ''}</div>
                </a>
              `).join('')}
            </div>
          ` : `<div class="fl-empty">暂无友链，快来申请第一个吧~</div>`}
          <div class="fl-apply">
            <p style="margin-bottom: 16px; color: var(--blog-color-text-muted, #666)">交换友链请在留言板留言，或直接提交申请</p>
            <a href="/guestbook" class="fl-apply-btn">申请友链</a>
          </div>
        </div>`;
    }
  }
  customElements.define('blog-friends-links', FriendsLinks);
})();
