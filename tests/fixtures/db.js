const jwt = require('jsonwebtoken')
const mangoose = require('mongoose')

const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mangoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Daniel Yokoyama',
    email: 'teste@example.com',
    password: 'admadm123',
    tokens:[{
        token: jwt.sign({_id: userOneId}, process.env.JWT_TOKEN)
    }]
}

const userTwoId = new mangoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Mike',
    email: 'teste2@example.com',
    password: 'admadm123',
    tokens:[{
        token: jwt.sign({_id: userTwoId}, process.env.JWT_TOKEN)
    }]
}


const taskOne = new Task({
    _id: new mangoose.Types.ObjectId(),
    description: 'Clean house',
    owner: userOneId
}) 

const taskTwo = new Task({
    _id: new mangoose.Types.ObjectId(),
    description: 'Do bed',
    owner: userOneId
}) 

const taskThree = new Task({
    _id: new mangoose.Types.ObjectId(),
    description: 'Make lunch',
    owner: userTwoId
}) 

const taskFour = new Task({
    _id: new mangoose.Types.ObjectId(),
    description: 'Do dishes',
    owner: userTwoId
})

const setUpDatabase = async ()=> {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
    await new Task(taskFour).save()
}

module.exports = {
    userOne,
    userOneId,
    setUpDatabase,
    userTwo,
    taskOne
}