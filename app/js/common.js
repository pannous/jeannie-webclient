function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function startsWith(str, suffix) {
    return str.indexOf(suffix) == 0;
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
    subject = encodeURI(subject);
    var body = encodeURI(text);
    to = encodeURI(to);
    window.location.href = 'mailto:'+to+'?subject=' + subject + '&body=' + body;
}

// 1. enable input area => type=sms/email, (default email)
// 2. disable send but still listen
//    TODO automatically copy to clipboard full text?
//    TODO detect special commands like 'new line', 'question mark', 'apostrophe', 'dot/point'
// 3. detect 'send' and create the email/sms, and disable input area
//    TODO it should also be possible to say 'send this to peter'
//    TODO if not specified => ask for it!
Composer = function() {
    this.state = 'inactive';
    this.to = '';
    this.subject = '';    
    this.type = 'email';
    this.lastIndex = 0;
}

Composer.prototype.initFromObject = function(mailToData, input) {
    if(!mailToData)
        return false;
        
    this.to = mailToData.to;
    this.subject = mailToData.subject;
    this.setBody(mailToData.body);
    this.compose(input);
    return true;
}

Composer.prototype.compose = function(input) {
    this.showInputArea(true);
    this.state = 'active';
        
    // TODO support sms
    //        if(isSMSType(input)) {
    //            composeObject.type = 'sms';
    //        } else {
    this.type = 'email';
//        }        
}

Composer.prototype.checkCompose = function(input) {
    if(!input)
        return false;
    if(this.state == 'inactive') {
        if(!this.shouldHandleCompose(input))
            return false;
        
        this.compose(input);        
        return true;
    }
    
    var tmpLen;
    if(this.isEndCompose(input)) {
        this.state = 'inactive';
        
        // TODO support sms
        if(this.type == 'email') {
            openEmail(this.to, this.subject, this.getBody());
        }
        this.showInputArea(false);
        
    // still avoid that 'send email' will be sent to API => return true;        
    } else if(this.shouldClear(input)) {
        this.clearBody();
        
    } else if((tmpLen = inputStartsWith(input, ['i said', "ich sagte"])) > 0) {
        this.replaceOldInBody(input.substr(tmpLen));
    } else {
        this.addToBody(input);        
    }
    return true;
}

Composer.prototype.replaceOldInBody = function(input) {
    var area = $("#inputarea");
    var old = $.trim(area.val().substr(0, this.lastIndex));
    this.setBody(old + " " + input);    
}

Composer.prototype.setBody = function(str) {
    $("#inputarea").val($.trim(str));
}
    
Composer.prototype.addToBody = function(input) {
    var old = $("#inputarea").val();
    this.lastIndex = old.length;
    this.setBody(old + " " + input);
}

Composer.prototype.clearBody = function() {
    this.lastIndex = 0;
    return $("#inputarea").val('');
}

Composer.prototype.getBody = function() {
    return $("#inputarea").val();
}

Composer.prototype.showInputArea = function(show) {
    if(show) {
        $("#myinput").hide();
        $("#inputarea").show();
    } else {
        $("#myinput").show();
        $("#inputarea").hide();
    }
}

Composer.prototype.shouldClear = function(input) {          
    return exactMatches(input, ["clear", "remove all"]);
}

Composer.prototype.isEndCompose = function(input) {
    return exactMatches(input, ["send email", "send mail", "send sms", "send message", "send that", "send it"])    
    || exactMatches(input, ["finish", "stop"]);
}

Composer.prototype.isSMSType = function(input) {
    return matches(input, ["sms", "text message"]);
}

Composer.prototype.shouldHandleCompose = function(input) {
    // email
    return exactMatches(input, ["compose email", "compose mail", "new email", "new mail", "create email", "create mail"])
    // sms
    || exactMatches(input, ["compose sms", "new sms", "create sms"]);
}
