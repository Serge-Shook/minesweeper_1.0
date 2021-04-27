<?php

if (!$_POST) {
    exit();
}

require_once 'login.php';

$conn = new mysqli($hn, $un, $pw, $db);

// $timeset = $_POST['timeset'];
// $width = $_POST['width'];
// $height = $_POST['height'];
// $mines = $_POST['mines'];

extract($_POST);

$conn->query("INSERT INTO king_win (timeset, width, height, mines) VALUES ({$timeset}, {$width}, {$height}, {$mines})");

echo $conn->insert_id;

$conn->close();
