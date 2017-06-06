angular.module('myad5')
  .controller('ChatDetailCtrl', function ($stateParams, $timeout, $sanitize, Chats, Backand, Messages, $ionicScrollDelegate) {
    var self = this
    var typing = false
    var lastTypingTime
    var TYPING_TIMER_LENGTH = 400

    // Add colors
    var COLORS = [
      '#e21400', '#91580f', '#f8a700', '#f78b00', 
      '#58dc00', '#287b00', '#a8f07a', '#4ae8c4', 
      '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ]

    // Send a message - POST request to the server
    // After the message is added in the server's db, it triggers an action that dispatches the real time event to the clients
    // The action is configured in the Backand app
    self.sendMessage = function () {
      Messages.post($sanitize(self.chat.newMessage), $stateParams.chatId)
      //socket.emit('stop typing')
      self.chat.newMessage = ''
    }

    // Get the latest messages from the server
    self.getMessages = function () {
      Messages.get($stateParams.chatId).then(function (response) {
        self.messages = response.data.map(function (item) {
          return item.message
        })
      })
    }

    // update typing 
    self.updateTyping = sendUpdateTyping

    function sendUpdateTyping () {
      // if (!typing) {
      //   typing = true
      //   socket.emit('typing')
      // }

      // lastTypingTime = (new Date()).getTime()

      // $timeout(function () {
      //   var typingTimer = (new Date()).getTime()
      //   var timeDiff = typingTimer - lastTypingTime
      //   if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
      //     socket.emit('stop typing')
      //     typing = false
      //   }
      // }, TYPING_TIMER_LENGTH)
    }

    // Generate color for the same user.
    function getUsernameColor (username) {
      // Compute hash code
      var hash = 7
      for (var i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + (hash << 5) - hash
      }
      // Calculate color
      var index = Math.abs(hash % COLORS.length)
      return COLORS[index]
    }

    function init () {
      // Scroll chats to bottom so the user can see the latest messages
      $ionicScrollDelegate.scrollBottom(true)

      // Listen to real time events for the current chat, and when the event triggers run the callback that adds a new message
      // For more info about real time events in Backand: http://docs.backand.com/en/latest/apidocs/realtime/index.html
      Backand.on('send_message_' + $stateParams.chatId, function (data) {
        self.getMessages()
        $ionicScrollDelegate.scrollBottom(true)
      })

      // Whenever the server emits 'typing', show the typing message
      Backand.on('typing', function (data) {
        addChatTyping(data)
      })

      // Whenever the server emits 'stop typing', kill the typing message
      Backand.on('stop typing', function (data) {
        removeChatTyping(data.username)
      })

      // Get the chat from the server to get its metadata
      Chats.get($stateParams.chatId).then(function (response) {
        self.chat = response.data
      })

      self.getMessages()
    }

    init()
  })
