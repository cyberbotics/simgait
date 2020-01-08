<?php
  function my_shell_exec($cmd, &$stdout=null, &$stderr=null) {
    $proc = proc_open($cmd,[1 => ['pipe','w'], 2 => ['pipe','w'],], $pipes);
    $stdout = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[2]);
    return proc_close($proc);
  }
  # The contents of deploy.secret should match the github webhook secret
  $secret_file = fopen('deploy.secret', 'r') or die("Unable to open deploy.secret file\n");
  $secret = trim(fread($secret_file, filesize('deploy.secret')));
  fclose($secret_file);
  if (!isset($_SERVER['HTTP_X_HUB_SIGNATURE']))
    die("Missing HTTP_X_HUB_SIGNATURE\n");
  if (!extension_loaded('hash'))
    die("Missing 'hash' extension to check the secret code validity\n");
  list($algo, $hash) = explode('=', $_SERVER['HTTP_X_HUB_SIGNATURE'], 2) + array('', '');
  if (!in_array($algo, hash_algos(), TRUE))
    die("Hash algorithm '$algo' is not supported\n");
  $input = file_get_contents('php://input');
  if ($hash !== hash_hmac($algo, $input, $secret))
    die("Hook secret does not match\n");
  $payload = json_decode($input);  # assuming content type is application/json
  if ($payload->{'ref'} === 'refs/heads/master') {  # push on the master branch
    my_shell_exec('git reset --hard HEAD', $out1, $err1);
    my_shell_exec('git pull', $out2, $err2);
    $out3 = shell_exec('whoami');
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https' : 'http';
    die("Published master branch on $protocol://$_SERVER[SERVER_NAME]\nout1=$out1\n err1=$err1\n out2=$out2\n err2=$err2\n out3=$out3\n");
  } else
    die("Not on the master branch\n");
?>
