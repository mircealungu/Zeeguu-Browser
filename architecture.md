
BG
===

bg/js/bg.js
- browser specific behavior
    - e.g. contextMenu for translate.
     - at the moment of calling this function, we have the selection as tet
     but no dom element, so we can't get the full context yet. so we set the
     url and let the context to be filled later in the listener from inject.js
    - e.g. addMessageListener which delegates in case of chrome to
    addListener, message,...




bg/html/safari.html

GUI
===
gui/js/gui.js
- defines loadState()
- defines contributeAction() -- calls contribute() from zeeguu.js.
- defines the mapping between contributeAction() and the conribute-btn
- gets the search term via window.location.search

gui/js/login.js -- javascript for login + register + validate 
gui/html/login.html -- login page


Options
===
gui/js/options.js -- javascript for the preferences panel. implements save,reset, load data
gui/html/options.html -- chrome preferences panel

Q: what is <fieldset>
A:



Popup
===
the popup created by the toolbar button
gui/js/popup.js
gui/html/popup.html

gui/html/error.html
gui/html/zeeguu.html

Inject
======
inject/js/inject.js

loadState prepares two situations. when in zeeguu dictionary frame then
 there is a message send of "contribute"
  when in any other frame the message send is "translate"...
  this seems to prepare a global state elsewhere

Inside inject.js there is a browser.addMessageListener for "translate"

while debugging inject.js stepper entered extensions::messaging
ports -- a way through which scripts can send messages to each other



Q: Who uses inject.js?
A: manifest.json -- specifies it as content_script as opposed to bg.js which is specified as background script...



Lib
===
lib/bootstrap/bootstrap.js

lib/browser.js
 -- browser dependent functions. e.g. contextMenu delegates to contextMenus of chrome.
lib/jquery/jquery.js
lib/jquery/jquery.validate.js

lib/zeeguu.js -- implements translationUrl(), logSearch(), is_logged_in(), contribute(from,to), login(), register()

Questions
===
Q: Where do you extract the highlighted word from the page?
A: in bg.js:97 creating the context menu, and setting a callback function which
 sends a "translate" message through chrome.tabs.sendMessage??
  Q: where is the translate message dispatched?
  A: there seems to be a translate(term) in popup.js:15

  A: what is sendMessage doing?
  Q: takes an id and a dictionary...

  Q: in  bg.js i use chrome.tabs.sendMessage while in popup.js i use browser.sendMessage
  A:

Q: What is loadState? Seems to be called from many places.
A: seems to be defined in zeeguu.js.
  -- gui.js: initializes the info in the dict gui:
   -- the info seems to be transferred through window.location.search
   Q: what the hell is that?
   A:
  -- options.js: initializes the values in the option fields
  --


How do you pass the highlighted word to the pop-up?
How to pass also the URL with the contribution?
- add the original word and the URL near the contribute button


Q: What is the relation between sendMessage and addMessageListener.
 Do they work across scripts?
A:



To think about:
Q: How do you get the accept of the user for a given URL?
 - put the URL in the contribute box. add a check which sais "save context from this url" together with the actual sentence / paragraph in which the word appears.
  - also have an option: "never get the context from 'http://lala.com'"
 - add also a "save the url of this page to return later to it..."
  Q: but it is not possible to return to all url's so what do do?
 - have a special icon in the address bar which toggles saving info
 from a page or not.



Work in progress:
- encoding three elements in the zeeguuUrl function from browserJS.
 this way i can pass both the context and the url
 of the term


