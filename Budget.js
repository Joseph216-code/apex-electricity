// Get elements
const budgetForm = document.getElementById("budget-form");
const budgetAmountInput = document.getElementById("budget-amount-input");
const budgetAmountDisplay = document.getElementById("budget-amount");
const budgetStatus = document.getElementById("budget-status");
const budgetProgress = document.getElementById("budget-progress");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const remainingText = document.getElementById("remaining-text");
const percentageText = document.getElementById("percentage-text");
const setBudgetBtn = document.getElementById("set-budget-btn");
const budgetHistoryList = document.getElementById("budget-history-list");

// Alert elements
const alertOverlay = document.getElementById("alert-overlay");
const alertTitle = document.getElementById("alert-title");
const alertMessage = document.getElementById("alert-message");
const alertButton = document.getElementById("alert-button");

// Show a custom alert box
function showAlert(title, message, callback) {
  alertTitle.textContent = title;
  alertMessage.textContent = message;
  alertOverlay.classList.add("show");

  alertButton.onclick = function () {
    alertOverlay.classList.remove("show");
    if (callback) {
      callback();
    }
  };
}

// Get current month's budget
function getBudget() {
  const savedBudget = localStorage.getItem("powerWiseBudget");
  return savedBudget ? Number(savedBudget) : 0;
}

// Get budget status (active/disabled)
function getBudgetStatus() {
  const status = localStorage.getItem("powerWiseBudgetStatus");
  return status || "active"; // 'active' or 'disabled'
}

// Set budget status
function setBudgetStatus(status) {
  localStorage.setItem("powerWiseBudgetStatus", status);
}

// Get budget history
function getBudgetHistory() {
  const savedHistory = localStorage.getItem("powerWiseBudgetHistory");
  return savedHistory ? JSON.parse(savedHistory) : [];
}

// Save budget history
function saveBudgetHistory(history) {
  localStorage.setItem("powerWiseBudgetHistory", JSON.stringify(history));
}

// Get current month's spending
function getCurrentMonthSpending() {
  const transactions = getTransactions();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return transactions
    .filter(function (t) {
      const date = new Date(t.date);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    })
    .reduce(function (sum, t) {
      return sum + Number(t.amount);
    }, 0);
}

// Get transactions
function getTransactions() {
  const savedTransactions = localStorage.getItem("powerWiseTransactions");
  return savedTransactions ? JSON.parse(savedTransactions) : [];
}

// Check budget status and send notifications
function checkBudgetStatus(budget, spent) {
  if (budget === 0) return;

  const percentage = (spent / budget) * 100;
  const notifications = getNotifications();

  // Check if already notified at 80%
  if (percentage >= 80 && percentage < 100) {
    const alreadyNotified = notifications.some(function (n) {
      return n.type === "budget_warning" && n.title.includes("80%");
    });
    if (!alreadyNotified) {
      addNotification(
        "⚠️ Budget Warning",
        `You've used ${Math.round(percentage)}% of your monthly electricity budget (₦${budget.toLocaleString()}). Please monitor your usage.`,
        "budget_warning",
        "⚠️",
      );
    }
  }

  // Check if budget is exceeded
  if (percentage >= 100) {
    const alreadyNotified = notifications.some(function (n) {
      return n.type === "budget_exceeded";
    });
    if (!alreadyNotified) {
      addNotification(
        "🚨 Budget Exceeded!",
        `You have exceeded your monthly electricity budget of ₦${budget.toLocaleString()}. Current spending: ₦${spent.toLocaleString()}.`,
        "budget_exceeded",
        "🚨",
      );
    }
  }
}

// Get notifications
function getNotifications() {
  const saved = localStorage.getItem("powerWiseNotifications");
  return saved ? JSON.parse(saved) : [];
}

// Add notification
function addNotification(title, message, type = "system", icon = "🔔") {
  const notifications = getNotifications();
  notifications.unshift({
    id: Date.now(),
    title: title,
    message: message,
    type: type,
    icon: icon,
    date: new Date().toISOString(),
    read: false,
  });
  localStorage.setItem("powerWiseNotifications", JSON.stringify(notifications));
}

