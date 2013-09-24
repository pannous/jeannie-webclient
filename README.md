# Jeannie for Chrome

Try [our demo](https://ask.pannous.com) now! [Chrome](https://google.com//chrome/) or [Chromium](https://download-chromium.appspot.com/) work best.
If you are not sure what to ask Jeannie, then click on the Examples-Tab and click some of the examples!

# Limitations

 * Only Chrome supports speech recognition via Google, but other Browser will work too via keyboard.
 * Text to speech only works on our domain. You can create your own avatar on [sitepal](http://sitepal.com/).
 * The Google login is currently [not working](https://github.com/pannous/jeannie-webclient/issues/1) for Safari - we'd like your pull request!
 * To make calls skype is necessary (your browser has to support [skype URLs](https://support.skype.com/en/faq/FA12243/how-do-i-enable-skype-click-to-call-in-chrome)) and your contact needs to have a telephon number associated (in google contacts).

# License

This project stands under the Apache License 2.0. Of course our logos and images are excluded. We are using for some images [this nice](http://www.famfamfam.com) collection!

# Setup

 * cd app
 * change URL
 * open app/index.html in a browser

# Browser Access

 * Allow location access to make Jeannie smarter guessing your location. Read [on mozilla docs](https://www.mozilla.org/firefox/geolocation/) more about it. E.g. this will allow to answer general questions like "Whats the weather?" or location specific ones like "Where am I?".
 * Allow speech recognition in Chrome to make Jeannie listening to your voice. Attention: you'll need to setup this app into an HTTPS environment in order to avoid that such a browser-request is done everytime it losts the audio-stream.
 * Allow popups to view intermediate results like youtube or google search. 

