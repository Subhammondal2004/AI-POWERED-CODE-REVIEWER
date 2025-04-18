const express = require ('express');
const app = express();
const aiRouter = require('../src/routes/ai-route');
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.get('/', (req, res)=>{
    res.json({msg: 'hello from server'})
});

app.use('/ai', aiRouter);

module.exports = app;