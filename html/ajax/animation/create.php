<?php # This script creates a new animation entry in the database
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  function parse_sf_string($line, $parameter) {
    $n = 2;  // skiping '<' and node name (at least one character)
    $start = strpos($line, " $parameter=", $n);
    $value = '';
    if ($start !== false) {
      $start += strlen($parameter) + 2;
      $quote = $line[$start];
      $end = $start;
      do { // skip escaped double quotes
        $end += 1;
        $end = strpos($line, $quote, $end);
      } while ($line[$end - 1] == '\\' && $end !== false);
      if ($end !== false)
        $value = str_replace("\\$quote", $quote, substr($line, $start + 1, $end - $start - 1));
    }
    return $value;
  }
  function parse_mf_string($line, $parameter) {
    $n = 2; // skiping '<' and node name (at least one character)
    $start = strpos($line, " $parameter='\"", $n);
    $value = array();
    if ($start !== false) {
      $start += strlen($parameter) + 3;
      while(true) {
        $end = $start;
        do { // skip escaped double quotes
          $end += 1;
          $end = strpos($line, '"', $end);
        } while ($line[$end - 1] == '\\' && $end !== false);
        if ($end !== false)
          array_push($value, str_replace('\\"', '"', substr($line, $start + 1, $end - $start - 1)));
        else
          break;
        if ($line[$end + 1] === ' ' && $line[$end + 2] === '"')
          $start = $end + 2;
        else
          break;
      }
    }
    return $value;
  }

  function  move_assets($total_assets, $assets_type, $folder) {
    mkdir("$folder/$assets_type");
    for($i = 0; $i < $total_assets; $i++) {
      $target = basename($_FILES[$assets_type]['name'][$i]);
      if ($target == '')
        continue;
      if (!move_uploaded_file($_FILES[$assets_type]['tmp_name'][$i], "$folder/$assets_type/$target"))
        error("Cannot move $total_assets $target");
    }
  }

  header('Content-Type: application/json');
  // connect to database
  require '../../../php/database.php';
  $mysqli = new mysqli($database_host, $database_username, $database_password, $database_name);
  if ($mysqli->connect_errno)
    error("Can't connect to MySQL database: $mysqli->connect_error");
  $mysqli->set_charset('utf8');

  // check if uploading is done
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  $uploading = (isset($data->uploading)) ? intval($data->uploading) : 1;
  $uploadId = (isset($data->uploadId)) ? intval($data->uploadId) : null;
  if (!$uploading && $uploadId) {
    $query = "UPDATE animation SET uploading=0 WHERE id=$uploadId";
    $mysqli->query($query) or error($mysqli->error);
    die('{"status": "uploaded"}');
  }

  // get files and variables from post
  $animation = array_key_exists('animation-file', $_FILES);
  $size = $_FILES['animation-file']['size'];
  $angles = array_key_exists('angles-file', $_FILES);

  $size += $_FILES['scene-file']['size'];
  $size += $_FILES['scene-file']['size'];

  $user = (isset($_POST['user'])) ? intval($_POST['user']) : 0;

  // determine title, info and version
  $file = fopen($_FILES['scene-file']['tmp_name'], 'r') or error('Unable to open scene file');
  $count = 0;
  $world_info = false;
  while (!feof($file)) {
    $line = fgets($file);
    if (substr($line, 0, 15) === "<WorldInfo id='") {
      $world_info = true;
      $title = parse_sf_string($line, 'title');
      $info = parse_mf_string($line, 'info');
      $description = implode("\n", $info);
    } else if (substr($line, 0, 30) == '<meta name="version" content="')
      $version = parse_sf_string($line, 'content');
  }
  fclose($file);
  if ($world_info === false)
    error('Missing WorldInfo title in x3d file');
  if (!isset($version))
    error('Missing version meta header node in x3d file');

  // determine duration
  if ($animation) {
    $duration = false;
    $content = file_get_contents($_FILES['animation-file']['tmp_name']);
    $start = strrpos($content, '{"time":');
    if ($start !== false) {
      $start += 8;
      $end = strpos($content, ',', $start);
      if ($end !== false)
        $duration = intval(substr($content, $start, $end - $start));
    }
    if ($duration === false)
      error('Missing duration');
  } else
    $duration = 0;

  // save entry in database
  $escaped_title = html_entity_decode($mysqli->escape_string($title), ENT_QUOTES);
  $escaped_description = html_entity_decode($mysqli->escape_string($description), ENT_QUOTES);
  $escaped_version = $mysqli->escape_string($version);
  if ($user !== 0) {
    $result = $mysqli->query("SELECT password from user WHERE id=$user") or error($mysqli->error);
    $password = $result->fetch_assoc();
    $result->free();
    if (!$password)
      error("Unknown user: $user.");
    if ($password['password'] !== $_POST['password'])
      error("Wrong password for user $user.");
  } else {
    error("You must be logged in to upload an animation");
  }
  $branch = basename(dirname(__FILE__, 4));
  $query = "INSERT INTO animation(title, description, version, duration, size, user, branch) ".
           "VALUES(\"$escaped_title\", \"$escaped_description\", \"$escaped_version\", $duration, $size, $user, \"$branch\")";
  $mysqli->query($query) or error($mysqli->error);
  $id = $mysqli->insert_id;

  // save files in new folder
  require '../../../php/mysql_id_string.php';
  $type = $animation ? 'A' : 'S';
  $uri = '/' . $type . mysql_id_to_string($mysqli->insert_id);
  $folder = "../../storage$uri";
  mkdir($folder);
  if (!move_uploaded_file($_FILES['animation-file']['tmp_name'], "$folder/animation.json"))
    error('Cannot move animation file.');
  if (!move_uploaded_file($_FILES['angles-file']['tmp_name'], "$folder/angles.json"))
    error('Cannot move animation file.');
  if (!move_uploaded_file($_FILES['scene-file']['tmp_name'], "$folder/scene.x3d"))
    error('Cannot move scene file.');

  $condition = "branch=\"$branch\"";
  $result = $mysqli->query("SELECT COUNT(*) AS total FROM animation WHERE $condition") or error($mysqli->error);
  $count = $result->fetch_array(MYSQLI_ASSOC);
  $total = intval($count['total']);

  $answer = array();
  $answer['id'] = $id;
  $answer['total'] = $total;
  $answer['url'] = 'https://' . $_SERVER['SERVER_NAME'] . $uri;
  $answer['title'] = $title;
  $answer['description'] = $description;
  $answer['version'] = $version;
  $answer['duration'] = $duration;
  $answer['size'] = $size;
  $answer['viewed'] = 0;
  $answer['user'] = $user;
  $answer['uploaded'] = date("Y-m-d H:i:s");

  die(json_encode($answer));
 ?>
