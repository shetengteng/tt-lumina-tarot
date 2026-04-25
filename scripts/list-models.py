#!/usr/bin/env python3
"""List Gemini models available with current API key."""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("ERROR: GEMINI_API_KEY not set", file=sys.stderr)
    sys.exit(1)

from google import genai

client = genai.Client(api_key=API_KEY)

print("=== Models supporting generateContent ===")
for m in client.models.list():
    methods = getattr(m, 'supported_actions', None) or getattr(m, 'supported_generation_methods', None) or []
    name = m.name
    if 'image' in name.lower() or 'imagen' in name.lower() or 'flash' in name.lower():
        print(f"  {name}")
        if methods:
            print(f"    methods: {methods}")
        if hasattr(m, 'description') and m.description:
            print(f"    desc: {m.description[:120]}")
