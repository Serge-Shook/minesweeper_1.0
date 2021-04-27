<?php

if (!$_POST) {
    exit();
}

require_once 'login.php';

$table_name = $_POST['name'];
$length = $_POST['num'];

$conn = new mysqli($hn, $un, $pw, $db);

$res = $conn->query("SELECT `name`, timeset, record_date FROM {$table_name} ORDER BY timeset LIMIT {$length}");

$conn->close();

?>

<table>
    <thead>
        <tr>
            <th>n</th>
            <th>имя</th>
            <th>время</th>
            <th>дата</th>
        </tr>
    </thead>
    <tbody>

        <?php

        $n = 1;

        while ($row = $res->fetch_assoc()) {
            echo '<tr>' .
                '<td>' . $n++ . '</td>' .
                '<td class="name">' . htmlentities($row['name']) . '</td>' .
                '<td>' . display_time($row['timeset']) . '</td>' .
                '<td>' . display_date($row['record_date']) . '</td>' .
                '</tr>';
        }

        function display_time(int $time): string
        {
            $secs = round($time / 1000);
            $mins = floor($secs / 60);
            $secs %= 60;

            return $mins . ':' . sprintf("%02d", $secs);
        }

        function display_date(string $date): string
        {
            $new_date = date_create_from_format('Y-m-d G:i:s', $date);
            return $new_date->format('d.m.Y, G:i');
        }

        ?>

    </tbody>
</table>