var recognizing = false;
var startTimestamp;
var finalTranscript = '';
var recognitionObj;

// states: 'nothing', 'restart', 'stop'
var audioState = 'nothing';
var sleeping = false;

function isSpeechRecPossible() {
    return 'webkitSpeechRecognition' in window;
}

window.onfocus = function() {
    if(!recognizing && !isTtsSpeaking()) {
        // if somehow in sleep mode -> wakup
        if(sleeping)
            sleep(false, true);

        restartSpeechRecogition(false);
    }
};

function stopSpeechRecognition() {
    audioState = 'stop';
    recognitionObj.stop();
}

function restartSpeechRecogition(force) {
    if(!isSpeechRecPossible())
        return;
    
    if(force || !recognitionObj) {
        console.log("restartSpeechRecogition");
        initWebkitSpeechRecognition();
        startRecognition();
    }
}
var standby_phrases = ["standby", "stand by","stand-by", "go to sleep", "goto sleep",
"go sleeping", "sleep now", "to background", "goto background", "in background",
"be silent", "silence please",
"background mode", "stop listening", "ground mode", "grove mode","shut up",
"geh schlafen","geschlafen", "hör auf", "sei still"];

var wake_phrases = ["wake-up", "wake up", "listen", "listen again", "back to work",
"okay google", "ok google", "o.k. google", "jeannie",
"genie","jenny","jamie","wach auf","aufwachen","teenie"];
var close_phrases = ["close page","close window", "close popup", "close pop up"];

function tryWakeup(input) {
    for (phrase in wake_phrases)
        if (input.toLowerCase().match(wake_phrases[phrase])) {
            sleep(false, true);
            return true;
        }
    return false;
}

function tryStandby(input) {
    for (phrase in standby_phrases)
        if (input.toLowerCase().match(standby_phrases[phrase])) {
            sleep(true, true);
            return true;
        }
    return false;
}
function tryClose(input) {
    for (phrase in close_phrases)
        if (input.toLowerCase().match(close_phrases[phrase])) {
            closePopupWindow();
            return true;
        }

    return false;
}

function playSound(soundfile) {
    document.getElementById("sound_dummy").innerHTML =
    "<embed src=\"" + soundfile + "\" hidden=\"true\" autostart=\"true\" loop=\"false\" />";
}


function capitalize(s) {
    var first_char = /\S/;
    return s.replace(first_char, function (m) {
        return m.toUpperCase();
    });
}

function initWebkitSpeechRecognition() {
    recognizing = false;
    if (!isSpeechRecPossible())
        return false;    

    recognitionObj = new webkitSpeechRecognition();
    recognitionObj.continuous = true;
    recognitionObj.interimResults = false;

    recognitionObj.onstart = function () {
        recognizing = true;
        showInfo('info_speak_now');
        start_img.src = 'img/mic-animate-blue.gif';
    };

    recognitionObj.onaudioend = function () {
        console.log("onaudioend " + audioState);
        if (audioState == "stop")
            return;
        audioState = "restart";
    };

    recognitionObj.onerror = function (event) {
        console.log(event);
        if (event.error == 'network') {
            showInfo('info_error_network');
        } else if (event.error == 'aborted') {
            showInfo('info_error_aborted');
        } else if (event.error == 'no-speech') {
            start_img.src = 'img/mic.png';
            showInfo('info_no_speech');
        } else if (event.error == 'audio-capture') {
            start_img.src = 'img/mic.png';
            showInfo('info_no_microphone');
        } else if (event.error == 'not-allowed') {
            if (event.timeStamp - startTimestamp < 100) {
                showInfo('info_blocked');
            } else {
                showInfo('info_denied');
            }
        } else {
            showInfo('info_unknown');
        }
    };

    recognitionObj.onend = function () {
        console.log("onend, sleeping: " + sleeping + ", audioState:" + audioState);
        recognizing = false;
        if (audioState == "restart")
            restartSpeechRecogition(true);

        audioState = 'nothing';
        start_img.src = 'img/mic.png';        
    };

    recognitionObj.onresult = function (event) {
        var interim_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            var recognized = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                interim_transcript += recognized;
                finalTranscript += recognized;
            } else {
                interim_transcript += recognized;
            }
        }


        console.log("finalTranscript:" + finalTranscript);
        copyToClipboard(finalTranscript);
        var input = $.trim(capitalize(finalTranscript));
        if(sleeping) {
            tryWakeup(input);
        // wake up command should not result in a request
        } else {
            if(tryStandby(input)) {
            // standby/sleep command
            } else if(tryClose(input)) {
            // close popup window
            } else if(checkCompose(input)) {
            // switch to input area
            } else {
                // hand over recognized text ONLY if not sleeping
                $('#myinput').val(input);
                mysubmit();
            }
        }

        finalTranscript = '';
    // for now interimResults = false otherwise we would need special send command
    // interim_span.innerHTML = interim_transcript;
    };
    return true;
}

