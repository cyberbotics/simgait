<?php
  // This script initializes a new project
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  header('Content-Type: application/json');
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  require '../../../php/database.php';
  require '../../../php/simulation.php';
  $mysqli =  new mysqli($database_host, $database_username, $database_password, $database_name);
  if (!$mysqli)
    error("Can't connect to MySQL database: $mysqli->error");
  $mysqli->set_charset('utf8');
  $email = $mysqli->escape_string($data->{'email'});
  $password = $mysqli->escape_string($data->{'password'});
  $url = $mysqli->escape_string($data->{'url'});
  if ($email && $password) {
    $result = $mysqli->query("SELECT id, password FROM user WHERE email=\"$email\"") or error($mysqli->error);
    $user = $result->fetch_assoc();
    $result->free();
    if (!$user)
      error('This e-mail address is not registered.');
    if ($user['password'] != $password)
      error('The password you entered is wrong.');
  } else
    error('You need to be authenticated to create a new project.');
  $check_url = simulation_check_url($url);
  if (!is_array($check_url))
    error($check_url);
  list($username, $repository, $tag_or_branch, $folder, $world) = $check_url;
  $world_url = "https://raw.githubusercontent.com/$username/$repository/$tag_or_branch" . "$folder/worlds/$world";
  $world = @file_get_contents($world_url);
  if ($world === false)
    error("Failed to fetch world file at $world_url");
  # retrieve the title from the WorldInfo node (assuming the default tabulation from a Webots saved world file)
  $n = strpos($world, "\nWorldInfo {\n");
  if ($n === false)
    error("Missing WorldInfo in $default world file");
  $n = strpos($world, "\n  title \"", $n);
  if ($n === false)
    error("Missing WorldInfo.title in $default world file");
  $n += 10;
  $m = strpos($world, "\"\n", $n);
  if ($m === false)
    error("Missing closing double quote for WorldInfo.title in $default world file");
  $title = substr($world, $n, $m - $n);
  $query = "INSERT INTO project(title, user, url, public) VALUES(\"$title\", $user[id], \"$url\", 0)";
  $mysqli->query($query) or error($mysqli->error);
  $answer = array();
  $answer['id'] = $mysqli->insert_id;
  $answer['title'] = $title;
  $answer['status'] = 'success';
  die(json_encode($answer));
 ?>
