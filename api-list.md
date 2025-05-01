## authRouter

- POST
  /signup
  /login
  /logout

## profileRouter

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## connectionRequestRouter

/request/send/:status/:userId

- POST /request/send/interested/:userId
- POST /request/send/ignored/:userId

  /request/review/:status/:requestId

- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

## userRouter

- GET /user/request/received
- GET user/connections
- GET user/feed

status: ignore, interested, accepted, rejected
