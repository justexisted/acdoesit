document.addEventListener('DOMContentLoaded', () => {
  // Only allow this specific email to access admin
  const ADMIN_EMAIL = 'justexisted@gmail.com';
  
  // DOM Elements
  const loginContainer = document.getElementById('loginContainer');
  const dashboardContainer = document.getElementById('dashboardContainer');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  
  const errorEl = document.getElementById('error');
  const successEl = document.getElementById('success');
  const loadingEl = document.getElementById('loading');
  const statsOverview = document.getElementById('statsOverview');
  const tabNavigation = document.getElementById('tabNavigation');
  const controls = document.getElementById('controls');
  const refreshBtn = document.getElementById('refreshBtn');
  const exportBtn = document.getElementById('exportBtn');
  const lastUpdatedEl = document.getElementById('lastUpdated');
  
  // Table elements
  const usersTable = document.getElementById('usersTable');
  const activityTable = document.getElementById('activityTable');
  const featuresTable = document.getElementById('featuresTable');
  const bookingsTable = document.getElementById('bookingsTable');
  
  // Search and filter elements
  const userSearch = document.getElementById('userSearch');
  const providerFilter = document.getElementById('providerFilter');
  const engagementFilter = document.getElementById('engagementFilter');
  
  let currentData = [];
  let currentTab = 'users';
  let filteredData = [];
  let isAuthenticated = false;

  // Google OAuth Admin Sign-In Handler
  function handleAdminGoogleSignIn(response) {
    try {
      // Decode the JWT token from Google
      const responsePayload = decodeJwtResponse(response.credential);
      
      console.log('Google Sign-In Response:', responsePayload);
      
      // Check if this is the admin email
      if (responsePayload.email === ADMIN_EMAIL) {
        // Store admin session
        localStorage.setItem('adminAuthToken', responsePayload.email);
        localStorage.setItem('adminName', responsePayload.name);
        localStorage.setItem('adminPicture', responsePayload.picture);
        
        isAuthenticated = true;
        showDashboard();
        hideLoginError();
      } else {
        showLoginError(`Access denied. Only ${ADMIN_EMAIL} can access admin dashboard.`);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      showLoginError('Google Sign-In failed. Please try again.');
    }
  }

  // Make the function globally accessible
  window.handleAdminGoogleSignIn = handleAdminGoogleSignIn;

  // Decode JWT token from Google
  function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

  // Check if user is already authenticated
  function checkAuthStatus() {
    const authToken = localStorage.getItem('adminAuthToken');
    if (authToken && authToken === ADMIN_EMAIL) {
      isAuthenticated = true;
      showDashboard();
    } else {
      showLogin();
    }
  }

  // Show login form
  function showLogin() {
    loginContainer.style.display = 'flex';
    dashboardContainer.style.display = 'none';
    isAuthenticated = false;
  }

  // Show dashboard
  function showDashboard() {
    loginContainer.style.display = 'none';
    dashboardContainer.style.display = 'block';
    isAuthenticated = true;
    fetchUserAnalytics(); // Load data when dashboard is shown
  }



  // Decode JWT token from Google
  function decodeJwtResponse(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT decode error:', error);
      throw new Error('Invalid token format');
    }
  }

  // Handle logout
  function handleLogout() {
    localStorage.removeItem('adminAuthToken');
    isAuthenticated = false;
    showLogin();
    hideLoginError();
  }

  // Show login error
  function showLoginError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
  }

  // Hide login error
  function hideLoginError() {
    loginError.style.display = 'none';
  }

  // Event listeners for authentication
  logoutBtn.addEventListener('click', handleLogout);
  
  // Email/Password form submission
  const adminEmailInput = document.getElementById('adminEmail');
  const adminPasswordInput = document.getElementById('adminPassword');
  
  // Handle email/password login
  function handleEmailPasswordLogin() {
    const email = adminEmailInput.value.trim();
    const password = adminPasswordInput.value.trim();
    
    if (!email || !password) {
      showLoginError('Please enter both email and password');
      return;
    }
    
    // Check if this is the admin email
    if (email === ADMIN_EMAIL) {
      // For now, accept any password for the admin email
      // In production, you'd verify against a secure password hash
      localStorage.setItem('adminAuthToken', email);
      localStorage.setItem('adminName', 'Admin User');
      localStorage.setItem('adminPicture', '');
      
      isAuthenticated = true;
      showDashboard();
      hideLoginError();
    } else {
      showLoginError(`Access denied. Only ${ADMIN_EMAIL} can access admin dashboard.`);
    }
  }
  
  // Add event listeners for email/password form
  if (adminEmailInput && adminPasswordInput) {
    // Handle Enter key on password field
    adminPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleEmailPasswordLogin();
      }
    });
    
    // Handle form submission
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', handleEmailPasswordLogin);
    }
  }

  // Utility functions
  const setError = (msg) => {
    if (!msg) { 
      errorEl.classList.add('hidden'); 
      errorEl.textContent = ''; 
      return; 
    }
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  };

  const setSuccess = (msg) => {
    if (!msg) { 
      successEl.classList.add('hidden'); 
      successEl.textContent = ''; 
      return; 
    }
    successEl.textContent = msg;
    setTimeout(() => setSuccess(''), 5000);
  };

  const showLoading = (show = true) => {
    loadingEl.classList.toggle('hidden', !show);
    if (show) {
      statsOverview.classList.add('hidden');
      tabNavigation.classList.add('hidden');
      controls.classList.add('hidden');
    }
  };

  // Format time to AM/PM format
  function formatTime(timeString) {
    if (!timeString) return 'Never';
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
    if (!dateString) return 'Unknown';
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

  // Get engagement level text
  function getEngagementText(score) {
    if (score >= 70) return 'High';
    if (score >= 30) return 'Medium';
    return 'Low';
  }

  // Filter data based on search and filters
  function filterData() {
    const searchTerm = userSearch.value.toLowerCase();
    const providerValue = providerFilter.value;
    const engagementValue = engagementFilter.value;

    filteredData = currentData.filter(user => {
      // Search filter
      const matchesSearch = !searchTerm || 
        user.first_name.toLowerCase().includes(searchTerm) ||
        user.last_name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm);

      // Provider filter
      const matchesProvider = !providerValue || user.provider === providerValue;

      // Engagement filter
      let matchesEngagement = true;
      if (engagementValue) {
        const score = user.engagement_score || 0;
        if (engagementValue === 'high') matchesEngagement = score >= 70;
        else if (engagementValue === 'medium') matchesEngagement = score >= 30 && score < 70;
        else if (engagementValue === 'low') matchesEngagement = score < 30;
      }

      return matchesSearch && matchesProvider && matchesEngagement;
    });

    renderCurrentTab();
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
    
    const newUsers = data.filter(user => {
      const created = new Date(user.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return created > sevenDaysAgo;
    }).length;
    
    const avgEngagement = totalUsers > 0 ? Math.round(data.reduce((sum, user) => sum + (user.engagement_score || 0), 0) / totalUsers) : 0;
    const totalActions = data.reduce((sum, user) => sum + (user.total_actions || 0), 0);
    const googleUsers = data.filter(user => user.provider === 'google').length;

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('activeUsers').textContent = activeUsers;
    document.getElementById('newUsers').textContent = newUsers;
    document.getElementById('avgEngagement').textContent = avgEngagement;
    document.getElementById('totalActions').textContent = totalActions;
    document.getElementById('googleUsers').textContent = googleUsers;
  }

  // Render users table
  function renderUsersTable(data) {
    const tbody = usersTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    if (data.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="10" style="text-align: center; padding: 2rem; color: #666;">No users found</td>';
      tbody.appendChild(tr);
      return;
    }
    
    data.forEach(user => {
      const tr = document.createElement('tr');
      
      const locationText = user.location?.city ? 
        `${user.location.city}, ${user.location.country || user.location.region || 'Unknown'}` : 
        'Unknown';
      
      // Create feature icons instead of text
      const featureIcons = createFeatureIcons(user.feature_usage || {});
      
      const cells = [
        formatDate(user.created_at),
        `${user.first_name} ${user.last_name}`,
        user.email,
        user.provider || 'email',
        locationText,
        `<span class="${getEngagementClass(user.engagement_score)}">${getEngagementText(user.engagement_score)} (${user.engagement_score || 0})</span>`,
        user.total_actions || 0,
        formatTime(user.last_activity),
        `<div class="feature-icons">${featureIcons}</div>`,
        `<div class="user-actions">
          <button class="btn btn-secondary btn-sm" onclick="exportUserData('${user.id}')">📊 Export</button>
        </div>`
      ];
      
      cells.forEach(c => { 
        const td = document.createElement('td'); 
        td.innerHTML = c; 
        tr.appendChild(td); 
      });
      
      tbody.appendChild(tr);
    });
  }

  // Create feature icons for better visualization
  function createFeatureIcons(featureUsage) {
    if (!featureUsage || Object.keys(featureUsage).length === 0) {
      return '<span class="no-features">No features used</span>';
    }

    const icons = {
      'ai_prompt_builder': '🤖',
      'properties_saved': '🏠',
      'page_view': '👁️',
      'property_saved': '💾',
      'module_switch': '🔄',
      'prompt_generated': '✨',
      'prompt_copied': '📋'
    };

    const featureElements = Object.entries(featureUsage).map(([feature, count]) => {
      const icon = icons[feature] || '⚡';
      const label = feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return `<span class="feature-icon" title="${label}: ${count}">
        ${icon} ${count}
      </span>`;
    });

    return featureElements.join('');
  }

  // Render activity table
  function renderActivityTable(data) {
    const tbody = activityTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // Collect all activities from all users
    const allActivities = [];
    data.forEach(user => {
      if (user.activities) {
        user.activities.forEach(activity => {
          allActivities.push({
            ...activity,
            user_name: `${user.first_name} ${user.last_name}`,
            user_email: user.email
          });
        });
      }
    });
    
    if (allActivities.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="5" style="text-align: center; padding: 2rem; color: #666;">No activity data found</td>';
      tbody.appendChild(tr);
      return;
    }
    
    // Sort by timestamp (most recent first)
    allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    allActivities.slice(0, 100).forEach(activity => { // Limit to 100 most recent
      const tr = document.createElement('tr');
      
      const cells = [
        activity.user_name,
        activity.action || 'Unknown',
        JSON.stringify(activity.details || {}),
        activity.location ? `${activity.location.city || 'Unknown'}, ${activity.location.country || 'Unknown'}` : 'Unknown',
        formatTime(activity.timestamp)
      ];
      
      cells.forEach(c => { 
        const td = document.createElement('td'); 
        td.textContent = c; 
        tr.appendChild(td); 
      });
      
      tbody.appendChild(tr);
    });
  }

  // Render features table
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
    
    if (Object.keys(featureStats).length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="5" style="text-align: center; padding: 2rem; color: #666;">No feature usage data found</td>';
      tbody.appendChild(tr);
      return;
    }
    
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
  }

  // Render bookings table
  function renderBookingsTable(data) {
    const tbody = bookingsTable.querySelector('tbody');
    tbody.innerHTML = '';
    
    // For now, we'll show users who have requested appointments
    // In the future, this could be connected to a real booking system
    const usersWithActivity = data.filter(user => user.total_actions > 0);
    
    if (usersWithActivity.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="5" style="text-align: center; padding: 2rem; color: #666;">No booking requests found</td>';
      tbody.appendChild(tr);
      return;
    }
    
    usersWithActivity.forEach(user => {
      const tr = document.createElement('tr');
      
      const cells = [
        `${user.first_name} ${user.last_name}`,
        user.email,
        formatDate(user.created_at),
        'Active User',
        `<div class="user-actions">
          <button class="btn btn-primary btn-sm" onclick="contactUser('${user.email}')">Contact</button>
          <button class="btn btn-success btn-sm" onclick="scheduleCall('${user.id}')">Schedule Call</button>
        </div>`
      ];
      
      cells.forEach(c => { 
        const td = document.createElement('td'); 
        td.innerHTML = c; 
        tr.appendChild(td); 
      });
      
      tbody.appendChild(tr);
    });
  }

  // Switch tabs
  function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    
    // Show selected tab content
    if (tabName === 'users') {
      document.getElementById('usersTab').classList.remove('hidden');
    } else if (tabName === 'activity') {
      document.getElementById('activityTab').classList.remove('hidden');
    } else if (tabName === 'features') {
      document.getElementById('featuresTab').classList.remove('hidden');
    } else if (tabName === 'bookings') {
      document.getElementById('bookingsTab').classList.remove('hidden');
    }
    
    renderCurrentTab();
  }

  // Render current tab
  function renderCurrentTab() {
    const dataToRender = filteredData.length > 0 ? filteredData : currentData;
    
    switch (currentTab) {
      case 'users':
        renderUsersTable(dataToRender);
        break;
      case 'activity':
        renderActivityTable(dataToRender);
        break;
      case 'features':
        renderFeaturesTable(dataToRender);
        break;
      case 'bookings':
        renderBookingsTable(dataToRender);
        break;
    }
  }

  // Main render function
  function render(data) {
    currentData = data;
    filteredData = data;
    
    renderStats(data);
    renderCurrentTab();
    
    // Show stats and tabs
    statsOverview.classList.remove('hidden');
    tabNavigation.classList.remove('hidden');
    controls.classList.remove('hidden');
    
    // Update last updated time
    lastUpdatedEl.textContent = new Date().toLocaleString();
    
    setSuccess(`Successfully loaded ${data.length} users`);
  }

  // Fetch user analytics from database
  async function fetchUserAnalytics() {
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot fetch data');
      return;
    }

    try {
      showLoading(true);
      setError('');
      
      console.log('Admin dashboard: Starting to fetch user analytics from database...');
      
      const response = await fetch('/.netlify/functions/get-user-analytics');
      
      console.log('Admin dashboard: Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Admin dashboard: Data received:', { 
        type: typeof data, 
        isArray: Array.isArray(data), 
        length: Array.isArray(data) ? data.length : 'not an array' 
      });
      
      if (!Array.isArray(data)) {
        throw new Error(`Invalid data format received: expected array, got ${typeof data}`);
      }
      
      console.log(`Admin dashboard: Successfully fetched ${data.length} users from database`);
      
      if (data.length === 0) {
        setError('No users found. Users will appear here after they sign up and use the AI Prompt Builder.');
      }
      
      render(data || []);
      
    } catch (error) {
      console.error('Admin dashboard: Error fetching user analytics:', error);
      setError(`Failed to load user data: ${error.message}`);
      
      // Show empty state
      render([]);
    } finally {
      showLoading(false);
    }
  }

  // Export CSV function
  function toCSV(rows) {
    const esc = (v) => '"' + String(v ?? '').replace(/"/g,'""') + '"';
    
    let headers, lines;
    
    if (currentTab === 'users') {
      headers = ['Created','Name','Email','Provider','Location','Engagement','Actions','Last Activity','Features Used'];
      lines = [headers.join(',')];
      rows.forEach(r => {
        const locationText = r.location?.city ? 
          `${r.location.city}, ${r.location.country || r.location.region || 'Unknown'}` : 
          'Unknown';
        
        // Format feature usage for CSV
        const featureUsageText = Object.entries(r.feature_usage || {})
          .map(([feature, count]) => `${feature.replace(/_/g, ' ')}: ${count}`)
          .join('; ') || 'None';
        
        const values = [
          formatDate(r.created_at),
          `${r.first_name} ${r.last_name}`,
          r.email,
          r.provider || 'email',
          locationText,
          getEngagementText(r.engagement_score || 0),
          r.total_actions || 0,
          formatTime(r.last_activity),
          featureUsageText
        ];
        lines.push(values.map(v => esc(v)).join(','));
      });
    } else if (currentTab === 'activity') {
      headers = ['User','Action','Details','Location','Timestamp'];
      lines = [headers.join(',')];
      // Activity CSV logic would go here
    } else if (currentTab === 'features') {
      headers = ['Feature','Total Usage','Unique Users','Avg Usage/User','Most Active User'];
      lines = [headers.join(',')];
      // Features CSV logic would go here
    } else if (currentTab === 'bookings') {
      headers = ['User','Email','Request Date','Status'];
      lines = [headers.join(',')];
      // Bookings CSV logic would go here
    }
    
    return lines.join('\n');
  }

  async function exportCSV() {
    try {
      const dataToExport = filteredData.length > 0 ? filteredData : currentData;
      const csv = toCSV(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; 
      a.download = `admin-${currentTab}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); 
      a.click(); 
      a.remove();
      URL.revokeObjectURL(url);
      
      setSuccess('CSV exported successfully!');
    } catch (error) {
      setError('Failed to export CSV: ' + error.message);
    }
  }

  // Add test users for testing purposes
  function addTestUsers() {
    try {
      const testUsers = [
        {
          id: 'test-user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          provider: 'email'
        },
        {
          id: 'test-user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@gmail.com',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          provider: 'google'
        }
      ];

      // Add test users to localStorage
      localStorage.setItem('users', JSON.stringify(testUsers));
      
      // Add some test properties for John
      const johnProperties = [
        {
          Property_Address: '123 Main St, San Diego, CA',
          Neighborhood: 'North Park',
          Property_Type: 'Single-Family Home',
          module: 'listing',
          savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          Property_Address: '456 Oak Ave, San Diego, CA',
          Neighborhood: 'La Jolla',
          Property_Type: 'Condo',
          module: 'investment',
          savedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      localStorage.setItem('savedProperties_test-user-1', JSON.stringify(johnProperties));
      
      // Add some test properties for Jane
      const janeProperties = [
        {
          Property_Address: '789 Pine St, San Diego, CA',
          Neighborhood: 'Gaslamp',
          Property_Type: 'Townhouse',
          module: 'listing',
          savedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      localStorage.setItem('savedProperties_test-user-2', JSON.stringify(janeProperties));
      
      setSuccess('Test users added successfully! Refresh to see them.');
      
      // Refresh the data
      setTimeout(() => {
        fetchUserAnalytics();
      }, 1000);
      
    } catch (error) {
      setError('Failed to add test users: ' + error.message);
    }
  }

  // Event listeners
  refreshBtn.addEventListener('click', fetchUserAnalytics);
  exportBtn.addEventListener('click', exportCSV);
  
  // Add test users button
  const addTestUsersBtn = document.getElementById('addTestUsersBtn');
  if (addTestUsersBtn) {
    addTestUsersBtn.addEventListener('click', addTestUsers);
  }
  
  // Search and filter event listeners
  userSearch.addEventListener('input', filterData);
  providerFilter.addEventListener('change', filterData);
  engagementFilter.addEventListener('change', filterData);
  
  // Tab switching
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
      switchTab(e.target.dataset.tab);
    }
  });

  // Global functions for user actions
  window.exportUserData = function(userId) {
    const user = currentData.find(u => u.id === userId);
    if (user) {
      const userData = JSON.stringify(user, null, 2);
      const blob = new Blob([userData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-${user.email}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      setSuccess(`User data exported for ${user.first_name} ${user.last_name}`);
    }
  };

  window.contactUser = function(email) {
    alert(`Contact user at: ${email}\n\nThis would open your email client or CRM system.`);
  };

  window.scheduleCall = function(userId) {
    const user = currentData.find(u => u.id === userId);
    if (user) {
      alert(`Schedule call with: ${user.first_name} ${user.last_name}\nEmail: ${user.email}\n\nThis would open your calendar booking system.`);
    }
  };

  // Initialize authentication check
  checkAuthStatus();
});