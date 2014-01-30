#!/bin/bash
python increase_version_no.py
zip -r zeeguu.zip * >/dev/null

read -p "Press any key to start uploading..."
open https://chrome.google.com/webstore/developer/edit/ckncjmaednfephhbpeookmknhmjjodcd
