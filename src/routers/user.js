const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')


const router = new express.Router()

// this creates new account
router.post('/users', async (req, res)=>{
    const user = new User(req.body);
    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user: user.getPublicData(), token})
    } catch(e){
        res.status(400).send(e)
    }  
});

// login system
router.post('/users/login', async (req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user: user.getPublicData(), token})
    } catch(e){
        res.status(400).send(e)
    }
})


// logout system
router.post('/users/logout', auth, async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter(token => {
            token.token !== req.token
        })
        await req.user.save()
        res.send("successfully logged out")
    } catch(e){
        res.status(500).send()

    }
})

// logout from everywhere
router.post('/users/logoutAll', auth, async (req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send("successfully logged out from evrywhere")
    } catch(e){
        res.status(500).send()

    }
})


// my profile
router.get('/users/me', auth, async (req, res)=>{
    res.send(req.user.getPublicData())
})


// update my profile
router.patch('/users/me',auth, async (req, res)=>{
    const updates = Object.keys(req.body)
    const validUpdates = ['name', 'email', 'age', 'password']
    const isValid = updates.every(u => validUpdates.includes(u))
    if(!isValid) {
        return res.status(404).send({error:"Invalid Update"})
    }
    try{
        updates.forEach(u => req.user[u] = req.body[u])
        await req.user.save()
        res.status(200).send({user : req.user.getPublicData()})
    } catch(e){
        res.status(400).send(e)
    }
})


// delete my profile
router.delete('/users/me', auth, async (req, res)=>{
    try{
        await req.user.remove()
        res.send({user: req.user.getPublicData()})
    } catch(e){
        res.status(400).send(e)
    }
})


// upload profile photo

const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Plz choose a jpg/jpeg/png file'))
        }
        cb(undefined, true)
    }
})

// upload avatar
router.post('/users/me/avatar',auth, upload.single('avatar'), async (req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send('Photo has been uploaded')
}, (err, req, res, next)=>{
    res.status(400).send({error: err.message})
})

// return avatar
router.get('/users/:id/avatar', async (req, res)=>{
   
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error('Not Found')
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch(e){
        res.status(404).send()
    }
})


// delete avatar
router.delete('/users/me/avatar',auth, async (req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send('Photo has been deleted')
})



module.exports = router