<?php
  $secret_file = fopen('deploy.secret', 'r') or die("Unable to open deploy.secret file\n");
  $secret = fread($secret_file, filesize('deploy.secret'));
  fclose($secret_file);
  if (!isset($_GET['secret']))
    die("Missing secret parameter\n");
  if ($_GET['secret'] !== $secret)
    die("Wrong secret\n");
  shell_exec('git reset --hard HEAD && git pull');
  print("OK\n");
?>
