import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'node:http'

const app = express()
const server = createServer(app)

const io = new Server(server, {
    path: '/ws',
    connectionStateRecovery: {
        maxDisconnectionDuration: 60 * 60 * 1000,
        skipMiddlewares: true,
    }
})

io.on('connection', (socket) => {
    socket.on('chat', (msg) => {
        io.emit('chat', `${msg} (from server)`)
    })
})

server.listen(3600, () => {
    console.log('Websockets (socket.io) server running at http://localhost:3600')
})
