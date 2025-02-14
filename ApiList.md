##DevTinder 


# authRouter
POST /signup
POST /login
POST /logout

# profileRouter
GET /profile/view
PATCH /profile/edit
PATCH /profile/password

# connectionRequestRouter
POST /request/send/:status/:toUserId     //status : intrested,ignored
POST /request/review/:status/:requestId  //status : accepted,rejected

# userRouter
GET /user/connections
GET /feed
GET /user/requests/received


status - ignored, intrested, accepted, rejected


