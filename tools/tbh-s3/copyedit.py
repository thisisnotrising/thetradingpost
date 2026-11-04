"""Light copyedit of Amanda's manuscript. Each fix is (old, new, why). Every 'old' must match exactly once."""
import json, re
P = json.load(open('source/paras.json'))
FIXES = [
 ("as the Covid-19 vaccines", "as the COVID-19 vaccines", "COVID-19 in caps (standard style)"),
 ("back home to the east coast", "back home to the East Coast", "East Coast is a proper region name"),
 ("the same as being ok.", "the same as being OK.", "OK, to match \"OK, maybe not bad\" later"),
 ("this period is comparing it to sitting shiva", "this period is by comparing it to sitting shiva", "small grammar fix"),
 ("Apparently the traditions vary", "Apparently, the traditions vary", "comma after an opening adverb"),
 ("You wait, while somewhere unseen, a longer trip", "You wait while, somewhere unseen, a longer trip", "comma placement"),
 ("How we’ve missed thee!) which tells you", "How we’ve missed thee!), which tells you", "comma after the parenthesis"),
 ("until around 8pm.", "until around 8 p.m.", "times styled as 8 p.m."),
 ("the one suitcase of clothes I packed.", "the one suitcase of clothes I’d packed.", "tense agreement"),
 ("I thought of as “ready for a decision”.", "I thought of as “ready for a decision.”", "period inside the quotes (US style)"),
 ("My feet ached by 3pm most days", "My feet ached by 3 p.m. most days", "times styled as 3 p.m."),
 ("who'd either 1) ask how", "who’d either (1) ask how", "list numbers in parentheses"),
 ("going or 2) tell the same story", "going or (2) tell the same story", "list numbers in parentheses"),
 ("seemed to be the most \"her\".", "seemed to be the most “her.”", "period inside the quotes (US style)"),
 ("which is not a feeling, it's an operating system", "which is not a feeling; it's an operating system", "comma splice"),
 ("An auntie can do it in ten minutes.", "An auntie can do it in 10 minutes.", "numerals for minutes, as elsewhere (40, 15, 10)"),
 ("Stir fries, because", "Stir-fries, because", "hyphenated noun"),
 ("about three quarters of a mile", "about three-quarters of a mile", "hyphenated fraction"),
]
log = []
for old, new, why in FIXES:
    hits = [i for i, p in enumerate(P) if 't' in p and old in p['t']]
    assert len(hits) == 1, (old, hits)
    P[hits[0]]['t'] = P[hits[0]]['t'].replace(old, new)
    log.append((old, new, why))

# Typography everywhere: curly apostrophes and quotes, a real ellipsis
def curly(t):
    t = re.sub(r"(\w)'(\w)", r"\1’\2", t)              # don't, it's
    t = re.sub(r"(\w)'(\s|$|[.,;:!?)])", r"\1’\2", t)  # parents' house
    t = re.sub(r'(^|[\s(—])"', r'\1“', t)               # opening double quote
    t = t.replace('"', '”')
    t = t.replace("...", "…")
    return t
for p in P:
    if 't' in p: p['t'] = curly(p['t'])
# italics for titles and the one word set in italics in the manuscript
ITAL = ["The Morning Show", "Jury Duty", "Family Feud"]
for p in P:
    if 't' in p:
        for w in ITAL: p['t'] = p['t'].replace(w, f"<i>{w}</i>")
        p['t'] = p['t'].replace("called me Ma:", "called me <i>Ma</i>:")
assert not any("'" in p.get('t', '') or '"' in p.get('t', '') for p in P), [p['t'] for p in P if "'" in p.get('t','') or '"' in p.get('t','')]
json.dump(P, open('paras_edited.json', 'w'), ensure_ascii=False, indent=0)
json.dump(log, open('copyedits.json', 'w'), ensure_ascii=False, indent=1)
print(len(log), 'fixes; straight quotes left:', 0)
