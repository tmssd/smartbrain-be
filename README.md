# SmartBrain - backend(Dockerized)

Final project for "The Complete Web Developer: Zero to Mastery" course by [ZTM academy](https://zerotomastery.io/courses/coding-bootcamp/)

The frontend code available at [smartbrain-fe](https://github.com/tmssd/smartbrain-fe) repo.

## Description

Web App that allows users to detect faces in pictures using Clarifai's AI API.

Utilized: ES6, React, Node.js, Express, PostgreSQL, Redis, Docker, knex, bcrypt, JWT, Prettier.

## Setup the api

1. Clone this repo and `cd` to the project dir

    ```bash
    git clone git@github.com:tmssd/smartbrain-be.git && cd smartbrain-be
    ```

    or

    ```bash
    git clone https://github.com/tmssd/smartbrain-be.git && cd smartbrain-be
    ```

2. Launch the api

    for the first setup phase run:

    ```bash
    docker-compose up --build
    ```

    otherwise run:

    ```bash
    docker-compose up
    ```

    The api now availbale at `localhost:3000`

NOTE: You must add your own Clarifai API key in the `controllers/image.js` file to connect to Clarifai API. You can grab it [here](https://www.clarifai.com/).

## Tips

To access backend's bash:

```bash
docker-compose -it exec smartbrain-be-app bash
```

To access postgres: (adjust PORT number if needed)

```bash
psql postgres://<username>:<password>@localhost:5432/smart-brain
```

To access redis:

```bash
docker-compose exec smartbrain-be-redis redis-cli
```
