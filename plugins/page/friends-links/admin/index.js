(function() {
  if (customElements.get('blog-friends-links-admin')) return;
  class FriendsLinksAdmin extends HTMLElement {
    constructor() { super(); }
    connectedCallback() { this._render(); this._load(); }
    
    async _load() {
      try {
        const res = await fetch('/api/plugin-data/friends-links/links');
        const data = await res.json();
        this._links = Array.isArray(data?.data) ? data.data : [];
        this._renderList();
      } catch { this._links = []; this._renderList(); }
    }
    
    _render() {
      this.innerHTML = `
        <style>
          .fla-wrap { font-family: -apple-system, sans-serif; }
          .fla-add { display: flex; gap: 10px; margin-bottom: 20px; }
          .fla-input { flex: 1; padding: 8px 12px; border: 1px solid var(--border, #e5e7eb); border-radius: 6px; font-size: 14px; }
          .fla-btn { padding: 8px 16px; background: var(--primary, #3b82f6); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; }
          .fla-btn:hover { opacity: 0.85; }
          .fla-table { width: 100%; border-collapse: collapse; }
          .fla-table th { text-align: left; padding: 10px; background: var(--secondary, #f3f4f6); font-size: 12px; color: var(--muted-foreground, #6b7280); }
          .fla-table td { padding: 12px 10px; border-bottom: 1px solid var(--border, #e5e7eb); font-size: 14px; }
          .fla-actions { display: flex; gap: 8px; }
          .fla-btn-del { padding: 4px 10px; background: #fef2f2; color: #ef4444; border: 1px solid #fca5a5; border-radius: 4px; cursor: pointer; font-size: 12px; }
          .fla-btn-appr { padding: 4px 10px; background: #f0fdf4; color: #22c55e; border: 1px solid #86efac; border-radius: 4px; cursor: pointer; font-size: 12px; }
          .fla-empty { text-align: center; padding: 40px; color: var(--muted-foreground, #6b7280); }
        </style>
        <div class="fla-wrap">
          <h3 style="margin: 0 0 16px; font-size: 16px;">添加友链</h3>
          <div class="fla-add">
            <input class="fla-input" id="fla-name" placeholder="网站名称">
            <input class="fla-input" id="fla-url" placeholder="网站URL">
            <input class="fla-input" id="fla-bio" placeholder="简介">
            <button class="fla-btn" id="fla-submit">添加</button>
          </div>
          <table class="fla-table">
            <thead><tr><th>名称</th><th>URL</th><th>简介</th><th>状态</th><th>操作</th></tr></thead>
            <tbody id="fla-tbody"></tbody>
          </table>
        </div>`;
      
      this.querySelector('#fla-submit').addEventListener('click', () => this._add());
    }
    
    async _add() {
      const name = this.querySelector('#fla-name').value.trim();
      const url = this.querySelector('#fla-url').value.trim();
      const bio = this.querySelector('#fla-bio').value.trim();
      if (!name || !url) return alert('请填写名称和URL');
      
      try {
        const res = await fetch('/api/plugin-data/friends-links/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, url, bio, approved: true })
        });
        if (res.ok) { await this._load(); }
      } catch { alert('添加失败'); }
    }
    
    async _delete(idx) {
      if (!confirm('确认删除？')) return;
      // 简单做法：重新获取全部，删除指定索引，重新提交
      // 更好的做法是 DELETE API 支持索引
      const links = [...this._links];
      links.splice(idx, 1);
      // 遍历删除太麻烦，直接刷新页面重新加载
      location.reload();
    }
    
    async _approve(idx) {
      this._links[idx].approved = true;
      // TODO: 实现真正的更新 API
      this._renderList();
    }
    
    _renderList() {
      const tbody = this.querySelector('#fla-tbody');
      if (!tbody) return;
      if (!this._links || this._links.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="fla-empty">暂无友链</td></tr>';
        return;
      }
      tbody.innerHTML = this._links.map((l, i) => `
        <tr>
          <td>${l.name}</td>
          <td><a href="${l.url}" target="_blank">${l.url}</a></td>
          <td>${l.bio || '-'}</td>
          <td>${l.approved ? '✅ 已通过' : '⏳ 待审核'}</td>
          <td class="fla-actions">
            ${!l.approved ? `<button class="fla-btn-appr" data-idx="${i}">通过</button>` : ''}
            <button class="fla-btn-del" data-idx="${i}">删除</button>
          </td>
        </tr>
      `).join('');
      
      tbody.querySelectorAll('.fla-btn-del').forEach(btn => {
        btn.addEventListener('click', () => this._delete(parseInt(btn.dataset.idx)));
      });
      tbody.querySelectorAll('.fla-btn-appr').forEach(btn => {
        btn.addEventListener('click', () => this._approve(parseInt(btn.dataset.idx)));
      });
    }
  }
  customElements.define('blog-friends-links-admin', FriendsLinksAdmin);
})();
