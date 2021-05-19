const express = require('express');
require('./db/mongoose') // requiring this so that db can connect there
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')


const app = express();
const port = process.env.PORT


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



app.listen(port, ()=>{
    console.log('Server is upon port: ' + port);
})

