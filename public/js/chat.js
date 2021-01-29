const socket = io()

const messageContainer = document.querySelector('#message-container')
const messageInput = document.querySelector('#message-box')

messageInput.addEventListener('keyup', e => {
    if (e.key == 'Enter') {
        socket.emit('chatMessage', messageInput.value)
        messageInput.value = ''
    }
})

socket.on('chatMessage', res => {
    const messageLi = document.createElement('li')
    messageLi.innerText = res.userId + ': ' + res.message
    messageContainer.append(messageLi)
    messageContainer.scrollTop = messageContainer.scrollHeight
})

socket.on('newUserConnected', res => {

})

socket.on('initGameBoard', res => {
    const humanBoardDiv = document.querySelector('#human-board')

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            let cellDiv = document.createElement('div')
            cellDiv.classList = 'cell'
            cellDiv.dataset.row = i
            cellDiv.dataset.col = j

            if (res.humanGameBoard[i][j].charAt(0) == 's') {
                cellDiv.classList += ' ship'
            }

            humanBoardDiv.append(cellDiv)
        }
    }

    const machineBoardDiv = document.querySelector('#machine-board')

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            let cellDiv = document.createElement('div')
            cellDiv.classList = 'cell'
            cellDiv.dataset.row = i
            cellDiv.dataset.col = j

            machineBoardDiv.append(cellDiv)
        }
    }

    const machineCells = document.querySelectorAll('#machine-board .cell')

    console.log(machineCells)

    function clickBoard(machineCell) {
        console.log('Hea töö sa vajutasid boardile')
        console.log(machineCell.dataset.col)
    }
    machineCells.forEach(
        function (machineCell) {
            machineCell.addEventListener('click', () => {
                console.log('Hea töö sa vajutasid boardile')
                console.log(machineCell.dataset)
                socket.emit('attack', machineCell.dataset)
            })
        }
    )
})

messageInput.focus()
messageContainer.scrollTop = messageContainer.scrollHeight
