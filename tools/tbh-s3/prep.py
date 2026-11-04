"""Turn the copyedited manuscript into the magazine's flow: blocks of paragraphs (as word tokens, with soft
hyphens), section breaks, pull quotes and photo markers, chapter by chapter."""
import json, re, pyphen
P = json.load(open('paras_edited.json'))
H = pyphen.Pyphen(lang='en_US', left=2, right=3)
SHY = '­'
def hyph(word):
    m = re.match(r'^([^A-Za-z]*)([A-Za-z’]+)([^A-Za-z]*)$', word)
    if not m or len(m.group(2)) < 6 or '’' in m.group(2): return word
    a, w, z = m.groups()
    return a + H.inserted(w, hyphen=SHY) + z
def tokens(text, lead=0):
    """Split a paragraph into words; italics are kept per word, and the first `lead` words get small caps."""
    out, ital = [], False
    for raw in text.split(' '):
        w = raw
        opens, closes = w.startswith('<i>'), w.endswith('</i>')
        w = w.replace('<i>', '').replace('</i>', '')
        if opens: ital = True
        parts = [hyph(x) for x in w.split('-')]           # hyphenated compounds: hyphenate each part
        w = '-'.join(parts)
        if ital: w = f'<i>{w}</i>'
        if closes: ital = False
        out.append(w)
    for i in range(min(lead, len(out))):
        out[i] = f'<span class="sc">{out[i].replace(SHY, "")}</span>'
    return out

CH = [  # chapter title, opener photo, mid-chapter photos (placed at the section that starts with these words), pull quotes
  dict(n=1, title='Shraddha', photo='mccafe', thumb='thumb-mccafe', mid={'We pulled into the driveway': 'mailbox'},
       pull={'I’ve never had to think about vegetarian': 'It is possible to be grieving and also delighted by pavement.'},
       filler='Grief hadn’t found the door yet. I made myself too busy to answer it anyway.'),
  dict(n=2, title='Backlog', photo='desk', thumb='thumb-desk', mid={},
       pull={'There were a few nights we just': 'There is something strange about producing a document to prove you aren’t running a scam with your father-in-law’s death.'},
       filler='RJ made the calls on what stayed and what went. I built the piles he had to stand in front of.'),
  dict(n=3, title='Silk', photo='utensils', thumb='thumb-utensils', mid={'There were hundreds of saris.': 'saris'},
       pull={'That’s the whole recipe written down': 'A whole life accumulates like that — not by decision, but by not-finding.'},
       filler='RJ and I didn’t learn until after she was gone that she didn’t like potatoes. She made them anyway, for years.'),
  dict(n=4, title='Cul-de-sacs', photo='tree', thumb='thumb-tree', mid={'A few things broke the loop.': 'kona'},
       pull={'I am, it turns out, spoiled in Denver.': 'Even the house I was living in, I could only find by its labels.'},
       filler='Mom’s kitchen was perfectly fine. It just wasn’t mine.'),
]
chapters, cur = [], None
ci = 0
for p in P:
    if 'h' in p or cur is None:
        cur = dict(CH[ci], blocks=[]); chapters.append(cur); ci += 1
        if 'h' in p: continue
    t = p['t']
    if t == '–':
        cur['blocks'].append({'type': 'break'}); continue
    for start, name in cur['mid'].items():
        if t.startswith(start): cur['blocks'].append({'type': 'photo', 'name': name})
    for start, q in cur['pull'].items():
        if t.startswith(start): cur['blocks'].append({'type': 'pull', 'text': q})
    real = [b['type'] for b in cur['blocks'] if b['type'] != 'pull']   # a pull quote sits between paragraphs: look past it
    prev = real[-1] if real else 'start'
    kind = 'drop' if prev == 'start' else ('lead' if prev in ('break', 'photo') else '')
    cur['blocks'].append({'type': 'p', 'kind': kind, 'tok': tokens(t, lead=3 if kind == 'lead' else 0)})
chapters[-1]['blocks'][-1]['endmark'] = True
for c in chapters[:-1]: c['blocks'][-1]['endmark'] = True
for c in chapters: c.pop('mid'); c.pop('pull')
json.dump(chapters, open('build/content.json', 'w'), ensure_ascii=False)
for c in chapters:
    print(c['n'], c['title'], len(c['blocks']), 'blocks', sum(len(b.get('tok', [])) for b in c['blocks']), 'words',
          [b['name'] for b in c['blocks'] if b['type'] == 'photo'], sum(b['type'] == 'pull' for b in c['blocks']), 'pull')
