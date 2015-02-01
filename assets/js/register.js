io.sails.url = 'http://localhost:3001';

window.CZ = {
  deviceId: 1, // FIXME: HARD CODED
  devicePath: function() {
    return '/device/' + this.deviceId.toString() + '/subscribe'
  },
  createRequest: function(amount, message) {
    var requestParams = {
      device: this.deviceId,
      amount: amount,
      message: message
    };

    io.socket.post('/request', requestParams)
  },
  setMessage: function(msg) {
    $('#message').text(msg)
  },
  initMessage: function() {
    CZ.setMessage('Connected As Device#' + CZ.device.id.toString());
  }
};

var setQrCode = function(url) {
  if (CZ.qrCode) {
    CZ.qrCode.clear();
    CZ.qrCode.makeCode(url);
  } else {
    CZ.qrCode = new QRCode("qrcode", {text: url});
  }

  $(window.CZ.qrCode._el).show();
};

var setSocketEvents = function(device) {
  io.socket.on('requestCreated', function(request) {
    CZ.currentRequest = Ember.Object.create(request);
    CZ.setMessage('Pending Request, awaiting payment');
    setQrCode(request.uri);
  });

  io.socket.on('requestPaid', function(tx) {
    if(CZ.currentRequest) {
      CZ.currentRequest = undefined;
      CZ.setMessage('Request Paid, thanks!');
      $(window.CZ.qrCode._el).hide();
      setTimeout(CZ.initMessage, 5000);
    }
  });

  io.socket.on('requestTimeout', function() {
    console.log('requestTimeout', arguments);
  })
};

$(document).ready(function() {

  io.socket.post(CZ.devicePath(), {deviceId: CZ.deviceId}, function(response) {
    CZ.device = response.device;
    CZ.initMessage();

    setSocketEvents(response)
  });

});

window.App = Ember.Application.create();
App.MyView = Ember.View.extend();

