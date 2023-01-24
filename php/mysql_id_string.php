<?php
  // converts forth and back a mysql id which is a 32 bit int(11) into a 6-char string that can be used in a URI
  const UINT32_MAX = 4294967295; // has 10 digits
  const CHARACTER_SET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-'; // 64 chars
  function mysql_id_to_string($int) {
    $s = intval(strrev(sprintf('%010d', UINT32_MAX - $int)));
    $str = '';
    for($i = 0; $i < 6; $i++) {
      $b = ($s >> (6 * $i)) & 63;
      $str .= CHARACTER_SET[$b];
    }
    return $str;
  }
  function string_to_mysql_id($str) {
    $n = 0;
    for($i = 0; $i < strlen($str); $i++)
      $n += strpos(CHARACTER_SET, $str[$i]) << (6 * $i);
    $i = UINT32_MAX - intval(strrev(sprintf('%010d', $n)));
    return $i;
  }
?>
