#!/bin/bash
python increase_version_no.py
zip -r zeeguu.zip * >/dev/null

read -p "Press any key for the Developer Dashboard..."
open https://chrome.google.com/webstore/developer/edit/ckncjmaednfephhbpeookmknhmjjodcd
