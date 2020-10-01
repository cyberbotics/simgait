<?php
  // This script update the public status of a project
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
  $project_id = intval($data->{'project'});
  $public = intval($data->{'public'});
  $result = $mysqli->query("SELECT id, password FROM user WHERE email=\"$email\"") or error($mysqli->error);
  $user = $result->fetch_assoc();
  $result->free();
  if (!$user)
    error("Wrong e-mail");
  if ($user['password'] != $password)
    error('Wrong password');
  $mysqli->query("UPDATE project SET public=$public WHERE user=$user[id] AND id=$project_id");
  if ($mysqli->affected_rows == 0)
    error("Could not update project $project_id");
  die('{"status": "success"}');
 ?>
