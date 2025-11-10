/**
 * Theme utility functions for managing application theme
 */

/**
 * Initialize theme from localStorage or system preference
 */
export function initializeTheme() {
  // Get saved theme from localStorage
  const savedTheme = localStorage.getItem('theme');
  console.log("Saved theme:", savedTheme);
  
  // Apply the saved theme or use system preference as fallback
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (savedTheme === 'high-contrast') {
    document.documentElement.setAttribute('data-theme', 'high-contrast');
  } else if (savedTheme === 'deuteranopia-protanopia-friendly') {
    document.documentElement.setAttribute('data-theme', 'deuteranopia-protanopia-friendly');
  } else if (savedTheme === 'light') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    applySystemTheme();
  }

  // Add listener for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', handleSystemThemeChange);
}

/**
 * Apply system theme preference
 */
function applySystemTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

/**
 * Handle system theme change events
 * @param {MediaQueryListEvent} e - Media query change event
 */
function handleSystemThemeChange(e) {
  // Only update if user is using system theme (no theme in localStorage)
  if (!localStorage.getItem('theme')) {
    if (e.matches) {
      // System switched to dark mode
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      // System switched to light mode
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
}

/**
 * Set theme and save preference to localStorage
 * @param {string} theme - Theme name ('light', 'dark', 'high-contrast', 'colorblind-friendly', or 'system')
 */
export function setTheme(theme) {
  console.log("Setting theme to:", theme);
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  } 
  else if (theme === 'high-contrast') {
    document.documentElement.setAttribute('data-theme', 'high-contrast');
    localStorage.setItem('theme', 'high-contrast');
  } 
  else if (theme === 'deuteranopia-protanopia-friendly') {
    document.documentElement.setAttribute('data-theme', 'deuteranopia-protanopia-friendly');
    localStorage.setItem('theme', 'deuteranopia-protanopia-friendly');
  }
  else if (theme === 'light') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } 
  else if (theme === 'system') {
    // Remove the localStorage item first so handleSystemThemeChange will work
    localStorage.removeItem('theme');
    // Apply current system theme
    applySystemTheme();
  } 
  else {
    console.warn('Unknown theme:', theme);
  }
}