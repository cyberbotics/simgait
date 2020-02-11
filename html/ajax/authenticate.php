<?php
  // This script authenticates a user from its email and password (hashed)
  // It returns user data: username, category, enabled
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  header('Content-Type: application/json');
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  require '../../php/database.php';
  $mysqli =  new mysqli($database_host, $database_username, $database_password, $database_name);
  if (!$mysqli)
    error("Can't connect to MySQL database: $mysqli->error");
  $mysqli->set_charset('utf8');
  $email = $mysqli->escape_string($data->{'email'});
  $password = $mysqli->escape_string($data->{'password'});
  $query = "SELECT username, category, enabled, password FROM user WHERE email=\"$email\"";
  $result = $mysqli->query($query) or error($mysqli->error);
  $user = $result->fetch_assoc();
  $result->free();
  if (!$user)
    error("This e-mail address is not registered.");
  if ($user['password'] != $password)
    error("The password you entered is wrong.");
  die("{\"username\": \"$user[username]\", \"category\": \"$user[category]\", \"enabled\": \"$user[enabled]\"}");
 ?>
