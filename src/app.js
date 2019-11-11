const express = require ('express')

const userRouter = require('./routers/usersRouter')
const tasksRouter = require('./routers/tasksRouter')

const app = express()


app.use(express.json())
app.use(userRouter)
app.use(tasksRouter)

module.exports = app