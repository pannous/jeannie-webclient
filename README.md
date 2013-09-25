# Jeannie for Chrome

Jeannie is a siri like virtual assistant with over 3 million users in the past years!
Now you can fully extend the functionality of your bot.
This project is the source code to the web client.

Try [our demo](https://ask.pannous.com) in the browser now!
For other clients and look [here](http://jeannie-assistant.com/).

[![Ask Jeannie](https://trello-attachments.s3.amazonaws.com/510ffeb37c6181d462007892/51dd10936a5b14a425001acb/b679632825359c3c4784fcbe48b8a765/webclient.png)](https://ask.pannous.com?input=hi)

# What can I ask?

Jeannie performs all the standard tasks required by modern assistants, and much more:

 * Who is Obama?
 * Whats the weather?
 * When is the next TV show for Simpsons?
 * Show me an elephant
 * Route from Berlin Neukölln to paris
 * Remind me tomorrow at 4 pm about the dentist
 * Who are you?
 * Find pizza
 * What time is it?
 * Where am I?
 * "Is there a traffic jam in Berlin?" And then: "What is the weather there?"
 * ... and much more! 

If you are not sure what to ask Jeannie, then click on the Examples-Tab and click some of the examples!
More examples are given in the API documentation below.

# Local Setup

Just open app/index.html in a browser! Works best in [Chrome](https://google.com/chrome/).

Optionally:

 * To make calls skype is necessary (your browser has to support [skype URLs](https://support.skype.com/en/faq/FA12243/how-do-i-enable-skype-click-to-call-in-chrome)) and your contact needs to have a telephon number associated (in google contacts). Coming soon: SIP!
 * Text to speech only works on our domain. You can create your own avatar on [sitepal](http://sitepal.com/).
 * Set your own clientId and apiKey under app/js/googlehandling.js


# API Documentation

The documentation for our Jeannie API is [here](https://docs.google.com/document/d/1dVG_B5Sc2x-fi1pN6iJJjfF1bJY6KEFzUqjOb8NsntI/edit?pli=1).
Please get in touch with us if you want to create your own bot or modify the responses / actions etc.
We had a very beautiful interface for this which is currently in private Beta.

# License

This JavaScript project stands under the Apache License 2.0. Of course our logos and images are excluded and must not be used in your application. Additionally we are using several projects with a different license

 * [JQuery](http://jquery.com/), MIT license
 * [jquery.dd.js](https://github.com/HenrikJoreteg/jquery.dd), MIT license
 * [history.js](https://github.com/browserstate/history.js/), BSD compliant
 * [moment.js](http://momentjs.com/), MIT license
 * [Google APIs](http://code.google.com/p/google-api-javascript-client/), Apache License 2.0
 * For some images we use [this](http://www.famfamfam.com) collection


# Limitations

 * Only Chrome supports speech recognition via Google, but other browsers will work too via keyboard.
 * The Google login is currently [not working](https://github.com/pannous/jeannie-webclient/issues/1) for Safari - we'd like your pull request!
 * The web client currently does not play sound actions, but this can be easily achieved with a JavaScript library.


# Browser Permission

 * Allow location access to make Jeannie smarter guessing your location. Read [on mozilla docs](https://www.mozilla.org/firefox/geolocation/) more about it. E.g. this will allow to answer general questions like "Whats the weather?" or location specific ones like "Where am I?".
 * Allow speech recognition in Chrome to make Jeannie listening to your voice. Attention: Pages hosted on HTTPS do not need to ask repeatedly for permission, whereas HTTP hosted pages do.
 * Allow popups to view intermediate results like youtube or google search. 
 * Allow Jeannie to access your Google account. This is necessary for contact, call, sms and email requests but this also ensures that the same user data is used as with our [Android Jeannie app](https://play.google.com/store/apps/details?id=com.pannous.voice.actions.free).
