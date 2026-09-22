const alertOverlay = document.getElementById("alert-overlay");
const alertTitle = document.getElementById("alert-title");
const alertMessage = document.getElementById("alert-message");
const alertButton = document.getElementById("alert-button");
const forgotForm = document.getElementById("forgot-form");

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

// Handle the forgot password form
forgotForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();

  // Check if the field is empty
  if (email === "") {
    showAlert("Missing Information ⚠️", "Please enter your email address.");
    return;
  }

  // Check if the email exists in localStorage
  const savedUser = localStorage.getItem("powerWiseUser");

  if (!savedUser) {
    showAlert(
      "Account Not Found",
      "No account is associated with this email address. Please create an account first.",
    );
    return;
  }

  // Parse the saved user data
  let user;
  try {
    user = JSON.parse(savedUser);
  } catch (error) {
    showAlert("Error", "There was a problem with your account data.");
    console.error("Error parsing user data:", error);
    return;
  }

  // Check if the entered email matches the saved email
  if (email === user.email) {
    // In a real application, you would send a password reset email here.
    // For this demo, we'll just show a success message.
    showAlert(
      "Email Sent! 📧",
      "We've sent a password reset link to your email address.",
      function () {
        window.location.href = "Login.html";
      },
    );
  } else {
    showAlert(
      "Account Not Found",
      "No account is associated with this email address. Please create an account first.",
    );
  }
});
