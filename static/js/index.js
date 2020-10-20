$(document).ready(() =>{
  const entries = [document.getElementById('firstEntry')]
  let urlBuffer = ''
  const notifySound = new Audio('audio/notifySound.wav')

  function newLiElement () {
    const li = document.createElement('LI')
    entries.push(li)
    li.addEventListener('input', inputHandler)
    li.class = 'entry'
    const ul = document.getElementById('linkList')
    const inputs = [document.createElement('INPUT'),
      document.createElement('INPUT'),
      document.createElement('INPUT')]
    inputs[0].type = 'url'
    inputs[1].type = 'time'
    inputs[2].type = 'date'
    for (let i = 0; i < 3; i++) {
      li.appendChild(inputs[i])
    }
    ul.appendChild(li)
  }

  function readyForNewElement () {
    for (let i = 0; i < entries.length; i++) {
      if (!liIsValid(entries[i])) {
        return false
      }
    }
    return true
  }

  function inputHandler () {
    if (readyForNewElement() && entries.length <= 10) {
      newLiElement()
    }
  }

  document.getElementById('firstEntry').addEventListener('input', inputHandler)

  $('#joinButton')[0].addEventListener('click', () => {
    window.open(urlBuffer)
    $('#notification')[0].style.visibility = 'hidden'
  })

  $('#ignoreButton')[0].addEventListener('click', () => {
    $('#notification')[0].style.visibility = 'hidden'
  })

  function liIsValid (liElement) {
    for (let child = liElement.firstChild; child; child = child.nextSibling) {
      if (child.value === '') {
        return false
      }
    }
    return true
  }

  function clearSignUpModal () {
    const list = $('#signUpModal input')
    for (let i = 0; i < list.length; i++) {
      list[i].value = ''
    }
    $('#signUpModal').modal('hide')
  }

  function clearLoginModal () {
    const list = $('#loginModal input')
    for (let i = 0; i < list.length; i++) {
      list[i].value = ''
    }
    $('#loginModal').modal('hide')
  }

  function loadData (meetingData) {
    if (meetingData.urls != null) {
      for (let i = 0; i < meetingData.urls.length; i++) {
        entries[i].children[0].value = meetingData.urls[i]
        entries[i].children[1].value = meetingData.times[i]
        entries[i].children[2].value = meetingData.dates[i]
        if (entries.length !== 10) newLiElement()
      }
    }
  }

  function saveDataSuccess (successful) {
    if (successful) {
      $('#save').popover({
        content: 'Saved!',
        trigger: 'focus'
      })
      $('#save').popover('toggle')
    } else {
      $('#save').popover({
        content: 'Error! Could not save',
        trigger: 'focus'
      })
      $('#save').popover('toggle')
    }
  }

  let loginBtnBind = new Vue({
    el: '#loginForm',
    data() {
      return {
        usr: '',
        psw: '',
        inactiveClass: 'btn btn-primary btn-block btn-lg inactive',
        activeClass: 'btn btn-primary btn-block btn-lg'
      }
    }
  })

  let signupBtnBind = new Vue({
    el: '#signupForm',
    data () {
      return {
        usr: '',
        psw: '',
        psw2: '',
        inactiveClass: 'btn btn-primary btn-block btn-lg inactive',
        activeClass: 'btn btn-primary btn-block btn-lg text-center'
      }
    }
  })

  // check for meeting
  setInterval(() => {
    const currTime = new Date()
    for (let i = 0; i < entries.length; i++) {
      const time = entries[i].children[1]
      const date = entries[i].children[2]
      const meetTime = new Date(date.value + ' ' + time.value)
      if (meetTime.toDateString() === currTime.toDateString() &&
      meetTime.toTimeString().substring(0, 5) === currTime.toTimeString().substring(0, 5)) {
        let link = ''
        const given = entries[i].firstChild.value
        if (!given.startsWith('http://') &&
          !given.startsWith('https://')) {
          link = 'http://'
        }
        link += given
        makeNotification(link)
      }
    }
  }, 60000)

  // NOTIFICATION DIV CODE
  function makeNotification (url) {
    $('#notification')[0].style.visibility = 'visible'
    urlBuffer = url
    notifySound.play()
  }

  // connect with backend
  const socket = io()
  socket.on('news', function (data) { // listen to news event raised by the server
    // login button handler
    const loginForm = document.getElementById('loginForm')
    $('#login').click(() =>{
      if (loginForm.checkValidity()) {
        const username = loginForm.children[0].children[0].value
        const password = loginForm.children[1].children[0].value
        socket.emit('loginEvent', { user: username, pass: password }, (answer)=>{
          if (answer.message === 'success') {
            $('#signupButton')[0].style.visibility = 'hidden'
            $('#loginButton')[0].style.visibility = 'hidden'
            $('#save')[0].style.visibility = 'visible'
            clearLoginModal()
            // load user data from database
            socket.emit('requestDataEvent', {}, (answer)=>{
              loadData(answer.data)
            })
          }
        })
      }
      return false
    })

    // signup button handler
    const signupForm = document.getElementById('signupForm')
    $('#signup').click(() =>{
      if (signupForm.checkValidity()) {
        const username = signupForm.children[0].children[0].value
        const password = signupForm.children[1].children[0].value
        socket.emit('signUpEvent', { user: username, pass: password }, (answer)=>{
          if (answer.message === 'success') {
            $('#signupButton')[0].style.visibility = 'hidden'
            $('#loginButton')[0].style.visibility = 'hidden'
            $('#save')[0].style.visibility = 'visible'
            clearSignUpModal()
          }
        })
      }
      return false
    })

    // save button handler
    $('#save').click(() => {
      let urls = []
      let times = []
      let dates = []
      for (let i = 0; i < entries.length; i++) {
        if (liIsValid(entries[i])) {
          urls.push(entries[i].children[0].value)
          times.push(entries[i].children[1].value)
          dates.push(entries[i].children[2].value)
        }
      }
      socket.emit('saveEvent', { urls: urls, times: times, dates: dates }, answer =>{
        saveDataSuccess(answer.successful === 'success')
      })
    })
  })
})
