function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
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

function exactMatches(input, words, and_or) {
    if(isArray(words)) {       
        for(var i = 0; i < words.length; i++) {
            if(input == words[i])
                return true;
        }
        return false;        
    }
        
    return input.indexOf(words) >= 0
}

function matches(input, words, and_or) {
    if(isArray(words)) {
        if(and_or == "AND") {
            for(var i = 0; i < words.length; i++) {
                if(input.indexOf(words[i]) < 0)
                    return false;
            }
            return true;
        } 
        // default is OR
        for(var i = 0; i < words.length; i++) {
            if(input.indexOf(words[i]) >= 0)
                return true;
        }
        return false;        
    }
        
    return input.indexOf(words) >= 0
}