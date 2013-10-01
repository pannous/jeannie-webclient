// TODO RENAME
// google api docs are often not straight forward. look into
// http://stackoverflow.com/q/7393852
// https://developers.google.com/oauthplayground
// https://developers.google.com/accounts/docs/OAuth2UserAgent?hl=de
// https://developers.google.com/+/web/api/javascript
// https://developers.google.com/oauthplayground

var googvars = {

    // Enter a client ID for a web application from the Google Developer Console.
    // In your Developer Console project, add a JavaScript origin that corresponds to the domain
    // where you will be running the script.
    clientId  : '480122947868-0meo67pauhl71f12935lth7r94vok7jo.apps.googleusercontent.com',

    // Enter the API key from the Google Developer Console - to handle any unauthenticated
    // requests in the code.
    apiKey : 'AIzaSyAHIAkpSvR075MDwzxR_E1nJkQLXT1XSbM',

    scopes : "https://www.googleapis.com/auth/userinfo.email"
+ " https://www.googleapis.com/auth/calendar"
// for the mail feed no longer necessary + " https://mail.google.com/mail/feed/atom"
// for imap
+ " https://mail.google.com/"
// for contacts -> to send mail
+ " https://www.google.com/m8/feeds/"
}

googvars.getURLParams = function() {
    if(this.loggedIn)
        return "&googleAccessToken=" + this.accessToken;
    return "";
}

function shouldHandleGoogle(input) {
    // no need to login if already logged in
    if(googvars.loggedIn)
        return false;
    
    input = input.toLowerCase();
   
    // to access contacts and mail feed
    return matches(input, "mail") 
    || matches(input, ["google", "login"], "AND")
    // to access calendar
    || matches(input, ["remind", "appointment", "alarm", "wake", "calendar"])
    || matches(input, ["erinner", "termin", "weck", "kalender"])
    // to access contacts
    || matches(input, ["sms", "phone", "mobile", "contact", "address"])
    || matches(input, ["telefon", "nummer", "handy", "kontakt", "adresse"])
    // call
    || matches(input, ["skype", "call"]) 
    || matches(input, "anrufen") || matches(input, ["ruf", "an"], "AND");
}

function handleGoogleLogin(callback) {
    googvars.callback = callback;
    gapi.load('client', function() {
        gapi.client.setApiKey(googvars.apiKey);
        // prompt: "consent"
        gapi.auth.authorize({
            client_id: googvars.clientId,
            scope: googvars.scopes,
            immediate: true,
            response_type: "token"
        // , approval_prompt: "force"
        }, handleAuthResult);
    });
}

function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
        showLoginButton();
    } else {
        gapi.auth.authorize({
            client_id: googvars.clientId,
            scope: googvars.scopes,
            // important otherwise endless loop
            immediate: false,
            response_type: "token"
        }, handleAuthResult);
    }
}

function showLoginButton() {
    gapi.client.request({
        path: "/oauth2/v1/userinfo",
        async: false,
        callback: function(data) {
            // console.log(data);
            if(!data) {
                alert("Couldn't login?");
                return;
            }
            var gDiv = $("#google_div");
            gDiv.append($("<button>Logout</button>").click(logoutGoogle));
            gDiv.append($("<span>" + data.email + "</span>"));
            gDiv.show();
            $("#google_login").hide();            
            googvars.loggedIn = true;
            googvars.accessToken = gapi.auth.getToken().access_token;
            if(googvars.callback)
                googvars.callback();
        }
    });
}

//function makePlusApiCall() {
//    gapi.client.load('plus', 'v1', function() {
//        var request = gapi.client.plus.people.get({
//            'userId': 'me'
//        });
//        request.execute(function(resp) {
//            if(!resp.image) {
//                alert("Couldn't login?");
//                return;
//            }
//            var image = document.createElement('img');
//            image.src = resp.image.url;
//            var gDiv = $("#google_logout");
//            gDiv.append(image);
//            gDiv.append($("<span>" + resp.displayName + "</span>"));
//            gDiv.click(logoutGoogle);
//        });
//    });
//}

// Nice hack to logout http://stackoverflow.com/q/4202161
function logoutGoogle() {
    // avoid loop so do not specify the current input!
    var redirUrl = "https://" + window.location.hostname;
    if(window.location.hostname == "localhost")
        redirUrl = "http://localhost:" + window.location.port;

    document.location.href = "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=" + redirUrl;
}
