# The Best

The Best is a tiny and simple ranking API.

## URL

### `/status` (POST)
Check if the API is working.

#### Parameters:
No parameters required

#### Result:
`{ message : "The Best is On!" }`

### `/app/new` (POST)
Register a new application in the service and returing a hash to use in other requests.

#### Parameters:
- `name` : The name of application

#### Result:
`{ hash : '82267be7b55d204e0f996fa0a09a37890df2a9e1' }`

