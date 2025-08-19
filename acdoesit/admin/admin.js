document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const who = document.getElementById('who');
    const controls = document.getElementById('controls');
    const refreshBtn = document.getElementById('refreshBtn');
    const exportBtn = document.getElementById('exportBtn');
    const errorEl = document.getElementById('error');
    const table = document.getElementById('leadsTable');
    const tbody = table.querySelector('tbody');
  
    const setError = (msg) => {
      if (!msg) { errorEl.classList.add('hidden'); errorEl.textContent=''; return; }
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    };
  
    function render(leads) {
      tbody.innerHTML = '';
      leads.forEach(l => {
        const tr = document.createElement('tr');
        const cells = [l.created_at?.slice(0,19)?.replace('T',' ')||'', l.name||'', l.email||'', l.role||'', l.price||''];
        cells.forEach(c => { const td = document.createElement('td'); td.textContent = c; tr.appendChild(td); });
        tbody.appendChild(tr);
      });
      table.classList.toggle('hidden', leads.length === 0);
      document.getElementById('count').textContent = `${leads.length} lead(s)`;
    }
  
    async function getToken() {
      const user = netlifyIdentity.currentUser();
      if (!user) return null;
      try { return await user.jwt(); } catch { return null; }
    }
  
    async function fetchLeads() {
      setError('');
      const token = await getToken();
      if (!token) { setError('Please log in.'); return; }
      const r = await fetch('/.netlify/functions/list-leads', { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) { setError('Failed to load leads.'); return; }
      const data = await r.json();
      render(data || []);
    }
  
    function toCSV(rows) {
      const esc = (v) => '"' + String(v ?? '').replace(/"/g,'""') + '"';
      const headers = ['created_at','name','email','role','price'];
      const lines = [headers.join(',')];
      rows.forEach(r => lines.push(headers.map(h => esc(r[h])).join(',')));
      return lines.join('\n');
    }
  
    async function exportCSV() {
      const token = await getToken();
      if (!token) { setError('Please log in.'); return; }
      const r = await fetch('/.netlify/functions/list-leads', { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) { setError('Failed to export.'); return; }
      const rows = await r.json();
      const csv = toCSV(rows || []);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'leads.csv';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }
  
    function updateAuthUI() {
      const user = netlifyIdentity.currentUser();
      const loggedIn = !!user;
      loginBtn.classList.toggle('hidden', loggedIn);
      logoutBtn.classList.toggle('hidden', !loggedIn);
      controls.classList.toggle('hidden', !loggedIn);
      who.textContent = loggedIn ? `Signed in as ${user.email}` : '';
      if (loggedIn) fetchLeads();
    }
  
    loginBtn.addEventListener('click', () => netlifyIdentity.open('login'));
    logoutBtn.addEventListener('click', async () => { await netlifyIdentity.logout(); updateAuthUI(); });
    refreshBtn.addEventListener('click', fetchLeads);
    exportBtn.addEventListener('click', exportCSV);
  
    netlifyIdentity.on('init', updateAuthUI);
    netlifyIdentity.on('login', () => { netlifyIdentity.close(); updateAuthUI(); });
    netlifyIdentity.on('logout', updateAuthUI);
    netlifyIdentity.init();
  });