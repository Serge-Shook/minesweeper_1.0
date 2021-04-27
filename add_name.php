<?php

if (!$_POST) {
    exit();
}

require_once 'login.php';

set_error_handler('myHandler', E_WARNING);

$conn = new mysqli($hn, $un, $pw, $db);

function myHandler($errno, $errstr)
{
    if ($errno === E_WARNING) {
        echo '(Таблица рекордов недоступна)';
        exit();
    }
}

$record_id = $_POST['record_id'];
$raw_name = $_POST['name'];
$new_name = $conn->real_escape_string($raw_name);
$table_name = $_POST['difficulty'];

$rep = $conn->query("UPDATE {$table_name} SET name = '{$new_name}' WHERE num = {$record_id}");

$conn->close();

$disp_name = htmlspecialchars($raw_name);

if ($rep) {
    echo "Имя <b>{$disp_name}</b> успешно внесено";
} else {
    echo 'Что-то пошло не так!'; // this should not happen
}
