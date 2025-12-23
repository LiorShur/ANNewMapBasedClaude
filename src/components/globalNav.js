/**
 * Global Bottom Navigation Component
 * 3-Tab Structure: Home | Map | Profile
 * 
 * Features:
 * - Simple 3-tab navigation
 * - Auth-aware profile (green when signed in, shows name)
 * - Fullscreen toggle support
 * 
 * @file src/components/globalNav.js
 * @version 4.0
 */

// SVG Icons (26x26)
const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>`,
  profile: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
};

export class GlobalNav {
  constructor(options = {}) {
    this.navElement = null;
    this.currentPage = options.currentPage || this.detectCurrentPage();
    this.isHidden = false;
    
    // Auth state
    this.isSignedIn = false;
    this.userName = null;
  }

  /**
   * Detect current page from URL
   */
  detectCurrentPage() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('map')) return 'map';
    if (path.includes('profile')) return 'profile';
    return 'home';
  }

  /**
   * Initialize and mount the navigation
   */
  init() {
    // Add body class for proper page offset
    document.body.classList.add('has-bottom-nav');
    
    // Add page-specific class for map page
    if (this.currentPage === 'map') {
      document.body.classList.add('map-page');
    }
    
    // Create and mount nav
    this.render();
    
    // Listen for fullscreen toggle events
    window.addEventListener('fullscreenToggle', (e) => {
      if (e.detail?.fullscreen) {
        this.hide();
      } else {
        this.show();
      }
    });
    
    console.log('[GlobalNav] Initialized on page:', this.currentPage);
  }

  /**
   * Render the navigation bar
   */
  render() {
    const nav = document.createElement('nav');
    nav.className = 'global-bottom-nav';
    nav.id = 'globalBottomNav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    nav.innerHTML = `
      <!-- Home -->
      <a href="index.html" class="global-nav-item ${this.currentPage === 'home' ? 'active' : ''}" data-page="home" aria-label="Home">
        <span class="nav-icon">${ICONS.home}</span>
        <span class="nav-label">Home</span>
      </a>

      <!-- Map -->
      <a href="map.html" class="global-nav-item ${this.currentPage === 'map' ? 'active' : ''}" data-page="map" aria-label="Map">
        <span class="nav-icon">${ICONS.map}</span>
        <span class="nav-label">Map</span>
      </a>

      <!-- Profile -->
      <button class="global-nav-item ${this.currentPage === 'profile' ? 'active' : ''}" data-page="profile" aria-label="Profile" id="globalNavProfile">
        <span class="nav-icon">${ICONS.profile}</span>
        <span class="nav-label" id="profileLabel">Profile</span>
      </button>
    `;

    this.navElement = nav;
    document.body.appendChild(nav);

    // Bind profile click
    this.bindProfileClick();
    
    // Check auth state
    this.checkAuthState();
  }

  /**
   * Bind profile button click handler
   */
  bindProfileClick() {
    const profileBtn = document.getElementById('globalNavProfile');
    if (!profileBtn) return;

    profileBtn.addEventListener('click', () => {
      if (this.isSignedIn) {
        window.location.href = 'profile.html';
      } else {
        this.openAuthModal();
      }
    });
  }

  /**
   * Check and update auth state
   */
  checkAuthState() {
    const profileItem = document.getElementById('globalNavProfile');
    const profileLabel = document.getElementById('profileLabel');
    if (!profileItem || !profileLabel) return;

    const updateAuthUI = () => {
      const firebaseUser = window.auth?.currentUser;
      const authIndicator = document.querySelector('.auth-status.signed-in');
      const localToken = localStorage.getItem('accessNature_authToken');
      
      this.isSignedIn = !!(firebaseUser || authIndicator || localToken);
      
      if (this.isSignedIn) {
        this.userName = firebaseUser?.displayName || 
                       firebaseUser?.email?.split('@')[0] ||
                       localStorage.getItem('accessNature_userName') ||
                       'You';
        
        const displayName = this.userName.length > 8 
          ? this.userName.substring(0, 8) + '…' 
          : this.userName;
        
        profileItem.classList.add('signed-in');
        profileLabel.textContent = displayName;
      } else {
        profileItem.classList.remove('signed-in');
        profileLabel.textContent = 'Sign In';
      }
    };

    updateAuthUI();
    window.addEventListener('authStateChanged', updateAuthUI);
    
    if (window.auth?.onAuthStateChanged) {
      window.auth.onAuthStateChanged(updateAuthUI);
    }
    
    let checks = 0;
    const interval = setInterval(() => {
      updateAuthUI();
      checks++;
      if (checks > 10) clearInterval(interval);
    }, 500);
  }

  /**
   * Open the auth modal
   */
  openAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.classList.remove('hidden');
      authModal.style.display = 'flex';
      return;
    }
    
    if (window.openAuthModal) {
      window.openAuthModal();
      return;
    }
    
    window.location.href = 'index.html?signin=true';
  }

  show() {
    if (this.navElement) {
      this.navElement.classList.remove('hidden');
      this.isHidden = false;
    }
  }

  hide() {
    if (this.navElement) {
      this.navElement.classList.add('hidden');
      this.isHidden = true;
    }
  }

  toggle() {
    if (this.isHidden) {
      this.show();
    } else {
      this.hide();
    }
  }

  destroy() {
    this.navElement?.remove();
    document.body.classList.remove('has-bottom-nav');
    document.body.classList.remove('map-page');
  }
}

// Singleton instance
let globalNavInstance = null;

export function initGlobalNav(options = {}) {
  if (!globalNavInstance) {
    globalNavInstance = new GlobalNav(options);
    globalNavInstance.init();
    window.globalNav = globalNavInstance;
  }
  return globalNavInstance;
}

export function getGlobalNav() {
  return globalNavInstance;
}

export default GlobalNav;
