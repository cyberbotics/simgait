<?php
  header('Content-Type: application/json');
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  require '../../php/database.php';
  $mysqli =  new mysqli($database_host, $database_username, $database_password, $database_name);
  if (!$mysqli)
    die("\"error\": \"Can't connect to MySQL database: $mysqli->error\"}");
  $mysqli->set_charset('utf8');
  $email = $mysqli->escape_string($data->{'email'});
  if (!filter_var($email, FILTER_VALIDATE_EMAIL))
    die('{"error": "Wrong e-mail address."}');
  $category = $mysqli->escape_string($data->{'category'});
  $token = bin2hex(random_bytes(16));
  $result = $mysqli->query("INSERT INTO user(email, token, category) VALUES(\"$email\", \"$token\", \"$category\")")
            or die("{\"error\": \"MySQL error: $mysqli->error\"}");
  $link = 'http' . ($_SERVER['HTTPS'] ? 's' : '') . '://' . $_SERVER['SERVER_NAME'] . "/?token=$token&email=$email";
  $subject = "SimGait sign up";
  $message = "<html><head><title>$subject</title></head>"
           . "<body><p>Hello,</p><p>Please click on this <a href="$link">link</a> to validate your $category "
           . " account request on <a href=\"https://simgait.org\">simgait.org</a>.</p>"
           . "<p>Best regards,</p><p><a href=\"https://simgait.org\">simgait.org</a></p>\n";
  $header = "From: support@cyberbotics.com\r\n"
          . "Reply-To: Olivier.Michel@cyberbotics.com\r\n"
          . "Cc: Olivier.Michel@cyberbotics.com\r\n"
          . "MIME-Version: 1.0\r\n"
          . "Content-type:text/html;charset=UTF-8\r\n";
  mail($email, $subject, $message, $header);
  echo json_encode($data);
 ?>
