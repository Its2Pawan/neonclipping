"""Clip direction (3E): plain words in the focus box become times and styles.

"funny moments first, more from around 1:35:00, the police chase near the end" ->
  spans:  [(5640, 5760), (last 15% of the video)]   time ranges read by this code, never by the AI
  styles: {'humour'}                                  kinds of moment to prefer
Like Clips Kitty's intent.py (idea only, code written here) it only ADDS: clips inside an asked span or of an asked style get points
and extra candidates are looked at inside the spans; nothing is filtered out, so a wrong guess never loses clips.
Hinglish works too: "1:35 ke paas", "end mein", "shuru mein", "hasi wale".
"""
import re

_T = r'(\d{1,2}:\d{2}(?::\d{2})?|\d+(?:\.\d+)?\s*(?:h|hr|hour|hours|ghante?|m|min|mins|minute|minutes|minat|s|sec|secs|second|seconds))'
_RANGE = re.compile(_T + r'\s*(?:-|–|to|se|till|tak|until)\s*' + _T, re.I)
_ONE = re.compile(_T, re.I)
STYLE_WORDS = {
    'humour': ('funny', 'comedy', 'joke', 'laugh', 'hasi', 'hansi', 'mazak', 'mazaak', 'meme', 'lol'),
    'action': ('hype', 'action', 'fight', 'chase', 'kill', 'clutch', 'crash', 'police', 'shootout', 'ladai', 'maar'),
    'reaction': ('reaction', 'react', 'shock', 'scream', 'rage', 'gussa', 'chilla'),
    'story': ('story', 'kahani', 'emotional', 'sad', 'storytime'),
    'opinion': ('opinion', 'hot take', 'rant', 'take'),
    'insight': ('tip', 'tips', 'tutorial', 'how to', 'trick', 'sikh'),
}


def seconds(token):
    token = token.strip().lower()
    if ':' in token:
        parts = [float(p) for p in token.split(':')]
        return parts[0] * 3600 + parts[1] * 60 + parts[2] if len(parts) == 3 else parts[0] * 60 + parts[1]
    m = re.match(r'(\d+(?:\.\d+)?)\s*([a-z]+)', token)
    if not m:
        return None
    value, unit = float(m.group(1)), m.group(2)
    return value * (3600 if unit[0] == 'h' or unit.startswith('ghant') else 60 if unit[0] == 'm' else 1)


def parse(text, duration):
    text = str(text or '')
    low = text.lower()
    spans = []
    taken = []
    for m in _RANGE.finditer(text):
        a, b = seconds(m.group(1)), seconds(m.group(2))
        if a is not None and b is not None and b > a:
            spans.append((a, b)); taken.append(m.span())
    for m in _ONE.finditer(text):
        if any(s <= m.start() < e for s, e in taken):
            continue
        t = seconds(m.group(1))
        if t is not None:
            spans.append((t - 60, t + 60))
    if duration:
        if re.search(r'\b(near the end|at the end|end mein|end me|last part|aakhir|akhir|ending)\b', low):
            spans.append((duration * .85, duration))
        if re.search(r'\b(at the start|beginning|shuru|starting|opening part)\b', low):
            spans.append((0, duration * .15))
        if re.search(r'\b(middle|beech|bich)\b', low):
            spans.append((duration * .4, duration * .6))
    clean = []
    for a, b in spans:
        a, b = max(0.0, a), min(float(duration or b), b)
        if b - a >= 5:
            clean.append((round(a, 1), round(b, 1)))
    styles = {kind for kind, words in STYLE_WORDS.items() if any(re.search(r'\b' + re.escape(w) + r'\b', low) for w in words)}
    return {'spans': clean[:8], 'styles': styles}


def inside(clip, spans):
    """Share of the clip that falls in any asked span (0..1)."""
    if not spans:
        return 0.0
    length = max(0.1, clip['end'] - clip['start'])
    return max(max(0.0, min(clip['end'], b) - max(clip['start'], a)) / length for a, b in spans)


def boost(clip, direction):
    """Rank bonus for a clip that matches the direction: up to +0.25 for an asked span, +0.08 for an asked style."""
    bonus = .25 * inside(clip, direction.get('spans') or [])
    if clip.get('kind') in (direction.get('styles') or ()):
        bonus += .08
    return bonus
