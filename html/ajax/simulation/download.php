<?php
require '../../../php/simulation.php';
function error($message) {
  die("{\"error\":\"$message\"}");
}
header('Content-Type: application/json');
$json = file_get_contents('php://input');
$data = json_decode($json);
$url = $data->{'url'};
$tag = intval($data->{'tag'});
$check_url = simulation_check_url($url);
if (!is_array($check_url))
  error($check_url);
list($username, $repository, $tag_or_branch, $folder) = $check_url;
// download the project folder using subversion
$WEBOTS_HOME = getenv('WEBOTS_HOME');
if ($WEBOTS_HOME === False)
  error('WEBOTS_HOME environment variable is not set.');
if (!file_exists($WEBOTS_HOME))
  error("Folder not found: $WEBOTS_HOME.");
$WEBOTS_PROJECTS = getenv('WEBOTS_PROJECTS');
if ($WEBOTS_PROJECTS === False)
  error('WEBOTS_PROJECTS environment variable is not set.');
if (!file_exists($WEBOTS_PROJECTS))
  error("Folder not found: $WEBOTS_PROJECTS");
# $script = escapeshellcmd("$WEBOTS_HOME/resources/web/server/export_github_folder.py");
$script = "$WEBOTS_HOME/resources/web/server/export_github_folder.py";
if (!file_exists($script))
  error("File not found: $script.");
$script .= " --url=$url";
$script .= " --output=$WEBOTS_PROJECTS";
if ($tag == 1)
  $script .= " --tag";
$output = shell_exec("python.exe $script");
if ($output)
  error(trim($output));
die('{"status":"success"}');
?>
