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
// $found = $_POST['found'];
// $errors = $_POST['errors'];
// $opened = $_POST['opened'];

extract($_POST);

$query = "INSERT INTO king_lost (timeset, width, height, mines, found, errors, opened) " .
    "VALUES ({$timeset}, {$width}, {$height}, {$mines}, {$found}, {$errors}, {$opened})";

$conn->query($query);

$conn->close();
