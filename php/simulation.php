<?php
function simulation_check_url($url) {
  if (substr($url, 0, 19) !== 'https://github.com/')
    return 'The url should start with https://github.com/';
  $exploded = explode('/', substr($url, 19));
  $count = count($exploded);
  if ($count < 4)
    return 'Wrong GitHub URL';
  $username = $exploded[0];
  $repository = $exploded[1];
  if (!preg_match('/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i', $username))
    return 'Wrong GitHub username';
  if (!preg_match('/^[a-z\d_.-]{1,100}$/i', $repository))
    return 'Wrong GitHub repository';
  if ($exploded[2] != 'tree')
    return 'Missing "tree" folder in URL';
  $tag_or_branch = $exploded[3];
  if (!preg_match('/^[a-z\d_.-]{0,100}$/i', $tag_or_branch))
    return 'Wrong GitHub tag or branch';
  $folder = implode('/', array_slice($exploded, 4));
  if ($folder !=='' and
      (!preg_match('/^[a-z\d_.-\/]{1,100}$/i', $folder)  # no fancy folder name
       or substr($folder, 0, 1) === '/'                  # doesn't start with slash
       or strstr($folder, '//')                          # no double slashes
       or substr($folder, -1) === '/'))                  # doesn't end with slash
    return 'Wrong folder name';
  if ($folder !== '')
    $folder = "/$folder";
  return array($username, $repository, $tag_or_branch, $folder);
}
?>
