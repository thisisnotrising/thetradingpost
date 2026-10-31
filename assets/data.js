/* ============================================================
   NOT RISING · 777 DAYDREAM ST. — THE DATA FILE
   The one file you edit. Both buildings read it:
     PART 1  window.NR    the Newsstand: issues, interviews, masthead
     PART 2  window.NRSF  the Trading Post storefront: signs, links, posters
   The Trading Post's window shows the covers from PART 1, so a new
   issue appears on the rack and in the shop window at the same time.
   ============================================================ */

/* ================= PART 1 · THE NEWSSTAND ================= */
/* ============================================================
   NOT RISING NEWSSTAND — THE DATA FILE
   This is the only file you edit to add an issue or change the
   masthead. The engine (newsstand.js) reads everything from here.
   ============================================================ */
window.NR = {

  /* Every image, by nickname. Put the file in assets/img, then list it here.
     Covers also need a small copy in assets/img/thumbs (same file name) for the
     rack and the shop window. Forget it and the full cover loads instead. */
  IMAGES: {
    qr: "qr.svg",
    editorPhoto: "editor-kathi.webp",
    editorSignature: "editor-signature.webp",
    cover01: "issue01-cover.webp",
    cover02: "issue02-cover.webp",
    cover03: "issue03-cover.webp",
    cover04: "issue04-cover.webp",
    cover05: "issue05-cover.webp",
    cover06: "issue06-cover.webp",
    cover07: "issue07-cover.webp",
    cover08: "issue08-cover.webp",
    cover09: "issue09-cover.webp",
    cover10: "issue10-cover.webp",
    cover11: "issue11-cover.webp",
    cover12: "issue12-cover.webp",
    cover13: "issue13-cover.webp",
    memoir01: "memoir01-cover.webp",
    memoir01Back: "memoir01-back.webp",
    memoir02: "memoir02-cover.webp",
    memoir02Back: "memoir02-back.webp",
    memoir03: "memoir03-cover.webp",          // To Be Human: Season 1 (Kathi)
    memoir04: "memoir04-cover.webp",          // To Be Human: Season 3 (Amanda Jane Lee)
    cover14: "issue14-cover.webp",
    cover15: "issue15-cover.webp",
    cover16: "issue16-cover.webp",
    cover17: "issue17-cover.webp",
    cover18: "issue18-cover.webp",
    cover19: "issue19-cover.webp",
    portrait01: "issue01-portrait.webp",
    name01: "issue01-name.webp",
    coverPhoto01: "issue01-cover-photo.webp",
    tocPortrait01: "issue01-toc-portrait.webp",
    arch01: "issue01-arch.webp",
    stage01: "issue01-stage.webp"
  },

  /* Tabs on the rack. A tab only appears once it holds an issue. */
  TABS: [[1, 20], [21, 40], [41, 60]],      // 20 issues per tab
  /* The first tab with no issues yet still shows, with this placard on it. */
  UPCOMING_NOTE: "New issues arrive in 2027",
  /* Each issue's flip book opens on the day of this month that matches its number:
     Issue 17 -> "Coming December 17". */
  RELEASE_MONTH: "December",

  /* MEMOIRS: its own tab, set apart on the right of the menu, in reading order.
     "tag" is the little placard under each cover.
     No "issue" yet? Clicking the cover puts up the marquee with the "soon" text
     (each \n starts a new line; keep lines short so they fit on a phone; the board shows it in capitals). */
  MEMOIRS: [
    { name: "To Be Human: Season 1 · Kathi Eric Dalguntas", tag: "TBH · S1", cover: "memoir03", soon: "To Be Human: Season 1\nDigital Issue\nComing Soon" },
    { name: "To Be Human: Season 2 · Garrett Rees", tag: "TBH · S2", cover: "memoir01", issue: "tbh-s2" },
    { name: "To Be Human: Season 3 · Amanda Jane Lee", tag: "TBH · S3", cover: "memoir04", soon: "To Be Human: Season 3\nDigital Issue\nComing Soon" },
    { name: "To Be Human: Holiday Special · Kathi Eric Dalguntas", tag: "TBH · HOLIDAY", cover: "memoir02", issue: "tbh-holiday" }
  ],

  /* The masthead, shared by every issue. x and y place each group
     on the page in design pixels (Canva pixel x 0.528). */
  MASTHEAD: [
    { role: "Editorial Directors",  names: ["Jennifer Hong", "Jennifer Houle", "Kevin Guiney"], x: 70, y: 166 },
    { role: "Contributing Editors", names: ["Sam Illingworth", "Rebecca Watson", "Pragya", "Mia Kiraki"], x: 408, y: 166 },
    { role: "Columnist",            names: ["Andrea Chiarelli"], x: 66, y: 347 },
    { role: "Contributing Writer",  names: ["Amanda Jane Lee"], x: 408, y: 351 },
    { role: "Editor-in-Chief",      names: ["Kathi Eric Dalguntas"], x: 66, y: 563 }
  ],

  EDITOR_LETTER: {
    greeting: "Hi, Human.",
    paragraphs: [
      { loud: true, text: "Our voices are not heard. Let’s fix that." },
      { text: "NOT RISING features ordinary humans and their extraordinary stories. In a world full of narratives handed from the top down, I’m on a mission to make humanity’s stories rise from the ground up." },
      { text: "My Why is simple: help humans be heard over the algorithm. The How is ancient and battle tested: old-school word of mouth." },
      { loud: true, text: "This is the not-so-underground human curation movement.\nThis is NOT RISING." }
    ],
    photo: "editorPhoto", signature: "editorSignature", role: "Editor-in-Chief", editor: "Kathi Eric Dalguntas"
  },

  /* Every cover feature, oldest first. Its place in this list is its
     issue number. Add "cover" when the Canva cover is uploaded, and
     "issue" when the full magazine is filled in below. */
  FEATURES: [
    { name: "Jennifer Houle", date: "2026-03-01", url: "https://thisisnotrising.org/2026/03/01/jennifer-houle-uncompliant/", cover: "cover01", issue: "jennifer-houle" },
    { name: "Jennifer Hong", date: "2026-03-15", url: "https://thisisnotrising.org/2026/03/15/jennifer-hong/", cover: "cover02" },
    { name: "Farida Khalaf", date: "2026-03-29", url: "https://thisisnotrising.org/2026/03/29/farida-khalaf/", cover: "cover03" },
    { name: "Sam Illingworth", date: "2026-04-12", url: "https://thisisnotrising.org/2026/04/12/sam-illingworth/", cover: "cover04" },
    { name: "Paolo Nardi", date: "2026-04-26", url: "https://thisisnotrising.org/2026/04/26/paolo-nardi/", cover: "cover05" },
    { name: "Neela Kavita Ragbirsingh", date: "2026-05-10", url: "https://thisisnotrising.org/2026/05/10/neela-kavita-ragbirsingh/", cover: "cover06" },
    { name: "Ben Linford", date: "2026-05-24", url: "https://thisisnotrising.org/2026/05/24/ben-linford/", cover: "cover07" },
    { name: "Casey Keen", date: "2026-06-07", url: "https://thisisnotrising.org/2026/06/07/casey-keen/", cover: "cover08" },
    { name: "Mustard", date: "2026-06-21", url: "https://thisisnotrising.org/2026/06/21/mustard/", cover: "cover09" },
    { name: "Mia Kiraki", date: "2026-07-05", url: "https://thisisnotrising.org/2026/07/05/mia-kiraki/", cover: "cover10" },
    { name: "Anna Levitt", date: "2026-07-19", url: "https://thisisnotrising.org/2026/07/19/anna-levitt/", cover: "cover11" },
    { name: "Rebecca Watson", date: "2026-08-02", url: "https://thisisnotrising.org/2026/08/02/rebecca-watson/", cover: "cover12" },
    { name: "Andrew Barban", date: "2026-08-16", url: "https://thisisnotrising.org/2026/08/16/andrew-barban/", cover: "cover13" },
    { name: "Joel L", date: "2026-08-30", url: "https://thisisnotrising.org/2026/08/30/joel-l/", cover: "cover14" },
    { name: "Constantinos Tachtsidis", date: "2026-09-13", url: "https://thisisnotrising.org/2026/09/13/constantinos-tachtsidis/", cover: "cover15" },
    { name: "Rebecca Wicker", date: "2026-09-27", url: "https://thisisnotrising.org/2026/09/27/thestrategiclinguist/", cover: "cover16" },
    { name: "Marlana", date: "2026-10-11", url: "https://thisisnotrising.org/2026/10/11/marlana/", cover: "cover17" },
    { name: "Pragya", date: "2026-10-25", url: "https://thisisnotrising.org/2026/10/25/pragya/", cover: "cover18" },
    /* "soon" = this issue's own marquee text (one line per \n), used instead of the
       automatic "Coming December 19". Add url: "..." once the feature is live. */
    { name: "Dan Korus", date: "2026-11-08", cover: "cover19", soon: "Dan Korus\nDigital Issue\nComing November 8" }
  ],

  /* One magazine per issue. Each question can pick its layout:
       layout: "band-top"     black band top-right; add photo: "nickname" for a photo on the right
       layout: "band-bottom"  question across the top, black band across the bottom
       layout: "split"        black block + tall bleed photo (needs photo) + pull: "quote bar text"
       layout: "statement"    one big answer (for one- or two-sentence answers)
       layout: "reading"      simple: question across the top, one comfortable column
       layout: "callout"      add callout: "one or two lines" — a quote bar under the question
                              (or feature: { label, name } to spotlight a person in the bar)
       bandTop: 520           on "band-bottom", where the black band starts (520 = same as statements)
       ["photoPage", image]   a photo on its own page (just the photo and the page number)
                              add , "", "", "stack" for the stacked-name version
       ["fq", text]           a quoted voice (e.g. a friend's words) set as a pull quote
       layout: "quotes"       question + lead-in on white, ["fq"] quotes on a black band
       pull on "reading"      adds a black band with the quote right under the answer
       blackAt: "top"/"bottom" and answer: "bold" on "statement" pages
       contPull               a pull quote for the question's "continued" page
       layout: "list"         lead-in on white, list items in two columns on a black band
                              (put ["break"] after the lead-in paragraph)
     Extras: feature: { label, name } puts a name in a big black panel (band-top);
     a "split" with no photo leaves a blank white panel.
     Leave layout out and the engine picks one.
     Blocks are tiny instructions:
       ["p", text]          a paragraph (can break across columns)
       ["li", text]         a list item (dash-led)
       ["quote", text]      a big pull quote
       ["img", image]       a photo (sits under the question when it fits)
       ["photoPage", image, label, caption]  a full-page photo */
  ISSUES: {
    /* A finished book, shown page by page from images (exported from the print PDF).
       Put the pages in assets/img/<pageDir> named p01.webp, p02.webp, ...
       (pageExt says which kind of file: "webp" or "jpg")
       Black inside covers are added so page 1 lands on the right, like in print. */
    "tbh-s2": {
      kind: "pages", title: "To Be Human · Season 2 · Garrett Rees",
      pageDir: "tbh-s2/", pageCount: 48, pageExt: "webp", back: "memoir01Back"
    },
    /* insideFront / insideBack: the colour of the blank inside cover, or false for none.
       Choose them so chapter openers face their photos and the page count is even. */
    "tbh-holiday": {
      kind: "pages", title: "To Be Human · Holiday Special · Episode 1",
      pageDir: "tbh-holiday/", pageCount: 32, pageExt: "webp", back: "memoir02Back",
      insideFront: false, insideBack: false
    },

    "jennifer-houle": {
      number: 1, year: 2026,
      /* PREVIEW: until the "until" date, the flip book shows only the first
         "pages" pages, then a "Full issue releases" page and the back cover.
         On that date it opens in full by itself. Delete this line to end the preview early. */
      preview: { pages: 11, until: "2026-12-01" },
      name: "Jennifer Houle", publication: "Uncompliant",
      photoCredit: "Jennifer Houle",
      nameRows: ["JEN", "NIF", "ER", "HOU", "LE"],      // how the name stacks on its title page
      portrait: "portrait01", namePhoto: "name01",
      pullQuote: "“Being competent and well-intentioned inside a broken system doesn’t protect you from being complicit in it.”",
      /* In This Issue: each question or photo with its spot on the page */
      toc: [
        { q: 1, x: 67, y: 182, w: 205 },
        { img: "arch01", x: 537, y: 229, w: 187, h: 156 },
        { q: 5, x: 302, y: 293, w: 225 },
        { img: "tocPortrait01", x: 67, y: 448, w: 173, h: 170 },
        { q: 8, x: 533, y: 488, w: 200 },
        { q: 7, x: 302, y: 628, w: 230 },
        { q: 3, x: 67, y: 737, w: 210 },
        { img: "stage01", x: 532, y: 780, w: 188, h: 111 }
      ],
      sections: [
        { n: "1", q: "Tell us about you.",
          contPull: "“Real change is rarely obvious, or clean, or even rewarded.”", blocks: [
          ["p", "I feel like I’m the last person you would expect to find in Human Resources. I’m very dark, a little angry, and have a highly inappropriate sense of humour, so working in a role that is historically serious and unfunny feels wildly out of character."],
          ["p", "But I think this juxtaposition works, because I’m not the kind of person to just sit there and say, “Hey! This system is unfair, and we should do something about it.”"],
          ["p", "I mean, I do that via Substack, but you have to be smarter about it. If you want to enable real systems change, you have to undercover agent your way into the system. Figure out how it works, infiltrate it."],
          ["p", "That’s when you can make real change."],
          ["p", "And it’s hard… it’s exhausting. And it sometimes feels counterproductive and it definitely can feel confusing, but that’s the work. It’s life work, and it’s work you might not see the results of during your tenure, or maybe even in your lifetime, but it’s there."],
          ["p", "I want readers to know that I envision Uncompliant as a movement, not a personal brand or some kind of weak-ass armchair activism."],
          ["p", "If there’s a throughline in my work, it’s that real change is rarely obvious, or clean, or even rewarded. It’s cumulative, and if enough of us are doing it, it will happen."]
        ]},
        { n: "2", q: "How does the cover photo capture who you are?",
          layout: "reading", pull: "“I once told a photographer that I’m not photogenic. He immediately agreed.”", blocks: [
          ["photoPage", "coverPhoto01", "02 · The cover photo", "“I selected what I felt was the least heinous picture of the bunch.”"],
          ["p", "In a poor attempt at self-deprecation, I once told a photographer that I’m not photogenic. He immediately agreed, and I’ve been traumatized ever since."],
          ["p", "As a result, I looked through my photos and selected what I felt was the least heinous picture of the bunch."]
        ]},
        { n: "3", q: "In one sentence, what are you trying to change?", layout: "statement", blocks: [
          ["quote", "I’m trying to change what we’ve been conditioned to accept as “normal” at work."]
        ]},
        { n: "4", q: "What did you notice was broken that made you start writing?", layout: "band-bottom",
          pull: "“The truth about work is so much more fucked up than anything I could make up.”", blocks: [
          ["p", "HR is a very “behind-the-curtain” role. Pretty early on in my career, I noticed that all of the typical issues that came up at work were blamed on individuals, even though they were clearly systemic issues."],
          ["p", "Companies couldn’t get rid of “problem people” fast enough, and yet, when they did, the same issues kept resurfacing."],
          ["p", "I wanted to shout, “Are you seeing this?” to my peers in the field, but no one was saying anything, and I actually started to feel like Jim Carrey in The Truman Show. I played along for a while, but that’s never really been who I am."],
          ["p", "So I decided to put my thoughts on paper, and Uncompliant was born."],
          ["p", "I love writing, and have always focused on fiction. But the truth about work is so much more fucked up than anything I could make up. I hate that."]
        ]},
        { n: "5", q: "If you could manifest a brighter tomorrow, what would be different by 2030?",
          layout: "callout", callout: "“I would love to see the 5-day/40 hour/week thing abolished.”", blocks: [
          ["photoPage", "arch01", "", "", "stack"],
          ["p", "I would love to see the 5-day/40 hour/week thing abolished."],
          ["p", "Can we just collectively agree on how fucked up that is?"],
          ["p", "That we spend so much of our lives dedicated to work, only to be treated like shit by our employer?"],
          ["p", "I’m completely overwhelmed by that thought right now. It feels like a sick joke. And because I work in HR, I have a front-row seat to how little employers care about employees."],
          ["p", "Like, y’all! They don’t care about you. At all. It’s hard to hear, but I’d rather people know this than be oblivious to it."],
          ["p", "Knowledge is power."]
        ]},
        { n: "6", q: "How would your closest friends describe you?",
          layout: "quotes", bandTop: 520, blocks: [
          ["p", "Questions like this make me deeply uncomfortable. So instead, I asked my two closest pals for their thoughts, and I’m just going to copy and paste what they shared, even though it reads like an obituary:"],
          ["break"],
          ["fq", "Honestly, one of the funniest people I know. Her wit comes from this endless well of information, observations, and connections she’s always making. She sees things other people miss, and she’s so quick with it. She never shies away from trying to get a laugh- even if it’s at her own expense."],
          ["fq", "Deeply passionate and all-in once something catches her interest. She doesn’t do things halfway. She shows up with energy, curiosity, and real commitment."],
          ["fq", "Generous with her time, her love, her thoughts, her knowledge. Wants others to thrive."],
          ["fq", "Invests in her friends in every aspect of the word. Makes people feel seen, empowered and uplifted selflessly without seeking anything in return"],
          ["fq", "Curious and always in pursuit of knowledge, good food, and new adventures."],
          ["fq", "An incredible mom, partner, sister, aunt, daughter who intentionally weaves her bio family and chosen family together."],
          ["p", "And now I’m crying. RIP to me."]
        ]},
        { n: "7", q: "What’s a challenge that changed how you see the world?", layout: "statement", blocks: [
          ["p", "Understanding that being competent and well-intentioned inside a broken system doesn’t protect you from being complicit in it. That’s a very uncomfortable realization."]
        ]},
        { n: "8", q: "What are you most proud of right now?",
          layout: "callout", callout: "“He is spectacular. And we did that.”", blocks: [
          ["photoPage", "stage01"],
          ["p", "My son, Sébastien. Oh my God, he is so funny and self-aware and sharp and emotionally regulated, and I just can’t get over it."],
          ["p", "My partner and I both had traumatic childhoods, and it would be so easy to just keep that generational trauma going, but we refuse. We’ve both done a lot of work on ourselves, and it shows up in our son."],
          ["p", "He’s eight, so of course, he gets upset and loses his shit sometimes. But do you know what he does? He comes back to us, and he apologizes. He’ll say, “I don’t like the way I spoke to you because it’s not actually how I feel about you.”"],
          ["p", "I mean…can you even? He is spectacular. And we did that. We are showing up for him, and it’s working"],
          ["p", "And now I’m crying. Again."],
          ["p", "I’m so proud. I’m proud of myself, and of my partner, and of our son. For someone who isn’t really spiritual, I will say this: in every single lifetime, I hope that I’m lucky enough to know both of them."]
        ]},
        { n: "9", q: "On hard days, what kind of signal from your readers keeps you going?", layout: "statement", blocks: [
          ["p", "Honestly, it’s the fact that they read my work at all. That someone chose to spend a few minutes of their limited time on this planet with something I wrote is astonishing. I’m so grateful."]
        ]},
        { n: "10", q: "For people who haven’t seen your work yet, what article would you want them to read first and why?", layout: "reading",
          pull: "“It captures the core of what I’m trying to do with Uncompliant.”", blocks: [
          ["p", "This was the toughest question to answer. It forced me to revisit every post I’ve written since I joined Substack, and now I want to go back and rewrite everything!"],
          ["p", "That being said, I think the post that gives the most insight into who I am and what I am trying to do here is best reflected in “Your Next Hire Should Make You Uncomfortable.“"],
          ["p", "In this piece, I introduce the idea of Collaborative Range, which reframes hiring as a way to expand a team’s adaptive capacity rather than preserve comfort or familiarity."],
          ["p", "It captures the core of what I’m trying to do with Uncompliant: challenge the habits we’ve normalized in HR and org design, especially the obsession with “fit.”"]
        ]},
        { n: "+", q: "Bonus Q: If you could recommend another writer to be featured on Not Rising, who would it be and why?", layout: "callout",
          feature: { label: "Jennifer recommends", name: "Machine Poet" }, blocks: [
          ["p", "Machine Poet."],
          ["p", "When you choose to engage in something you know is going to be dark, you usually expect a moment where the story becomes dark…some kind of escalation, a pivot, or a reveal."],
          ["p", "But with Machine Poet stories, that moment never really comes. You’re already inside it the second you start reading."],
          ["p", "The first lines envelope you in darkness, and by the time you realize what’s happening, you’re fully in it, and the only way out is through. Machine Poet isn’t designing the exit for you; you have to extract yourself on your own."],
          ["p", "It’s harsh storytelling at its best. It’s uncompromising, immersive and unsettling. Yes, please."]
        ]}
      ]
    }
  }
};