// Disable/Remove budget
function disableBudget() {
  const budget = getBudget();
  if (budget === 0) {
    showAlert("No Budget ⚠️", "You don't have an active budget to disable.");
    return;
  }

  showAlert(
    "Disable Budget? ⚠️",
    `Are you sure you want to disable your monthly budget of ₦${budget.toLocaleString()}? You can set a new one anytime.`,
    function () {
      // Save current budget to history before disabling
      const history = getBudgetHistory();
      history.unshift({
        amount: budget,
        date: new Date().toISOString(),
        action: "disabled",
      });
      saveBudgetHistory(history);

      // Remove the budget
      localStorage.removeItem("powerWiseBudget");
      setBudgetStatus("disabled");

      // Add notification
      addNotification(
        "📊 Budget Disabled",
        `Your monthly electricity budget of ₦${budget.toLocaleString()} has been disabled.`,
        "budget",
        "📊",
      );

      // Update display
      updateBudgetDisplay();

      showAlert(
        "Budget Disabled! 📊",
        `Your budget of ₦${budget.toLocaleString()} has been disabled. You can set a new budget anytime.`,
      );
    },
  );
}

// Update budget display
function updateBudgetDisplay() {
  const budget = getBudget();
  const spent = getCurrentMonthSpending();
  const status = getBudgetStatus();

  // Update amount display
  if (budget > 0 && status === "active") {
    budgetAmountDisplay.textContent = `₦${budget.toLocaleString()}`;
    budgetStatus.innerHTML = `<span class="status-badge active">✅ Active</span>`;
    budgetProgress.style.display = "block";

    const percentage = Math.min((spent / budget) * 100, 100);
    progressBar.style.width = percentage + "%";

    // Change color based on usage
    progressBar.classList.remove("warning", "danger");
    if (percentage >= 90) {
      progressBar.classList.add("danger");
    } else if (percentage >= 70) {
      progressBar.classList.add("warning");
    }

    progressText.textContent = `₦${spent.toLocaleString()} / ₦${budget.toLocaleString()}`;
    const remaining = Math.max(0, budget - spent);
    remainingText.textContent = `Remaining: ₦${remaining.toLocaleString()}`;
    percentageText.textContent = Math.round(percentage) + "% used";

    // Check budget status and send notifications
    checkBudgetStatus(budget, spent);

    // Update button text
    setBudgetBtn.textContent = "Update Budget ✏️";
    setBudgetBtn.classList.add("update");

    // Pre-fill input with current budget
    budgetAmountInput.value = budget;

    // Show disable button
    showDisableButton(true);
  } else if (budget > 0 && status === "disabled") {
    // Budget exists but is disabled
    budgetAmountDisplay.textContent = `₦${budget.toLocaleString()}`;
    budgetStatus.innerHTML = `<span class="status-badge" style="background-color: #fee2e2; color: #dc2626;">⛔ Disabled</span>`;
    budgetProgress.style.display = "none";
    setBudgetBtn.textContent = "Reactivate Budget 🔄";
    setBudgetBtn.classList.add("update");
    budgetAmountInput.value = budget;
    showDisableButton(false);
  } else {
    // No budget set
    budgetAmountDisplay.textContent = "₦0.00";
    budgetStatus.innerHTML = `<span class="status-badge not-set">Not Set</span>`;
    budgetProgress.style.display = "none";
    setBudgetBtn.textContent = "Set Budget 💰";
    setBudgetBtn.classList.remove("update");
    showDisableButton(false);
  }

  // Render budget history
  renderBudgetHistory();
}

// Show/hide disable button
function showDisableButton(show) {
  let disableBtn = document.getElementById("disable-budget-btn");

  if (show) {
    if (!disableBtn) {
      disableBtn = document.createElement("button");
      disableBtn.id = "disable-budget-btn";
      disableBtn.className = "disable-budget-btn";
      disableBtn.textContent = "⛔ Disable Budget";
      disableBtn.type = "button";

      // Insert after the form
      const budgetForm = document.getElementById("budget-form");
      budgetForm.parentNode.insertBefore(disableBtn, budgetForm.nextSibling);

      disableBtn.addEventListener("click", disableBudget);
    }
    disableBtn.style.display = "block";
  } else {
    if (disableBtn) {
      disableBtn.style.display = "none";
    }
  }
}

