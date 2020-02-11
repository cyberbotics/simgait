<?php
  // This script sets the initial password for a new user
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
  if (!filter_var($email, FILTER_VALIDATE_EMAIL))
    error('Wrong e-mail address.');
  $token = $mysqli->escape_string($data->{'token'});
  if (!preg_match('/^[0-9a-f]{32}$/',$token))
    error('Wrong token format.');
  $password = $mysqli->escape_string($data->{'password'});
  if (!preg_match('/^[0-9a-f]{64}$/',$password))
    error('Wrong password format.');
  $query = "SELECT enabled, token, password, updated + INTERVAL 72 HOUR AS expiration, NOW() AS `now` "
         . "FROM user WHERE email=\"$email\"";
  $result = $mysqli->query($query) or error($mysqli->error);
  $user = $result->fetch_assoc();
  $result->free();
  if (!$user)
    error('E-mail address not found.');
  if ($user['token'] == '')
    error('Account already activated.');
  if ($user['token'] != $token)
    error('Wrong token.');
  $expiration = strtotime($user['expiration']);
  $now = strtotime($user['now']);
  if ($expiration < $now)
    error('Expired token.');
  if ($user['password'] != '')
    error('Password already set.');
  $query = "UPDATE user SET password=\"$password\", token=\"\" WHERE email=\"$email\" AND token=\"$token\"";
  $mysqli->query($query) or error($mysqli->error);
  if ($mysqli->affected_rows != 1)
    error('Cannot set password.');
  die("{\"enabled\": \"$user[enabled]\"}");
 ?>
