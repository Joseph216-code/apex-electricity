// Get the saved user information from localStorage
const savedUser = localStorage.getItem("powerWiseUser");

// Check if a user account exists
if (savedUser) {
  // Convert the saved information back into a JavaScript object
  const user = JSON.parse(savedUser);

  // Get the user's first name
  const firstName = user.fullname.split(" ")[0];

  // Display the user's name on the home page
  document.getElementById("user-name").textContent = firstName;
}

// Get all saved meters from localStorage
const savedMeters = localStorage.getItem("powerWiseMeters");

// Convert the saved meters into an array
const meters = savedMeters ? JSON.parse(savedMeters) : [];

// Get the Meters Saved display
const metersCount = document.getElementById("meter-count");

// Display the number of saved meters
metersCount.textContent = meters.length;

// Get all the hide and reveal buttons
const toggleButtons = document.querySelectorAll(".toggle-balance");

// Add a click event to each button
toggleButtons.forEach(function (button) {
  button.addEventListener("click", function (event) {
    // Stop the click from bubbling up (prevents navigating to the link)
    event.stopPropagation();
    event.preventDefault();

    // Get the ID of the amount this button controls
    const targetId = button.dataset.target;
    const amountElement = document.getElementById(targetId);

    if (!amountElement) return;

    // Check whether the amount is currently hidden
    if (amountElement.dataset.hidden === "true") {
      // Show the real amount - use the stored value
      const storedAmount = amountElement.dataset.amount;
      amountElement.textContent = storedAmount;
      amountElement.dataset.hidden = "false";
      button.textContent = "👁️";
    } else {
      // Save the real amount before hiding it
      const currentText = amountElement.textContent;
      amountElement.dataset.amount = currentText;

      // Hide the amount
      amountElement.textContent = "••••••";
      amountElement.dataset.hidden = "true";
      button.textContent = "🙈";
    }
  });
});

// Get the saved balance from localStorage
const savedBalance = localStorage.getItem("powerWiseBalance");

// Convert the saved balance into a number or use zero
const balance = savedBalance ? Number(savedBalance) : 0;

// Get the Available Balance display
const walletBalance = document.getElementById("wallet-balance");

// Display the user's available balance
const formattedBalance = `₦${balance.toLocaleString()}.00`;
walletBalance.textContent = formattedBalance;
walletBalance.dataset.amount = formattedBalance;
walletBalance.dataset.hidden = "false";

// =============================================
// CALCULATE AND DISPLAY TOTAL SPENT
// =============================================

// Get transactions from localStorage
function getTransactions() {
  const savedTransactions = localStorage.getItem("powerWiseTransactions");
  return savedTransactions ? JSON.parse(savedTransactions) : [];
}

// Calculate total spent
function calculateTotalSpent() {
  const transactions = getTransactions();
  const total = transactions.reduce(function (sum, transaction) {
    return sum + Number(transaction.amount);
  }, 0);
  return total;
}

// Update the total spent display
function updateTotalSpent() {
  const totalSpentElement = document.getElementById("total-spent");
  const total = calculateTotalSpent();
  const formattedTotal = `₦${total.toLocaleString()}`;

  // Store the formatted value as data attribute for toggle
  totalSpentElement.dataset.amount = formattedTotal;
  totalSpentElement.textContent = formattedTotal;
  totalSpentElement.dataset.hidden = "false";

  return total;
}

// Call updateTotalSpent on page load
updateTotalSpent();

// =============================================
// BUDGET NOTIFICATION FUNCTION
// =============================================
function addBudgetNotification(amount) {
  try {
    if (typeof window.addNotification === "function") {
      window.addNotification(
        "📊 Budget Set",
        `Your monthly electricity budget has been set to ₦${amount.toLocaleString()}.`,
        "budget",
        "📊",
      );
    }
  } catch (error) {
    console.log("Notification system not available:", error);
  }
}

// =============================================
// UPDATE TOTAL SPENT WHEN TRANSACTIONS CHANGE
// =============================================

// Listen for storage changes (if transactions are updated from another tab)
window.addEventListener("storage", function (event) {
  if (event.key === "powerWiseTransactions") {
    updateTotalSpent();
  }
});

// Also update when the page becomes visible again (user returns to tab)
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    updateTotalSpent();
  }
});

// Add this to the top of Home.js or at the end

// =============================================
// NOTIFICATION BADGE - Auto Update
// =============================================

// Update badge when page loads
document.addEventListener("DOMContentLoaded", function () {
  updateNotificationBadge();
});

// Listen for storage changes (notifications added from other tabs/pages)
window.addEventListener("storage", function (event) {
  if (
    event.key === "powerWiseNotifications" ||
    event.key === "powerWiseNotifications_trigger"
  ) {
    updateNotificationBadge();
  }
});

// Also update when page becomes visible again
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    updateNotificationBadge();
  }
});
