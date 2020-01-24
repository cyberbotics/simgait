<?php
  header('Content-Type: application/json');
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  $to = $data->{'email'};
  if (!filter_var($to, FILTER_VALIDATE_EMAIL))
    die('{"error": "Wrong e-mail address."}');
  die('{"error": "Unknown e-mail address <b>'.$to.'</b>.<br />'
    . 'Please sign up with this e-mail address to create a new account."}');
?>
