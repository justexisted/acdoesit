// Authentication System
class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.savedAddresses = [];
    this.savedNeighborhoods = [];
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
    console.log('Setting up Google Auth...');
    
    // Function to check and initialize Google Auth
    const checkAndInitGoogleAuth = () => {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        console.log('Google API loaded, initializing...');
        this.initializeGoogleAuth();
        return true;
      }
      return false;
    };

    // Try to initialize immediately
    if (checkAndInitGoogleAuth()) {
      return;
    }

    // If not ready, wait for load event
    window.addEventListener('load', () => {
      if (checkAndInitGoogleAuth()) {
        return;
      }
      
      // If still not ready, try with intervals
      const interval = setInterval(() => {
        if (checkAndInitGoogleAuth()) {
          clearInterval(interval);
        }
      }, 500);
      
      // Stop trying after 10 seconds
      setTimeout(() => {
        clearInterval(interval);
        console.log('Google API failed to load after 10 seconds');
      }, 10000);
    });
  }

  initializeGoogleAuth() {
    try {
      console.log('Initializing Google Auth...');
      
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
        console.log('Sign in Google button rendered');
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
        console.log('Sign up Google button rendered');
      }
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
      this.showGoogleAuthError();
    }
  }

  showGoogleAuthError() {
    // Show a message that Google auth failed to load
    const signInGoogleBtn = document.getElementById('g_id_signin');
    const signUpGoogleBtn = document.getElementById('g_id_signin_signup');
    
    if (signInGoogleBtn) {
      signInGoogleBtn.innerHTML = '<button class="auth-btn auth-btn-signin" disabled>Google Sign-In Unavailable</button>';
    }
    
    if (signUpGoogleBtn) {
      signUpGoogleBtn.innerHTML = '<button class="auth-btn auth-btn-signin" disabled>Google Sign-Up Unavailable</button>';
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
        throw new Error('Password must be at least 6 characters long');
      }

      const userData = { firstName, lastName, email, password };

      // Create user account
      const user = await this.simulateSignUp(userData);
      
      // Sign in the user
      this.signIn(user);
      
      // Show success message
      this.showMessage('Account created successfully! You now have access to the AI Prompt Builder.', 'success');
      
      // Close modal after successful authentication
      this.closeAllModals();
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
      
      // Sign in the user
      this.signIn(user);
      
      // Show success message
      this.showMessage('Signed in successfully!', 'success');
      
      // Close modal after successful authentication
      this.closeAllModals();
    } catch (error) {
      this.showMessage(error.message, 'error');
    }
  }

  async simulateSignUp(userData) {
    // Validate data
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
      throw new Error('All fields are required');
    }

    // Create user object
    const user = {
      id: Date.now().toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password, // Store password for future sign-ins
      createdAt: new Date().toISOString(),
      provider: 'email'
    };

    // Save user to database first
    const savedToDb = await this.saveUserToDatabase(user);
    if (!savedToDb) {
      throw new Error('Failed to create account. Please try again.');
    }

    // Also save to localStorage for consistency
    const existingUsers = localStorage.getItem('users');
    const users = existingUsers ? JSON.parse(existingUsers) : [];
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    
    return user;
  }

  async simulateSignIn(credentials) {
    // Check if user exists in localStorage first (for quick lookup)
    const existingUsers = localStorage.getItem('users');
    let user = null;
    
    if (existingUsers) {
      const users = JSON.parse(existingUsers);
      user = users.find(u => u.email === credentials.email);
    }
    
    if (!user) {
      throw new Error('User not found. Please sign up first.');
    }

    // Password validation
    if (!credentials.password || credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // Check if password matches
    if (user.password !== credentials.password) {
      throw new Error('Invalid password. Please try again.');
    }

    // Verify user exists in database and get latest data
    const dbUser = await this.verifyUserInDatabase(user.email);
    if (dbUser) {
      // Use database user data (more up-to-date)
      this.signIn(dbUser);
    } else {
      // Fall back to localStorage user
      this.signIn(user);
    }
  }

  async signIn(user) {
    this.currentUser = user;
    this.isAuthenticated = true;
    
    // Store session
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Save user to database
    await this.saveUserToDatabase(user);
    
    // Load saved addresses and neighborhoods
    await this.loadSavedData();
    
    // Update UI
    this.updateAuthUI();
    
    // Verify authentication was successful
    if (this.isAuthenticated && this.currentUser) {
      console.log('User successfully authenticated:', this.currentUser.firstName);
      
      // Trigger custom event
      window.dispatchEvent(new CustomEvent('userSignedIn', { detail: user }));
    } else {
      console.error('Authentication failed - user not properly set');
    }
  }

  async saveUserToDatabase(user) {
    try {
      console.log('Attempting to save user to database:', {
        id: user.id,
        email: user.email,
        provider: user.provider || 'email'
      });

      const response = await fetch('/.netlify/functions/save-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData: user })
      });

      if (response.ok) {
        console.log('User saved to database successfully');
        return true;
      } else {
        const errorText = await response.text();
        console.log('Failed to save user to database:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.log('Error saving user to database:', error);
      return false;
    }
  }

  async verifyUserInDatabase(email) {
    try {
      const response = await fetch('/.netlify/functions/get-user-by-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      });

      if (response.ok) {
        const userData = await response.json();
        return userData.user || null;
      } else {
        console.log('User not found in database:', response.status);
        return null;
      }
    } catch (error) {
      console.log('Error verifying user in database:', error);
      return null;
    }
  }

  async loadSavedData() {
    if (!this.currentUser || !this.currentUser.id) return;

    try {
      const response = await fetch('/.netlify/functions/manage-saved-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'get', 
          userId: this.currentUser.id 
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.savedAddresses = data.addresses || [];
        this.savedNeighborhoods = data.neighborhoods || [];
        console.log('Loaded saved data:', { addresses: this.savedAddresses, neighborhoods: this.savedNeighborhoods });
      } else {
        console.log('Failed to load saved data:', response.statusText);
      }
    } catch (error) {
      console.log('Error loading saved data:', error);
    }
  }

  async saveAddress(address, label = '') {
    if (!this.currentUser || !this.currentUser.id) return false;

    try {
      const response = await fetch('/.netlify/functions/manage-saved-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'save', 
          userId: this.currentUser.id,
          data: {
            type: 'address',
            value: address,
            label: label || address
          }
        })
      });

      if (response.ok) {
        await this.loadSavedData(); // Reload saved data
        return true;
      } else {
        console.log('Failed to save address:', response.statusText);
        return false;
      }
    } catch (error) {
      console.log('Error saving address:', error);
      return false;
    }
  }

  async saveNeighborhood(neighborhood, label = '') {
    if (!this.currentUser || !this.currentUser.id) return false;

    try {
      const response = await fetch('/.netlify/functions/manage-saved-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'save', 
          userId: this.currentUser.id,
          data: {
            type: 'neighborhood',
            value: neighborhood,
            label: label || neighborhood
          }
        })
      });

      if (response.ok) {
        await this.loadSavedData(); // Reload saved data
        return true;
      } else {
        console.log('Failed to save neighborhood:', response.statusText);
        return false;
      }
    } catch (error) {
      console.log('Error saving neighborhood:', error);
      return false;
    }
  }

  getSavedAddresses() {
    return this.savedAddresses;
  }

  getSavedNeighborhoods() {
    return this.savedNeighborhoods;
  }

  signOut() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.savedAddresses = [];
    this.savedNeighborhoods = [];
    
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
        // Load saved data for existing session
        this.loadSavedData();
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
    console.log(`Closing ${modals.length} modals`);
    
    modals.forEach(modal => {
      // Multiple ways to hide the modal
      modal.style.display = 'none';
      modal.style.visibility = 'hidden';
      modal.setAttribute('aria-hidden', 'true');
      
      // Remove any active classes
      modal.classList.remove('active', 'show');
      
      console.log('Modal closed:', modal.id);
    });
    
    // Also clear any form data
    this.clearFormData();
    
    // Remove any body scroll locks
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  clearFormData() {
    // Clear sign up form
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
      signUpForm.reset();
    }
    
    // Clear sign in form
    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
      signInForm.reset();
    }
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

      console.log('Google user data:', user);

      // Save user to localStorage users array
      const existingUsers = localStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      // Check if user already exists
      const existingUserIndex = users.findIndex(u => u.email === user.email);
      if (existingUserIndex >= 0) {
        // Update existing user
        users[existingUserIndex] = { ...users[existingUserIndex], ...user };
      } else {
        // Add new user
        users.push(user);
      }
      
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Google user saved to localStorage users array');

      // Sign in the user
      authSystem.signIn(user);
      authSystem.showMessage('Signed in with Google successfully!', 'success');
      
      // Close all modals after Google sign in
      authSystem.closeAllModals();
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
  const modal = document.getElementById('signInModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
    
    // Reinitialize Google auth for the sign in modal
    setTimeout(() => {
      if (authSystem && typeof google !== 'undefined' && google.accounts) {
        authSystem.initializeGoogleAuth();
      }
    }, 100);
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

function openSignUpModal() {
  const modal = document.getElementById('signUpModal');
  if (modal) {
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
    
    // Reinitialize Google auth for the sign up modal
    setTimeout(() => {
      if (authSystem && typeof google !== 'undefined' && google.accounts) {
        authSystem.initializeGoogleAuth();
      }
    }, 100);
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
  authSystem.signOut();
  authSystem.showMessage('Signed out successfully!', 'success');
}

// Initialize authentication system when DOM is loaded
let authSystem;
document.addEventListener('DOMContentLoaded', () => {
  authSystem = new AuthSystem();
});
