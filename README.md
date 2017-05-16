# The Best

The Best is a tiny and simple ranking API.

## Installa

### Required:
- NodeJS
- MongoDB

### Step by Step:

At first, clone this repository to your computer:

`https://github.com/lai32290/theBest`

#### With Docker:

Then you can just edit the path where you want to keep your MongoDB file to `volumes` option in `docker-compose.yml` file.

Sample:

```
  mongo:
    image: mongo
    volumes:
      - {your-db-path}:/var/db
    ports:
      - 27017:27017
    restart: always
    container_name: theBestMongo
```

Then just execute `docker-compose up -d` and test it accessing on `localhost/status` (GET).

#### Setup Manually:

Then you can edit your environment configuration in the `settings.json` file and execute `node server.js`, then test it accessing on `localhost/status` (GET).


## URL

### `/status` (POST)
Check if the API is working.

#### Parameters:
No parameters required

#### Result Format:
```
{
    "status" : "success",
    "statusCode" : 1,
    "data" : {
        "message" : "The Best is On!"
    }
}
```

### `/app/new` (POST)
Register a new application in the service and returing a hash to use in other requests.

#### Parameters:
- `name` : The name of application

#### Result Format:
```
{
    "status" : "success",
    "statusCode" : 1,
    "data" : {
        hash : '82267be7b55d204e0f996fa0a09a37890df2a9e1'
    }
}
```

### `/app/tops` (POST)
Get the top rankings.

#### Parameters:
`{ app_hash: '82267be7b55d204e0f996fa0a09a37890df2a9e1', [top_limit: 10] }`

- `app_hash` : The hash returned in `/app/new`
- `top_limit` : How much tops of the ranking do you want to get. (optional) 

#### Result Format:

```
{
  "status": "success",
  "statusCode": 1,
  "data": [
    {
      "_id": "591500e5ef62b9000167c795",
      "id": "360f529932aa6142d91870b5",
      "bestScore": 567
    }
  ]
}
```

### `/user/insertScore` (POST)
Register a new score to the player

#### Parameters:
- `user_id` : The user identification, you can use your role to define the identification, the API will just use it to recover the user scores.
- `app_hash` : The hash returned by `/app/new` request.

#### Result Format:
```
{
    "status" : "success",
    "statusCode" : 1,
    "data" : {
        "id": "590f529976aa6142d91870b7",
        "appHash": "82267be7b55d204e0f996fa0a09a37890df2a9e1",
        "scores": [100, 200, 150, 30, 25, 0, 63]
    }
}
```

### `/user/scores` (POST)
Return all scores of a specifically user.

#### Parameters:
- `user_id` : The user identification, you can use your role to define the identification, the API will just use it to recover the user scores.
- `app_hash` : The hash returned by `/app/new` request.

#### Result Format:
```
{
    "status" : "success",
    "statusCode" : 1,
    "data" : {
        "_id" : "5918fc59a43b2200012d91e6",
        "scores" : [100, 200, 300]
    }
}
```


### `/user/bestScore` (POST)
Return best score of a specifically user.

#### Parameters:
- `user_id` : The user identification, you can use your role to define the identification, the API will just use it to recover the user scores.
- `app_hash` : The hash returned by `/app/new` request.

#### Result Format:
```
{
    "status" : "success",
    "statusCode" : 1,
    "data" : {
        "_id" : "5918fc59a43b2200012d91e6",
        "score" : 1000
    }
}
```
