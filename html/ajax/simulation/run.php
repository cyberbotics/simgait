<?php
require '../../../php/simulation.php';
function error($message) {
  die("{\"error\":\"$message\"}");
}
function download_file($url) {

}
function download_folder($url) {
  
}
header('Content-Type: application/json');
$json = file_get_contents('php://input');
$data = json_decode($json);
$url = $data->{'url'};
$check_url = simulation_check_url($url);
if (!is_array($check_url))
  error($check_url);
list($username, $repository, $tag_or_branch, $folder) = $check_url;
// download the project folder using the github API
$options = array('http'=>array('method'=>'GET', 'header'=>"User-Agent: PHP/file_get_contents\r\n"));
$context = stream_context_create($options);
$project_json_url = "https://api.github.com/repos/$username/$repository/contents$folder?ref=$tag_or_branch";
$project_json = @file_get_contents($project_json_url, false, $context);
if ($project_json === false)
  error("No project found in $url");
$project = json_decode($project_json);
$files = array();
foreach($project as $file) {
  if ($file->{'type'} === 'file') {
    $name = $file->{'name'};
  }
}
if (count($files) == 0)
  error("No world file found in this project folder");
sort($files);
$default = $files[0];

?>
