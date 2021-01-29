const express = require('express')
const session = require('express-session')
const redis = require('redis')
const connectRedis = require('connect-redis')
var bodyParser = require('body-parser')
const http = require('http')
const socketio = require('socket.io')
const seaBattle = require('./sea-battle')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = 8000

const userList = {}

const RedisStore = connectRedis(session)
const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/public', express.static('./public/'))

redisClient.on('error', function (err) {
    console.log('Could not establish a connection with redis. ' + err)
})
redisClient.on('connect', function (err) {
    console.log('Connected to redis successfully')
})

const sessionMiddleware = session({
    store: new RedisStore({ client: redisClient }),
    secret: 'secret$%^134',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent client side JS from reading the cookie
        maxAge: 1000 * 60 * 60 * 24 // session max age in miliseconds
    }
})

app.use(sessionMiddleware)

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next)
})

app.get("/", (req, res) => {
    sess = req.session;
    if (sess.username && sess.password) {
        sess = req.session
        if (sess.username) {
            res.sendFile(__dirname + "/public/index.html")
        } else {
            res.sendFile(__dirname + "/public/login.html")
        }
    }


})

app.post("/login", (req, res) => {
    sess = req.session;
    sess.username = req.body.username
    sess.password = req.body.password
    // add username and password validation logic here if you want. If user is authenticated send the response as success
    res.end("success")
})

app.post("/register", (req, res) => {
    let isSuccess = false
    redisClient.hgetall('users', (err, result) => {
        if (result) {
            if (req.body.username in result) {
                isSuccess = false
            }
            else {
                isSuccess = true
            }
        } else {
            isSuccess = true
        }

        if (isSuccess) {
            redisClient.hset('users', req.body.username, req.body.password)
            res.json({ response: 'success' })
        } else {
            res.json({ response: 'userExists' })
        }
    })
})

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return console.log(err)
        }
        res.redirect("/")
    })
})

io.on('connection', (socket) => {
    const sess = socket.request.session
    userList[socket.id] = sess.username
    // console.log(sess.username)
    // console.log(socket.id)


    socket.on('chatMessage', msg => {
        console.log(socket.id + ': ' + msg)
        io.emit('chatMessage', { 'userId': socket.id, 'message': msg })
    })

    io.emit('newUserConnected', userList)
    io.emit('initGameBoard', { 'humanGameBoard': seaBattle.gameBoard.human })
    // console.log('user ' + socket.id + ' connected)
    socket.on('disconnect', () => {
        console.log('user ' + socket.id + ' disconnected')
        delete userList[socket.id]
    })

    socket.on('attack', coordinates => {
        console.log(coordinates)
    })
})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})
