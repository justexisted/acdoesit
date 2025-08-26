window.loadReferrals = async function loadReferrals() {
  const list = document.getElementById('referralsList');
  if (!list) return;
  list.innerHTML = '<p class="muted">Loading...</p>';
  try {
    const resp = await fetch('/.netlify/functions/get-referrals');
    if (!resp.ok) {
      list.innerHTML = '<p class="muted">Failed to load referrals.</p>';
      return;
    }
    const data = await resp.json();
    const rows = data.referrals || [];
    if (rows.length === 0) {
      list.innerHTML = '<p class="muted">No referral links yet. Create your first one above.</p>';
      return;
    }
    list.innerHTML = '';
    rows.forEach(r => {
      const div = document.createElement('div');
      div.className = 'ref-card';
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
          <div style="min-width:260px;">
            <div><strong>Reward:</strong> ${escapeHtml(r.referee_reward_description || '')}</div>
            <div class="muted">Status: ${escapeHtml(r.status)} · Completed Count: ${r.completed_count || 0}</div>
            <div class="muted" style="overflow-wrap:anywhere;">Link: ${escapeHtml(r.link || '')}</div>
          </div>
          <div class="ref-actions">
            <button class="copy-btn" data-link="${r.link || ''}">Copy Link</button>
          </div>
        </div>
      `;
      list.appendChild(div);
    });
    list.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const link = e.currentTarget.getAttribute('data-link');
        try { await navigator.clipboard.writeText(link); showMsg('Link copied!'); } catch { showMsg('Copy failed'); }
      });
    });
  } catch (e) {
    list.innerHTML = '<p class="muted">Error loading referrals.</p>';
  }
}

function showMsg(msg) {
  const node = document.getElementById('createReferralMsg');
  if (node) node.textContent = msg;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('createReferralBtn');
  const input = document.getElementById('refReward');
  if (btn && input) {
    btn.addEventListener('click', async () => {
      const text = (input.value || '').trim();
      if (!text) { showMsg('Please enter a reward description.'); return; }
      showMsg('Creating...');
      try {
        const resp = await fetch('/.netlify/functions/create-referral', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referee_reward_description: text })
        });
        if (!resp.ok) { showMsg('Failed to create referral'); return; }
        showMsg('Referral created');
        input.value = '';
        await window.loadReferrals();
      } catch (e) {
        showMsg('Error creating referral');
      }
    });
  }

  // Initial load (will show empty if not signed in)
  try { window.loadReferrals(); } catch (e) {}
});


