// =============================================
// SHARED NOTIFICATION SYSTEM
// =============================================

// Get all notifications from localStorage
function getNotifications() {
  const savedNotifications = localStorage.getItem("powerWiseNotifications");
  return savedNotifications ? JSON.parse(savedNotifications) : [];
}

// Save notifications to localStorage
function saveNotifications(notifications) {
  localStorage.setItem("powerWiseNotifications", JSON.stringify(notifications));
}

// Add a new notification
function addNotification(title, message, type = "system", icon = "🔔") {
  const notifications = getNotifications();

  const notification = {
    id: Date.now(),
    title: title,
    message: message,
    type: type, // 'deposit', 'purchase', 'budget', 'budget_warning', 'budget_exceeded', 'system'
    icon: icon,
    date: new Date().toISOString(),
    read: false, // NEW: Track if notification has been read
  };

  notifications.unshift(notification); // Add to beginning (newest first)
  saveNotifications(notifications);

  // Also trigger a storage event for other tabs
  try {
    localStorage.setItem(
      "powerWiseNotifications_trigger",
      Date.now().toString(),
    );
  } catch (e) {
    // Ignore
  }

  // Console log for debugging
  console.log("✅ Notification added:", notification);

  // Update badge on all pages
  updateNotificationBadge();

  return notification;
}

// Clear all notifications
function clearAllNotifications() {
  localStorage.removeItem("powerWiseNotifications");
  updateNotificationBadge();
}

// Get unread count
function getUnreadCount() {
  const notifications = getNotifications();
  return notifications.filter(function (n) {
    return !n.read;
  }).length;
}

// Mark all as read
function markAllAsRead() {
  const notifications = getNotifications();
  notifications.forEach(function (n) {
    n.read = true;
  });
  saveNotifications(notifications);
  updateNotificationBadge();
}

// Mark a single notification as read
function markNotificationAsRead(notificationId) {
  const notifications = getNotifications();
  const found = notifications.find(function (n) {
    return n.id === notificationId;
  });
  if (found) {
    found.read = true;
    saveNotifications(notifications);
    updateNotificationBadge();
  }
}

// Update the notification badge on the page
function updateNotificationBadge() {
  const unreadCount = getUnreadCount();
  const badge = document.getElementById("notification-badge");
  const icon = document.querySelector(".notification-btn");

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }

  // Also update the bell icon if it doesn't have a badge element
  if (icon) {
    if (unreadCount > 0) {
      icon.style.position = "relative";
    }
  }
}

// Make functions available globally
window.getNotifications = getNotifications;
window.saveNotifications = saveNotifications;
window.addNotification = addNotification;
window.clearAllNotifications = clearAllNotifications;
window.getUnreadCount = getUnreadCount;
window.markAllAsRead = markAllAsRead;
window.markNotificationAsRead = markNotificationAsRead;
window.updateNotificationBadge = updateNotificationBadge;

console.log("✅ Notification system loaded successfully!");
