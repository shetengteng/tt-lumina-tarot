#!/usr/bin/env python3
"""
Test Gemini Image generation with a single tarot card prompt.
Goal: verify API works and quickly see one render before going further.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-image-preview")

if not API_KEY:
    print("ERROR: GEMINI_API_KEY not set", file=sys.stderr)
    sys.exit(1)

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("ERROR: pip install google-genai", file=sys.stderr)
    sys.exit(1)


PROMPT_FOOL = """Vertical tarot card illustration in the style of traditional Chinese ink painting (shuǐmò) blended with mineral pigment color (gōngbǐ).

Subject: A young traveler standing on the edge of a cliff at dawn, wearing a flowing dark-blue robe with subtle gold trim, holding a wooden walking staff, a small bundle on their back. A white crane with a red crown flies near them. They look forward into the misty distance.

Composition: Vertical scroll layout (vertical orientation, taller than wide). Misty mountains layer in the upper third, the cliff edge and figure occupy the middle, with cloud and empty paper space (留白) above. The crane is a small detail, not dominant. Negative space at top.

Color palette: Aged rice paper background (#F4E8D0 to #F8EFD8), mineral azurite blue (#3B5C8A) for distant mountains, ochre (#A0532C) for cliffs, vermillion red (#B33C2F) for accents, gold leaf (#C9A04C) for highlights. Soft and washed, not saturated.

Style: Song dynasty landscape painting aesthetic. Loose ink brush strokes for mountains. Detailed but not photorealistic figure. NO text, NO border frame, NO watermark, NO calligraphy stamps. Pure illustration only - decoration will be added in post-production.

Aspect ratio: vertical, 4:7 (taller than wide), like a traditional tarot card.

Atmosphere: serene, hopeful, contemplative. Like a poem about beginning a journey."""


def main():
    out_dir = ROOT / "raw-assets" / "ai-tarot-test"
    out_dir.mkdir(parents=True, exist_ok=True)

    client = genai.Client(api_key=API_KEY)

    print(f"[gemini] model: {MODEL}")
    print(f"[gemini] generating: The Fool (test)\n")

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=[types.Part.from_text(text=PROMPT_FOOL)],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE"],
            ),
        )
    except Exception as e:
        print(f"ERROR: API call failed: {e}", file=sys.stderr)
        sys.exit(2)

    saved = 0
    for part in response.candidates[0].content.parts:
        if hasattr(part, 'inline_data') and part.inline_data is not None:
            ext = "png"
            out_path = out_dir / f"fool-test-{saved}.{ext}"
            data = part.inline_data.data
            if isinstance(data, str):
                import base64
                data = base64.b64decode(data)
            out_path.write_bytes(data)
            print(f"[saved] {out_path}  ({len(data)/1024:.1f} KB)")
            saved += 1
        elif hasattr(part, 'text') and part.text:
            print(f"[model text] {part.text[:200]}")

    if saved == 0:
        print("ERROR: no images returned", file=sys.stderr)
        sys.exit(3)

    print(f"\n[ok] saved {saved} images to {out_dir}")


if __name__ == "__main__":
    main()
