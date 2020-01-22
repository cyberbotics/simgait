<?php
  header('Content-Type: application/json');
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  mail("Olivier.Michel@cyberbotics.com", "SimGait Sign Up", $data->{'email'} . " " . $data->{'category'}, 'From: support@cyberbotics.com');
  echo json_encode($data);
 ?>
