<?php
  // This script deletes a user account and all its related data
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
  $project_id = intval($data->{'project'});
  $result = $mysqli->query("SELECT id, password FROM user WHERE email=\"$email\"") or error($mysqli->error);
  $user = $result->fetch_assoc();
  $result->free();
  if (!$user)
    error("Wrong e-mail");
  if ($user['password'] != $password)
    error('Wrong password');
  $mysqli->query("DELETE FROM project WHERE user=$user[id] AND id=$project_id");
  if ($mysqli->affected_rows == 0)
    error("Could not delete project $project_id");
  die('{"status": "success"}');
 ?>
