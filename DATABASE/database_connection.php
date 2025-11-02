<?php
  $database_host = "localhost";
  $database_user = "root";
  $database_password = "";
  $db_name = "MealHaven";

  $database_connection = new mysqli($database_host, $database_user, $database_password, $db_name) or die ("Connection is un-available") ;

?>