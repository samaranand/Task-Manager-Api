const Task = require('../models/task')
const express = require('express')
const auth = require('../middleware/auth')

const router = new express.Router()


// it creates the task
router.post('/tasks', auth, async (req, res)=>{
    const task = new Task({
        ...req.body,
        creater: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)       
    }catch(e){
        res.status(400).send(e)
    }
})

// it return all tasks to frontend
// GET /tasks/completed=true
// GET /tasks/limit=2&skip=3
// GET /tasks/sort=createdAt:desc

router.get('/tasks', auth, async (req, res)=>{
    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = (req.query.completed === 'true')
    }
    if(req.query.sort){
        const parts = req.query.sort.split(':')
        sort[parts[0]] = (parts[1] === 'desc' ? -1 : 1)
    }
    try{
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    } catch(e){
        res.status(500).send(e)
    }
})



// find task by id
router.get('/tasks/:id',auth, async (req, res)=>{
    const _id = req.params.id;
    try{
        const task = await Task.findOne({_id, creater: req.user._id})
        if(!task) {
            return res.status(404).send();
        }
        res.status(201).send(task)
    } catch(e){
        res.status(400).send(e)
    }
})



// this edits task
router.patch('/tasks/:id',auth, async (req, res)=>{
    const _id = req.params.id;
    const updates = Object.keys(req.body)
    const validUpdates = ['description', 'completed']
    const isValid = updates.every(u => validUpdates.includes(u))
    if(!isValid){
        return res.status(400).send({error:"Invalid Update"})
    }
    try{
        const task = await Task.findOne({_id, creater: req.user._id})
        if(!task) return res.status(404).send();
        updates.forEach(u => task[u] = req.body[u])
        await task.save()
        res.status(200).send(task)
    } catch(e){
        res.status(500).send(e)
    }
})

// this deletes task
router.delete('/tasks/:id',auth, async (req, res)=>{
    const _id = req.params.id;
    try{
        const task = await Task.findOneAndDelete({_id, creater: req.user._id})
        if(!task) return res.status(404).send();
        res.status(200).send(task)
    } catch(e){
        res.status(500).send(e)
    }
})

module.exports = router