window.addEventListener("load", function () {
  console.log("Splash script loaded.");

  setTimeout(function () {
    const splashScreen = document.getElementById("splashScreen");
    if (!splashScreen) {
      console.error("No splash screen found.");
      return;
    }

    splashScreen.style.opacity = "0";

    setTimeout(function () {
      console.log("Redirecting to main page...");
      window.location.href = "../HTML/login.html";
    }, 800);
  }, 2500);
});
