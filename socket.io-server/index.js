import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { instrument } from '@socket.io/admin-ui'

const app = express()
const server = createServer(app)

const io = new Server(server, {
    path: '/ws',
    cors: {
        origin: (origin, callback) => {
            if (origin) {
                callback(null, true)
            } else {
                callback(new Error('No origin header'), false)
            }
        },
        credentials: true
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: 60 * 60 * 1000,
        skipMiddlewares: true,
    }
})

instrument(io, {
    auth: false,
    mode: 'development',
})

io.on('connection', (socket) => {
    socket.on('chat', (msg) => {
        io.emit('chat', `${msg} (from server)`)
    })
})

server.listen(3600, () => {
    console.log('Websockets (socket.io) server running at http://localhost:3600')
})
