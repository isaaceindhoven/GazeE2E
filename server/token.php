<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header("Access-Control-Allow-Headers: X-Requested-With");
header('Content-type: application/json');

require __DIR__ . '/vendor/autoload.php';

use ISAAC\GazePublisher\Gaze;

$roles = json_decode($_GET["roles"] ?? "[]");

$gaze = new Gaze("http://hub:3333", __DIR__ . "/private.key");
echo json_encode(["token" => $gaze->generateClientToken($roles)]);