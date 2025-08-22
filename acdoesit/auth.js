// Professional Authentication System
class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    this.checkAuthStatus();
    // Always update UI on initialization
    this.updateAuthUI();
    // Only setup event listeners and Google auth if we're on the main page
    if (document.getElementById('signUpForm') || document.getElementById('signInForm')) {
      this.setupEventListeners();
      this.setupGoogleAuth();
    }
  }

  setupEventListeners() {
    // Sign up form
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
      signUpForm.addEventListener('submit', (e) => this.handleSignUp(e));
    }

    // Sign in form
    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
      signInForm.addEventListener('submit', (e) => this.handleSignIn(e));
    }

    // Set password form (for Google users without password)
    const setPasswordForm = document.getElementById('setPasswordForm');
    if (setPasswordForm) {
      setPasswordForm.addEventListener('submit', (e) => this.handleSetPassword(e));
    }

    // Password reset form
    const passwordResetForm = document.getElementById('passwordResetForm');
    if (passwordResetForm) {
      passwordResetForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
    }

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('auth-modal')) {
        this.closeAllModals();
      }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  setupGoogleAuth() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      this.initializeGoogleAuth();
    } else {
      window.addEventListener('load', () => {
        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
          this.initializeGoogleAuth();
        }
      });
    }
  }

  initializeGoogleAuth() {
    try {
      // Initialize Google Sign-In for sign in modal
      if (document.getElementById('g_id_signin')) {
        google.accounts.id.initialize({
          client_id: '6812355521-ruaqh0ccemnpnu325ihblctbvnjj0ijf.apps.googleusercontent.com',
          callback: handleGoogleSignIn
        });
        
        google.accounts.id.renderButton(
          document.getElementById('g_id_signin'),
          { 
            theme: 'outline', 
            size: 'large', 
            text: 'sign_in_with',
            width: 300,
            type: 'standard'
          }
        );
      }

      // Initialize Google Sign-In for sign up modal
      if (document.getElementById('g_id_signin_signup')) {
        google.accounts.id.initialize({
          client_id: '6812355521-ruaqh0ccemnpnu325ihblctbvnjj0ijf.apps.googleusercontent.com',
          callback: handleGoogleSignUp
        });
        
        google.accounts.id.renderButton(
          document.getElementById('g_id_signin_signup'),
          { 
            theme: 'outline', 
            size: 'large', 
            text: 'signup_with',
            width: 300,
            type: 'standard'
          }
        );
      }
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
    }
  }

  async handleSignUp(e) {
    e.preventDefault();
    
    try {
      const firstName = document.getElementById('signUpFirstName').value.trim();
      const lastName = document.getElementById('signUpLastName').value.trim();
      const email = document.getElementById('signUpEmail').value.trim();
      const password = document.getElementById('signUpPassword').value;

      if (!firstName || !lastName || !email || !password) {
        throw new Error('All fields are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check if user already exists
      const existingUser = await this.checkUserExists(email);
      if (existingUser) {
        // Show password reset option instead
        this.showPasswordResetOption(email);
        return;
      }

      // Create new user
      const user = await this.createUser({ firstName, lastName, email, password });
      
      // Sign in the user
      await this.signIn(user);
      
      this.showMessage('Account created successfully!', 'success');
      this.closeAllModals();
      
    } catch (error) {
      this.showMessage(error.message, 'error');
    }
  }

  async handleSignIn(e) {
    e.preventDefault();
    
    try {
      const email = document.getElementById('signInEmail').value.trim();
      const password = document.getElementById('signInPassword').value;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Perform secure login (sets JWT cookie server-side)
      const resp = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!resp.ok) {
        let reason = 'invalid';
        try { const t = await resp.text(); const j = JSON.parse(t); reason = j.reason || reason; } catch {}
        if (reason === 'no_password') {
          const existing = await this.checkUserExists(email);
          if (existing) {
            this.currentUser = existing;
            this.isAuthenticated = true;
            this.updateAuthUI();
            this.showSetPasswordForm();
            return;
          }
        }
        throw new Error('Invalid email or password');
      }
      const data = await resp.json();
      const user = {
        id: data.user.id,
        email: data.user.email,
        firstName: this.currentUser?.firstName || '',
        lastName: this.currentUser?.lastName || '',
        provider: 'email'
      };

      // Sign in locally (updates last_login and UI)
      await this.signIn(user);
      
      this.showMessage('Signed in successfully!', 'success');
      this.closeAllModals();
      
    } catch (error) {
      this.showMessage(error.message, 'error');
    }
  }

  async handlePasswordReset(e) {
    e.preventDefault();
    
    try {
      const email = document.getElementById('resetEmail').value.trim();
      
      if (!email) {
        throw new Error('Email is required');
      }

      // Check if user exists
      const user = await this.checkUserExists(email);
      if (!user) {
        throw new Error('No account found with this email address');
      }

      // Send password reset email (implement this function)
      await this.sendPasswordResetEmail(email);
      
      this.showMessage('Password reset email sent! Check your inbox.', 'success');
      this.closeAllModals();
      
    } catch (error) {
      this.showMessage(error.message, 'error');
    }
  }

  async checkUserExists(email) {
    try {
      console.log('Checking if user exists:', email);
      const response = await fetch('/.netlify/functions/get-user-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      console.log('get-user-by-email response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('get-user-by-email response data:', data);
        if (data.user) {
          // Map database fields to frontend fields
          const mappedUser = {
            id: data.user.id,
            firstName: data.user.first_name || data.user.firstName,
            lastName: data.user.last_name || data.user.lastName,
            email: data.user.email,
            provider: data.user.provider,
            password: data.user.password,
            createdAt: data.user.created_at || data.user.createdAt,
            lastLogin: data.user.last_login || data.user.lastLogin
          };
          console.log('Mapped user data:', mappedUser);
          return mappedUser;
        }
      } else {
        console.log('get-user-by-email response not ok:', response.status);
      }
      return null;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return null;
    }
  }

  async createUser(userData) {
    try {
      const user = {
        id: Date.now().toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password, // In production, hash this
        createdAt: new Date().toISOString(),
        provider: 'email'
      };

      const response = await fetch('/.netlify/functions/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userData: user })
      });

      if (!response.ok) {
        let text = '';
        try { text = await response.text(); } catch (e) {}
        console.error('save-user failed:', response.status, text);
        throw new Error('Failed to create account');
      }

      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create account');
    }
  }

  async verifyCredentials(email, password) {
    try {
      console.log('Verifying credentials for email:', email);
      const user = await this.checkUserExists(email);
      console.log('User found for verification:', user);
      
      if (!user) {
        console.log('No user found for verification');
        return null;
      }

      // In production, verify password hash
      console.log('Comparing passwords - stored:', user.password, 'provided:', password);
      if (user.password === password) {
        console.log('Password verification successful');
        return user;
      }
      
      console.log('Password verification failed');
      return null;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      return null;
    }
  }

  showSetPasswordForm() {
    const form = document.getElementById('setPasswordForm');
    const modal = document.getElementById('signInModal');
    if (form && modal) {
      if (modal.style.display !== 'flex') {
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('active');
      }
      form.style.display = 'block';
    }
    this.showMessage('Set a password to enable email sign-in.', 'info');
  }

  async handleSetPassword(e) {
    e.preventDefault();
    try {
      const input = document.getElementById('setPassword');
      const newPassword = input && input.value ? input.value : '';
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      const userId = this.currentUser?.id || (typeof localStorage !== 'undefined' ? localStorage.getItem('sessionUserId') : null);
      if (!userId) throw new Error('No user session found');

      const resp = await fetch('/.netlify/functions/set-user-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword })
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || 'Failed to set password');
      }
      // Create/refresh session cookie
      try {
        await fetch('/.netlify/functions/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email: this.currentUser?.email || '' })
        });
      } catch (e) {}
      // Persist session id for cross-page continuity
      try { localStorage.setItem('sessionUserId', userId); } catch (e) {}
      // Also update last_login so other pages recognize the active session
      try {
        await fetch('/.netlify/functions/update-user-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, lastLogin: new Date().toISOString() })
        });
      } catch (e) {
        // Non-fatal
      }
      this.showMessage('Password set successfully. You can now sign in with email.', 'success');
      this.closeAllModals();
    } catch (err) {
      this.showMessage(err.message || 'Failed to set password', 'error');
    }
  }

  async sendPasswordResetEmail(email) {
    try {
      const resp = await fetch('/.netlify/functions/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || 'Failed to send reset email');
      }
      return true;
    } catch (e) {
      console.error('Password reset email error:', e);
      throw e;
    }
  }

  showPasswordResetOption(email) {
    // Hide sign up form, show password reset form
    const signUpForm = document.getElementById('signUpForm');
    const passwordResetForm = document.getElementById('passwordResetForm');
    const resetEmail = document.getElementById('resetEmail');
    
    if (signUpForm && passwordResetForm && resetEmail) {
      signUpForm.style.display = 'none';
      passwordResetForm.style.display = 'block';
      resetEmail.value = email;
      
      // Show message
      this.showMessage('An account with this email already exists. Use the form below to reset your password.', 'info');
    }
  }

  async signIn(user) {
    // Avoid keeping password in memory
    const sanitizedUser = { ...user };
    if (sanitizedUser.password) delete sanitizedUser.password;
    this.currentUser = sanitizedUser;
    this.isAuthenticated = true;
    
    // Store session in database (not just localStorage)
    const updated = await this.updateUserSession(sanitizedUser);
    // Create/refresh cookie-based session and persist identifiers locally regardless of update outcome
    try {
      await fetch('/.netlify/functions/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: sanitizedUser.id, email: sanitizedUser.email || '' })
      });
    } catch (e) {}
    try {
      localStorage.setItem('sessionUserId', sanitizedUser.id);
      if (sanitizedUser.email) localStorage.setItem('sessionEmail', sanitizedUser.email);
      localStorage.setItem('currentUser', JSON.stringify(sanitizedUser));
    } catch (e) {}
    
    // Update UI
    this.updateAuthUI();
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('userSignedIn', { detail: user }));
  }

  async updateUserSession(user) {
    try {
      // Update last login time in database
      const resp = await fetch('/.netlify/functions/update-user-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          lastLogin: new Date().toISOString()
        })
      });
      if (!resp.ok) {
        console.error('update-user-session failed with status:', resp.status);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error updating user session:', error);
      return false;
    }
  }

  async signOut() {
    // Use current user id or persisted session id for deterministic server clear
    const previousUserId = this.currentUser?.id || (typeof localStorage !== 'undefined' ? localStorage.getItem('sessionUserId') : null);
    // Clear server cookie-based session
    try {
      await fetch('/.netlify/functions/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: previousUserId })
      });
    } catch (e) {}
    // Attempt to clear server-side session first
    await this.clearUserSession(previousUserId);
    // Clear local persisted session id
    try { localStorage.removeItem('sessionUserId'); localStorage.removeItem('sessionEmail'); localStorage.removeItem('currentUser'); } catch (e) {}
    // Clear local auth state
    this.currentUser = null;
    this.isAuthenticated = false;
    // Update UI
    this.updateAuthUI();
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('userSignedOut'));
  }

  async clearUserSession(userId) {
    try {
      const idToClear = userId || (this.currentUser && this.currentUser.id);
      if (idToClear) {
        await fetch('/.netlify/functions/clear-user-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: idToClear })
        });
      }
    } catch (error) {
      console.error('Error clearing user session:', error);
    }
  }

  async handleGoogleUser(user) {
    try {
      // Check if user already exists
      const existingUser = await this.checkUserExists(user.email);
      
      if (existingUser) {
        // Update existing user with Google info
        await this.updateGoogleUser(existingUser.id, user);
        // Create cookie session
        await fetch('/.netlify/functions/create-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: existingUser.id, email: existingUser.email }) });
        // If password missing, prompt to set it after sign-in
        await this.signIn(existingUser);
        if (!existingUser.password) {
          this.showSetPasswordForm();
          return;
        }
      } else {
        // Create new Google user
        const newUser = await this.createGoogleUser(user);
        // Create session cookie and sign in
        await fetch('/.netlify/functions/create-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: newUser.id, email: newUser.email }) });
        await this.signIn(newUser);
        this.showSetPasswordForm();
        return;
      }
      
      this.showMessage('Signed in with Google successfully!', 'success');
      this.closeAllModals();
      
    } catch (error) {
      console.error('Error handling Google user:', error);
      this.showMessage('Error signing in with Google. Please try again.', 'error');
    }
  }

  async updateGoogleUser(userId, googleUser) {
    try {
      await fetch('/.netlify/functions/update-google-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, googleUser })
      });
    } catch (error) {
      console.error('Error updating Google user:', error);
    }
  }

  async createGoogleUser(googleUser) {
    try {
      const user = {
        id: googleUser.id,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        email: googleUser.email,
        picture: googleUser.picture,
        createdAt: googleUser.createdAt,
        provider: 'google'
      };

      const response = await fetch('/.netlify/functions/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userData: user })
      });

      if (!response.ok) {
        throw new Error('Failed to create Google account');
      }

      return user;
    } catch (error) {
      console.error('Error creating Google user:', error);
      throw new Error('Failed to create Google account');
    }
  }

  checkAuthStatus() {
    // Check if user has valid session in database
    this.checkDatabaseSession();
  }

  async checkDatabaseSession() {
    try {
      console.log('Checking database session...');
      // Send stored session user id if present to avoid ghost sign-ins
      let sessionUserId = null;
      let sessionEmail = null;
      try {
        sessionUserId = localStorage.getItem('sessionUserId');
        sessionEmail = localStorage.getItem('sessionEmail');
      } catch (e) {}
      const response = await fetch('/.netlify/functions/check-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: sessionUserId, email: sessionEmail })
      });

      console.log('check-session response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('check-session response data:', data);
              if (data.user) {
        console.log('User found in database session:', data.user);
        // Map database fields to frontend fields
        this.currentUser = {
          id: data.user.id,
          firstName: data.user.first_name || data.user.firstName,
          lastName: data.user.last_name || data.user.lastName,
          email: data.user.email,
          provider: data.user.provider,
          password: data.user.password,
          createdAt: data.user.created_at || data.user.createdAt,
          lastLogin: data.user.last_login || data.user.lastLogin
        };
        console.log('Mapped user data:', this.currentUser);
        this.isAuthenticated = true;
        this.updateAuthUI();
        try { localStorage.setItem('currentUser', JSON.stringify(this.currentUser)); } catch (e) {}
        // Notify other pages/components that a session has been restored
        window.dispatchEvent(new CustomEvent('userSignedIn', { detail: this.currentUser }));
      } else {
        console.log('No user found in database session');
      }
      } else {
        console.log('check-session response not ok:', response.status);
      }
    } catch (error) {
      console.error('Error checking database session:', error);
    }
  }

  updateAuthUI() {
    console.log('updateAuthUI called - isAuthenticated:', this.isAuthenticated, 'currentUser:', this.currentUser);
    
    const authButtons = document.getElementById('auth-buttons');
    const userStatus = document.getElementById('user-status');
    const userFirstName = document.getElementById('user-first-name');
    const aiPromptBuilderSection = document.getElementById('ai-prompt-builder-section');

    console.log('Found elements:', { authButtons: !!authButtons, userStatus: !!userStatus, userFirstName: !!userFirstName, aiPromptBuilderSection: !!aiPromptBuilderSection });

    if (this.isAuthenticated && this.currentUser) {
      console.log('User is authenticated, showing AI Prompt Builder button');
      if (authButtons) authButtons.style.display = 'none';
      if (userStatus) userStatus.style.display = 'flex';
      if (userFirstName) userFirstName.textContent = this.currentUser.firstName;
      if (aiPromptBuilderSection) aiPromptBuilderSection.style.display = 'block';
    } else {
      console.log('User is not authenticated, hiding AI Prompt Builder button');
      if (authButtons) authButtons.style.display = 'flex';
      if (userStatus) userStatus.style.display = 'none';
      if (aiPromptBuilderSection) aiPromptBuilderSection.style.display = 'none';
    }
  }

  showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `auth-message auth-message-${type}`;
    messageEl.textContent = message;
    
    messageEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 3000;
      animation: slideIn 0.3s ease;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    `;

    if (!document.getElementById('auth-message-styles')) {
      const style = document.createElement('style');
      style.id = 'auth-message-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 3000);
  }

  closeAllModals() {
    const modals = document.querySelectorAll('.auth-modal');
    modals.forEach(modal => {
      // Move focus out if it is inside the modal to avoid hiding a focused element
      if (modal.contains(document.activeElement)) {
        try { document.activeElement.blur(); } catch (e) {}
        if (typeof modal.setAttribute === 'function') {
          // Optional: mark modal inert while hidden; remove on show elsewhere if implemented
        }
      }
      modal.style.display = 'none';
      modal.style.visibility = 'hidden';
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('active', 'show');
    });
    
    this.clearFormData();
    document.body.style.overflow = '';
  }

  clearFormData() {
    const forms = ['signUpForm', 'signInForm', 'passwordResetForm'];
    forms.forEach(formId => {
      const form = document.getElementById(formId);
      if (form) form.reset();
    });
  }
}

// Google Authentication Handlers
function handleGoogleSignIn(response) {
  if (response.credential) {
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const user = {
        id: payload.sub,
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        picture: payload.picture,
        createdAt: new Date().toISOString(),
        provider: 'google'
      };

      // Check if user exists, create if not
      authSystem.handleGoogleUser(user);
      
    } catch (error) {
      console.error('Error processing Google sign-in:', error);
      authSystem.showMessage('Error signing in with Google. Please try again.', 'error');
    }
  }
}

function handleGoogleSignUp(response) {
  handleGoogleSignIn(response);
}

// Modal Functions
function openSignInModal() {
  if (authSystem && authSystem.isAuthenticated) {
    authSystem.showMessage('You are already signed in!', 'info');
    return;
  }
  
  const modal = document.getElementById('signInModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
  }
}

function openSignUpModal() {
  if (authSystem && authSystem.isAuthenticated) {
    authSystem.showMessage('You are already signed in!', 'info');
    return;
  }
  
  const modal = document.getElementById('signUpModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
  }
}

function closeSignInModal() {
  const modal = document.getElementById('signInModal');
  if (modal) {
    modal.style.display = 'none';
    modal.style.visibility = 'hidden';
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('active');
  }
}

function closeSignUpModal() {
  const modal = document.getElementById('signUpModal');
  if (modal) {
    modal.style.display = 'none';
    modal.style.visibility = 'hidden';
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('active');
  }
}

function signOut() {
  if (authSystem) {
    authSystem.signOut();
    authSystem.showMessage('Signed out successfully!', 'success');
  }
}

function showSignUpForm() {
  const signUpForm = document.getElementById('signUpForm');
  const passwordResetForm = document.getElementById('passwordResetForm');
  
  if (signUpForm && passwordResetForm) {
    signUpForm.style.display = 'block';
    passwordResetForm.style.display = 'none';
  }
}

// Initialize authentication system
let authSystem;
document.addEventListener('DOMContentLoaded', () => {
  authSystem = new AuthSystem();
});

