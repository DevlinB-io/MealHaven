<?php
require_once "../DATABASE/database_table_scrips.php";
?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MealHaven</title>
  <link rel="stylesheet" href="../CSS/index.css" />
</head>

<body>
  <div class="splash-screen" id="splashScreen">
    <div class="logo-container">
      <div class="logo">
        <img src="../IMAGES/logo.png" alt="MealHaven logo" class="logo-img" />
      </div>
    </div>

    <div class="loading-container">
      <div class="loading-bar"></div>
    </div>

    <div class="loading-text">Loading<span class="dots"></span></div>
  </div>

  <script src="../JAVASCRIPT/index.js"></script>
</body>

</html>