var lastInput = "";
var lastLocale = "en";
var lastLocation = "";
var lastLink = "";
var lastTimeZone;
var browserTitle = "Jeannie for Chrome";
var popupWindow;
var maxGeoWait = 100;
var apiLogin="chrome-demo";
var apiKey="";
var apiDebug = false;
var apiURL = "https://ask.pannous.com/api";

$(document).ready(function(e) {
    $('#myinput').focus();
    
    $("#google_login").click(function() {
        handleGoogleLogin();
    });

    if (isSpeechRecPossible()) {
        $("#speechrec_start").show();
        $("#myinput").removeAttr('x-webkit-speech');

        initWebkitSpeechRecognition();
        startRecognition();
    }

    // click on example
    $('.usage-description li').click(function() {
        var input = $(this).text();
        var locale = $(this).attr("locale");
        var timeZone = getTimeZone($(this).attr("timeZone"));
        var link = "";
        var tab = $(this).attr("tab");
        if(tab)
            link = tab;

        // do not store the location in the URL as when the URL is shared
        // the user should get its own location
        var partUrl = "?input=" + input
        + "&timeZone=" + timeZone
        + "&locale=" + getLocale(locale)
        + "&link=" + link
        
        partUrl += googvars.getURLParams();
        History.pushState(null, browserTitle, partUrl);
    });
    
    // prepare oddcast
    $('#toggleSpeach').click(function() {        
        console.log("pauseFunction called");
        var src = $('#speachimage').attr('src');
        if(src.indexOf('pause') > 0)
            $('#speachimage').attr('src', "img/control-play.png");
        else
            $('#speachimage').attr('src', "img/control-pause.png");
        toggleSilentPlay();
    });
    
    // prevent ENTER/submitting and use javascript
    $('#myform').submit(function(event){
        event.preventDefault();
        mysubmit();
    });

    // avoid triggering an additional state on the first request -> do not use (function(window,undefined){ etc
    var History = window.History;
    if (History.enabled) {
        History.Adapter.bind(window, 'statechange', function(){
            var state = History.getState();
            // History.log(State.data, State.title, State.url);
            urlInit(state.url);
        });
    }

    var paramMap = urlInit();
    prepareExpand("description", paramMap.link);
});

function getSelectedLocale() {
    return $("#locale-menu option:selected").val();
}

function changeLanguage(lang) {
    restartSpeechRecogition();
}

function mysubmit() {
    var input = $('#myinput').val();
    if(!input)
        return;

    // re-submit even if identical query
    if(lastInput == input)
        input += " ";

    var currLocale = getSelectedLocale();
    var partUrl = "?input=" + encodeURIComponent(input)
    + "&timeZone=" + lastTimeZone + "&locale=" + getLocale(currLocale)
    + "&location=" + lastLocation
    + "&tts=" + isTtsAllowed();

    History.pushState(null, browserTitle, partUrl);
}

function urlInit(url) {
    var paramMap;
    if(url)
        paramMap = parseUrl(url);
    else
        paramMap = parseUrlWithHisto();
    postProcessParseUrl(paramMap);

    var timeout = 1;
    if(!lastLocation) {
        if(updateGeolocation()) {
            // if this browser supports geolocation then hope and wait for 'maxGeoWait' that the
            // user accepts the location. hacky because geolocation request is not forced
            timeout = maxGeoWait;
        }
    }
    setTimeout(function() {
        doRequest(lastInput, lastLocale, lastLocation);
    }, timeout);
    return paramMap;
}

function closePopupWindow() {
    if(popupWindow) {
        popupWindow.close();
        popupWindow = null;
    }
}

