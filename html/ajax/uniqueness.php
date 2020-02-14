<?php
  // This script checks the uniqueness of a field in the user database
  // It works only for the email and username fields.
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
  $field = $mysqli->escape_string($data->{'field'});
  if ($field == 'email')
    $fieldName = 'e-mail address';
  elseif ($field == 'username')
    $fieldName = $field;
  else
    error("Cannot check the uniqueness of the $field field.");
  $value = $mysqli->escape_string($data->{'value'});
  $result = $mysqli->query("SELECT $field FROM user WHERE $field=\"$value\"") or error($mysqli->error);
  $user = $result->fetch_assoc();
  $result->free();
  if ($user)
    error("This $fieldName is already registered.");
  else
    die('{"status": "OK"}');
 ?>
