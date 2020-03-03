<?php
  // This script initializes a new project
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
  $repository = $mysqli->escape_string($data->{'repository'});
  $folder = $mysqli->escape_string($data->{'folder'});
  $tag = $mysqli->escape_string($data->{'tag'});
  $branch = $mysqli->escape_string($data->{'branch'});
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
  if (substr($repository, 0, 19) !== 'https://github.com/')
    error('The repository should start with https://github.com/');
  $exploded = explode('/', substr($repository, 19));
  if (count($exploded) != 2)
    error('Wrong GitHub URL');
  $username = $exploded[0];
  $repository_name = $exploded[1];
  if (!preg_match('/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i', $username))
    error('Wrong GitHub username');
  if (!preg_match('/^[a-z\d_.-]{1,100}$/i', $repository_name))
    error('Wrong GitHub repository name');
  if ($folder !=='' and
      (!preg_match('/^[a-z\d_.-\/]{1,100}$/i', $folder)  # no fancy folder name
       or substr($folder, 0, 1) === '/'                  # doesn't start with slash
       or strstr($folder, '//')                          # no double slashes
       or substr($folder, -1) === '/'))                  # doesn't end with slash
    error('Wrong folder name');
  if (!preg_match('/^[a-z\d_.-]{0,100}$/i', $tag))
    error('Wrong GitHub tag');
  if (!preg_match('/^[a-z\d_.-]{0,100}$/i', $branch))
    error('Wrong GitHub branch');
  if ($branch === '' and $tag === '')
    error('A branch or a tag should be specified');
  if ($branch !== '' and $tag !== '')
    error('Either a branch or a tag should be specified, but not both');
  if ($folder !== '')
    $folder_formated = "/$folder";
  $url = "https://raw.githubusercontent.com/$username/$repository_name/$tag$branch" . "$folder_formated/project.json";
  $project_json = @file_get_contents($url);
  if ($project_json === false) {  # if the project.json file is not here, try to get the first world file (alphabetic order)
    $options = array('http'=>array('method'=>'GET', 'header'=>"User-Agent: PHP/file_get_contents\r\n"));
    $context = stream_context_create($options);
    $url = "https://api.github.com/repos/$username/$repository_name/contents$folder_formated/worlds?ref=$tag$branch";
    $worlds_json = file_get_contents($url, false, $context);
    if ($worlds_json === false)
      error("Failed to fetch worlds directory at $url");
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
      error("Cannot decode JSON data from $url: " . json_last_error());
    if (!property_exists($project, 'default'))
      error("Missing default property in $project");
    $default = $project->{'default'};
  }
  $url = "https://raw.githubusercontent.com/$username/$repository_name/$tag$branch" . "$folder_formated/worlds/$default";
  $world = @file_get_contents($url);
  if ($world === false)
    error("Failed to fetch world file at $url");
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
  $repository =
  $query = "INSERT INTO project(title, user, repository, branch, tag, folder, public) VALUES(\"$title\", $user[id], " .
           "\"$repository\", \"$branch\", \"$tag\", \"$folder\", 0)";
  $mysqli->query($query) or error($mysqli->error);
  $answer = array();
  $answer['id'] = $mysqli->insert_id;
  $answer['default'] = $default;
  $answer['title'] = $title;
  $answer['status'] = 'success';
  die(json_encode($answer));
 ?>
