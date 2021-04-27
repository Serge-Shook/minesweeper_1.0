<?php

// if (!$_POST) {
//     exit();
// }

require_once 'login.php';

$length = 20;

$conn = new mysqli($hn, $un, $pw, $db);

$res = $conn->query("SELECT timeset, width, height, mines, found FROM king_lost ORDER BY found DESC LIMIT {$length}");

$conn->close();

?>

<table>
    <thead>
        <tr>
            <th>time</th>
            <th>size</th>
            <th>mines</th>
            <th>found</th>
        </tr>
    </thead>
    <tbody>

        <?php

        // $n = 1;

        while ($row = $res->fetch_assoc()) {
            echo '<tr>' .
                '<td>' . display_time($row['timeset']) . '</td>' .
                '<td>' . $row['width'] . '&times;' . $row['height'] . '</td>' .
                '<td>' . $row['mines'] . '</td>' .
                '<td>' . $row['found'] . '</td>' .
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