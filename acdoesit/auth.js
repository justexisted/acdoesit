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
    // Google Sign-In will be initialized when the page loads
    // The callback functions are defined below
  }

  async handleSignUp(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      firstName: formData.get('firstName') || document.getElementById('signUpFirstName').value,
      lastName: formData.get('lastName') || document.getElementById('signUpLastName').value,
      email: formData.get('email') || document.getElementById('signUpEmail').value,
      password: formData.get('password') || document.getElementById('signUpPassword').value
    };

    try {
      // Here you would typically send this to your backend
      // For now, we'll simulate a successful signup
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
    const formData = new FormData(e.target);
    const credentials = {
      email: formData.get('email') || document.getElementById('signInEmail').value,
      password: formData.get('password') || document.getElementById('signInPassword').value
    };

    try {
      // Here you would typically send this to your backend
      // For now, we'll simulate a successful signin
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

    localStorage.setItem('users', JSON.stringify([
      ...(JSON.parse(localStorage.getItem('users') || '[]'), user)
    ]));
  }

  async simulateSignIn(credentials) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('User not found. Please sign up first.');
    }

    // In a real app, you'd verify the password hash
    if (credentials.password !== 'password123') { // Demo password
      throw new Error('Invalid password');
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
