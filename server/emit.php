<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");
header('Content-type: application/json');

require __DIR__ . '/vendor/autoload.php';

use GazePHP\Gaze;

$event = $_GET["event"];
$payload = json_decode($_GET["payload"]);
$role = $_GET["role"] ?? null;

$gaze = new Gaze("http://hub:3333", __DIR__ . "/private.key");
$gaze->emit($event, $payload, $role);

echo json_encode(["status" => "send"]);

?>