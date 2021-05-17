# GazeE2E
 
This repository runs a full E2E test using the 3 [Gaze](https://isaaceindhoven.github.io/GazeHub/docs/) libraries ([GazeHub-src](https://github.com/isaaceindhoven/GazeHub-src), [GazePublisher](https://github.com/isaaceindhoven/GazePublisher) and [GazeClient](https://github.com/isaaceindhoven/GazeClient))

## Configure

- Clone [GazeHub-src](https://github.com/isaaceindhoven/GazeHub-src), [GazePublisher](https://github.com/isaaceindhoven/GazePublisher) and [GazeClient](https://github.com/isaaceindhoven/GazeClient).
- Copy the `.env.example` file to `.env`.
- Modify the paths in the `.env` file to point to the right repository.
 
## Running the tests
```sh
# run the tests using a specific PHP version
PHP_VER="7.3" npm run test

# run the tests using PHP 7.3, 7.4 and 8.0
./e2etest.sh
```
