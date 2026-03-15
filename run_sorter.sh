#!/bin/bash
export DYLD_LIBRARY_PATH="$(brew --prefix zbar)/lib:$DYLD_LIBRARY_PATH"
python3 tri_auto_photos.py
