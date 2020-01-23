<?php
  header('Content-Type: application/json');
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  $to = $data->{'email'};
  $subject = "SimGait sign up";
  $message = "<html><head><title>$subject</title></head>"
           . "<body><p>Hello,</p><p>Your request to open a " . $data->{'category'}
           . " account on <a href=\"https://simgait.org\">simgait.org</a> was sent to the administrator.</p>"
           . "<p>You will receive a notification as soon as your request is accepted or refused.</p>"
           . "<p>Best regards,</p><p><a href=\"https://simgait.org\">simgait.org</a></p>\n";
  $header = "From: support@cyberbotics.com\r\n"
          . "Reply-To: Olivier.Michel@cyberbotics.com\r\n"
          . "Cc: Olivier.Michel@cyberbotics.com\r\n"
          . "MIME-Version: 1.0\r\n"
          . "Content-type:text/html;charset=UTF-8\r\n";
  mail($to, $subject, $message, $header);
  echo json_encode($data);
 ?>
