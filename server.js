const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const seaBattle = require('./sea-battle')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = 8000

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

io.on('connection', (socket) => {
    socket.on('chatMessage', msg => {
        console.log(socket.id + ': ' + msg)
        io.emit('chatMessage', { 'userId': socket.id, 'message': msg })
    })

    io.emit('initGameBoard', { 'humanGameBoard': seaBattle.gameBoard.human })
    // console.log('user connected ' + socket.id)
    // socket.on('disconnect', () => {
    //     console.log('user ' + socket.id + ' disconnected');
    // })
})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})

app.use('/public', express.static('./public/'))
