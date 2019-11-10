const express = require ('express')

const userRouter = require('./routers/usersRouter')
const tasksRouter = require('./routers/tasksRouter')

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(tasksRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})