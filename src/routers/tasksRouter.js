const express = require('express')


const Task = require('../models/task')
const auth = require('../middleware/auth')
require('../db/mongoose')

const tasksRouter = new express.Router()

tasksRouter.post('/tasks', auth, async (req, res) =>{
    const task =new Task({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }catch(err){
        res.status(400).send(err)
    }
})

tasksRouter.get('/tasks', auth, async (req, res) =>{
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1  : 1
    }

    try {
       await req.user.populate({
           path: 'tasks',
           match,
           options: {
               limit: parseInt(req.query.limit),
               skip: parseInt(req.query.skip),
               sort
           }
        }).execPopulate()
       res.send(req.user.tasks)
    } catch (err) {
        res.status(500).send(err)
    }
})

tasksRouter.get('/tasks/:id', auth, async (req, res) =>{
    try {
        const _id = req.params.id
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task){
            res.status(404).send()
        }
        res.send(task)
    } catch (err) {
        res.status(500).send(err)
    }
})

tasksRouter.patch('/tasks/:id', auth ,async (req, res) => {
    const updates = Object.keys(req.body)
    const validKeys = ['description', 'completed']
    const isValidUpdate = updates.every((update) => validKeys.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({error: 'Trying to update invalid element'})
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(400).send({error: 'Task not found'})
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (err) {
        res.status(500).send(err)
    }
})

tasksRouter.delete('/tasks/:id', auth, async (req, res) =>{
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (err) {
        res.status(500).send(err)
    }
})



module.exports = tasksRouter