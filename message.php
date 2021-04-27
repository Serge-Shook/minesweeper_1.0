<?php

if (!$_POST) {
    exit();
}

require_once 'login.php';

set_error_handler('myHandler', E_WARNING);

$conn = new mysqli($hn, $un, $pw, $db);

$name = $conn->real_escape_string($_POST['name']) ?: 'anonymous';
$text = $conn->real_escape_string($_POST['text']);

$rep = $conn->query("INSERT INTO messages (`name`, `text`) VALUES ('{$name}', '{$text}')");

$conn->close();

$name = htmlspecialchars($name);

if ($rep) {
    echo "Сообщение от <b>{$name}</b> успешно отправлено";
} else {
    echo 'Что-то пошло не так!'; // this should not happen
}

function myHandler($errno, $errstr)
{
    if ($errno === E_WARNING) {
        echo '(Таблица рекордов недоступна)';
        exit();
    }
}

// $record_id = $_POST['record_id'];
// $raw_name = $_POST['name'];
// $new_name = $conn->real_escape_string($raw_name);
// $table_name = $_POST['difficulty'];

// $rep = $conn->query("UPDATE {$table_name} SET name = '{$new_name}' WHERE num = {$record_id}");



// $disp_name = htmlspecialchars($raw_name);


