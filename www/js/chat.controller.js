angular.module('myad5')
  .controller('ChatsCtrl', function (Chats) {
    var self = this

    // Add chat and refresh the list
    self.create = function (name) {
      Chats.add(name).then(function () {
        self.isCreating = false
        init()
      })
    }

    self.cancelCreate = function () {
      self.isCreating = false
    }

    // Load the chats from the server
    function init () {
      Chats.getAll().then(function (response) {
        self.chats = response.data
      })
    }

    init()
  })
