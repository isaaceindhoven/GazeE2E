<?php

declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: X-Requested-With');
header('Content-type: application/json');

require __DIR__ . '/../publisher/vendor/autoload.php';

use ISAAC\GazePublisher\GazePublisher;

$event = $_GET['event'];
$payload = json_decode($_GET['payload']);
$role = $_GET['role'] ?? null;

$gaze = new GazePublisher('http://hub:3333', file_get_contents(__DIR__ . '/private.key'));
$gaze->emit($event, $payload, $role);

echo json_encode(['status' => 'send']);
