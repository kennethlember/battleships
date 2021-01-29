const registerBtn = document.getElementById('submit')
const usernameInput = document.getElementById('username')
const passwordInput = document.getElementById('password')
const responseMessageDiv = document.getElementById('response-message')

registerBtn.addEventListener('click', e => {
    responseMessageDiv.innerHTML = ''

    const data = { username: usernameInput.value, password: passwordInput.value }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            if (data.response == 'success') {
                window.location.href = '/'
            } else if (data.response == 'userExists') {
                responseMessageDiv.innerHTML = 'Selline kasutajanimi on juba olemas!'
            }
            console.log(data)
        })
        .catch(error => {
            console.log('Error: ', error)
        })
})
