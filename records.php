<?php

if (!$_POST) {
    exit();
}

define('TABLE_SIZE', 200);
define('BEST_SIZE', 50);

require_once 'login.php';

set_error_handler('myHandler', E_WARNING);

$conn = new mysqli($hn, $un, $pw, $db);

function myHandler($errno, $errstr)
{
    if ($errno === E_WARNING) {
        echo json_encode(['error' => '(Таблица рекордов недоступна)']);
        exit();
    }
}

// if ($conn->connect_error) {
//     echo json_encode(['error' => '<b>(Недоступна таблица рекордов)</b>']);
//     exit();
// }

$timeset = $_POST['time'];
$table_name = $_POST['difficulty'];

$my_goodness = am_i_good($timeset);

if (!$my_goodness) {
    $to_json['goodness'] = 'no';
} else {
    $conn->query("INSERT INTO {$table_name} (timeset) VALUES ({$timeset})");
    $new_num = $conn->insert_id;
    $my_place = $conn->query("SELECT COUNT(*) FROM {$table_name} WHERE timeset <= {$timeset}")->fetch_row()[0];
    $to_json['place'] = $my_place;

    trim_records_table_length();

    if ($my_place <= BEST_SIZE) {
        $to_json['goodness'] = 'best';
        $to_json['record_id'] = $new_num;
    } else {
        $to_json['goodness'] = 'good';
    }
}

$conn->close();

echo json_encode($to_json);


function am_i_good(int $time): bool
{
    global $conn, $table_name;

    $good = TABLE_SIZE - 1;

    $res = $conn->query("SELECT timeset FROM {$table_name} ORDER BY timeset LIMIT {$good}, 1")->fetch_row();

    if ($res === null) {
        return true;
    } else {
        return $time < $res[0];
    }
}

function trim_records_table_length(): void
{
    global $conn, $table_name;

    $length = $conn->query("SELECT COUNT(*) FROM {$table_name}")->fetch_row()[0];

    if ($length > TABLE_SIZE) {
        $allowed_length = TABLE_SIZE - 1;
        $last = $conn->query("SELECT num, timeset FROM {$table_name} ORDER BY timeset, num LIMIT {$allowed_length}, 1")->fetch_assoc();
        $cut_off_time = $last['timeset'];
        $cut_off_num = $last['num'];

        $conn->query("DELETE FROM {$table_name} WHERE timeset > {$cut_off_time} OR (timeset = {$cut_off_time} AND num > {$cut_off_num})");
    }
}
