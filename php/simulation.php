<?php
function simulation_check_url($url) {
  if (substr($url, 0, 20) !== 'webots://github.com/')
    return 'The URL should start with \'webots://github.com/\'';
  if (substr($url, -4) != '.wbt')
    return 'The URL should end with \'.wbt\': ' . substr($url, -4);
  $exploded = explode('/', substr($url, 20));
  $count = count($exploded);
  if ($count < 6)
    return 'Wrong Webots URL';
  $username = $exploded[0];
  $repository = $exploded[1];
  if (!preg_match('/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i', $username))
    return 'Wrong GitHub username';
  if (!preg_match('/^[a-z\d_.-]{1,100}$/i', $repository))
    return 'Wrong GitHub repository';
  if ($exploded[2] != 'tag' && $exploded[2] != 'branch')
    return 'Missing \'/tag/\' or \'/branch/\' in URL';
  $tag_or_branch = $exploded[3];
  if (!preg_match('/^[a-z\d_.-]{0,100}$/i', $tag_or_branch))
    return 'Wrong GitHub tag or branch name';
  $folder = implode('/', array_slice($exploded, 4, $count - 6));
  if ($folder !=='' and
      (!preg_match('/^[a-z\d_.-\/]{1,100}$/i', $folder)  # no fancy folder name
       or substr($folder, 0, 1) === '/'                  # doesn't start with slash
       or strstr($folder, '//')                          # no double slashes
       or substr($folder, -1) === '/'))                  # doesn't end with slash
    return 'Wrong folder name';
  if ($folder !== '')
    $folder = "/$folder";
  $worlds_folder = $exploded[$count - 2];
  if ($worlds_folder != 'worlds')
    return 'Missing \'/worlds/\' folder in URL';
  $world = $exploded[$count - 1];
  return array($username, $repository, $tag_or_branch, $folder, $world);
}
?>