// Render budget history
function renderBudgetHistory() {
  const history = getBudgetHistory();
  const budgetHistoryList = document.getElementById("budget-history-list");

  if (history.length === 0) {
    budgetHistoryList.innerHTML = `
      <div class="history-empty">
        <span style="font-size: 30px; display: block; margin-bottom: 10px;">📋</span>
        No budget history yet. Set your first budget!
      </div>
    `;
    return;
  }

  budgetHistoryList.innerHTML = "";
  // Show all history entries (not just 5)
  history.forEach(function (record) {
    const item = document.createElement("div");
    item.className = "history-item";

    const date = new Date(record.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const isDisabled = record.action === "disabled";
    const actionLabel = isDisabled ? "⛔ Disabled" : "✅ Set";
    const actionColor = isDisabled ? "#dc2626" : "#16a34a";

    item.innerHTML = `
      <div class="history-info">
        <div style="font-weight: bold; color: #2d0a4a;">
          Monthly Budget ${actionLabel}
        </div>
        <div class="history-date">${date}</div>
      </div>
      <div class="history-amount" style="display: flex; flex-direction: column; align-items: flex-end;">
        <span style="color: ${actionColor}; font-weight: bold;">₦${Number(record.amount).toLocaleString()}</span>
        <span style="font-size: 10px; color: ${actionColor};">
          ${isDisabled ? "⛔ Disabled" : "✅ Active"}
        </span>
      </div>
    `;

    budgetHistoryList.appendChild(item);
  });
}

// Handle budget form submission
budgetForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const amount = Number(budgetAmountInput.value);
  const currentStatus = getBudgetStatus();

  if (isNaN(amount) || amount <= 0) {
    showAlert("Invalid Amount ⚠️", "Please enter a valid budget amount.");
    return;
  }

  if (amount < 100) {
    showAlert("Minimum Amount ⚠️", "Budget must be at least ₦100.");
    return;
  }

  // If budget was disabled, we're reactivating it
  if (currentStatus === "disabled") {
    // Save reactivation to history
    const history = getBudgetHistory();
    history.unshift({
      amount: amount,
      date: new Date().toISOString(),
      action: "reactivated",
    });
    saveBudgetHistory(history);

    // Set status to active
    setBudgetStatus("active");

    addNotification(
      "📊 Budget Reactivated",
      `Your monthly electricity budget has been reactivated at ₦${amount.toLocaleString()}.`,
      "budget",
      "📊",
    );

    showAlert(
      "Budget Reactivated! 🔄",
      `Your budget has been reactivated at ₦${amount.toLocaleString()}.`,
    );
  } else {
    // Save current budget to history before updating
    const currentBudget = getBudget();
    if (currentBudget > 0 && currentStatus === "active") {
      const history = getBudgetHistory();
      history.unshift({
        amount: currentBudget,
        date: new Date().toISOString(),
        action: "updated",
      });
      saveBudgetHistory(history);
    }

    // Save new budget
    localStorage.setItem("powerWiseBudget", amount);
    setBudgetStatus("active");

    // Add notification
    addNotification(
      "📊 Budget Set",
      `Your monthly electricity budget has been set to ₦${amount.toLocaleString()}.`,
      "budget",
      "📊",
    );

    showAlert(
      "Budget Saved! 💰",
      `Your monthly electricity budget has been set to ₦${amount.toLocaleString()}.`,
    );
  }

  // Update display
  updateBudgetDisplay();
  budgetAmountInput.value = "";
});

// Quick amount buttons
document.querySelectorAll(".quick-amount").forEach(function (button) {
  button.addEventListener("click", function () {
    const amount = Number(this.dataset.amount);
    budgetAmountInput.value = amount;
    budgetAmountInput.focus();
  });
});

// =============================================
// UPDATE BUDGET WHEN TRANSACTIONS CHANGE
// =============================================

// Listen for storage changes
window.addEventListener("storage", function (event) {
  if (event.key === "powerWiseTransactions") {
    updateBudgetDisplay();
  }
  if (event.key === "powerWiseBudget") {
    updateBudgetDisplay();
  }
  if (event.key === "powerWiseBudgetStatus") {
    updateBudgetDisplay();
  }
});

// Update when page becomes visible
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    updateBudgetDisplay();
  }
});

// Initial load
updateBudgetDisplay();
