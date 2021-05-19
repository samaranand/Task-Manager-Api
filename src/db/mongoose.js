const mongoose = require('mongoose');

const connectionURL = process.env.MONGODB_URL


mongoose.connect(connectionURL+'/task-manager-api', {
    useNewUrlParser:true, 
    useUnifiedTopology:true,
    useCreateIndex:true
})


