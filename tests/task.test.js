const request = require('supertest')

const app = require('../src/app')
const Task = require ('../src/models/task')

const {userOne, userOneId, setUpDatabase, userTwo, taskOne} = require('./fixtures/db')

beforeEach(setUpDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send(  
            {
                description: "Learn nodejs",
                completed: true
            }
        )
        .expect(201)
    
    const task = await Task.findById(response.body._id)

    expect(task).not.toBeNull()
})

test('Should get tasks from user one', async () => { 
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toEqual(2)
})

test('User two should not delete task from user one', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

        const task = await Task.findById(taskOne._id)
        expect(task._id).toEqual(taskOne._id)
        expect(task.description).toEqual(taskOne.description)

})