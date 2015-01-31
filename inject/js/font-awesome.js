function injectFontAwesomeToHeadOf(document) {
    var fa = document.createElement('style');
    fa.type = 'text/css';
    fa.textContent = '@font-face { font-family: FontAwesome; src: url("'
        + chrome.extension.getURL('lib/fa-4.3/fonts/fontawesome-webfont.woff')
        + '"); }';
    document.head.appendChild(fa);
}