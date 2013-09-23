var ttsAllowed = !isDebugging();
var ttsLoaded= false;
var isSpeaking = false;
var oldInput;
var restartSpeechRec = false;

// called when oddcast is ready
function vh_sceneLoaded(){                                
    ttsLoaded = true;
    if(oldInput) 
        say();
    console.log("loaded tts");
}

// called when webjeannie is ready
function play(input, locale) {
    oldInput = {};
    oldInput.text = input;
    oldInput.locale = locale;
    say();
}

function toggleSilentPlay() {
    freezeToggle();
    ttsAllowed = !ttsAllowed;
// no need to change speech recog here
// as it must not listen => handled via separately via restartSpeechRec
}

function vh_talkStarted(){
    console.log("started talk");
}

function vh_talkEnded(){
    console.log("stopped talk");
    isSpeaking = false;

    if(restartSpeechRec) {
        restartSpeechRec = false;
        restartSpeechRecogition();    
    }
}

function setTtsAllowed(allowed) {
    ttsAllowed = allowed;
}

function isTtsAllowed() {
    return ttsAllowed;
}

function isTtsSpeaking() {
    return ttsAllowed && ttsLoaded && isSpeaking;
}

function say() {
    if(!ttsAllowed || !ttsLoaded)
        return;
                                
    // saying an empty result won't start the tts
    // and so it won't end it which makes restarting voice recognition impossible
    if(!oldInput.text)
        return;

    isSpeaking = true;
    if(recognizing && !sleeping) {
        restartSpeechRec = true;
        stopSpeechRecognition();
    }

    if(typeof(stopSpeech) == 'function') {
        stopSpeech();
        $('#speachimage').attr('src', "img/control-pause.png");
    }
    console.log("saying:" + oldInput.text + "," + oldInput.locale);
    var engine = 2;
    var langCode = 1;
    var voice = 7;// 1,7
    var loc = oldInput.locale ? oldInput.locale : "en";
        
    if(loc.indexOf("ar") == 0) {
        langCode = 27;
        voice = 2;
    } else if(loc.indexOf("da") == 0) {
        langCode = 19;
        voice = 1;
    } else if(loc.indexOf("de") == 0) {
        langCode = 3;
        voice = 3;
    } else if(loc.indexOf("es_MX") == 0) {
        langCode = 2;
        voice = 5;
    } else if(loc.indexOf("es") == 0) {
        langCode = 2;
        voice = 1;
    } else if(loc.indexOf("en_GB") == 0) {
        langCode = 1;
        voice = 4; //4,6
    } else if(loc.indexOf("en_AU") == 0) {
        langCode = 1;
        voice = 10;
    } else if(loc.indexOf("nl") == 0) {
        langCode = 11;
        voice = 2;
    } else if(loc.indexOf("fi") == 0) {
        langCode = 23;
        voice = 1;
    } else if(loc.indexOf("fr") == 0) {
        langCode = 4;
        voice = 3;
    } else if(loc.indexOf("el") == 0) {
        langCode = 8;
        voice = 1;
    } else if(loc.indexOf("it") == 0) {
        langCode = 7;
        voice = 2; // 1,2,3
    } else if(loc.indexOf("ja") == 0) {
        engine = 3;
        langCode = 12;
        voice = 3;
    } else if(loc.indexOf("ko") == 0) {
        engine = 3;
        langCode = 13;
        voice = 1;
    } else if(loc.indexOf("no") == 0) {
        langCode = 20;
        voice = 1;
    } else if(loc.indexOf("pl") == 0) {
        langCode = 14;
        voice = 1;    
    } else if(loc.indexOf("pt_BR") == 0) {
        langCode = 6;
        voice = 4;
    } else if(loc.indexOf("pt") == 0) {
        langCode = 6;
        voice = 2; // 1,2,4    
    } else if(loc.indexOf("ru") == 0) {        
        langCode = 21;
        voice = 1;
    } else if(loc.indexOf("sv") == 0) {
        langCode = 9;
        voice = 1;
    } else if(loc.indexOf("tr") == 0) {
        langCode = 16;
        voice = 1;
    } else if(loc.indexOf("zh") == 0) {
        engine = 3;
        langCode = 10;
        voice = 1;   
    }

    try {
        sayText(oldInput.text, voice, langCode, engine);
    } catch(ex) {
        console.log(ex);
        vh_talkEnded();
    }
    oldInput = false;
}