/* ================= PART 2 · THE TRADING POST ================= */
/* ============================================================
   NOT RISING · THE TRADING POST — THE DATA FILE
   Everything you'd want to change about the storefront lives here.
   The engine (storefront.js) reads it; you shouldn't need to touch that.
   ============================================================ */
window.NRSF = {

  /* Where each door and window leads, as folders of this site. */
  LINKS: {
    tradingPost: "newsstand/",      // right door, unit 9: opens onto the Newsstand (for now)
    speakeasy: "speakeasy/",        // left door, 9¾: THE SPEAK
    newsstand: "newsstand/",        // the magazine window
    ramh: "https://robotsatemyhomework.com/ramh-library"   // the A-frame floor sign (opens in a new tab)
  },

  /* The words on the building */
  SIGNS: {
    marquee: "GRAND OPENING",       // letter board under the upstairs window
    marqueeSub: "Sunday 11.1",      // the smaller second line under it (leave "" for one line)
    shop: "The Post",               // the black fascia
    address: "777 Daydream St.",
    hanging: "NOT RISING",          // the cut-metal swinging sign (split over two lines: NOT / RISING)
    floorSign: ["inspired by", "RAMH", "library"],   // the A-frame poster: small top line, big middle (the third word is read aloud only; the library photo shows it)
    leftDoor: "9¾",
    rightDoor: "9"
  },

  /* Seasons. "auto" picks by today's date:
       fall = Sep–Nov, winter = Dec–Feb, spring = Mar–May, summer = Jun–Aug.
     A season that isn't built yet falls back to the one named in FALLBACK_SEASON. */
  SEASON: "auto",
  SEASONS: {
    fall: {
      // Colours of the Boston ivy: the leaves on the walls, the ones lying on the cobbles and the ones falling.
      // Crimson to plum-red, picked from your red-ivy photo.
      leaves: ["#c41a2c", "#d62a3a", "#a8182a", "#cc2c3a", "#e2365a", "#8f2448", "#b81c3a", "#851432", "#d6343f", "#a82850"],
      falling: true,
      pumpkins: false       // the white pumpkins on the step (true = show them)
    }
  },
  FALLBACK_SEASON: "fall",

  /* The poster window: one poster, styled like a best-seller poster.
     (The Now Playing bills for the Speakeasy come back when it opens.) */
  POSTERS: [
    {
      kind: "bestseller",
      rank: "#1",
      book: "Poetic Drift",
      author: "Joel Lymneos",
      cover: "poetic-drift.jpg",
      link: "https://www.amazon.com/dp/B0HMFJL61C"
    }
  ]
};