//  disabled in most browsers !
//http://stackoverflow.com/questions/400212/how-to-copy-to-the-clipboard-in-javascript
function copyToClipboard(text)
{
    try{
        if (window.clipboardData) // Internet Explorer
        {
            window.clipboardData.setData("Text", text);
        }
        else
        {
            unsafeWindow.netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            const clipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
            clipboardHelper.copyString(text);
        }
    }catch(e){}
}


function showInfo(info) {
    try{        
        info = $('#' + info);
        if (info) {
            info.show().delay(5000).fadeOut(2000, function() {
                // finish fade out
                });
        }
    }catch(e){};
}

function startRecognition() {
    finalTranscript = '';
    var tmpLang = getSelectedLocale();
    if (!tmpLang)
        tmpLang = "en-US";
    recognitionObj.lang = tmpLang;
    console.log("using lang " + tmpLang);
    recognitionObj.start();
    
    // final_span.innerHTML = '';
    // interim_span.innerHTML = '';
    start_img.src = 'img/mic-slash.png';
    showInfo('info_allow');
// TODO startTimestamp = event.timeStamp;
}

function sleep(bool, say) {
    sleeping = bool;
    console.log("sleeping " + sleeping);
    var sayString;
    if(sleeping) {
        $('#myinput')[0].style.backgroundColor = "#ccc"
        sayString = "good night!";// say 'wake up' if you come back";
    } else {
        // playSound("http://www.jewelbeat.com/free/free-sound-effects/Human/Human_Yawn.mp3");
        $('#myinput')[0].style.backgroundColor = "#fff"
        sayString = "hello again!";
    }

    if(say)
        play(sayString, "en");
}

function startButton(force) {
    if(!recognitionObj)
        return;
    
    sleeping = false;
    console.log("startButton. recognizing: " + recognizing);
    if (recognizing) {
        sleep(true, false);
        stopSpeechRecognition();
        return;
    }
    sleep(false, false);
    startRecognition();
}

function changeLanguage(lang) {
    restartSpeechRecogition(true);
}

// 1. enable input area => type=sms/email, (default email)
// 2. disable send but still listen
//    TODO automatically copy to clipboard full text?
//    TODO detect special commands like 'new line', 'question mark', 'apostrophe', 'dot/point'
// 3. detect 'send' and create the email/sms, and disable input area
//    TODO it should also be possible to say 'send this to peter'
//    TODO if not specified => ask for it!
var composeObject = {
    state : 'inactive',
    to : '',
    subject : '',
    type : 'email'
};
function checkCompose(input) {    
    if(composeObject.state == 'inactive') {
        if(!shouldHandleCompose(input))
            return false;
        
        showInputArea(true);
        composeObject.state = 'active';
        
        // TODO support sms
        //        if(isSMSType(input)) {
        //            composeObject.type = 'sms';
        //        } else {
        composeObject.type = 'email';
        //        }
        
        return true;
    }
    
    if(isEndCompose(input)) {
        composeObject.state = 'inactive';
        
        // TODO support sms
        if(composeObject.type == 'email') {
            openEmail(composeObject.to, composeObject.subject, getComposedText());
        }
        showInputArea(false);
        
        // still avoid that 'send email' will be sent to API => return true;        
    } else if(shouldClear(input)) {
        clearComposedText();
        
    } else {
        addToCompose(input);        
    }
    return true;
}

function openEmail(to, subject, text) { 
    subject = encodeURI(subject);
    var body = encodeURI(text);
    to = encodeURI(to);
    window.location.href = 'mailto:'+to+'?subject=' + subject + '&body=' + body;
}

function addToCompose(input) {
    var area = $("#inputarea");
    var old = area.val();
    $("#inputarea").val($.trim(old + " " + input));
}

function clearComposedText() {
    return $("#inputarea").val('');
}

function getComposedText() {
    return $("#inputarea").val();
}

function showInputArea(show) {
    if(show) {
        $("#myinput").hide();
        $("#inputarea").show();
    } else {
        $("#myinput").show();
        $("#inputarea").hide();
    }
}

function shouldClear(input) {
    input = input.toLowerCase();       
    return exactMatches(input, ["clear", "remove all"]);
}

function isEndCompose(input) {
    input = input.toLowerCase();       
    return exactMatches(input, ["send email", "send mail", "send sms", "send message", "send that", "send it"])    
    || exactMatches(input, ["finish", "stop"]);
}

function isSMSType(input) {
    input = input.toLowerCase();    
    return matches(input, ["sms", "text message"]);
}

function shouldHandleCompose(input) {
    input = input.toLowerCase();
       
    // email
    return exactMatches(input, ["compose email", "compose mail", "new email", "new mail", "create email", "create mail"])
    // sms
    || exactMatches(input, ["compose sms", "new sms", "create sms"]);
}
