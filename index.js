
const express = require("express");
const bodyParser = require('body-parser')


const app = express()

app.use('/', express.static(`${__dirname}/dist`))
app.use('/img/', express.static(`${__dirname}/../web-resources/img`))
app.use(bodyParser.json({limit: '5000kb'}))

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('server listening on port ', port)
})
