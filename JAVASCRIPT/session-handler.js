// check if user is logged in
function checkLoginStatus() {
  fetch('php/check_session.php')
    .then(response => response.json())
    .then(data => {
      if (data.loggedIn) {
        // show logged in UI
        showLoggedInUI(data.initials, data.firstName, data.lastName);
      } else {
        // show logged out UI
        showLoggedOutUI();
      }
    })
    .catch(error => {
      console.error('Session check failed:', error);
      showLoggedOutUI();
    });
}

// show logged in UI
function showLoggedInUI(initials, firstName, lastName) {
  // hide auth buttons
  document.getElementById('signupBtn').style.display = 'none';
  document.getElementById('loginBtn').style.display = 'none';
  
  // show avatar
  const avatar = document.getElementById('profileBtn');
  avatar.textContent = initials;
  avatar.style.display = 'block';
  
  // show notifications
  document.getElementById('notifBtn').style.display = 'block';
  
// update profile details
const profileName = document.getElementById('profileName');
const profileInitials = document.getElementById('profileInitials');
if (profileName) profileName.textContent = `${firstName} ${lastName}`;
if (profileInitials) profileInitials.textContent = initials;

// show home view
document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
document.getElementById('home').classList.add('active');
}

// show logged out UI
function showLoggedOutUI() {
  // show auth buttons
  document.getElementById('signupBtn').style.display = 'inline-block';
  document.getElementById('loginBtn').style.display = 'inline-block';
  
  // hide avatar
  document.getElementById('profileBtn').style.display = 'none';
  
  // hide notifications
  document.getElementById('notifBtn').style.display = 'none';

  // show home view
document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
document.getElementById('home').classList.add('active');

}

// logout user
function handleLogout() {
  // go to logout script
  window.location.href = 'php/logout.php';
}

// run on page load
document.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  
  // attach logout handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});
