<?php
  // This script deletes a user account and all its related data
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  header('Content-Type: application/json');
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  require '../../../php/database.php';
  $mysqli =  new mysqli($database_host, $database_username, $database_password, $database_name);
  if (!$mysqli)
    error("Can't connect to MySQL database: $mysqli->error");
  $mysqli->set_charset('utf8');
  $email = $mysqli->escape_string($data->{'email'});
  $password = $mysqli->escape_string($data->{'password'});
  $result = $mysqli->query("SELECT id, password FROM user WHERE email=\"$email\"") or error($mysqli->error);
  $user = $result->fetch_assoc();
  $result->free();
  if (!$user)
    error('Wrong e-mail');
  if ($user['password'] != $password)
    error('Wrong password');
  $mysqli->query("DELETE FROM user WHERE id=$user[id]");
  $mysqli->query("DELETE FROM request WHERE user=$user[id]");
  $mysqli->query("DELETE FROM project WHERE user=$user[id]");
  die('{"status": "success"}');
 ?>
