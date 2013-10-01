function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function startsWith(str, suffix) {
    return str.indexOf(suffix) == 0;
}

// do not remove new lines
function simpleTrim(str) {
    if(!str)
        return "";
    if(startsWith(str, " "))
        str = str.substr(1, str.length - 1);
    if(endsWith(str, " "))
        str = str.substr(0, str.length - 2);
    return str;
}

function getLocale(l) {
    return (l == null) ? '' : l.toString();
}


function isDebugging() {
    if (document.location.hostname == "l" || document.location.hostname == "0.0.0.0") return true;
    return document.location.hostname == "localhost" || document.location.hostname == "127.0.0.1"
}

function getTimeZone(tz) {
    return (tz == null) ? -new Date().getTimezoneOffset() : tz;
}

function parseUrlWithHisto() {
    if(window.location.hash)
        return parseUrl(window.location.hash);

    return parseUrl(window.location.search);
}
function parseUrlAndRequest() {
    return parseUrl(window.location.search);
}

function parseUrl(query) {
    var index = query.indexOf('?');
    if(index >= 0)
        query = query.substring(index + 1);
    var res = {};
    var vars = query.split("&");
    for (var i=0;i < vars.length;i++) {
        var tmpVar = vars[i]
        var equalIndex = tmpVar.indexOf("=")
        key = tmpVar.substring(0, equalIndex);
        val = tmpVar.substring(equalIndex + 1);
        if(val != null)
            val = decodeURIComponent(val.replace(/\+/g,' '));

        if (typeof res[key] === "undefined")
            res[key] = val;
        else if (typeof res[key] === "string") {
            var arr = [ res[key], val ]; // multi facets
            res[key] = arr;
        } else
            res[key].push(val);
    }
    // console.log(res);
    return res;
}

function getIsoTime(d){
    function pad(n){
        return n<10 ? '0'+n : n
    }
    return d.getUTCFullYear()+'-'
    + pad(d.getUTCMonth()+1)+'-'
    + pad(d.getUTCDate())+'T'
    + pad(d.getUTCHours())+':'
    + pad(d.getUTCMinutes())+':'
    + pad(d.getUTCSeconds())+'Z'
}

// quick hack to make tabs working again with history.js
function prepareTabs(id, link) {
    // hide all
    $('#'+id+' div').hide();
    $('#'+id+' ul li').removeClass('active');

    var contentEl = $('#' + link);
    var titleEl = $('#'+id+' ul li a[href="#'+link+'"]');
    if(contentEl.length == 0 || titleEl.length == 0) {
        // show first content
        $('#'+id+' div:first').show();
        // show first title
        $('#'+id+' ul li:first').addClass('active');
    } else  {
        contentEl.show();
        titleEl.parent().addClass('active');
    }

    $('#'+id+' ul li a').click(function() {
        // hide current tab
        $('#'+id+' ul li').removeClass('active');
        $('#'+id+' div').hide();

        // show other tab
        $(this).parent().addClass('active');
        var currentTab = $($(this).attr('href'));
        currentTab.show();
        return false;
    });
}

function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

function inputStartsWith(input, words) {
    input = input.toLowerCase();
    if(isArray(words)) {       
        for(var i = 0; i < words.length; i++) {
            var w = words[i].toLowerCase();
            if(input.indexOf(w) == 0)
                return w.length;
        }
        return -1;        
    }
        
    if(input.indexOf(words) == 0)
        return words.length;
    return -1;
}

function exactMatches(input, words) {
    input = input.toLowerCase();
    if(isArray(words)) {       
        for(var i = 0; i < words.length; i++) {
            var w = words[i].toLowerCase();
            if(input == w)
                return true;
        }
        return false;        
    }
        
    return input.indexOf(words) >= 0
}

function matches(input, words, and_or) {
    input = input.toLowerCase();
    if(isArray(words)) {
        if(and_or == "AND") {
            for(var i = 0; i < words.length; i++) {
                var w = words[i].toLowerCase();
                if(input.indexOf(w) < 0)
                    return false;
            }
            return true;
        } 
        // default is OR
        for(var i = 0; i < words.length; i++) {
            var w = words[i].toLowerCase();
            if(input.indexOf(w) >= 0)
                return true;
        }
        return false;        
    }
        
    return input.indexOf(words.toLowerCase()) >= 0
}

function openEmail(to, subject, text) { 
    text += "\n\n\nMail sent via Jeannie http://voice-actions.com";

    subject = encodeURI(subject);
    var body = encodeURI(text);
    to = encodeURI(to);    
    window.location.href = 'mailto:'+to+'?subject=' + subject + '&body=' + body;
}

