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
  list($username, $repository, $tag_or_branch, $folder) = $check_url;
  $project_json_url = "https://raw.githubusercontent.com/$username/$repository/$tag_or_branch" . "$folder/project.json";
  $project_json = @file_get_contents($project_json_url);
  if ($project_json === false) {  # if the project.json file is not here, try to get the first world file (alphabetic order)
    $options = array('http'=>array('method'=>'GET', 'header'=>"User-Agent: PHP/file_get_contents\r\n"));
    $context = stream_context_create($options);
    $worlds_json_url = "https://api.github.com/repos/$username/$repository/contents$folder/worlds?ref=$tag_or_branch";
    $worlds_json = @file_get_contents($worlds_json_url, false, $context);
    if ($worlds_json === false)
      error("No worlds directory found in $url");
    $worlds = json_decode($worlds_json);
    $files = array();
    foreach($worlds as $world) {
      if ($world->{'type'} === 'file') {
        $name = $world->{'name'};
        if (substr($name, -4) == '.wbt')
          array_push($files, $name);
      }
    }
    if (count($files) == 0)
      error("No world file found in this project folder");
    sort($files);
    $default = $files[0];
  } else {
    $project = json_decode($project_json);
    if ($project === null)
      error("Cannot decode JSON data from $world_json_url: " . json_last_error());
    if (!property_exists($project, 'default'))
      error("Missing default property in $project");
    $default = $project->{'default'};
  }
  $world_url = "https://raw.githubusercontent.com/$username/$repository/$tag_or_branch" . "$folder/worlds/$default";
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
  $answer['default'] = $default;
  $answer['title'] = $title;
  $answer['status'] = 'success';
  die(json_encode($answer));
 ?>
