document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const who = document.getElementById('who');
  const controls = document.getElementById('controls');
  const refreshBtn = document.getElementById('refreshBtn');
  const exportBtn = document.getElementById('exportBtn');
  const errorEl = document.getElementById('error');
  const statsOverview = document.getElementById('statsOverview');
  const tabNavigation = document.getElementById('tabNavigation');
  
  // Table elements
  const usersTable = document.getElementById('usersTable');
  const engagementTable = document.getElementById('engagementTable');
  const featuresTable = document.getElementById('featuresTable');
  
  let currentData = [];
  let currentTab = 'users';

  const setError = (msg) => {
    if (!msg) { errorEl.classList.add('hidden'); errorEl.textContent=''; return; }
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  };

  // Format time to AM/PM format
  function formatTime(timeString) {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // Format date only (no time)
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // Get engagement level class
  function getEngagementClass(score) {
    if (score >= 70) return 'engagement-high';
    if (score >= 30) return 'engagement-medium';
    return 'engagement-low';
  }

  // Render statistics overview
  function renderStats(data) {
    const totalUsers = data.length;
    const activeUsers = data.filter(user => {
      if (!user.last_activity) return false;
      const lastActivity = new Date(user.last_activity);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastActivity > thirtyDaysAgo;
    }).length;
    
    const avgEngagement = totalUsers > 0 ? Math.round(data.reduce((sum, user) => sum + user.engagement_score, 0) / totalUsers) : 0;
    const totalActions = data.reduce((sum, user) => sum + user.total_actions, 0);

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('avgEngagement').textContent = avgEngagement;
    document.getElementById('totalActions').textContent = totalActions;
  }

  // Render users table
  function renderUsersTable(data) {
    const tbody = usersTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    data.forEach(user => {
      const tr = document.createElement('tr');
      
      const locationText = user.location?.city ? 
        `${user.location.city}, ${user.location.country || user.location.region || 'Unknown'}` : 
        'Unknown';
      
      const featureUsageText = Object.entries(user.feature_usage || {})
        .map(([feature, count]) => `${feature}: ${count}`)
        .join(', ') || 'None';
      
      const cells = [
        formatDate(user.created_at),
        `${user.first_name} ${user.last_name}`,
        user.email,
        user.provider || 'email',
        locationText,
        `<span class="${getEngagementClass(user.engagement_score)}">${user.engagement_score}</span>`,
        user.total_actions,
        formatTime(user.last_activity) || 'Never',
        `<div class="feature-usage">${featureUsageText}</div>`
      ];
      
      cells.forEach(c => { 
        const td = document.createElement('td'); 
        td.innerHTML = c; 
        tr.appendChild(td); 
      });
      
      tbody.appendChild(tr);
    });
    
    usersTable.classList.toggle('hidden', data.length === 0);
  }

  // Render engagement table
  function renderEngagementTable(data) {
    const tbody = engagementTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    data.forEach(user => {
      const tr = document.createElement('tr');
      
      const mostUsedFeature = Object.entries(user.feature_usage || {})
        .sort(([,a], [,b]) => b - a)[0];
      
      const mostUsedFeatureText = mostUsedFeature ? 
        `${mostUsedFeature[0]} (${mostUsedFeature[1]} times)` : 
        'None';
      
      const cells = [
        `${user.first_name} ${user.last_name}`,
        user.email,
        `<span class="${getEngagementClass(user.engagement_score)}">${user.engagement_score}</span>`,
        user.total_actions, // Simplified for demo
        user.total_actions, // Simplified for demo
        mostUsedFeatureText,
        formatTime(user.last_activity) || 'Never'
      ];
      
      cells.forEach(c => { 
        const td = document.createElement('td'); 
        td.innerHTML = c; 
        tr.appendChild(td); 
      });
      
      tbody.appendChild(tr);
    });
    
    engagementTable.classList.toggle('hidden', data.length === 0);
  }

  // Render feature usage table
  function renderFeaturesTable(data) {
    const tbody = featuresTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Aggregate feature usage across all users
    const featureStats = {};
    data.forEach(user => {
      Object.entries(user.feature_usage || {}).forEach(([feature, count]) => {
        if (!featureStats[feature]) {
          featureStats[feature] = {
            totalUsage: 0,
            uniqueUsers: 0,
            users: new Set()
          };
        }
        featureStats[feature].totalUsage += count;
        featureStats[feature].users.add(user.id);
      });
    });
    
    Object.entries(featureStats).forEach(([feature, stats]) => {
      const tr = document.createElement('tr');
      const uniqueUsers = stats.users.size;
      const avgUsage = uniqueUsers > 0 ? Math.round(stats.totalUsage / uniqueUsers * 10) / 10 : 0;
      
      // Find most active user for this feature
      const mostActiveUser = data.find(user => 
        user.feature_usage && user.feature_usage[feature] === 
        Math.max(...Object.values(user.feature_usage || {}))
      );
      
      const cells = [
        feature,
        stats.totalUsage,
        uniqueUsers,
        avgUsage,
        mostActiveUser ? `${mostActiveUser.first_name} ${mostActiveUser.last_name}` : 'None'
      ];
      
      cells.forEach(c => { 
        const td = document.createElement('td'); 
        td.textContent = c; 
        tr.appendChild(td); 
      });
      
      tbody.appendChild(tr);
    });
    
    featuresTable.classList.toggle('hidden', Object.keys(featureStats).length === 0);
  }

  // Switch tabs
  function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Hide all tables
    document.querySelectorAll('.table-wrap').forEach(wrap => wrap.classList.add('hidden'));
    
    // Show selected table
    if (tabName === 'users') {
      document.getElementById('usersTab').classList.remove('hidden');
    } else if (tabName === 'engagement') {
      document.getElementById('engagementTab').classList.remove('hidden');
    } else if (tabName === 'features') {
      document.getElementById('featuresTab').classList.remove('hidden');
    }
  }

  // Main render function
  function render(data) {
    currentData = data;
    renderStats(data);
    renderUsersTable(data);
    renderEngagementTable(data);
    renderFeaturesTable(data);
    
    // Show stats and tabs
    statsOverview.classList.remove('hidden');
    tabNavigation.classList.remove('hidden');
    
    document.getElementById('count').textContent = `${data.length} user(s)`;
  }

  async function getToken() {
    const user = netlifyIdentity.currentUser();
    if (!user) return null;
    try { return await user.jwt(); } catch { return null; }
  }

  async function fetchUserAnalytics() {
    setError('');
    const token = await getToken();
    if (!token) { setError('Please log in.'); return; }
    
    const r = await fetch('/.netlify/functions/get-user-analytics', { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    
    if (!r.ok) { setError('Failed to load user analytics.'); return; }
    const data = await r.json();
    render(data || []);
  }

  function toCSV(rows) {
    const esc = (v) => '"' + String(v ?? '').replace(/"/g,'""') + '"';
    
    let headers, lines;
    
    if (currentTab === 'users') {
      headers = ['created_at','first_name','last_name','email','provider','location','engagement_score','total_actions','last_activity','feature_usage'];
      lines = [headers.join(',')];
      rows.forEach(r => {
        const locationText = r.location?.city ? 
          `${r.location.city}, ${r.location.country || r.location.region || 'Unknown'}` : 
          'Unknown';
        const featureUsageText = Object.entries(r.feature_usage || {})
          .map(([feature, count]) => `${feature}: ${count}`)
          .join('; ') || 'None';
        
        const values = [
          formatDate(r.created_at),
          r.first_name,
          r.last_name,
          r.email,
          r.provider || 'email',
          locationText,
          r.engagement_score,
          r.total_actions,
          formatTime(r.last_activity) || 'Never',
          featureUsageText
        ];
        lines.push(values.map(v => esc(v)).join(','));
      });
    } else if (currentTab === 'engagement') {
      headers = ['user','email','engagement_score','total_actions','most_used_feature','last_activity'];
      lines = [headers.join(',')];
      rows.forEach(r => {
        const mostUsedFeature = Object.entries(r.feature_usage || {})
          .sort(([,a], [,b]) => b - a)[0];
        const mostUsedFeatureText = mostUsedFeature ? 
          `${mostUsedFeature[0]} (${mostUsedFeature[1]} times)` : 
          'None';
        
        const values = [
          `${r.first_name} ${r.last_name}`,
          r.email,
          r.engagement_score,
          r.total_actions,
          mostUsedFeatureText,
          formatTime(r.last_activity) || 'Never'
        ];
        lines.push(values.map(v => esc(v)).join(','));
      });
    } else if (currentTab === 'features') {
      // Aggregate feature usage for CSV
      const featureStats = {};
      rows.forEach(user => {
        Object.entries(user.feature_usage || {}).forEach(([feature, count]) => {
          if (!featureStats[feature]) {
            featureStats[feature] = { totalUsage: 0, uniqueUsers: 0 };
          }
          featureStats[feature].totalUsage += count;
          featureStats[feature].uniqueUsers++;
        });
      });
      
      headers = ['feature','total_usage','unique_users','avg_usage_per_user'];
      lines = [headers.join(',')];
      Object.entries(featureStats).forEach(([feature, stats]) => {
        const avgUsage = stats.uniqueUsers > 0 ? Math.round(stats.totalUsage / stats.uniqueUsers * 10) / 10 : 0;
        const values = [feature, stats.totalUsage, stats.uniqueUsers, avgUsage];
        lines.push(values.map(v => esc(v)).join(','));
      });
    }
    
    return lines.join('\n');
  }

  async function exportCSV() {
    const token = await getToken();
    if (!token) { setError('Please log in.'); return; }
    
    const csv = toCSV(currentData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = `user-analytics-${currentTab}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a); 
    a.click(); 
    a.remove();
    URL.revokeObjectURL(url);
  }

  function updateAuthUI() {
    const user = netlifyIdentity.currentUser();
    const loggedIn = !!user;
    loginBtn.classList.toggle('hidden', loggedIn);
    logoutBtn.classList.toggle('hidden', !loggedIn);
    controls.classList.toggle('hidden', !loggedIn);
    who.textContent = loggedIn ? `Signed in as ${user.email}` : '';
    if (loggedIn) fetchUserAnalytics();
  }

  // Event listeners
  loginBtn.addEventListener('click', () => netlifyIdentity.open('login'));
  logoutBtn.addEventListener('click', async () => { await netlifyIdentity.logout(); updateAuthUI(); });
  refreshBtn.addEventListener('click', fetchUserAnalytics);
  exportBtn.addEventListener('click', exportCSV);

  // Tab switching
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
      switchTab(e.target.dataset.tab);
    }
  });

  netlifyIdentity.on('init', updateAuthUI);
  netlifyIdentity.on('login', () => { netlifyIdentity.close(); updateAuthUI(); });
  netlifyIdentity.on('logout', updateAuthUI);
  netlifyIdentity.init();
});