// 1. enable input area => type=sms/email, (default email)
// 2. disable send but still listen
// 3. detect 'send' and create the email/sms, and disable input area
//    TODO it should also be possible to say 'send this to peter'
//    TODO if not specified => ask for it!
Composer = function() {
    this.wholeDiv = $("#inputarea");
    this.area = $("#inputarea textarea");
    this.clear();
    this.lastIndex = 0;    
    var tmp = this;
    $('#inputarea #cancelmail').click(function(event) {
        event.preventDefault();
        tmp.cancel();
    });
        
    $('#inputarea #sendmail').click(function(event) {
        event.preventDefault();
        tmp.endCompose();
    });
}

Composer.prototype.open = function(composerObject, input) {
    if(!composerObject)
        return false;        
    
    this.to = composerObject.to;
    this.toName = composerObject.toName;
    this.toPhone = composerObject.toPhone;
    this.toEmail = composerObject.toEmail;
    if(composerObject.type)
        this.type = composerObject.type;
    
    this.title = composerObject.title;
    this.setBody(composerObject.message);
    this.compose(input);
    
    if(composerObject.to) {
        var toName = composerObject.to;
        if(composerObject.toName)
            toName = composerObject.toName;
        
        var names = $("#inputarea #composer-names");
        var tmp = "Email";
        if(this.type == "sms")
            tmp = "SMS";
        names.empty();
        names.append(tmp + " to: " + toName);
    }
    return true;
}

Composer.prototype.compose = function(input) {
    this.showInputArea(true);
    this.state = 'active';
}

Composer.prototype.cancel = function() {
    this.state = 'inactive';
    this.showInputArea(false);
}

Composer.prototype.isComposeCommand = function(input) {
    if(!input || this.state == 'inactive')
        return false;
    
    var tmpLen;
    if(exactMatches(input, ["cancel email", "cancel", "discard", "discard email", "discard it"])) {
        this.cancel();
        
    } else if(this.isEndCompose(input)) {
        this.endCompose();
        
    // still avoid that 'send email' will be sent to API => return true;        
    } else if(exactMatches(input, ["clear", "clear all", "remove all", "delete all"])) {
        this.clearBody();
        
    } else if(exactMatches(input, ["new line", "press enter", "enter"])) {        
        this.addToBody('\n');
        
    } else if(exactMatches(input, ["paragraph", "new paragraph"])) {        
        this.addToBody('\n\n');
        
    } else if(exactMatches(input, ["full stop"])) {
        // period, question mark, exclamation mark/point are already transformed by google speech recognition
        this.addToBody('.');
        
    } else if(exactMatches(input, ["delete that", "delete it", "scratch that", "scratch it", "remove that", "remove it"])) {
        this.replaceOldInBody('');
        
    } else if((tmpLen = inputStartsWith(input, ['i said', "ich sagte"])) > 0) {
        this.replaceOldInBody(input.substr(tmpLen));
    } else {
        this.addToBody(input);        
    }
    return true;
}

Composer.prototype.endCompose = function() {
    this.state = 'inactive';
    if(this.type == 'email') {
        var to = this.to;
        if(this.toName && this.to)
            to = this.toName + " <" + this.to + ">";
        openEmail(to, this.title, this.getBody());
    } else {        
        $('#myinput').val("send sms to " + this.to + " text " + this.getBody());
        mysubmit();
    }
    this.showInputArea(false);
}

Composer.prototype.replaceOldInBody = function(input) {
    var old = $.trim(this.area.val().substr(0, this.lastIndex));
    this.setBody(old + " " + $.trim(input));
}

Composer.prototype.setBody = function(str) {
    str = simpleTrim(str);    
    this.area.val(str);
    
// hmmh does not put the caret to the end in chrome ...
//    var el = document.getElementById("mytextarea");
//    if (typeof el.selectionStart == "number") {
//        el.selectionStart = this.area.selectionEnd = newContent.length - 1;
//        this.area.focus();
//    }
}
    
Composer.prototype.addToBody = function(input) {
    var old = this.area.val();
    this.lastIndex = old.length;
    this.setBody(old + " " + input);    
}

Composer.prototype.clearBody = function() {
    this.lastIndex = 0;
    return this.area.val('');
}

Composer.prototype.clear = function() {
    this.clearBody();
    this.state = 'inactive';
    this.to = '';
    this.toName = '';
    this.title = '';    
    this.type = 'email';
}

Composer.prototype.getBody = function() {
    return this.area.val();
}

Composer.prototype.showInputArea = function(show) {
    if(show) {
        $("#myinput").hide();
        this.wholeDiv.show();        
        this.area.focus();        
    } else {
        this.clear();
        $("#myinput").show();
        this.wholeDiv.hide();
    }
}

Composer.prototype.isEndCompose = function(input) {
    return exactMatches(input, ["send email", "send mail", "send sms", "send message", "send that", "send it"])    
    || exactMatches(input, ["finish", "stop"]);
}

Composer.prototype.isSMSType = function(input) {
    return matches(input, ["sms", "text message"]);
}