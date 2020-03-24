<?php
  // This script provides information for a user page
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
  $username = $mysqli->escape_string($data->{'username'});
  $answer = array();
  if ($email && $password) {
    $result = $mysqli->query("SELECT id, password FROM user WHERE email=\"$email\"") or error($mysqli->error);
    $user = $result->fetch_assoc();
    $result->free();
    if (!$user)
      error("This e-mail address is not registered.");
    if ($user['password'] != $password)
      error("The password you entered is wrong.");
    $answer['self'] = true;
  } else
    $answer['self'] = false;
  $result = $mysqli->query("SELECT id FROM user where username=\"$username\"") or error($mysqli->error);
  $user = $result->fetch_assoc();
  $result->free();
  if (!$user)
    error("No such user: $username");
  $query = "SELECT id, title, url, branch, public FROM project WHERE user = $user[id]";
  if ($answer['self'] === false)
    $query .= " AND public = 1";
  $result = $mysqli->query($query) or error($mysqli->error);
  if ($result->num_rows) {
    $answer['projects'] = array();
    while ($project = $result->fetch_assoc())
      array_push($answer['projects'], $project);
  }
  $result->free();
  $answer['status'] = 'success';
  die(json_encode($answer));
 ?>
