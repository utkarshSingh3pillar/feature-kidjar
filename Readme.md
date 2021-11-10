## Installation

```bash
$ npm install
```

## Run app on CommanLine

```bash

#include encryption
SET CONFIG_ENCRYPTION_KEY=

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
## Run app on Docker
## test test

```
docker build . -t nest-api

docker run -p 3000:3000 -d nest-api

docker run -p 49160:8080 -d nest-api

# Get container ID
$ docker ps

# Print app output
$ docker logs <container id>

CLIs CRUD generator: nest g resource [name].
```
## Secret Key Generation

### Export encryption key first on your local bash.
    export CONFIG_ENCRYPTION_KEY=
### Then create secret for the key.
    secure-config-tool create --secret MySecret
### Then copy that secret to your respective config file.

```
```
## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Rest API Statuses
- 200 OK : Indicates that the request has succeeded.
- 201 Created : Indicates that the request has succeeded and a new resource has been created as a result.
- 202 Accepted : Indicates that the request has been received but not completed yet. It is typically used in log running requests and batch processing.
- 400 Bad Request : The request could not be understood by the server due to incorrect syntax. The client SHOULD NOT repeat the request without modifications.
- 401 Unauthorized : Indicates that the request requires user authentication information. The client MAY repeat the request with a suitable Authorization header field
- 402 Payment Required (Experimental) : Reserved for future use. It is aimed for using in the digital payment systems.
- 403 Forbidden : Unauthorized request. The client does not have access rights to the content. Unlike 401, the client’s identity is known to the server.
- 404 Not Found : The server can not find the requested resource.
- 405 Method Not Allowed : The request HTTP method is known by the server but has been disabled and cannot be used for that resource.
- 500 Internal Server Error : The server encountered an unexpected condition which prevented it from fulfilling the request.
- 502 Bad Gateway : The server got an invalid response while working as a gateway to get a response needed to handle the request.
- 503 Service Unavailable : The server is not ready to handle the request.
- 504 Gateway Timeout : The server is acting as a gateway and cannot get a response in time for a request.