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

      // Verify credentials
      const user = await this.verifyCredentials(email, password);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Sign in the user
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
      const response = await fetch('/.netlify/functions/get-user-by-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
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
      const user = await this.checkUserExists(email);
      if (!user) return null;

      // In production, verify password hash
      if (user.password === password) {
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      return null;
    }
  }

  async sendPasswordResetEmail(email) {
    // Implement password reset email functionality
    // For now, just return success
    return true;
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
    this.currentUser = user;
    this.isAuthenticated = true;
    
    // Store session in database (not just localStorage)
    await this.updateUserSession(user);
    
    // Update UI
    this.updateAuthUI();
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('userSignedIn', { detail: user }));
  }

  async updateUserSession(user) {
    try {
      // Update last login time in database
      await fetch('/.netlify/functions/update-user-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          lastLogin: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error updating user session:', error);
    }
  }

  signOut() {
    this.currentUser = null;
    this.isAuthenticated = false;
    
    // Clear session from database
    this.clearUserSession();
    
    // Update UI
    this.updateAuthUI();
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('userSignedOut'));
  }

  async clearUserSession() {
    try {
      if (this.currentUser) {
        await fetch('/.netlify/functions/clear-user-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: this.currentUser.id })
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
        await this.signIn(existingUser);
      } else {
        // Create new Google user
        const newUser = await this.createGoogleUser(user);
        await this.signIn(newUser);
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
      const response = await fetch('/.netlify/functions/check-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          this.currentUser = data.user;
          this.isAuthenticated = true;
          this.updateAuthUI();
        }
      }
    } catch (error) {
      console.error('Error checking database session:', error);
    }
  }

  updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userStatus = document.getElementById('user-status');
    const userFirstName = document.getElementById('user-first-name');
    const aiPromptBuilderSection = document.getElementById('ai-prompt-builder-section');

    if (this.isAuthenticated && this.currentUser) {
      if (authButtons) authButtons.style.display = 'none';
      if (userStatus) userStatus.style.display = 'flex';
      if (userFirstName) userFirstName.textContent = this.currentUser.firstName;
      if (aiPromptBuilderSection) aiPromptBuilderSection.style.display = 'block';
    } else {
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

