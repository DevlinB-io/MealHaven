function checkLoginStatus() {
  fetch("../PHP/check_session.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.loggedIn) {
        showLoggedInUI(data.initials, data.firstName, data.lastName);
      } else {
        showLoggedOutUI();
      }
    })
    .catch((error) => {
      console.error("Session check failed:", error);
      showLoggedOutUI();
    });
}

function showLoggedInUI(initials, firstName, lastName) {
  document.getElementById("signupBtn").style.display = "none";
  document.getElementById("loginBtn").style.display = "none";

  const avatar = document.getElementById("profileBtn");
  avatar.textContent = initials;
  avatar.style.display = "block";

  document.getElementById("notifBtn").style.display = "block";

  const profileName = document.getElementById("profileName");
  const profileInitials = document.getElementById("profileInitials");
  if (profileName) profileName.textContent = `${firstName} ${lastName}`;
  if (profileInitials) profileInitials.textContent = initials;

  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document.getElementById("home").classList.add("active");
}

function showLoggedOutUI() {
  document.getElementById("signupBtn").style.display = "inline-block";
  document.getElementById("loginBtn").style.display = "inline-block";

  document.getElementById("profileBtn").style.display = "none";

  document.getElementById("notifBtn").style.display = "none";

  document
    .querySelectorAll(".view")
    .forEach((v) => v.classList.remove("active"));
  document.getElementById("home").classList.add("active");
}

function handleLogout() {
  window.location.href = "../PHP/logout.php";
}
document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
});
