// Authentication System
class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    this.checkAuthStatus();
    this.setupEventListeners();
    this.setupGoogleAuth();
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
    // Wait for Google Sign-In API to load
    if (typeof google !== 'undefined' && google.accounts) {
      this.initializeGoogleAuth();
    } else {
      // If Google API hasn't loaded yet, wait for it
      window.addEventListener('load', () => {
        if (typeof google !== 'undefined' && google.accounts) {
          this.initializeGoogleAuth();
        }
      });
    }
  }

  initializeGoogleAuth() {
    try {
      // Initialize Google Sign-In for sign in modal
      if (document.getElementById('g_id_onload')) {
        google.accounts.id.initialize({
          client_id: '6812355521-ruaqh0ccemnpnu325ihblctbvnjj0ijf.apps.googleusercontent.com',
          callback: handleGoogleSignIn
        });
        google.accounts.id.renderButton(
          document.getElementById('g_id_signin'),
          { theme: 'outline', size: 'large', text: 'sign_in_with' }
        );
      }

      // Initialize Google Sign-In for sign up modal
      if (document.getElementById('g_id_onload_signup')) {
        google.accounts.id.initialize({
          client_id: '6812355521-ruaqh0ccemnpnu325ihblctbvnjj0ijf.apps.googleusercontent.com',
          callback: handleGoogleSignUp
        });
        google.accounts.id.renderButton(
          document.getElementById('g_id_signin_signup'),
          { theme: 'outline', size: 'large', text: 'signup_with' }
        );
      }
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
    }
  }

  async handleSignUp(e) {
    e.preventDefault();
    
    try {
      // Get form data directly from the form elements
      const firstName = document.getElementById('signUpFirstName').value.trim();
      const lastName = document.getElementById('signUpLastName').value.trim();
      const email = document.getElementById('signUpEmail').value.trim();
      const password = document.getElementById('signUpPassword').value;

      // Validate data
      if (!firstName || !lastName || !email || !password) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const userData = { firstName, lastName, email, password };

      // Simulate successful signup
      await this.simulateSignUp(userData);
      this.showMessage('Account created successfully!', 'success');
      this.closeAllModals();
      this.signIn(userData);
    } catch (error) {
      this.showMessage(error.message, 'error');
    }
  }

  async handleSignIn(e) {
    e.preventDefault();
    
    try {
      // Get form data directly from the form elements
      const email = document.getElementById('signInEmail').value.trim();
      const password = document.getElementById('signInPassword').value;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const credentials = { email, password };

      // Simulate successful signin
      await this.simulateSignIn(credentials);
      this.showMessage('Signed in successfully!', 'success');
      this.closeAllModals();
    } catch (error) {
      this.showMessage(error.message, 'error');
    }
  }

  async simulateSignUp(userData) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate data
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
      throw new Error('All fields are required');
    }
    
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Store user data in localStorage (in a real app, this would be in a database)
    const user = {
      id: Date.now().toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      createdAt: new Date().toISOString()
    };

    // Get existing users or create empty array
    const existingUsers = localStorage.getItem('users');
    const users = existingUsers ? JSON.parse(existingUsers) : [];
    
    // Add new user
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  }

  async simulateSignIn(credentials) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists
    const existingUsers = localStorage.getItem('users');
    if (!existingUsers) {
      throw new Error('User not found. Please sign up first.');
    }

    const users = JSON.parse(existingUsers);
    const user = users.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('User not found. Please sign up first.');
    }

    // In a real app, you'd verify the password hash
    // For demo purposes, we'll use a simple check
    if (credentials.password !== 'password123') { // Demo password
      throw new Error('Invalid password. Use "password123" for demo.');
    }

    this.signIn(user);
  }

  signIn(user) {
    this.currentUser = user;
    this.isAuthenticated = true;
    
    // Store session
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Update UI
    this.updateAuthUI();
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('userSignedIn', { detail: user }));
  }

  signOut() {
    this.currentUser = null;
    this.isAuthenticated = false;
    
    // Clear session
    localStorage.removeItem('currentUser');
    
    // Update UI
    this.updateAuthUI();
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('userSignedOut'));
  }

  checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.isAuthenticated = true;
        this.updateAuthUI();
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userStatus = document.getElementById('user-status');
    const userFirstName = document.getElementById('user-first-name');

    if (this.isAuthenticated && this.currentUser) {
      if (authButtons) authButtons.style.display = 'none';
      if (userStatus) userStatus.style.display = 'flex';
      if (userFirstName) userFirstName.textContent = this.currentUser.firstName;
    } else {
      if (authButtons) authButtons.style.display = 'flex';
      if (userStatus) userStatus.style.display = 'none';
    }
  }

  showMessage(message, type = 'info') {
    // Create and show a temporary message
    const messageEl = document.createElement('div');
    messageEl.className = `auth-message auth-message-${type}`;
    messageEl.textContent = message;
    
    // Add styles
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

    // Add animation styles
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
    
    // Remove after 3 seconds
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
    });
  }
}

// Google Authentication Handlers
function handleGoogleSignIn(response) {
  // Handle Google Sign-In response
  if (response.credential) {
    try {
      // Decode the JWT token to get user info
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

      // Sign in the user
      authSystem.signIn(user);
      authSystem.showMessage('Signed in with Google successfully!', 'success');
    } catch (error) {
      console.error('Error processing Google sign-in:', error);
      authSystem.showMessage('Error signing in with Google. Please try again.', 'error');
    }
  }
}

function handleGoogleSignUp(response) {
  // Handle Google Sign-Up response (same as sign-in for Google)
  handleGoogleSignIn(response);
}

// Modal Functions
function openSignInModal() {
  document.getElementById('signInModal').style.display = 'flex';
}

function closeSignInModal() {
  document.getElementById('signInModal').style.display = 'none';
}

function openSignUpModal() {
  document.getElementById('signUpModal').style.display = 'flex';
}

function closeSignUpModal() {
  document.getElementById('signUpModal').style.display = 'none';
}

function signOut() {
  authSystem.signOut();
  authSystem.showMessage('Signed out successfully!', 'success');
}

// Initialize authentication system when DOM is loaded
let authSystem;
document.addEventListener('DOMContentLoaded', () => {
  authSystem = new AuthSystem();
});