function doRequest(input, locale, latLon) {
    closePopupWindow();
    if(!latLon)
        latLon = "";
    if(input == null)
        input = "";
    lastInput = input;
    locale = getLocale(locale);
    lastLocale = locale;
    if(latLon)
        lastLocation = latLon;

    if(!input)
        return;
    
    if(shouldHandleGoogle(input)) {
        handleGoogleLogin(function() {
            // call again, but now with google access token
            doRequest(input, locale, latLon);
        });
        return;
    }

    clientTime = getTimeZone(lastTimeZone);

    var webjeannieParams = "?input=" + encodeURIComponent(input)
    + "&debug=" + apiDebug    
    + "&login=" + apiLogin
    + "&key=" + apiKey
    + "&locale=" + lastLocale
    + "&timeZone=" + clientTime
    + "&location=" + lastLocation
    + "&clientFeatures=say,show-images,open-url,show-urls,selector,show-emails,reminder,google-login";

    webjeannieParams += googvars.getURLParams();
    
    var url;
    if(window.location.hostname == "localhost") {
        // localhost:port/path/api
        var tmpPath = window.location.pathname;
        if(tmpPath.lastIndexOf('/') != tmpPath.length - 1)
            tmpPath += "/";
        tmpPath += "api";
        url = location.protocol + "//" + location.host + tmpPath + webjeannieParams;
    } else {            
        // for file://path and production
        url = apiURL + webjeannieParams;
    }
    
    console.log(url);

    var mainOutput = $("#mainOutput");
    var output = $("<div class='output'/>");
    var exec = function(resultJson) {
        var text = "";
        var imageSrc;
        var openUrl = false;
        var showUrl = false;
        var actions = false;
        var input = "";
        console.log(resultJson);
        if(resultJson.info) {
            if(!lastLocale)
                lastLocale = resultJson.info.detectedLanguage;
            input = resultJson.info.input;
        }
        
        var clickableDiv = $("<div class='inputDiv'>Q: " + input + "</div>");
        clickableDiv .click(function() {
            doRequest(input, locale, latLon);
        });
        clickableDiv.addClass('clickable');
        output.append(clickableDiv);
        var outLang = lastLocale;
        if(!resultJson.output || resultJson.output.length == 0) {
            text = "Sorry, nothing found";
            if(outLang == "de")
                text = "Leider nichts gefunden";
        } else {
            actions = resultJson.output[0].actions;
            if(actions.say) {
                if(actions.say.text) {
                    text = actions.say.text;                    
                    // eg. translation requires us to change the language
                    if(actions.say.lang)
                        outLang = actions.say.lang;
                } else
                    text = actions.say;
            }                       
            
            if(actions.open)
                openUrl = actions.open.url;

            if(actions.show) {
                var emails = actions.show.emails;
                if(emails) {
                    var ulList = $("<ul/>");
                    output.append(ulList);
                    for(var ii = 0; ii < emails.length; ii++) {
                        var emailListItem = $("<li/>")
                        ulList.append(emailListItem);
                        var email = emails[ii];
                        addLink(emailListItem, email.title, email.link);
                        addText(emailListItem, email.name + "<br/>", true);
                        addText(emailListItem, email.text + "...");
                    }
                } else {
                    var actionItem = actions.show.selectedItem ? actions.show.selectedItem : 0;
                    if(actions.show.images && actions.show.images.length > 0)
                        imageSrc = actions.show.images[actionItem];
                    if(actions.show.urls && actions.show.urls.length > 0)
                        showUrl = actions.show.urls[actionItem];
                }
            }
            if(actions.reminder) {
                var events = actions.reminder.events;
                if(events) {
                    var eventList = $("<ul/>");
                    output.append(eventList);
                    for(var ii = 0; ii < events.length; ii++) {
                        var eventListItem = $("<li/>")
                        eventList.append(eventListItem);
                        var event = events[ii];
                        var summary = event.summary;
                        if(summary === undefined)
                            summary = "Event";
                        if(event.creator)
                            summary += " from " + event.creator.displayName;
                        if(event.htmlLink)
                            addLink(eventListItem, summary, event.htmlLink);
                        else
                            addText(eventListItem,  summary +  "<br/>");

                        var start = parseAndConvertStartDate(event.start.dateTime);
                        // now only time
                        var end = parseAndConvertDate(event.end.dateTime);
                        addText(eventListItem,  start + " - " + end);
                    }
                }
            }
        }

        if(text.length > 0) {
            if(text.length > 600)
                text = text.substr(0, 600) + " ...";

            addText(output, text);            
        }

        if(imageSrc) {
            var elImgUrl = addImage(output, imageSrc, showUrl, true);
            elImgUrl.addClass('imgborder');
        } else if(showUrl) {
            if(outLang == "de")
                addLink(output, "Mehr Informationen", showUrl);
            else
                addLink(output, "More Information", showUrl);
        }

        if(actions && actions.source) {
            var smallDiv = $("<div class='cite-font'/>");
            var source = actions.source.info;
            if(actions.source.url) {
                addLink(smallDiv, source, actions.source.url);
            } else if(actions.source.infoUrl) {
                addLink(smallDiv, source, actions.source.infoUrl);
            } else {
                addText(smallDiv, source);
            }
            output.append(smallDiv);
        }

        mainOutput.prepend(output);
        play(text, outLang);

        if(openUrl) {
            if(openUrl.indexOf("mailto:") == 0) {
                document.location.href = openUrl;
            } else {
                // then it is hard to press Back button:
                // location.href = openUrl;

                // does not work:
                // var aEl = addLink(output, "Open URL", openUrl);
                // aEl.attr('id', '123');
                // aEl.attr('target', '_blank');
                // aEl.click();

                // does not create a new tab for me on chrome, only new windows:
                //            popupWindow = window.open(openUrl, '_blank');
                popupWindow = window.open(openUrl, '_newtab');
                popupWindow.focus();
            }
        }
    };

    $.ajax({
        url: url,
        type : "GET",
        dataType: "json",
        timeout: 15000
    }).fail(function(err) {
        output.addClass("error");
        mainOutput.prepend(output);
        addText(output, "Cannot get the connection to the API for Jeannie: " + err.status + " " + err.statusText, true);
    }).pipe(exec);
}

