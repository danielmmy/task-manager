const request = require('supertest')

const app = require('../src/app')
const User = require ('../src/models/user')

const {userOne, userOneId, setUpDatabase} = require('./fixtures/db')

beforeEach(setUpDatabase)

test('Should sign up user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Daniel',
            email: 'danielmmy10@example.com',
            password: 'admadm123'
        })
        .expect(201)
    
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    expect(response.body).toMatchObject({
        user:{
            name: 'Daniel',
        email: 'danielmmy10@example.com' 
        },
        token: user.tokens[0].token
    })
})

test('Should log in a user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(user).not.toBeNull()
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should fail to log in a user', async () => {
    await request(app).post('/users/login').send({
        email: 'bademail@bademail.com',
        password: 'falnbalgnbal'
    }).expect(400)
})

test('Should get user profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should fail to get user profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer fasfasfasfasfasfasfasfasfasfasfas`)
        .send()
        .expect(401)
})

test('Should delete user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should fail to delete user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer asfdasfafasfasfsafasfasfasfagdasgadgag`)
        .send()
        .expect(401)
})

test('Should upload an image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)

        const user = await User.findById(userOneId)
        expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user data', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Daniel',
        email: 'danielmmy10@example.com'
    })
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user).not.toBeNull()
    expect(user).toMatchObject({
        name: 'Daniel',
        email: 'danielmmy10@example.com'
    })
})

test('Should update valid user data', async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'Daniel'
    })
    .expect(400)
})