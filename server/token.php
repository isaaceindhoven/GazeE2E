<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");
header('Content-type: application/json');

require __DIR__ . '/vendor/autoload.php';

use ISAAC\GazePublisher\GazePublisher;

$roles = json_decode($_GET["roles"] ?? "[]");

$gaze = new GazePublisher("http://hub:3333", file_get_contents(__DIR__ . "/private.key"));
echo json_encode(["token" => $gaze->generateClientToken($roles)]);
