(function($) {
    var config = {
        contextPath: ''
    }

    var cometd = $.cometd;
    $(document).ready(function() {
        // cookie is set via login procedure
        var authCookie = $.cookie("auth");
        var paramMap = parseUrlAndRequest();
        try {
            $("#menu").tabify();
        } catch(e) {}

        if(!paramMap.message)
            $("#message").hide();
        else
            $("#message").text(paramMap.message);

        var email
        try {
            email = authCookie.split("|")[0];
        } catch(ex) {
            console.log(ex);
        }

        if(email)
            $("#email").text("Your Email: " + email);
        else
            $("#email").hide();

        startRecognition();

        // todo:  moved to another file. cometd??
        var AuthExt = function() {
            var _cometd;

            this.registered = function(name, cometd) {
                _cometd = cometd;
            };

            this.outgoing = function(message) {
                // 1. add authentication for handshake because handshake should be successfull only
                //    if logged in (token for the email has to exists)
                // 2. add authentication for every subscribe + publish
                if (message.channel == '/meta/handshake'
                    || message.channel == '/meta/subscribe'
                    || message.channel == '/meta/publish') {
                    // Log the long poll
                    _cometd._info('bayeux connect');

                    // Count the long polls
                    if (!message.ext)
                        message.ext = {};
                    if (!message.ext.authentication)
                        message.ext.authentication = authCookie;
                }
            };
        };

        // Disconnect when the page unloads
        $(window).unload(function() {
            cometd.disconnect(true); // cometd??
        });

        var cometURL = location.protocol + "//" + location.host + config.contextPath + "/cometd";
        cometd.configure({
            url: cometURL,
            logLevel: 'debug'
        });

        cometd.registerExtension('authExt', new AuthExt());
        cometd.addListener('/meta/handshake', _metaHandshake);
        cometd.addListener('/meta/connect', _metaConnect);

        cometd.handshake();
    });
})(jQuery);



// todo : Move to another file
function _connectionEstablished() {
    $('#status').text('Connected').attr('class', 'green');
}

function _connectionBroken() {
    $('#status').text('Lost Connection').attr('class', 'red');
}

function _connectionClosed() {
    $('#status').text('Disconnected').attr('class', 'red');
}

// Function that manages the connection status with the Bayeux server
var _connected = false;
function _metaConnect(message) {
    if (cometd.isDisconnected()) {
        _connected = false;
        _connectionClosed();
        return;
    }

    var wasConnected = _connected;
    _connected = message.successful === true;
    if (!wasConnected && _connected)
        _connectionEstablished();
    else if (wasConnected && !_connected)
        _connectionBroken();
}

// Function invoked when first contacting the server and when the server has lost the state of this client
function _metaHandshake(handshake) {
    if (handshake.successful === true) {
        $("#verifyError").hide();
        $("#email").show();
        cometd.batch(function() {
            cometd.subscribe('/chat/' + email, function(message) {
                var command = message.data.command;
                if(command == "period") {
                    $('#chatwindow').append(".");
                } else if(command == "new line") {
                    $('#chatwindow').append("\n");
                } else {
                    var text = $('#chatwindow').text();
                    if(text.length > 0) {
                        var lastC = text.charAt(text.length - 1);
                        if(lastC != ' ' && lastC != '\n')
                            $('#chatwindow').append(" ");
                    }
                    var msg = message.data.object;
                    $('#chatwindow').append(msg);
                }
            });

            // no need for this at the moment
            // Publish on a service channel since the message is for the server only
            //    cometd.publish('/service/chat', {
            //      message: "test it again"
            //    });
        });
    } else {
        $("#verifyError").show();
        $("#email").hide();
    }
}
