### How to run

In order to run the application you need to have Docker (docker-compose) installed.
Once Docker is installed, you should be able to run the application just by running `docker-compose up` in the project root directory.
After docker-compose is run, Docker will pull all necessary images (mysql, node, redis) and run the containers, initializing the database as well.
(During initial start-up the api container may fail, in that case it is enough to restart it by saving (ctrl+s) any of the files in `src` directory. That should restart the container since hot reloading is in place).

The api should be available at `localhost:3000`, and the following endpoints have been implemented:

GET /payment-notes

GET /payment-notes/:uuid

POST /payment-notes

request Body: 
` {
    "periodFrom": "<iso 8601 date>",
    "periodTo": "<iso 8601 date>"
  }
`