# Gaze E2E Test
 
This repository runs a full E2E test using the 3 Gaze libraries (GazeHub, GazePHP and GazeJS)
 
## How it works
 
### Docker Compose
- Starts Docker with 3 servers (docker-compose.yml) on a specified PHP version.
- The PHP version can be specified using environment variables
- The source code of the libraries lives in the `vendor` and `node_modules` folder. These are linked in the container using `volumes`.
 
### Running a single test
- Only a single PHP version can be tested at a time.
- 3 different types of browsers are tested in a single test (Chrome, FireFox and Safari).
 
### How do I run a single test?
Run the command `PHP_VER="7.3" npm run test` to run the Jest test using `PHP 7.3`.
 
### How can I run the full test suite?
There is a convenient bash script in the root called `e2etest.sh`. This can be executed with `bash e2etest.sh`.

### I made a change to one of the libraries.
Run these command to update the libraries `npm update && composer update`. This will pull in the new code in the `vendor` folder and the `node_modules`.