<?php
  function error($message) {
    die("{\"error\":\"$message\"}");
  }
  header('Content-Type: application/json');
  $json = file_get_contents('php://input');
  $data = json_decode($json);
  require '../../php/database.php';
  $mysqli =  new mysqli($database_host, $database_username, $database_password, $database_name);
  if (!$mysqli)
    error("Can't connect to MySQL database: $mysqli->error");
  $mysqli->set_charset('utf8');
  $email = $mysqli->escape_string($data->{'email'});
  if (!filter_var($email, FILTER_VALIDATE_EMAIL))
    error('Wrong e-mail address.');
  $username = $mysqli->escape_string($data->{'username'});
  $category = $mysqli->escape_string($data->{'category'});
  $token = bin2hex(random_bytes(16));
  $mysqli->query("INSERT INTO user(email, username, category) VALUES(\"$email\", \"$username\", \"$category\")")
    or error($mysqli->error);
  $mysqli->query("INSERT INTO request(user, type, token) VALUES($mysqli->insert_id, \"sign up\", \"$token\")") or error($mysqli->error);
  $link = 'http';
  if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    $link .= 's';
  $link .= '://' . $_SERVER['SERVER_NAME'] . "/?id=$mysqli->insert_id&token=$token&email=$email";
  $subject = "SimGait sign up";
  $message = "<html><head><title>$subject</title></head>"
           . "<body><p>Hello $username,</p><p>Please click on this <a href=\"$link\">link</a> to set a password and "
           . "activate your $category account.</p>"
           . "<p>This link will expires in 72 hours.</p>"
           . "<p>Best regards,</p><p><a href=\"https://simgait.org\">simgait.org</a></p>\n";
  $header = "From: support@cyberbotics.com\r\n"
          . "Reply-To: Olivier.Michel@cyberbotics.com\r\n"
          . "Cc: Olivier.Michel@cyberbotics.com\r\n"
          . "MIME-Version: 1.0\r\n"
          . "Content-type:text/html;charset=UTF-8\r\n";
  mail($email, $subject, $message, $header);
  echo json_encode($data);
 ?>
