const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/user')
const auth = require('../middleware/auth')
require('../db/mongoose')
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account')

const userRouter = new express.Router()

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(png|jpeg|jpg)$/)){
           return cb(new Error('Error: File must be an image'))
        }
        cb(undefined,true)
    }
})

userRouter.get('/users/:id/avatar', async (req, res)=>{
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (err) {
        res.status(404).send
    }
})

userRouter.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (err, req, res, next) => {
    res.status(400).send({error: err.message})
})

userRouter.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

userRouter.post('/users', async (req, res) => {
    try{
        const user = new User(req.body)
        const savedUser = await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await savedUser.generateAuthToken()
        res.status(201).send({user, token})
    }catch(err){
        res.status(400).send(err)
    }
})

userRouter.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


userRouter.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update) )
    try {
        if(!(isValidOperation && updates.length > 0)){
            return res.status(400).send()
        }
        
        updates.forEach((update) => req.user[update] = req.body[update])
        
        await req.user.save()

        res.send(req.user)
    } catch (err) {
        res.status(500).send(err)
    }

})

userRouter.delete('/users/me', auth, async (req, res) =>{
    try {
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (err) {
        res.status(500).send(err)
    }
})

userRouter.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (err) {
        res.status(400).send(err)
    }
})

userRouter.post('/users/logout', auth, async (req, res) =>{
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        console.log(req.user.tokens)
        res.send()
    }catch(err){
        res.status(500).send()
    }
})

userRouter.post('/users/logoutAll', auth, async (req,res) =>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send()
    }catch{
        res.status(500).send()
    }
})

module.exports = userRouter