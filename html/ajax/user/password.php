<?php
  // This script sets the initial password for a new user
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
  $id = intval($data->{'id'});
  $token = $mysqli->escape_string($data->{'token'});
  if (!preg_match('/^[0-9a-f]{32}$/',$token))
    error('Wrong token format.');
  $password = $mysqli->escape_string($data->{'password'});
  if (!preg_match('/^[0-9a-f]{64}$/',$password))
    error('Wrong password format.');
  $mysqli->query("DELETE FROM request WHERE updated < NOW() - INTERVAL 72 HOUR");
  $result = $mysqli->query("SELECT user, type, token FROM request WHERE id=$id") or error($mysqli->error);
  $request = $result->fetch_assoc();
  $result->free();
  if (!$request)
    error('Token not found.');
  $mysqli->query("DELETE FROM request WHERE id=$id") or die($mysqli->error);
  if ($request['token'] != $token)
    error("Wrong token: $request[token] != $token");
  $mysqli->query("UPDATE user SET password=\"$password\" WHERE id=$request[user]") or error($mysqli->error);
  $result = $mysqli->query("SELECT enabled FROM user WHERE id=$request[user]") or error($mysqli->error);
  $user = $result->fetch_assoc();
  $result->free();
  if (!$user)
    error('Cannot find user.');
  die("{\"type\": \"$request[type]\", \"enabled\": \"$user[enabled]\"}");
 ?>
