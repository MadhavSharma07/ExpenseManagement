// Financial Management Dashboard JavaScript

class FinancialDashboard {
  constructor() {
    this.currentSection = "dashboard"
    this.transactions = []
    this.budgets = []
    this.currentPage = 1
    this.itemsPerPage = 10
    this.filteredTransactions = []

    this.init()
    this.loadSampleData()
  }

  init() {
    this.setupEventListeners()
    this.setupTheme()
    this.updateDashboard()
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

  loadSectionData(sectionId) {
    switch (sectionId) {
      case "dashboard":
        this.updateDashboard()
        break
      case "transactions":
        this.loadTransactions()
        break
      case "budget":
        this.loadBudgetData()
        break
    }
  }

  loadSampleData() {
    // Sample transactions
    this.transactions = [
      {
        id: 1,
        type: "expense",
        amount: 85.5,
        description: "Grocery Store",
        category: "food",
        date: new Date(),
        icon: "fas fa-shopping-cart",
      },
      {
        id: 2,
        type: "income",
        amount: 2500.0,
        description: "Salary Deposit",
        category: "income",
        date: new Date(Date.now() - 86400000),
        icon: "fas fa-briefcase",
      },
      {
        id: 3,
        type: "expense",
        amount: 45.2,
        description: "Gas Station",
        category: "transport",
        date: new Date(Date.now() - 86400000),
        icon: "fas fa-gas-pump",
      },
      {
        id: 4,
        type: "expense",
        amount: 32.75,
        description: "Restaurant",
        category: "food",
        date: new Date(Date.now() - 172800000),
        icon: "fas fa-utensils",
      },
      {
        id: 5,
        type: "income",
        amount: 750.0,
        description: "Freelance Payment",
        category: "income",
        date: new Date(Date.now() - 259200000),
        icon: "fas fa-hand-holding-usd",
      },
    ]

    // Sample budgets
    this.budgets = [
      { category: "food", name: "Food & Dining", budget: 1000, spent: 850 },
      { category: "transport", name: "Transportation", budget: 600, spent: 420 },
      { category: "entertainment", name: "Entertainment", budget: 400, spent: 280 },
      { category: "shopping", name: "Shopping", budget: 300, spent: 180 },
      { category: "housing", name: "Housing", budget: 1200, spent: 1200 },
    ]

    this.filteredTransactions = [...this.transactions]
  }

  updateDashboard() {
    this.updateOverviewCards()
    this.updateChart()
    this.updateRecentTransactions()
    this.updateBudgetOverview()
  }

  updateOverviewCards() {
    const totalIncome = this.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = this.transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const totalBalance = totalIncome - totalExpenses + 21000 // Starting balance

    // Update card values with animation
    this.animateValue("totalBalance", totalBalance, "$")
    this.animateValue("monthlyIncome", totalIncome, "$")
    this.animateValue("monthlyExpenses", totalExpenses, "$")
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

  updateChart() {
    const chartContainer = document.getElementById("spendingChart")
    const period = document.getElementById("chartPeriod").value

    // Calculate spending by category
    const categorySpending = this.calculateCategorySpending(period)

    chartContainer.innerHTML = ""

    Object.entries(categorySpending).forEach(([category, amount]) => {
      const maxAmount = Math.max(...Object.values(categorySpending))
      const height = (amount / maxAmount) * 100

      const barContainer = document.createElement("div")
      barContainer.className = "chart-bar"

      const bar = document.createElement("div")
      bar.className = "bar"
      bar.style.height = `${height}%`

      const tooltip = document.createElement("div")
      tooltip.className = "bar-tooltip"
      tooltip.textContent = `${this.getCategoryName(category)}: $${this.formatCurrency(amount)}`

      const value = document.createElement("span")
      value.className = "bar-value"
      value.textContent = `$${Math.round(amount)}`

      const label = document.createElement("span")
      label.className = "bar-label"
      label.textContent = this.getCategoryName(category)

      bar.appendChild(tooltip)
      bar.appendChild(value)
      barContainer.appendChild(bar)
      barContainer.appendChild(label)

      // Add click handler
      bar.addEventListener("click", () => {
        this.showCategoryDetails(category)
      })

      chartContainer.appendChild(barContainer)
    })
  }

  calculateCategorySpending(period) {
    const now = new Date()
    let startDate

    switch (period) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "quarter":
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const filteredTransactions = this.transactions.filter((t) => t.type === "expense" && t.date >= startDate)

    const categorySpending = {}
    filteredTransactions.forEach((t) => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount
    })

    return categorySpending
  }

  getCategoryName(category) {
    const categoryNames = {
      food: "Food",
      transport: "Transport",
      housing: "Housing",
      entertainment: "Entertainment",
      shopping: "Shopping",
      utilities: "Utilities",
      healthcare: "Healthcare",
      other: "Other",
    }
    return categoryNames[category] || category
  }

  updateRecentTransactions() {
    const container = document.getElementById("recentTransactions")
    const recentTransactions = this.transactions.sort((a, b) => b.date - a.date).slice(0, 5)

    container.innerHTML = ""

    recentTransactions.forEach((transaction) => {
      const item = document.createElement("div")
      item.className = "transaction-item"

      item.innerHTML = `
                <div class="transaction-icon ${transaction.type}">
                    <i class="${transaction.icon}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-name">${transaction.description}</div>
                    <div class="transaction-date">${this.formatDate(transaction.date)}</div>
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

    this.budgets.forEach((budget) => {
      const percentage = Math.round((budget.spent / budget.budget) * 100)
      const isOverBudget = percentage > 100

      const categoryDiv = document.createElement("div")
      categoryDiv.className = "budget-category"

      categoryDiv.innerHTML = `
                <div class="category-header">
                    <span class="category-name">${budget.name}</span>
                    <span class="category-amount">$${this.formatCurrency(budget.spent)} / $${this.formatCurrency(budget.budget)}</span>
                </div>
                <div class="category-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${Math.min(percentage, 100)}%; background: ${isOverBudget ? "var(--danger-color)" : "var(--primary-gradient)"}"></div>
                    </div>
                    <span class="progress-percentage" style="color: ${isOverBudget ? "var(--danger-color)" : "var(--text-muted)"}">${percentage}%</span>
                </div>
            `

      container.appendChild(categoryDiv)
    })
  }

  loadTransactions() {
    this.applyFilters()
    this.renderTransactionsTable()
    this.renderPagination()
  }

  applyFilters() {
    const dateFilter = document.getElementById("dateFilter").value
    const categoryFilter = document.getElementById("categoryFilter").value
    const typeFilter = document.getElementById("typeFilter").value
    const searchFilter = document.getElementById("searchFilter").value.toLowerCase()

    this.filteredTransactions = this.transactions.filter((transaction) => {
      // Date filter
      if (dateFilter !== "all") {
        const transactionDate = new Date(transaction.date)
        const now = new Date()

        switch (dateFilter) {
          case "today":
            if (transactionDate.toDateString() !== now.toDateString()) return false
            break
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            if (transactionDate < weekAgo) return false
            break
          case "month":
            if (transactionDate.getMonth() !== now.getMonth() || transactionDate.getFullYear() !== now.getFullYear())
              return false
            break
          case "quarter":
            const currentQuarter = Math.floor(now.getMonth() / 3)
            const transactionQuarter = Math.floor(transactionDate.getMonth() / 3)
            if (transactionQuarter !== currentQuarter || transactionDate.getFullYear() !== now.getFullYear())
              return false
            break
          case "year":
            if (transactionDate.getFullYear() !== now.getFullYear()) return false
            break
        }
      }

      // Category filter
      if (categoryFilter !== "all" && transaction.category !== categoryFilter) return false

      // Type filter
      if (typeFilter !== "all" && transaction.type !== typeFilter) return false

      // Search filter
      if (searchFilter && !transaction.description.toLowerCase().includes(searchFilter)) return false

      return true
    })

    this.currentPage = 1
    this.renderTransactionsTable()
    this.renderPagination()
  }

  renderTransactionsTable() {
    const tbody = document.getElementById("transactionsTableBody")
    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    const pageTransactions = this.filteredTransactions.slice(startIndex, endIndex)

    tbody.innerHTML = ""

    pageTransactions.forEach((transaction) => {
      const row = document.createElement("tr")
      row.innerHTML = `
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td>${this.getCategoryName(transaction.category)}</td>
                <td class="transaction-amount ${transaction.type}">
                    ${transaction.type === "income" ? "+" : "-"}$${this.formatCurrency(transaction.amount)}
                </td>
                <td class="transaction-actions">
                    <button class="action-btn edit" onclick="dashboard.editTransaction(${transaction.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="dashboard.deleteTransaction(${transaction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `
      tbody.appendChild(row)
    })
  }

  renderPagination() {
    const container = document.getElementById("transactionsPagination")
    const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage)

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

  changePage(page) {
    const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage)
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page
      this.renderTransactionsTable()
      this.renderPagination()
    }
  }

  loadBudgetData() {
    this.updateBudgetSummary()
    this.renderDetailedBudgets()
  }

  updateBudgetSummary() {
    const totalBudget = this.budgets.reduce((sum, b) => sum + b.budget, 0)
    const totalSpent = this.budgets.reduce((sum, b) => sum + b.spent, 0)
    const totalRemaining = totalBudget - totalSpent

    document.getElementById("totalBudget").textContent = `$${this.formatCurrency(totalBudget)}`
    document.getElementById("totalSpent").textContent = `$${this.formatCurrency(totalSpent)}`
    document.getElementById("totalRemaining").textContent = `$${this.formatCurrency(totalRemaining)}`
  }

  renderDetailedBudgets() {
    const container = document.getElementById("budgetCategoriesDetailed")
    container.innerHTML = ""

    this.budgets.forEach((budget) => {
      const percentage = Math.round((budget.spent / budget.budget) * 100)
      const remaining = budget.budget - budget.spent
      const isOverBudget = percentage > 100

      const budgetDiv = document.createElement("div")
      budgetDiv.className = "budget-category-detailed"

      budgetDiv.innerHTML = `
                <div class="budget-category-header">
                    <h4 class="budget-category-name">${budget.name}</h4>
                    <div class="budget-category-actions">
                        <button class="action-btn edit" onclick="dashboard.editBudget('${budget.category}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="dashboard.deleteBudget('${budget.category}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="budget-stats">
                    <div class="budget-stat">
                        <div class="budget-stat-label">Budget</div>
                        <div class="budget-stat-value">$${this.formatCurrency(budget.budget)}</div>
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
                        <div class="progress" style="width: ${Math.min(percentage, 100)}%; background: ${isOverBudget ? "var(--danger-color)" : "var(--primary-gradient)"}"></div>
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
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId)
    modal.classList.remove("active")

    // Reset forms
    const form = modal.querySelector("form")
    if (form) form.reset()
  }

  addTransaction() {
    const form = document.getElementById("addTransactionForm")
    const formData = new FormData(form)

    const transaction = {
      id: Date.now(),
      type: document.getElementById("transactionType").value,
      amount: Number.parseFloat(document.getElementById("transactionAmount").value),
      description: document.getElementById("transactionDescription").value,
      category: document.getElementById("transactionCategory").value,
      date: new Date(document.getElementById("transactionDate").value),
      icon: this.getCategoryIcon(document.getElementById("transactionCategory").value),
    }

    this.transactions.unshift(transaction)
    this.updateBudgetSpending(transaction)

    this.hideModal("addTransactionModal")
    this.showToast("Success", "Transaction added successfully!", "success")

    // Update current view
    if (this.currentSection === "dashboard") {
      this.updateDashboard()
    } else if (this.currentSection === "transactions") {
      this.loadTransactions()
    } else if (this.currentSection === "budget") {
      this.loadBudgetData()
    }
  }

  addBudget() {
    const category = document.getElementById("budgetCategory").value
    const amount = Number.parseFloat(document.getElementById("budgetAmount").value)

    // Check if budget already exists
    const existingBudget = this.budgets.find((b) => b.category === category)
    if (existingBudget) {
      this.showToast("Error", "Budget for this category already exists!", "error")
      return
    }

    const budget = {
      category: category,
      name: this.getCategoryName(category),
      budget: amount,
      spent: this.calculateCategorySpent(category),
    }

    this.budgets.push(budget)

    this.hideModal("addBudgetModal")
    this.showToast("Success", "Budget added successfully!", "success")

    // Update current view
    if (this.currentSection === "dashboard") {
      this.updateDashboard()
    } else if (this.currentSection === "budget") {
      this.loadBudgetData()
    }
  }

  updateBudgetSpending(transaction) {
    if (transaction.type === "expense") {
      const budget = this.budgets.find((b) => b.category === transaction.category)
      if (budget) {
        budget.spent += transaction.amount
      }
    }
  }

  calculateCategorySpent(category) {
    return this.transactions
      .filter((t) => t.type === "expense" && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  getCategoryIcon(category) {
    const icons = {
      food: "fas fa-utensils",
      transport: "fas fa-car",
      housing: "fas fa-home",
      entertainment: "fas fa-film",
      shopping: "fas fa-shopping-bag",
      utilities: "fas fa-bolt",
      healthcare: "fas fa-heartbeat",
      income: "fas fa-dollar-sign",
      other: "fas fa-question-circle",
    }
    return icons[category] || icons.other
  }

  editTransaction(id) {
    const transaction = this.transactions.find((t) => t.id === id)
    if (transaction) {
      // Populate form with transaction data
      document.getElementById("transactionType").value = transaction.type
      document.getElementById("transactionAmount").value = transaction.amount
      document.getElementById("transactionDescription").value = transaction.description
      document.getElementById("transactionCategory").value = transaction.category
      document.getElementById("transactionDate").value = transaction.date.toISOString().split("T")[0]

      // Store the ID for updating
      document.getElementById("addTransactionForm").dataset.editId = id

      this.showModal("addTransactionModal")
    }
  }

  deleteTransaction(id) {
    if (confirm("Are you sure you want to delete this transaction?")) {
      const transactionIndex = this.transactions.findIndex((t) => t.id === id)
      if (transactionIndex > -1) {
        const transaction = this.transactions[transactionIndex]

        // Update budget if it's an expense
        if (transaction.type === "expense") {
          const budget = this.budgets.find((b) => b.category === transaction.category)
          if (budget) {
            budget.spent -= transaction.amount
          }
        }

        this.transactions.splice(transactionIndex, 1)
        this.showToast("Success", "Transaction deleted successfully!", "success")

        // Refresh current view
        this.loadSectionData(this.currentSection)
      }
    }
  }

  editBudget(category) {
    const budget = this.budgets.find((b) => b.category === category)
    if (budget) {
      document.getElementById("budgetCategory").value = budget.category
      document.getElementById("budgetAmount").value = budget.budget

      // Store the category for updating
      document.getElementById("addBudgetForm").dataset.editCategory = category

      this.showModal("addBudgetModal")
    }
  }

  deleteBudget(category) {
    if (confirm("Are you sure you want to delete this budget?")) {
      const budgetIndex = this.budgets.findIndex((b) => b.category === category)
      if (budgetIndex > -1) {
        this.budgets.splice(budgetIndex, 1)
        this.showToast("Success", "Budget deleted successfully!", "success")
        this.loadBudgetData()
      }
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

  showCategoryDetails(category) {
    this.showSection("transactions")
    document.getElementById("categoryFilter").value = category
    this.applyFilters()
    this.showToast("Info", `Showing transactions for ${this.getCategoryName(category)}`, "info")
  }

  formatDate(date) {
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return "Today"
    } else if (diffDays === 2) {
      return "Yesterday"
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`
    } else {
      return date.toLocaleDateString()
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

// Export for potential module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = FinancialDashboard
}
