# The Best

The Best is a tiny and simple ranking API.

## URL

### `/status` (POST)
Check if the API is working.

#### Parameters:
No parameters required

#### Result Format:
`{ message : "The Best is On!" }`

### `/app/new` (POST)
Register a new application in the service and returing a hash to use in other requests.

#### Parameters:
- `name` : The name of application

#### Result Format:
`{ hash : '82267be7b55d204e0f996fa0a09a37890df2a9e1' }`

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
    "id": "590f529976aa6142d91870b7",
    "appHash": "82267be7b55d204e0f996fa0a09a37890df2a9e1",
    "scores": [100, 200, 150, 30, 25, 0, 63]
}
```