function parseAndConvertStartDate(dateStr) {
    return moment(dateStr).format('Do MMM, h:mm');
}

function parseAndConvertDate(dateStr) {
    return moment(dateStr).format('h:mm a');
}

function addLink(parent, text, url) {
    var aEl = $("<a/>");
    aEl.html(text);
    aEl.attr('href', url);
    var div = $("<div/>");
    div.append(aEl);
    parent.append(div);
    return aEl;
}

function addImage(parent, imageSrc, onClickUrl, embed) {
    var img = new Image();
    img.src = imageSrc;
    img = $(img);
    var div;
    if(embed) {
        div = $("<div/>");
        div.append(img);
    } else
        div = img;

    parent.append(div);
    if(onClickUrl) {
        img.addClass('pointer');
        img.click(function() {
            window.open(onClickUrl);
        });
    }
    return div;
}

function addText(parent, text, bold, small) {
    var tag = $("<span/>");
    tag.html(text);
    parent.append(tag);
    if(bold)
        tag.attr("class", "bold");
    if(small)
        tag.attr("class", "small");

    return tag;
}

function postProcessParseUrl(paramMap) {
    var myinput = document.getElementById("myinput");
    // overwrite from url
    if(paramMap.input)
        myinput.value = paramMap.input;

    var localeMenu = document.getElementById("locale-menu");
    if(localeMenu) {
        var locale = getLocale(paramMap.locale);
        for(var i = 0; i < localeMenu.options.length; i++) {
            if(localeMenu.options[i].value == locale)
                localeMenu.options[i].selected = true;
            else
                localeMenu.options[i].selected = false;
        }
    }
    // now we can create our image dropdown
    try {
        $("body select").msDropDown();
    } catch(e) {
        console.log(" abnormal return in $(body select).msDropDown(); ?");
        console.log(e);
    }

    if(paramMap.tts)
        setTtsAllowed(paramMap.tts == "true");
    lastInput = paramMap.input;
    lastLocale = paramMap.locale;
    if(paramMap.location)
        lastLocation = paramMap.location;

    lastTimeZone = getTimeZone(paramMap.timeZone);
    if(paramMap.login && paramMap.key) {
        apiLogin = paramMap.login;
        apiKey = paramMap.key;
    }
    
    if(paramMap.debug != undefined)
        apiDebug = paramMap.debug;
}

// quick hack to make tabs working again with history.js
function prepareExpand(mainId, link) {
    // hide all content
    $('#'+mainId+' div').hide();
    // mark all tabs as unclicked
    $('#'+mainId+' ul li').removeClass('active');

    $('#'+mainId+' ul li a').click(function() {
        var menuListItem = $('#'+mainId+' ul li.active a');

        // hide current tab
        var menuListItems = $('#'+mainId+' ul li');
        menuListItems.removeClass('active');
        $('#'+mainId+' div').hide();

        if($(this).attr('href') === menuListItem.attr('href'))
            return false;

        // show other tab
        $(this).parent().addClass('active');
        var currentTab = $($(this).attr('href'));
        currentTab.show();
        return false;
    });

    if(link) {
        var titleEl = $('#'+mainId+' ul li a[href="#'+link+'"]');
        titleEl.click();
    }
}

// By default we re-query if geolocation update was successful. As per
// definition the user isn't forced to deal with the location dialog!
// http://stackoverflow.com/q/5947637/194609
// time out earlier. see http://stackoverflow.com/q/3397585/194609
function updateGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(positionSuccess, positionError, {
            maximumAge:Infinity,
            timeout:maxGeoWait
        });
        return true;
    } else {
        positionError(-1);
        return false;
    }
}
function positionError(err) {
    var msg;
    switch(err.code) {
        case err.UNKNOWN_ERROR:
            msg = "Unable to find your location";
            break;
        case err.PERMISSION_DENINED:
            msg = "Permission denied while reading your location";
            break;
        case err.POSITION_UNAVAILABLE:
            msg = "Your location is currently unknown";
            break;
        case err.BREAK:
            msg = "Attempt to read your location took too long";
            break;
        default:
            msg = "Location detection not supported";
    }
    console.log(msg);
}

function positionSuccess(position) {
    var coords = position.coords || position.coordinate || position;
    var tmpLatLon = coords.latitude+","+coords.longitude;

    lastLocation = tmpLatLon;
// TODO re-query could be strange to the user
// indicate that the re-query is cause of the location or avoid it somehow
// doRequest(lastInput, lastLocale, tmpLatLon);
}

function printLocation(tmpLatLon) {
    if(tmpLatLon)
        console.log("using location " + tmpLatLon);
}
