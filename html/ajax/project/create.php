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
  $world_content = @file_get_contents($world_url);
  if ($world_content === false)
    error("Failed to fetch world file at $world_url");
  # retrieve the title from the WorldInfo node (assuming the default tabulation from a Webots saved world file)
  $n = strpos($world_content, "\nWorldInfo {\n");
  if ($n === false)
    error("Missing WorldInfo in $world world file");
  $n = strpos($world_content, "\n  title \"", $n);
  if ($n === false)
    error("Missing WorldInfo.title in $world world file");
  $n += 10;
  $m = strpos($world_content, "\"\n", $n);
  if ($m === false)
    error("Missing closing double quote for WorldInfo.title in $world world file");
  $title = substr($world_content, $n, $m - $n);
  $query = "INSERT INTO project(title, user, url, public) VALUES(\"$title\", $user[id], \"$url\", 0)";
  $mysqli->query($query) or error($mysqli->error);
  $answer = array();
  $answer['id'] = $mysqli->insert_id;
  $answer['title'] = $title;
  $answer['status'] = 'success';
  die(json_encode($answer));
 ?>
