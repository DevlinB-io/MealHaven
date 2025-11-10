window.addEventListener("load", function () {
  console.log("Splash script loaded.");

  // Wait for 2.5 seconds before fading out
  setTimeout(function () {
    const splashScreen = document.getElementById("splashScreen");
    if (!splashScreen) {
      console.error("No splash screen found.");
      return;
    }

    // Fade out the splash screen
    splashScreen.style.opacity = "0";

    // After the fade completes, redirect to your main page
    setTimeout(function () {
      console.log("Redirecting to main page...");
      window.location.href = "../HTML/login.html"; // change to your target page
    }, 800); // matches the CSS transition (0.8s)
  }, 2500); // splash stays for 2.5 seconds
});
