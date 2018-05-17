import socket from 'socket.io'

const io = socket(httpServer)

io.on('connection', e => {
  console.log(`Socket:connection`)
})

export default io
