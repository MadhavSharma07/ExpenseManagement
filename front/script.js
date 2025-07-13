// Financial Management Dashboard JavaScript

const API_BASE_URL = "http://localhost:5000/api" // Ensure this matches your backend URL

class FinancialDashboard {
  constructor() {
    this.currentSection = "dashboard"
    this.transactions = []
    this.budgets = []
    this.categories = [] // To store categories fetched from backend
    this.currentPage = 1
    this.itemsPerPage = 10
    this.filteredTransactions = []

    this.init()
  }

  async init() {
    // Check for authentication token
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "login.html" // Redirect to login if not authenticated
      return
    }

    await this.fetchCategories() // Fetch categories first
    this.setupEventListeners()
    this.setupTheme()
    this.updateDashboard()
  }

  async fetchCategories() {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
      this.categories = data.data
      this.populateCategorySelects()
    } catch (error) {
      console.error("Error fetching categories:", error)
      this.showToast("Error", "Failed to load categories.", "error")
    }
  }

  populateCategorySelects() {
    const transactionCategorySelect = document.getElementById("transactionCategory")
    const budgetCategorySelect = document.getElementById("budgetCategory")
    const filterCategorySelect = document.getElementById("categoryFilter")

    // Clear existing options (except "Select Category" or "All Categories")
    ;[transactionCategorySelect, budgetCategorySelect, filterCategorySelect].forEach((select) => {
      if (select) {
        Array.from(select.options).forEach((option) => {
          if (option.value !== "" && option.value !== "all") {
            option.remove()
          }
        })
      }
    })

    this.categories.forEach((category) => {
      const option = document.createElement("option")
      option.value = category._id
      option.textContent = category.name
      if (transactionCategorySelect) transactionCategorySelect.appendChild(option.cloneNode(true))
      if (budgetCategorySelect) budgetCategorySelect.appendChild(option.cloneNode(true))
      if (filterCategorySelect) filterCategorySelect.appendChild(option.cloneNode(true))
    })
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-link, .sidebar-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const section = e.target.closest("[data-section]").dataset.section
        this.showSection(section)
      })
    })

    // Theme toggle
    document.getElementById("themeToggle").addEventListener("click", () => {
      this.toggleTheme()
    })

    // Quick actions
    document.querySelectorAll(".action-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const action = e.target.closest("[data-action]").dataset.action
        this.handleQuickAction(action)
      })
    })

    // Modal controls
    this.setupModalControls()

    // Form submissions
    this.setupFormSubmissions()

    // Filters
    this.setupFilters()

    // Chart interactions
    this.setupChartInteractions()

    // View all transactions
    document.querySelector(".view-all").addEventListener("click", (e) => {
      e.preventDefault()
      this.showSection("transactions")
    })
  }

  setupModalControls() {
    // Add Transaction Modal
    document.getElementById("addTransactionBtn").addEventListener("click", () => {
      this.showModal("addTransactionModal")
    })

    document.getElementById("closeTransactionModal").addEventListener("click", () => {
      this.hideModal("addTransactionModal")
    })

    document.getElementById("cancelTransaction").addEventListener("click", () => {
      this.hideModal("addTransactionModal")
    })

    // Add Budget Modal
    document.getElementById("addBudgetBtn").addEventListener("click", () => {
      this.showModal("addBudgetModal")
    })

    document.getElementById("closeBudgetModal").addEventListener("click", () => {
      this.hideModal("addBudgetModal")
    })

    document.getElementById("cancelBudget").addEventListener("click", () => {
      this.hideModal("addBudgetModal")
    })

    // Close modals on backdrop click
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.hideModal(modal.id)
        }
      })
    })
  }

  setupFormSubmissions() {
    // Add Transaction Form
    document.getElementById("addTransactionForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.addTransaction()
    })

    // Add Budget Form
    document.getElementById("addBudgetForm").addEventListener("submit", (e) => {
      e.preventDefault()
      this.addBudget()
    })
  }

  setupFilters() {
    const filters = ["dateFilter", "categoryFilter", "typeFilter", "searchFilter"]

    filters.forEach((filterId) => {
      const element = document.getElementById(filterId)
      if (element) {
        element.addEventListener("change", () => this.applyFilters())
        if (filterId === "searchFilter") {
          element.addEventListener("input", () => this.applyFilters())
        }
      }
    })

    // Chart period filter
    document.getElementById("chartPeriod").addEventListener("change", () => {
      this.updateChart()
    })
  }

  setupChartInteractions() {
    // Chart bars will be set up when chart is rendered
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

    this.showToast("Theme changed", `Switched to ${newTheme} mode`, "info")
  }

  updateThemeIcon(theme) {
    const icon = document.querySelector("#themeToggle i")
    icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon"
  }

  showSection(sectionId) {
    // Update navigation
    document.querySelectorAll(".nav-link, .sidebar-link").forEach((link) => {
      link.classList.remove("active")
    })

    document.querySelectorAll(`[data-section="${sectionId}"]`).forEach((link) => {
      link.classList.add("active")
    })

    // Show section
    document.querySelectorAll(".section").forEach((section) => {
      section.classList.remove("active")
    })

    document.getElementById(sectionId).classList.add("active")
    this.currentSection = sectionId

    // Load section-specific data
    this.loadSectionData(sectionId)
  }

  async loadSectionData(sectionId) {
    switch (sectionId) {
      case "dashboard":
        await this.updateDashboard()
        break
      case "transactions":
        await this.loadTransactions()
        break
      case "budget":
        await this.loadBudgetData()
        break
    }
  }

  async updateDashboard() {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/dashboard/overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }
      const data = await response.json()
      const { overview, recentTransactions, budgets, categorySpending } = data.data

      this.transactions = recentTransactions // Update local transactions for recent display
      this.budgets = budgets // Update local budgets

      this.animateValue("totalBalance", overview.totalBalance, "$")
      this.animateValue("monthlyIncome", overview.monthlyIncome, "$")
      this.animateValue("monthlyExpenses", overview.monthlyExpenses, "$")

      this.updateChart(categorySpending)
      this.updateRecentTransactions()
      this.updateBudgetOverview()
    } catch (error) {
      console.error("Error updating dashboard:", error)
      this.showToast("Error", "Failed to load dashboard data.", "error")
      if (error.message === "Token expired" || error.message === "Invalid token") {
        setTimeout(() => (window.location.href = "login.html"), 1500)
      }
    }
  }

  animateValue(elementId, targetValue, prefix = "") {
    const element = document.getElementById(elementId)
    if (!element) return

    const startValue = 0
    const duration = 1000
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      const currentValue = startValue + (targetValue - startValue) * this.easeOutQuart(progress)
      element.textContent = `${prefix}${this.formatCurrency(currentValue)}`

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  easeOutQuart(t) {
    return 1 - --t * t * t * t
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  updateChart(categorySpendingData = null) {
    const chartContainer = document.getElementById("spendingChart")
    const period = document.getElementById("chartPeriod").value

    if (!categorySpendingData) {
      // If data not provided, fetch it
      this.fetchCategorySpending(period)
      return
    }

    chartContainer.innerHTML = ""

    if (categorySpendingData.length === 0) {
      chartContainer.innerHTML = '<p class="text-muted">No spending data for this period.</p>'
      return
    }

    const maxAmount = Math.max(...categorySpendingData.map((item) => item.total))

    categorySpendingData.forEach((item) => {
      const height = (item.total / maxAmount) * 100

      const barContainer = document.createElement("div")
      barContainer.className = "chart-bar"

      const bar = document.createElement("div")
      bar.className = "bar"
      bar.style.height = `${height}%`
      bar.style.background = item.category.color // Use category color

      const tooltip = document.createElement("div")
      tooltip.className = "bar-tooltip"
      tooltip.textContent = `${item.category.name}: $${this.formatCurrency(item.total)}`

      const value = document.createElement("span")
      value.className = "bar-value"
      value.textContent = `$${Math.round(item.total)}`

      const label = document.createElement("span")
      label.className = "bar-label"
      label.textContent = item.category.name

      bar.appendChild(tooltip)
      bar.appendChild(value)
      barContainer.appendChild(bar)
      barContainer.appendChild(label)

      // Add click handler
      bar.addEventListener("click", () => {
        this.showCategoryDetails(item.category._id)
      })

      chartContainer.appendChild(barContainer)
    })
  }

  async fetchCategorySpending(period) {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/dashboard/analytics?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data")
      }
      const data = await response.json()
      this.updateChart(data.data.categoryBreakdown)
    } catch (error) {
      console.error("Error fetching category spending:", error)
      this.showToast("Error", "Failed to load spending chart.", "error")
    }
  }

  updateRecentTransactions() {
    const container = document.getElementById("recentTransactions")
    container.innerHTML = ""

    if (this.transactions.length === 0) {
      container.innerHTML = '<p class="text-muted">No recent transactions.</p>'
      return
    }

    this.transactions.forEach((transaction) => {
      const item = document.createElement("div")
      item.className = "transaction-item"

      const categoryIcon = transaction.category ? transaction.category.icon : "fas fa-question-circle"
      const categoryColor = transaction.category ? transaction.category.color : "#64748b"

      item.innerHTML = `
                <div class="transaction-icon ${transaction.type}" style="background: ${categoryColor};">
                    <i class="${categoryIcon}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-name">${transaction.description}</div>
                    <div class="transaction-date">${this.formatDate(new Date(transaction.date))}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === "income" ? "+" : "-"}$${this.formatCurrency(transaction.amount)}
                </div>
            `

      container.appendChild(item)
    })
  }

  updateBudgetOverview() {
    const container = document.getElementById("budgetCategories")
    container.innerHTML = ""

    if (this.budgets.length === 0) {
      container.innerHTML = '<p class="text-muted">No budgets set up.</p>'
      return
    }

    this.budgets.forEach((budget) => {
      const percentage = budget.percentageSpent
      const isOverBudget = percentage > 100
      const categoryColor = budget.category ? budget.category.color : "var(--primary-color)"

      const categoryDiv = document.createElement("div")
      categoryDiv.className = "budget-category"

      categoryDiv.innerHTML = `
                <div class="category-header">
                    <span class="category-name">${budget.name}</span>
                    <span class="category-amount">$${this.formatCurrency(budget.spent)} / $${this.formatCurrency(budget.amount)}</span>
                </div>
                <div class="category-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${Math.min(percentage, 100)}%; background: ${isOverBudget ? "var(--danger-color)" : categoryColor}"></div>
                    </div>
                    <span class="progress-percentage" style="color: ${isOverBudget ? "var(--danger-color)" : "var(--text-muted)"}">${percentage}%</span>
                </div>
            `

      container.appendChild(categoryDiv)
    })
  }

  async loadTransactions() {
    await this.applyFilters()
  }

  async applyFilters() {
    const dateFilter = document.getElementById("dateFilter").value
    const categoryFilter = document.getElementById("categoryFilter").value
    const typeFilter = document.getElementById("typeFilter").value
    const searchFilter = document.getElementById("searchFilter").value

    const params = new URLSearchParams()
    params.append("page", this.currentPage)
    params.append("limit", this.itemsPerPage)

    if (typeFilter !== "all") params.append("type", typeFilter)
    if (categoryFilter !== "all") params.append("category", categoryFilter)
    if (searchFilter) params.append("search", searchFilter)

    // Date range logic
    const now = new Date()
    let startDate, endDate
    switch (dateFilter) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        break
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7))
        endDate = new Date()
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case "quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1)
        endDate = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
    }
    if (startDate) params.append("startDate", startDate.toISOString())
    if (endDate) params.append("endDate", endDate.toISOString())

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/transactions?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }
      const data = await response.json()
      this.filteredTransactions = data.data.transactions
      this.renderTransactionsTable()
      this.renderPagination(data.data.pagination.pages)
    } catch (error) {
      console.error("Error applying filters:", error)
      this.showToast("Error", "Failed to load transactions.", "error")
    }
  }

  renderTransactionsTable() {
    const tbody = document.getElementById("transactionsTableBody")
    tbody.innerHTML = ""

    if (this.filteredTransactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted text-center">No transactions found.</td></tr>'
      return
    }

    this.filteredTransactions.forEach((transaction) => {
      const row = document.createElement("tr")
      const categoryName = transaction.category ? transaction.category.name : "N/A"
      const transactionDate = new Date(transaction.date)

      row.innerHTML = `
                <td>${this.formatDate(transactionDate)}</td>
                <td>${transaction.description}</td>
                <td>${categoryName}</td>
                <td class="transaction-amount ${transaction.type}">
                    ${transaction.type === "income" ? "+" : "-"}$${this.formatCurrency(transaction.amount)}
                </td>
                <td class="transaction-actions">
                    <button class="action-btn edit" onclick="dashboard.editTransaction('${transaction._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="dashboard.deleteTransaction('${transaction._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `
      tbody.appendChild(row)
    })
  }

  renderPagination(totalPages) {
    const container = document.getElementById("transactionsPagination")
    if (totalPages <= 1) {
      container.innerHTML = ""
      return
    }

    let paginationHTML = ""

    // Previous button
    paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === 1 ? "disabled" : ""} 
                    onclick="dashboard.changePage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
        paginationHTML += `
                    <button class="pagination-btn ${i === this.currentPage ? "active" : ""}" 
                            onclick="dashboard.changePage(${i})">
                        ${i}
                    </button>
                `
      } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
        paginationHTML += '<span class="pagination-ellipsis">...</span>'
      }
    }

    // Next button
    paginationHTML += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? "disabled" : ""} 
                    onclick="dashboard.changePage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `

    container.innerHTML = paginationHTML
  }

  async changePage(page) {
    const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage) // This needs to come from backend total
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page
      await this.applyFilters() // Re-fetch with new page
    }
  }

  async loadBudgetData() {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/budgets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch budgets")
      }
      const data = await response.json()
      this.budgets = data.data
      this.updateBudgetSummary()
      this.renderDetailedBudgets()
    } catch (error) {
      console.error("Error loading budget data:", error)
      this.showToast("Error", "Failed to load budget data.", "error")
    }
  }

  updateBudgetSummary() {
    const totalBudget = this.budgets.reduce((sum, b) => sum + b.amount, 0)
    const totalSpent = this.budgets.reduce((sum, b) => sum + b.spent, 0)
    const totalRemaining = totalBudget - totalSpent

    document.getElementById("totalBudget").textContent = `$${this.formatCurrency(totalBudget)}`
    document.getElementById("totalSpent").textContent = `$${this.formatCurrency(totalSpent)}`
    document.getElementById("totalRemaining").textContent = `$${this.formatCurrency(totalRemaining)}`
  }

  renderDetailedBudgets() {
    const container = document.getElementById("budgetCategoriesDetailed")
    container.innerHTML = ""

    if (this.budgets.length === 0) {
      container.innerHTML = '<p class="text-muted text-center">No detailed budgets to display.</p>'
      return
    }

    this.budgets.forEach((budget) => {
      const percentage = budget.percentageSpent
      const remaining = budget.remaining
      const isOverBudget = percentage > 100
      const categoryColor = budget.category ? budget.category.color : "var(--primary-color)"

      const budgetDiv = document.createElement("div")
      budgetDiv.className = "budget-category-detailed"

      budgetDiv.innerHTML = `
                <div class="budget-category-header">
                    <h4 class="budget-category-name">${budget.name}</h4>
                    <div class="budget-category-actions">
                        <button class="action-btn edit" onclick="dashboard.editBudget('${budget._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="dashboard.deleteBudget('${budget._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="budget-stats">
                    <div class="budget-stat">
                        <div class="budget-stat-label">Budget</div>
                        <div class="budget-stat-value">$${this.formatCurrency(budget.amount)}</div>
                    </div>
                    <div class="budget-stat">
                        <div class="budget-stat-label">Spent</div>
                        <div class="budget-stat-value ${isOverBudget ? "over-budget" : ""}">$${this.formatCurrency(budget.spent)}</div>
                    </div>
                    <div class="budget-stat">
                        <div class="budget-stat-label">Remaining</div>
                        <div class="budget-stat-value ${remaining < 0 ? "over-budget" : ""}">$${this.formatCurrency(remaining)}</div>
                    </div>
                    <div class="budget-stat">
                        <div class="budget-stat-label">Progress</div>
                        <div class="budget-stat-value ${isOverBudget ? "over-budget" : ""}">${percentage}%</div>
                    </div>
                </div>
                <div class="category-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${Math.min(percentage, 100)}%; background: ${isOverBudget ? "var(--danger-color)" : categoryColor}"></div>
                    </div>
                </div>
            `

      container.appendChild(budgetDiv)
    })
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId)
    modal.classList.add("active")

    // Set today's date as default for transaction date
    if (modalId === "addTransactionModal") {
      document.getElementById("transactionDate").value = new Date().toISOString().split("T")[0]
      document.getElementById("addTransactionForm").dataset.editId = "" // Clear edit ID
      document.getElementById("addTransactionForm").querySelector('button[type="submit"]').textContent =
        "Add Transaction"
    } else if (modalId === "addBudgetModal") {
      document.getElementById("addBudgetForm").dataset.editId = "" // Clear edit ID
      document.getElementById("addBudgetForm").querySelector('button[type="submit"]').textContent = "Add Budget"
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId)
    modal.classList.remove("active")

    // Reset forms
    const form = modal.querySelector("form")
    if (form) form.reset()
  }

  async addTransaction() {
    const form = document.getElementById("addTransactionForm")
    const editId = form.dataset.editId
    const method = editId ? "PUT" : "POST"
    const url = editId ? `${API_BASE_URL}/transactions/${editId}` : `${API_BASE_URL}/transactions`

    const transactionData = {
      type: document.getElementById("transactionType").value,
      amount: Number.parseFloat(document.getElementById("transactionAmount").value),
      description: document.getElementById("transactionDescription").value,
      category: document.getElementById("transactionCategory").value,
      date: document.getElementById("transactionDate").value,
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save transaction")
      }

      this.hideModal("addTransactionModal")
      this.showToast("Success", `Transaction ${editId ? "updated" : "added"} successfully!`, "success")

      // Refresh current view
      await this.loadSectionData(this.currentSection)
    } catch (error) {
      console.error("Error saving transaction:", error)
      this.showToast("Error", error.message, "error")
    }
  }

  async addBudget() {
    const form = document.getElementById("addBudgetForm")
    const editId = form.dataset.editId
    const method = editId ? "PUT" : "POST"
    const url = editId ? `${API_BASE_URL}/budgets/${editId}` : `${API_BASE_URL}/budgets`

    const budgetData = {
      category: document.getElementById("budgetCategory").value,
      name:
        this.categories.find((c) => c._id === document.getElementById("budgetCategory").value)?.name || "New Budget",
      amount: Number.parseFloat(document.getElementById("budgetAmount").value),
      period: "monthly", // Assuming monthly for simplicity, can be made dynamic
      startDate: new Date().toISOString().split("T")[0], // Current date
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(budgetData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to save budget")
      }

      this.hideModal("addBudgetModal")
      this.showToast("Success", `Budget ${editId ? "updated" : "added"} successfully!`, "success")

      // Refresh current view
      await this.loadSectionData(this.currentSection)
    } catch (error) {
      console.error("Error saving budget:", error)
      this.showToast("Error", error.message, "error")
    }
  }

  async editTransaction(id) {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch transaction for editing")
      }
      const data = await response.json()
      const transaction = data.data

      document.getElementById("transactionType").value = transaction.type
      document.getElementById("transactionAmount").value = transaction.amount
      document.getElementById("transactionDescription").value = transaction.description
      document.getElementById("transactionCategory").value = transaction.category._id // Use category ID
      document.getElementById("transactionDate").value = new Date(transaction.date).toISOString().split("T")[0]

      document.getElementById("addTransactionForm").dataset.editId = id
      document.getElementById("addTransactionForm").querySelector('button[type="submit"]').textContent =
        "Update Transaction"
      this.showModal("addTransactionModal")
    } catch (error) {
      console.error("Error editing transaction:", error)
      this.showToast("Error", error.message, "error")
    }
  }

  async deleteTransaction(id) {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return
    }
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete transaction")
      }

      this.showToast("Success", "Transaction deleted successfully!", "success")
      await this.loadSectionData(this.currentSection)
    } catch (error) {
      console.error("Error deleting transaction:", error)
      this.showToast("Error", error.message, "error")
    }
  }

  async editBudget(id) {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch budget for editing")
      }
      const data = await response.json()
      const budget = data.data

      document.getElementById("budgetCategory").value = budget.category._id
      document.getElementById("budgetAmount").value = budget.amount

      document.getElementById("addBudgetForm").dataset.editId = id
      document.getElementById("addBudgetForm").querySelector('button[type="submit"]').textContent = "Update Budget"
      this.showModal("addBudgetModal")
    } catch (error) {
      console.error("Error editing budget:", error)
      this.showToast("Error", error.message, "error")
    }
  }

  async deleteBudget(id) {
    if (!confirm("Are you sure you want to delete this budget?")) {
      return
    }
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete budget")
      }

      this.showToast("Success", "Budget deleted successfully!", "success")
      await this.loadSectionData(this.currentSection)
    } catch (error) {
      console.error("Error deleting budget:", error)
      this.showToast("Error", error.message, "error")
    }
  }

  handleQuickAction(action) {
    switch (action) {
      case "add-transaction":
        this.showModal("addTransactionModal")
        break
      case "add-budget":
        this.showModal("addBudgetModal")
        break
      case "set-goal":
        this.showToast("Info", "Goal setting feature coming soon!", "info")
        break
    }
  }

  showCategoryDetails(categoryId) {
    this.showSection("transactions")
    document.getElementById("categoryFilter").value = categoryId
    this.applyFilters()
    const categoryName = this.categories.find((c) => c._id === categoryId)?.name || "selected category"
    this.showToast("Info", `Showing transactions for ${categoryName}`, "info")
  }

  formatDate(date) {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (date.toDateString() === now.toDateString()) {
      return "Today"
    } else {
      const yesterday = new Date(now)
      yesterday.setDate(now.getDate() - 1)
      if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday"
      } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`
      } else {
        return date.toLocaleDateString()
      }
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

// Initialize the dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.dashboard = new FinancialDashboard()
})

// Add some utility functions for better UX
document.addEventListener("keydown", (e) => {
  // Close modals with Escape key
  if (e.key === "Escape") {
    document.querySelectorAll(".modal.active").forEach((modal) => {
      window.dashboard.hideModal(modal.id)
    })
  }
})

// Add loading states for better UX
function showLoading(element) {
  const originalContent = element.innerHTML
  element.innerHTML = '<div class="loading"></div>'
  element.dataset.originalContent = originalContent
}

function hideLoading(element) {
  if (element.dataset.originalContent) {
    element.innerHTML = element.dataset.originalContent
    delete element.dataset.originalContent
  }
}
