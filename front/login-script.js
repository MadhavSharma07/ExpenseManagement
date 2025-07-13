const API_BASE_URL = "http://localhost:5000/api" // Ensure this matches your backend URL

class LoginManager {
  constructor() {
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.setupTheme()
  }

  setupEventListeners() {
    // Form submission
    document.getElementById("loginForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleLogin()
    })

    // Password toggle
    document.getElementById("passwordToggle").addEventListener("click", () => {
      this.togglePassword()
    })

    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme()
    })

    // Social login buttons
    document.querySelector(".google-btn").addEventListener("click", () => {
      this.showToast("Info", "Google login integration coming soon!", "info")
    })

    document.querySelector(".microsoft-btn").addEventListener("click", () => {
      this.showToast("Info", "Microsoft login integration coming soon!", "info")
    })

    // Sign up link
    document.getElementById("signupLink").addEventListener("click", (e) => {
      // This link now points to signup.html directly
    })

    // Forgot password link
    document.querySelector(".forgot-password").addEventListener("click", (e) => {
      e.preventDefault()
      this.showToast("Info", "Password reset functionality coming soon!", "info")
    })

    // Enter key handling
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && document.activeElement.tagName !== "BUTTON") {
        document.getElementById("loginForm").dispatchEvent(new Event("submit"))
      }
    })
  }

  setupTheme() {
    const savedTheme = localStorage.getItem("theme") || "light"
    document.documentElement.setAttribute("data-theme", savedTheme)
    this.updateThemeIcon(savedTheme)
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"

    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
    this.updateThemeIcon(newTheme)

    this.showToast("Theme Changed", `Switched to ${newTheme} mode`, "info")
  }

  updateThemeIcon(theme) {
    const icon = document.querySelector("#themeToggle i")
    icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon"
  }

  togglePassword() {
    const passwordInput = document.getElementById("password")
    const toggleIcon = document.querySelector("#passwordToggle i")

    if (passwordInput.type === "password") {
      passwordInput.type = "text"
      toggleIcon.className = "fas fa-eye-slash"
    } else {
      passwordInput.type = "password"
      toggleIcon.className = "fas fa-eye"
    }
  }

  async handleLogin() {
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const rememberMe = document.getElementById("rememberMe").checked

    // Basic validation
    if (!this.validateEmail(email)) {
      this.showToast("Error", "Please enter a valid email address", "error")
      return
    }

    if (password.length < 6) {
      this.showToast("Error", "Password must be at least 6 characters long", "error")
      return
    }

    // Show loading state
    this.setLoadingState(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      localStorage.setItem("token", data.data.token)
      localStorage.setItem("refreshToken", data.data.refreshToken)
      localStorage.setItem("userEmail", data.data.user.email) // Store user email or other relevant info

      this.showToast("Success", "Login successful! Redirecting...", "success")

      // Redirect to dashboard after successful login
      setTimeout(() => {
        window.location.href = "index.html" // Redirect to your main dashboard
      }, 1500)
    } catch (error) {
      this.showToast("Error", error.message, "error")
    } finally {
      this.setLoadingState(false)
    }
  }

  setLoadingState(loading) {
    const loginBtn = document.querySelector(".login-btn")
    const btnText = document.querySelector(".btn-text")
    const btnLoader = document.querySelector(".btn-loader")

    if (loading) {
      loginBtn.disabled = true
      btnText.style.opacity = "0"
      btnLoader.style.display = "block"
    } else {
      loginBtn.disabled = false
      btnText.style.opacity = "1"
      btnLoader.style.display = "none"
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  showToast(title, message, type = "info") {
    const toastContainer = document.getElementById("toastContainer")
    const toast = document.createElement("div")
    toast.className = `toast ${type}`

    const iconMap = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    }

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="${iconMap[type]}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">
        <i class="fas fa-times"></i>
      </button>
    `

    // Add close functionality
    toast.querySelector(".toast-close").addEventListener("click", () => {
      this.removeToast(toast)
    })

    toastContainer.appendChild(toast)

    // Show toast
    setTimeout(() => toast.classList.add("show"), 100)

    // Auto remove after 5 seconds
    setTimeout(() => this.removeToast(toast), 5000)
  }

  removeToast(toast) {
    toast.classList.remove("show")
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }
}

// Initialize login manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new LoginManager()
})

// Auto-fill demo credentials for testing
document.addEventListener("DOMContentLoaded", () => {
  // Add demo credentials hint
  const loginCard = document.querySelector(".login-card")
  const demoHint = document.createElement("div")
  demoHint.style.cssText = `
    background: rgba(102, 126, 234, 0.1);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
    color: var(--primary-color);
    text-align: center;
  `
  demoHint.innerHTML = `
    <strong>Demo Credentials:</strong><br>
    Email: demo@financetracker.com<br>
    Password: demo123
  `

  const loginForm = document.querySelector(".login-form")
  loginForm.insertBefore(demoHint, loginForm.firstChild)
})
