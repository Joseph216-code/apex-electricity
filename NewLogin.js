const alertOverlay = document.getElementById("alert-overlay");
const alertTitle = document.getElementById("alert-title");
const alertMessage = document.getElementById("alert-message");
const alertButton = document.getElementById("alert-button");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");
const showPassword = document.getElementById("show-password");
const signupForm = document.getElementById("signup-form");

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

// Clear all data belonging to the previous user
function clearPreviousUserData() {
  const userDataKeys = [
    "powerWiseBalance",
    "powerWiseMeters",
    "powerWiseTransactions",
    "powerWiseBudget",
    "powerWiseBudgetHistory",
    "powerWiseBudgetStatus",
    "powerWiseNotifications",
    "powerWiseNotifications_trigger",
    "powerWiseChartData",
  ];

  userDataKeys.forEach(function (key) {
    localStorage.removeItem(key);
  });
}

// Show or hide the password
showPassword.addEventListener("click", function () {
  if (password.type === "password") {
    password.type = "text";
    showPassword.textContent = "🙈";
  } else {
    password.type = "password";
    showPassword.textContent = "👁️";
  }
});

// Handle the signup form
signupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const passwordValue = password.value;
  const confirmPasswordValue = confirmPassword.value;

  // Check that all fields are filled
  if (
    fullname === "" ||
    email === "" ||
    passwordValue === "" ||
    confirmPasswordValue === ""
  ) {
    showAlert("Missing Information ⚠️", "Please fill in all fields.");
    return;
  }

  // Check if both passwords match
  if (passwordValue !== confirmPasswordValue) {
    showAlert(
      "Passwords Don't Match ❌",
      "Please make sure both passwords are the same.",
    );
    return;
  }

  // Clear the previous user's information
  clearPreviousUserData();

  // Create the new user
  const newUser = {
    fullname: fullname,
    email: email,
    password: passwordValue,
  };

  // Save the new user's information
  localStorage.setItem("powerWiseUser", JSON.stringify(newUser));

  // Log in the new user
  localStorage.setItem("powerWiseLoggedIn", "true");

  showAlert(
    "Account Created! ⚡",
    "Your new account has been created successfully!",
    function () {
      window.location.href = "Home.html";
    },
  );
});
