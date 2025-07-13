const API_BASE_URL = "http://localhost:5000/api" // Ensure this matches your backend URL

class SignupManager {
  constructor() {
    this.passwordStrength = 0
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.setupTheme()
  }

  setupEventListeners() {
    // Form submission
    document.getElementById("signupForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleSignup()
    })

    // Password toggles
    document.getElementById("passwordToggle").addEventListener("click", () => {
      this.togglePassword("password", "passwordToggle")
    })

    document.getElementById("confirmPasswordToggle").addEventListener("click", () => {
      this.togglePassword("confirmPassword", "confirmPasswordToggle")
    })

    // Real-time validation
    document.getElementById("email").addEventListener("input", (e) => {
      this.validateEmail(e.target.value)
    })

    document.getElementById("password").addEventListener("input", (e) => {
      this.checkPasswordStrength(e.target.value)
      this.validatePasswordMatch()
    })

    document.getElementById("confirmPassword").addEventListener("input", () => {
      this.validatePasswordMatch()
    })

    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme()
    })

    // Social signup buttons
    document.querySelector(".google-btn").addEventListener("click", () => {
      this.showToast("Info", "Google signup integration coming soon!", "info")
    })

    document.querySelector(".microsoft-btn").addEventListener("click", () => {
      this.showToast("Info", "Microsoft signup integration coming soon!", "info")
    })

    // Terms and privacy links
    document.querySelector(".terms-link").addEventListener("click", (e) => {
      e.preventDefault()
      this.showToast("Info", "Terms of Service page coming soon!", "info")
    })

    document.querySelector(".privacy-link").addEventListener("click", (e) => {
      e.preventDefault()
      this.showToast("Info", "Privacy Policy page coming soon!", "info")
    })

    // Enter key handling
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && document.activeElement.tagName !== "BUTTON") {
        document.getElementById("signupForm").dispatchEvent(new Event("submit"))
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

  togglePassword(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId)
    const toggleIcon = document.querySelector(`#${toggleId} i`)

    if (passwordInput.type === "password") {
      passwordInput.type = "text"
      toggleIcon.className = "fas fa-eye-slash"
    } else {
      passwordInput.type = "password"
      toggleIcon.className = "fas fa-eye"
    }
  }

  validateEmail(email) {
    const emailInput = document.getElementById("email")
    const feedback = document.getElementById("emailFeedback")
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) {
      emailInput.classList.remove("valid", "invalid")
      feedback.textContent = ""
      return false
    }

    if (emailRegex.test(email)) {
      emailInput.classList.remove("invalid")
      emailInput.classList.add("valid")
      feedback.textContent = "✓ Valid email address"
      feedback.className = "input-feedback success"
      return true
    } else {
      emailInput.classList.remove("valid")
      emailInput.classList.add("invalid")
      feedback.textContent = "Please enter a valid email address"
      feedback.className = "input-feedback error"
      return false
    }
  }

  checkPasswordStrength(password) {
    const strengthFill = document.querySelector(".strength-fill")
    const strengthText = document.querySelector(".strength-text")

    if (!password) {
      strengthFill.className = "strength-fill"
      strengthText.textContent = "Password strength"
      this.passwordStrength = 0
      return
    }

    let score = 0
    const feedback = []

    // Length check
    if (password.length >= 8) score += 1
    else feedback.push("at least 8 characters")

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 1
    else feedback.push("uppercase letter")

    // Lowercase check
    if (/[a-z]/.test(password)) score += 1
    else feedback.push("lowercase letter")

    // Number check
    if (/\d/.test(password)) score += 1
    else feedback.push("number")

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    else feedback.push("special character")

    this.passwordStrength = score

    // Update visual indicator
    strengthFill.className = "strength-fill"
    if (score <= 2) {
      strengthFill.classList.add("weak")
      strengthText.textContent = `Weak - Add: ${feedback.slice(0, 2).join(", ")}`
    } else if (score === 3) {
      strengthFill.classList.add("fair")
      strengthText.textContent = `Fair - Add: ${feedback.join(", ")}`
    } else if (score === 4) {
      strengthFill.classList.add("good")
      strengthText.textContent = "Good password strength"
    } else {
      strengthFill.classList.add("strong")
      strengthText.textContent = "Strong password!"
    }
  }

  validatePasswordMatch() {
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const confirmInput = document.getElementById("confirmPassword")
    const feedback = document.getElementById("confirmPasswordFeedback")

    if (!confirmPassword) {
      confirmInput.classList.remove("valid", "invalid")
      feedback.textContent = ""
      return false
    }

    if (password === confirmPassword) {
      confirmInput.classList.remove("invalid")
      confirmInput.classList.add("valid")
      feedback.textContent = "✓ Passwords match"
      feedback.className = "input-feedback success"
      return true
    } else {
      confirmInput.classList.remove("valid")
      confirmInput.classList.add("invalid")
      feedback.textContent = "Passwords do not match"
      feedback.className = "input-feedback error"
      return false
    }
  }

  async handleSignup() {
    const formData = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value,
      confirmPassword: document.getElementById("confirmPassword").value,
      currency: document.getElementById("currency").value,
      agreeTerms: document.getElementById("agreeTerms").checked,
      newsletter: document.getElementById("newsletter").checked,
    }

    // Validation
    if (!this.validateForm(formData)) {
      return
    }

    // Show loading state
    this.setLoadingState(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      this.showToast("Success", "Account created successfully! Redirecting to login...", "success")

      // Redirect to login page after successful signup
      setTimeout(() => {
        window.location.href = "login.html"
      }, 2000)
    } catch (error) {
      this.showToast("Error", error.message, "error")
    } finally {
      this.setLoadingState(false)
    }
  }

  validateForm(data) {
    // Check required fields
    if (!data.firstName) {
      this.showToast("Error", "Please enter your first name", "error")
      return false
    }

    if (!data.lastName) {
      this.showToast("Error", "Please enter your last name", "error")
      return false
    }

    if (!this.validateEmail(data.email)) {
      this.showToast("Error", "Please enter a valid email address", "error")
      return false
    }

    if (this.passwordStrength < 3) {
      this.showToast("Error", "Please choose a stronger password", "error")
      return false
    }

    if (!this.validatePasswordMatch()) {
      this.showToast("Error", "Passwords do not match", "error")
      return false
    }

    if (!data.currency) {
      this.showToast("Error", "Please select your preferred currency", "error")
      return false
    }

    if (!data.agreeTerms) {
      this.showToast("Error", "Please agree to the Terms of Service and Privacy Policy", "error")
      return false
    }

    return true
  }

  setLoadingState(loading) {
    const signupBtn = document.querySelector(".signup-btn")
    const btnText = document.querySelector(".btn-text")
    const btnLoader = document.querySelector(".btn-loader")

    if (loading) {
      signupBtn.disabled = true
      btnText.style.opacity = "0"
      btnLoader.style.display = "block"
    } else {
      signupBtn.disabled = false
      btnText.style.opacity = "1"
      btnLoader.style.display = "none"
    }
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

    // Auto remove after 6 seconds
    setTimeout(() => this.removeToast(toast), 6000)
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

// Initialize signup manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new SignupManager()
})
