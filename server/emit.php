<?php

/**
  *   Do not remove or alter the notices in this preamble.
  *   This software code regards ISAAC Standard Software.
  *   Copyright © 2021 ISAAC and/or its affiliates.
  *   www.isaac.nl All rights reserved. License grant and user rights and obligations
  *   according to applicable license agreement. Please contact sales@isaac.nl for
  *   questions regarding license and user rights.
  */

declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: X-Requested-With');
header('Content-type: application/json');

require __DIR__ . '/vendor/autoload.php';

use ISAAC\GazePublisher\GazePublisher;

$event = $_GET['event'];
$payload = json_decode($_GET['payload']);
$role = $_GET['role'] ?? null;

$gaze = new GazePublisher('http://hub:3333', file_get_contents(__DIR__ . '/private.key'));
$gaze->emit($event, $payload, $role);

echo json_encode(['status' => 'send']);
