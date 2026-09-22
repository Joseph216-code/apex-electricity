const alertOverlay = document.getElementById("alert-overlay");
const alertTitle = document.getElementById("alert-title");
const alertMessage = document.getElementById("alert-message");
const alertButton = document.getElementById("alert-button");
const password = document.getElementById("password");
const showPassword = document.getElementById("show-password");
const loginForm = document.getElementById("login-form");

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

// Handle the login form
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const passwordValue = password.value;

  // Check if the fields are empty
  if (email === "" || passwordValue === "") {
    showAlert("Missing Information ⚠️", "Please fill in all fields.");
    return;
  }

  // DEBUG: Check what's in localStorage
  console.log("All localStorage items:", localStorage);
  console.log("powerWiseUser:", localStorage.getItem("powerWiseUser"));
  console.log("powerWiseLoggedIn:", localStorage.getItem("powerWiseLoggedIn"));

  // Get the saved user from localStorage
  const savedUser = localStorage.getItem("powerWiseUser");

  // Check if an account exists
  if (!savedUser) {
    showAlert(
      "No Account Found ❌",
      "Please create an account first. You will be redirected to the signup page.",
      function () {
        window.location.href = "NewLogin.html";
      },
    );
    return;
  }

  // Convert the saved text back into a JavaScript object
  let user;
  try {
    user = JSON.parse(savedUser);
    console.log("Parsed user data:", user);
  } catch (error) {
    showAlert("Error", "There was a problem with your account data.");
    console.error("Error parsing user data:", error);
    return;
  }

  // Check if the login details are correct
  if (email === user.email && passwordValue === user.password) {
    localStorage.setItem("powerWiseLoggedIn", "true");
    console.log("Login successful!");

    showAlert("Login Successful! ⚡", "Welcome to Apex.", function () {
      window.location.href = "Home.html";
    });
  } else {
    // Check if email exists but password is wrong
    if (email === user.email && passwordValue !== user.password) {
      showAlert("Login Failed ❌", "Invalid password. Please try again.");
    } else {
      showAlert(
        "Login Failed ❌",
        "Invalid email or password. Please try again.",
      );
    }
  }
});
