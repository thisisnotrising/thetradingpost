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
    memoir03Back: "memoir03-back.webp",       // its back cover (the last page of the S1 ebook PDF)
    memoir04: "memoir04-cover.webp",          // To Be Human: Season 3 (Amanda Jane Lee)
    memoir04Back: "memoir04-back.webp",       // its back cover
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
    stage01: "issue01-stage.webp",
    // Issue 19 · Dan Korus: his magazine's pictures (made from the feature's photos by tools/issue19-images.py)
    portrait19: "issue19-portrait.webp",      // opener portrait
    name19: "issue19-name.webp",              // name page (in colour, like Issue 01's)
    tocDog19: "issue19-toc-dog.webp",         // contents page, small photos
    tocRun19: "issue19-toc-run.webp",
    tocLaugh19: "issue19-toc-laugh.webp",
    camp19: "issue19-camp.webp",              // Q1 photo page (under 700 px wide on purpose: it sits framed, whole, on black)
    couple19: "issue19-couple.webp",          // Q2 photo page
    workshop19: "issue19-workshop.webp",      // Q4 photo page (stacked name + photo)
    dog19: "issue19-dog.webp"                 // Q6 photo page
  },

  /* Tabs on the rack. A tab only appears once it holds an issue. */
  TABS: [[1, 20], [21, 40], [41, 60]],      // 20 issues per tab
  /* READ ONLINE button under every "coming soon" marquee: where it goes.
     (A memoir with its own "read" link uses that one instead.) */
  READ_ONLINE: "https://thisisnotrising.org/features/",
  /* The first tab with no issues yet still shows, with this placard on it. */
  UPCOMING_NOTE: "New issues arrive in 2027",
  /* Each issue's flip book opens on the day of this month that matches its number:
     Issue 17 -> "Coming December 17". */
  RELEASE_MONTH: "December",

  /* MEMOIRS: its own tab, set apart on the right of the menu, in reading order.
     "tag" is the little placard under each cover.
     No "issue" yet? Clicking the cover puts up the marquee with the "soon" text
     (each \n starts a new line; keep lines short so they fit on a phone; the board shows it in capitals).
     "read" = a web link; when it's there, the marquee gets a READ ONLINE button that opens it in a new tab.
     "url" = the memoir's web home; when it's there, the open book shows the Online button (same as the issues' "url").
     "paper" = the colour of the copies stacked behind the cover, so they match the cover's own paper
     (leave it out and the copies stay black, like TBH S2).
     (The Holiday Special, memoir02 / "tbh-holiday", is off the shelf until its teaser drops; its book
     is still kept in ISSUES below, so putting it back is just adding its line here again.) */
  MEMOIRS: [
    { name: "To Be Human: Season 1 · Kathi Eric Dalguntas", tag: "TBH · S1", cover: "memoir03", issue: "tbh-s1", url: "https://thisisnotrising.org/to-be-human/", paper: "#e3e2dc" },
    { name: "To Be Human: Season 2 · Garrett Rees", tag: "TBH · S2", cover: "memoir01", issue: "tbh-s2", url: "https://thisisnotrising.org/to-be-human/" },
    { name: "To Be Human: Season 3 · Amanda Jane Lee", tag: "TBH · S3", cover: "memoir04", issue: "tbh-s3", url: "https://thisisnotrising.org/to-be-human/", paper: "#fafbf8" }
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
    /* A cover with no "issue" yet shows a "coming soon" marquee instead of a magazine. Its options:
       soon: "..." = that marquee's own text (one line per \n), used instead of the automatic "Coming December 19";
       read: false = no READ ONLINE button on it. Both can go once the magazine ("issue") is filled in. */
    { name: "Dan Korus", date: "2026-11-08", url: "https://thisisnotrising.org/2026/11/08/dan-korus/", cover: "cover19", issue: "dan-korus" }
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
    /* Season 1, from TBH_Season1_ebook_light.pdf (Nov 4): the PDF's first page is the cover (memoir03),
       its pages 2-56 are p01-p55 here (1400 px wide, so they stay sharp when the book fills a big screen),
       and its last page is the back cover (memoir03Back). Page 2 of the PDF is already dark (the copyright
       page), so it serves as the inside front cover: no extra one. One dark inside back cover is added so
       the closing photo faces it and the back cover sits alone, as in print. #212226 = the PDF's own dark. */
    "tbh-s1": {
      kind: "pages", title: "To Be Human · Season 1 · Kathi Eric Dalguntas",
      pageDir: "tbh-s1/", pageCount: 55, pageExt: "webp", back: "memoir03Back",
      insideFront: false, insideBack: "#212226",
      /* The contents page (p03) is clickable: each chapter's row jumps to its opener.
         page = the picture the button sits on; to = the picture it jumps to (Chapter 1, printed page 4, is p05:
         the printed page number + 1); x, y, w, h = where the row is, in design pixels (816 x 1056 per page). */
      links: [
        { page: 3, to: 5,  label: "Chapter 1: What It Is To Be Human",              x: 283, y: 175, w: 461, h: 94 },
        { page: 3, to: 11, label: "Chapter 2: To love is human; to grieve, divine.",  x: 283, y: 292, w: 461, h: 94 },
        { page: 3, to: 17, label: "Chapter 3: To falter is human; to persevere, divine.", x: 283, y: 409, w: 461, h: 94 },
        { page: 3, to: 25, label: "Chapter 4: To weep is human; to let yourself, divine.", x: 283, y: 526, w: 461, h: 94 },
        { page: 3, to: 35, label: "Chapter 5: To break is human; to blaze, divine.",  x: 283, y: 643, w: 461, h: 94 },
        { page: 3, to: 45, label: "Chapter 6: To be human is divine.",               x: 283, y: 760, w: 461, h: 94 }
      ]
    },
    /* Season 3 (Nov 4), rebuilt as a 32-page magazine from Amanda's manuscript (the build kit is in tools/tbh-s3:
       see its README). The cover is memoir04; p01-p30 are printed pages 2-31; the back cover is memoir04Back. The page files are
       numbered so that pXX is printed page XX + 1, which is also the flipbook's page counter.
       Clickable: the contents rows (p03) jump to each chapter and to the finale (p28, straight after Chapter 4's
       last page); "Read it online" (p29) and "Subscribe to Amanda" (p30) open their Substack pages in a new tab. x, y, w, h in design pixels (816 x 1056). */
    "tbh-s3": {
      kind: "pages", title: "To Be Human · Season 3 · Amanda Jane Lee",
      pageDir: "tbh-s3/", pageCount: 30, pageExt: "webp", back: "memoir04Back",
      insideFront: false, insideBack: false,
      links: [
        { page: 3, to: 5,  label: "Chapter 1: Shraddha",    x: 282, y: 168, w: 462, h: 132 },
        { page: 3, to: 11, label: "Chapter 2: Backlog",     x: 282, y: 324, w: 462, h: 132 },
        { page: 3, to: 17, label: "Chapter 3: Silk",        x: 282, y: 480, w: 462, h: 132 },
        { page: 3, to: 23, label: "Chapter 4: Cul-de-sacs", x: 282, y: 636, w: 462, h: 132 },
        { page: 3, to: 28, label: "Chapter 5: The Season Finale, arrives Saturday 11.7", x: 282, y: 792, w: 462, h: 132 },
        { page: 29, href: "https://chiefabsurdistofficer.substack.com/s/to-be-human", label: "Read To Be Human online (opens Substack)", x: 72, y: 540, w: 373, h: 118 },
        { page: 30, href: "https://substack.com/@ajlol", label: "Subscribe to Amanda Jane Lee on Substack (opens a new tab)", x: 72, y: 540, w: 391, h: 130 }
      ]
    },
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

    /* Issue 19 · Dan Korus (Nov 7). Built exactly like Issue 01: same page templates, same 11-page preview.
       Text from the feature on thisisnotrising.org (goes live Nov 8, 11:11 am); photos from the same post.
       The preview ends on December 19, matching RELEASE_MONTH (Issue 19 -> December 19); on that day the
       whole issue opens by itself. Add ?full to the Newsstand address to proof the whole issue before then. */
    "dan-korus": {
      number: 19, year: 2026,
      preview: { pages: 11, until: "2026-12-19" },
      name: "Dan Korus", publication: "The Updraft",
      photoCredit: "Dan Korus",
      nameRows: ["DAN", "KO", "RUS"],
      portrait: "portrait19", namePhoto: "name19",
      pullQuote: "“I want fewer people spending their evenings recovering from how they were treated at work.”",
      toc: [
        { q: 1, x: 67, y: 182, w: 205 },
        { img: "tocRun19", x: 537, y: 229, w: 187, h: 156 },
        { q: 5, x: 302, y: 293, w: 225 },
        { img: "tocDog19", x: 67, y: 448, w: 173, h: 170 },
        { q: 8, x: 533, y: 488, w: 200 },
        { q: 7, x: 302, y: 628, w: 230 },
        { q: 3, x: 67, y: 737, w: 210 },
        { img: "tocLaugh19", x: 532, y: 780, w: 188, h: 111 }
      ],
      sections: [
        { n: "1", q: "Tell us about you.",
          contPull: "“The fastest way to give others permission to be themselves is to be outrageously yourself first.”", blocks: [
          ["p", "I’m from Washington. The Pacific Northwest. Land of trees, strong coffee, and kinda-dirty smiling people in Birkenstocks who have opinions about the right way to compost."],
          ["p", "My favorite childhood memories are from the mountains. I learned to love endurance sports through nordic ski racing on Mt. Spokane. On Friday nights we’d carpool up after school to train. No headlamps was the rule. We skied by the moon and stars."],
          ["p", "I had a hard time reading growing up. I couldn’t sit still. Sports taught me more than the classroom ever did, and that’s still how I teach."],
          ["p", "The mountains are still where I go to play. These days it’s trail running in the Jemez Mountains around my home in New Mexico. If you’ve seen my dorky attempts at filming leadership videos while running, you’ve seen some of my favorite places."],
          ["p", "One of my first jobs was as a camp counselor. It’s still the most fun I’ve ever had at work."],
          ["p", "I learned how to help kids get along, get a shy camper to open up, and defuse a fight so they could go back to being friends. I also got to be goofy. A muscular guy in a dress, being ridiculous and genuine, on purpose."],
          ["p", "The fastest way to give others permission to be themselves is to be outrageously yourself first."],
          ["p", "Teach ’em young: Know your emotions, take responsibility for how you act, and do cool shit for others."],
          ["p", "We’d raid the candy store in silly costumes, serious as can be, then take our sugary haul to a field to stargaze and laugh. The next day, still in costume, we’d build massive floating wooden structures and set them on fire with flaming arrows."],
          ["p", "Many of those campers became counselors themselves. They still write to me about the costumes, the candy raids, and the nights under the stars."],
          ["p", "I know what leadership looks like. I learned it at summer camp."],
          ["photoPage", "camp19"],
          ["p", "I went on to earn my master’s in chemistry and work in startups and government. I met my best friend along the way and settled in New Mexico. Sunshine, green chile, and the beauty of the wide open."],
          ["p", "Today I run Kestryl Edge, where I teach leadership and emotional intelligence to the people who run high consequence, mission-oriented teams. Places where how you treat people is an operational variable."],
          ["p", "I’m a husband. A dog walker. A runner. A coach. A scientist. Someone with a good bit to say about leadership. And a camp counselor, still."]
        ]},
        { n: "2", q: "What drives you? What gives you energy?",
          layout: "reading", pull: "“Things could be better, and therefore they shall.”", blocks: [
          ["photoPage", "couple19", "02 · Rich in life", "“My wife. My dogs. My cat. I’m rich in life.”"],
          ["p", "My unreasonably strong sense of justice."],
          ["p", "Things could be better, and therefore they shall."],
          ["p", "I lived the problem, then I saw the problem, and the fact that it still exists is reason enough."],
          ["p", "What gives me energy is simpler. My wife. My dogs. My cat. I’m rich in life."],
          ["p", "And when you already have everything money can’t buy, all that’s left is to make a difference for the people around you."]
        ]},
        { n: "3", q: "In one sentence, what are you trying to change?", layout: "statement", blocks: [
          ["quote", "I want fewer people spending their evenings recovering from how they were treated at work."]
        ]},
        { n: "4", q: "What did you notice was broken that made you start writing?", layout: "band-bottom",
          pull: "“We give people advice about managing their reactions to poor leadership while letting the people responsible carry on.”", blocks: [
          ["photoPage", "workshop19", "", "", "stack"],
          ["p", "“You should read The Four Agreements.”"],
          ["p", "I had just shown a CEO the red lines I’d made in one of his emails. Threats underlined, rudeness circled. I told him I expected more respectful communication. His advice was that I read the book."],
          ["p", "So I did. I asked him to read it with me. He didn’t."],
          ["p", "At our next meeting, he turned the conversation into an early performance review. My feedback for the coming year: I needed to work on the second agreement. Don’t take anything personally."],
          ["p", "Apparently the second agreement applied to me. The first one, be impeccable with your word, didn’t seem to apply to the CEO whose words I’d marked in red."],
          ["p", "He had turned a lesson about personal accountability into a way to escape his own."],
          ["p", "I knew enough to speak up. What I didn’t have was the practice or the confidence to hold that boundary with someone who had power over my job. I could tell him his behavior was unacceptable. Figuring out what to do when it continued was harder."],
          ["p", "That’s the problem I keep coming back to in my writing."],
          ["p", "We give people advice about managing their reactions to poor leadership while letting the people responsible carry on."],
          ["p", "I want people to recognize what’s happening and have tools to respond. I also want leaders to be able to hear criticism without making someone regret speaking up."],
          ["p", "I’m still learning how to do both."]
        ]},
        { n: "5", q: "If you could manifest a brighter tomorrow, what would change by 2030?",
          layout: "callout", callout: "“Emotional Management 101 would be required, just like English 101.”", blocks: [
          ["p", "By 2030, emotional intelligence would be taught at every level of education. Emotional Management 101 would be required, just like English 101."],
          ["p", "Students would have an emotion wheel in their backpack alongside their physics equation sheet."],
          ["p", "That education would show up outside the classroom."],
          ["p", "High schoolers able to express their feelings. Parents able to listen without immediately jumping in to correct them."],
          ["p", "Healthier adult relationships. Workplaces with healthy candor. People who understand their values well enough to know when they need to set a boundary."],
          ["p", "At work, basic EQ skills would be part of onboarding. Managers would lead the way, setting the bar for what it means to listen and put people first."],
          ["p", "I’d love for Kestryl Edge to partner with schools and universities to help build that curriculum. Teach people how to recognize what they’re feeling, work through disagreements, and take responsibility when they hurt someone."],
          ["p", "I’d be proud to have a hand in what the next generation learns about treating people well."]
        ]},
        { n: "6", q: "How would your closest friends describe you?",
          layout: "quotes", bandTop: 520,
          contPull: "“You’re a Belgian Malinois in a human body.”", blocks: [
          ["p", "I love my friends. I have good ones. Here’s what they sent me:"],
          ["break"],
          ["fq", "Daniel is one of the most compassionate people I know. Talking with him is like chatting over a fire late into the night until the embers go out. He has a listening ear and wants to hear every aspect of every story just so he can be as empathetic and understanding as possible. He strives to put others before himself but does not forget who he is in the process. He’s independent and head strong but careful to not harm anyone in his wake. Daniel is someone I envision walking with me through life as a friend, colleague, and mentor.” – Jay"],
          ["fq", "Dan is one of those people who just gets shit done. He has the vision, but more importantly the discipline and drive to execute, whether it’s starting a business or running an ultramarathon. Not everyone can see the value in the struggle, and even fewer willingly take them on. Dan not only launches into challenges face first, but knows how to have fun when they punch back.” – Mason"],
          ["fq", "Dan is the most ride-or-die type person I know. I admire the certainty and ferocity with which he approaches his life, and which is evident in his accomplishments and relationships big and small. In all things Dan does, there is this beautiful connecting thread which is his thoughtfulness, intentionality, and desire to do good by his people.” – Emily"],
          ["fq", "Dan is the most genuinely charismatic person I have ever met. And ‘genuine’ is important in this context, because his charisma, which some people use for their own gain, comes from a place of kindness, warmth, and genuine care for other people. You could be a grocery store clerk, a stranger on the street, or a friend going through a rough patch, and Dan will genuinely want to know how you’re doing. He’ll listen, truly listen, and somehow find the right way to support you, uplift you, or make you laugh. It goes beyond Dan being someone who can make friends with anyone; he has the rare ability to turn those encounters into meaningful connections.” – Nick"],
          ["fq", "Dan Korus holds every aspect of his life to the highest standard — his performance, his relationships, the quality of his leisure time — and somehow still makes the unrelenting pursuit of excellence a fun time. Every time I talk to him I feel like I just dunked my head in spring water, and remember why he’s been one of my closest friends for many years despite the many miles between us.” – Phil"],
          ["fq", "You’re a Belgian Malinois in a human body.” – Anna"],
          ["photoPage", "dog19", "", ""]
        ]},
        { n: "7", q: "What’s a challenge that changed how you see the world?", layout: "band-top",
          pull: "“Surviving was hard. Leaving was harder.”", blocks: [
          ["p", "Working in a toxic environment."],
          ["p", "At a startup, years ago, I watched people get frustrated and leave the company, their research, and a dream they’d once believed in."],
          ["p", "I went to a dark place. I was drinking every night. One to calm down enough to cook and clean. Another to relax and enjoy time with my partner. Sometimes more to sleep without rehearsing defenses and retorts in my head."],
          ["p", "Any conversation about work became a conversation about how fucked up my day job was. Get a few coworkers together and we’d end up in the same place."],
          ["p", "Then I’d see friends a few months after they’d left. They’d found new jobs, and it was scary how much happier they looked. They seemed to be living so much more of their lives. I wanted that."],
          ["p", "But when you’re burned out and everything at work is telling you that you’re not enough, how do you find the energy to look for another job? How do you convince yourself you have something worth offering?"],
          ["p", "I’d learned how to get through the day where I was. I worried the next place could be just as bad."],
          ["p", "Surviving was hard. Leaving was harder."],
          ["p", "What I came to understand was how much a workplace can shrink what you believe is possible for yourself. You can recognize that something is wrong and still struggle to act on it. Finding a way out takes energy and confidence that the job itself may have worn down."],
          ["p", "That changed how I understand people who stay. Knowing they deserve better doesn’t mean they can see how to get there."],
          ["p", "I want people to have more options and more power over what happens next. Something beyond finding another way to get through the day."],
          ["p", "That’s what the free essays and the podcast are for. And for the teams that want to go further, that’s what the workshops and coaching at Kestryl Edge are built to do."]
        ]},
        { n: "8", q: "What are you most proud of right now?",
          layout: "callout", callout: "“Leadership is inviting others to greatness and accepting your own invitation first.”", blocks: [
          ["p", "I’m proud that people can learn from us without a budget for coaching."],
          ["p", "We’re building a library of free resources. And the teams and individuals who hire us for workshops and coaching are what make the free stuff possible."],
          ["p", "I also just really like what we teach."],
          ["p", "We have run a virtual workshop where I was the only attendee. Tessa, lead facilitator, is teaching, and the two of us are sitting there talking about what we value and why it matters to us. No one was there to witness it."],
          ["p", "“Okay Dan, what values are we working on here?”"],
          ["p", "“I’m working on how to be more kind when I’m frustrated.”"],
          ["p", "We’re doing the work we ask others to do. I’m taking notes. Learning. Laughing."],
          ["p", "I will never ask someone to do something I’m not already working hard on myself."],
          ["p", "Leadership is inviting others to greatness and accepting your own invitation first."],
          ["p", "There’s something satisfying about helping build a workshop and then discovering how much you still have to learn from it. Watching teams grow closer as they work through the material together is a big part of why I love this."],
          ["p", "It rocks. It rocks hard."]
        ]},
        { n: "9", q: "On hard days, what kind of signal from your readers keeps you going?", layout: "band-bottom",
          pull: "“My writing is me. My company is the manifestation of what I want to bring to the world.”", blocks: [
          ["p", "When someone I’ve never pitched writes to tell me they learned something."],
          ["p", "It’s easy to feel invisible."],
          ["p", "A ‘like’ costs nothing. An email costs something. Somebody had to stop, think about what they read, and decide to reach out."],
          ["p", "My writing is me. My company is the manifestation of what I want to bring to the world."],
          ["p", "And when a stranger says it helped them handle a hard conversation with a peer, or finally set a boundary they’d been avoiding, that’s the whole reason I do this."]
        ]},
        { n: "10", q: "What article would you want your new readers to read first?", layout: "reading",
          pull: "“Reach out. Say hi. Let’s chat.”", blocks: [
          ["p", "“The Leadership Field Has A Bullshit Problem.”"],
          ["p", "Then to my inbox. Reach out. Say hi. Let’s chat."],
          ["p", "Every week I record a new Kestryl Edge podcast and sit down with someone who’s thought hard about how we treat people at work."],
          ["p", "And if you run a team and want to do this work together, that’s kestryledge.com."]
        ]},
        { n: "+", q: "Bonus Q: If you could recommend another writer to be featured on Not Rising, who would it be and why?", layout: "callout",
          feature: { label: "Dan recommends", name: "Sven Brodmerkel" }, blocks: [
          ["p", "Sven Brodmerkel."],
          ["p", "I have a school boy crush on him. Awesome writer. So gifted with words. I get smarter reading Sven."]
        ]}
      ]
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
    tradingPost: "post/cafe", // right door, unit 10: opens into THE POST (the room inside); its directory leads on to the Newsstand
    speakeasy: "speakeasy/",        // left door, 9¾: THE SPEAK
    newsstand: "newsstand/",        // the magazine window
    ramh: "https://robotsatemyhomework.com/ramh-library",  // the A-frame floor sign (opens in a new tab)
    marquee: "https://nebularising.media/thetradingpost/newsstand/#tbh-s3",   // the button under the letter board up close: Amanda's To Be Human S3 on the Newsstand ("" = no popup)
    magazine: "https://thisisnotrising.org/"                 // the button under the NOT RISING sign up close ("" = no popup)
  },

  /* The words on the building */
  SIGNS: {
    marquee: "NOW SOARING",       // letter board under the upstairs window
    marqueeSub: "AMANDA JANE LEE",      // the smaller second line under it (leave "" for one line)
    marqueeButton: "Read Amanda's Story",  // the button under the letter board up close (it opens LINKS.marquee)
    shop: "The Post",               // the black fascia
    address: "777 Daydream St.",
    hanging: "NOT RISING",          // the cut-metal swinging sign (split over two lines: NOT / RISING)
    floorSign: ["Inspired by", "RAMH", "Library"],   // the A-frame poster's three lines: small, big, medium (the RAMH logo sits under them)
    leftDoor: "9¾",
    rightDoor: "10"
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

  /* Seasons whose building, ivy, doors and shop windows are baked into pictures (assets/img/storefront/),
     so they load fast. A season not listed here is painted live on the visitor's device (slow on phones).
     Changed the building, the ivy colours or a season? Run tools/bake-storefront.js to bake it again. */
  BAKED: ["fall"],

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


/* ================= PART 3 · THE POST (the room inside) ================= */
/* ============================================================
   NOT RISING · THE POST — THE DATA FILE
   The room you walk into through the right-hand door (unit 10).
   The engine (post.js) reads this; the drawing of the room lives there.
   THE POST itself (post/cafe.html) is a stage set photographed from that room (post/recipe.html), so a change
   here that shows in the room appears there after re-photographing with tools/bake-stage.js. The gallery's photos
   and label, and the wishes as words (for screen readers), are read live by post/cafe.html.
   ============================================================ */
window.NRPOST = {

  /* The white directory panel, top to bottom. "href" is where each one leads.
     Leave href as "" while a room is still being built: visitors get a small
     "opening soon" note instead. The arrow points the way from the door. */
  ROOMS: [
    { key: "newsstand",   label: "Newsstand",    arrow: "←", href: "../newsstand/index.html" },
    { key: "wishingWall", label: "Wishing Wall", arrow: "↖", href: "" },
    { key: "cafe",        label: "Cafe",         arrow: "↑", href: "https://buymeacoffee.com/thisisnotrising" },   // Nebula Cafe: Buy Me a Coffee (opens in a new tab)
    { key: "gallery",     label: "Gallery",      arrow: "→", href: "" }
  ],

  /* NEBULA CAFE's neon, on the front of the stone bar: the words (one line each) and where it leads.
     Leave "link" as "" for a sign that isn't clickable. */
  NEON: {
    lines: ["buy me a cosmo"],
    link: "https://buymeacoffee.com/thisisnotrising"
  },

  /* THE WISHING WALL. Every cover feature's answer to the question below, spray-painted on the white brick around
     the floor-to-ceiling cowboy mural. One line each, in their own words, signed "Name, Human". Each wish gets its
     own block, laid out by itself (post.js, wallLayout()): a new wish just needs a new line here.
     name, wish: the words.   **word** = paint that word bigger.
     font: Permanent Marker, Sedgwick Ave Display, Rock Salt, Bebas Neue, Black Ops One or Reenie Beanie
       (saved in assets/fonts/wall, so they always load).
     case: "up" = ALL CAPITALS, "low" = all lower case, leave it out = as written.
     place: "under" = this wish is painted on its own, centred right under the cowboy mural, like its caption
       (the cowboy is raised a little to leave room). The rest are laid out around him.
     human: false = signed with the name alone, without ", Human".
     title: "..." = signed with these words in place of "Human", e.g. title: "observer of humans" = "Name, observer of humans".
     (side, size, w, rot and ink were for the old layout; they're kept, but the wall no longer uses them:
      every wish is painted solid black, and the layout decides where it goes and how big.)
     New issue? Copy a line and change the name, the words and, if you like, the font. */
  QUESTION: "If you could manifest a brighter tomorrow, what would be different by 2030?",
  WISHES: [
    { side: "L", name: "Jennifer Hong",          wish: "I don’t wish people happiness, I wish them **wholeness.**", font: "Sedgwick Ave Display", size: .26, w: 2.6, rot: -3, ink: "#111" },
    { side: "L", name: "Paolo Nardi Fernandez",  wish: "Tech for good.", font: "Black Ops One", size: .42, w: 3.2, rot: 0, case: "up", ink: "#111" },
    { side: "R", name: "Rebecca Wicker",         wish: "Different doesn’t mean wrong.", font: "Permanent Marker", size: .3, w: 2.1, rot: -4, case: "up", ink: "#111" },
    { side: "L", name: "Neela Singh",            wish: "I want the culture of burning people out in the name of growth to finally be called what it is: **exploitation.**", font: "Permanent Marker", size: .13, w: 2.2, rot: 2, ink: "#111" },
    { side: "L", name: "Jennifer Houle",         wish: "I would love to see the 5-day/40 hour/week thing abolished.", font: "Bebas Neue", size: .26, w: 2.0, rot: 0, case: "up", ink: "#111" },
    { side: "L", name: "Sam Illingworth",        wish: "People are freed up to be creators and humans.", font: "Rock Salt", size: .13, w: 1.9, rot: -3, ink: "#111" },
    { side: "L", name: "Rebecca Watson",         wish: "A world where people feel less alone.", font: "Reenie Beanie", size: .34, w: 2.2, rot: 3, ink: "#111" },
    { side: "L", name: "Andrew Barban",          wish: "A world where you can read the news and you don’t feel worse.", font: "Sedgwick Ave Display", size: .17, w: 1.9, rot: 2, ink: "#111" },
    { side: "R", name: "Joel L.",                wish: "No more tying healthcare to employment.", font: "Permanent Marker", size: .17, w: 1.9, rot: -2, case: "low", ink: "#111" },
    { side: "L", name: "Farida Khalaf",          wish: "I hope we manifest a deeper **empathy.**", font: "Rock Salt", size: .14, w: 1.6, rot: 3, ink: "#111" },
    { side: "R", name: "Pragya",                 wish: "More generosity in the world.", font: "Black Ops One", size: .17, w: 1.7, rot: 0, case: "up", ink: "#111" },
    { side: "R", name: "Constantinos Tachtsidis",wish: "I would like journalism to care more about meaning and less about content quantity.", font: "Bebas Neue", size: .2, w: 1.9, rot: -2, case: "up", ink: "#111" },
    { side: "R", name: "Marlana",                wish: "More people questioning what we’re told life is supposed to look like and actually experimenting with something different.", font: "Reenie Beanie", size: .26, w: 1.8, rot: -3, ink: "#111" },
    { side: "R", name: "Ben Linford",            wish: "Understand what we’ll be giving up if we choose to regress.", font: "Sedgwick Ave Display", size: .15, w: 1.7, rot: 2, ink: "#111" },
    { side: "L", name: "Casey Keen",             wish: "Fewer insurance-driven constraints shaping what care is allowed to look like.", font: "Permanent Marker", size: .12, w: 1.8, rot: -3, ink: "#111" },
    { side: "R", name: "JustSomeMustard",        wish: "A society that actively works to everyone’s benefit.", font: "Bebas Neue", size: .22, w: 1.7, rot: 3, case: "up", ink: "#111", title: "observer of humans" },
    { side: "L", name: "Maria-Cristina Muntean", wish: "A world that values the time it takes to care about something.", font: "Reenie Beanie", size: .26, w: 1.9, rot: -2, ink: "#111" },
    { side: "R", name: "Anna Levitt",            wish: "Less hustle culture, more knowing who you are as a person.", font: "Rock Salt", size: .12, w: 1.9, rot: 4, case: "low", ink: "#111" },
    { side: "L", name: "Dan Korus",              wish: "Emotional intelligence would be taught at every level of education.", font: "Sedgwick Ave Display", size: .17, w: 1.9, rot: 2, ink: "#111" },
    { name: "Chief Absurdist Officer",           wish: "War is disincentivized.", font: "Black Ops One", case: "up", place: "under", human: false }
  ],

  /* THE GALLERY: black-and-white photos, each a framed canvas print, all the same size, in an even grid
     along the black brick wall (top row first, from the far end toward the door).
     Put the print in assets/img/post/gallery/life-exhibit and its small copy in life-exhibit/wall (same name),
     then list it here.
     The canvases on the wall are square, so each photo is trimmed to a square there.
     "crop" (optional) says which part of the photo to keep, as "across down":
       "50% 50%" = the middle (the default), "50% 100%" = keep the bottom, "50% 0%" = keep the top.
     The viewer always shows the whole photo, untrimmed.
     "ar" is the photo's real shape, width ÷ height (1 = square, 1.5 = landscape, 0.75 = portrait):
     the viewer uses it to size the photo.
     Clicking a frame opens the photo big, with a museum wall label beside it.
     GALLERY_LABEL is the label every photo uses: four lines (artist, title, medium, credit).
     Put *stars* around words to set them in italics, as museums do for a work's title. To give one photo its own wording,
     add the same field names to that photo's line, e.g.
       { img: "...", ar: 1.5, alt: "...", title: "Juniper, Ogden Valley, 2026" }
     and only that line changes; the rest of its label stays the same. */
  GALLERY_LABEL: {
    artist: "KATHI ERIC DALGUNTAS (Filipino-American, b. 1986)",       // line 1, bold
    title:  "*Life Exhibit*, 2026",                                     // line 2  (*words* = in italics)
    medium: "Gelatin silver print",                                     // line 3
    credit: "Collection of THE GALLERY on Daydream St., Gift of the artist"   // line 4, small
  },
  /* The prints are made from Kathi's originals by tools/tone-gallery.py: stark black and white in the Wishing
     Wall's own two tones. It saves each one twice: the print (life-exhibit/) and a small copy for the wall
     (life-exhibit/wall/, same name). */
  GALLERY: [
    // Life Exhibit, 2026. Hung in this order: top row first (far end to door end), then the next row down.
    { img: "post/gallery/life-exhibit/01-brick-coffee-house.webp", ar: 0.75, crop: "50% 25%", alt: "The BRICK Coffee House Cafe: a brick shopfront with a Breakfast & Lunch sign over a wooden door, a flag in the window" },
    { img: "post/gallery/life-exhibit/02-chalk-heart.webp",        ar: 1.35, alt: "A chalk heart on wet pavement scattered with fallen leaves, a pair of black shoes at its point" },
    { img: "post/gallery/life-exhibit/03-string-lights.webp",      ar: 1.52, alt: "A string of bulb lights, the rest of the strand melting into blur" },
    { img: "post/gallery/life-exhibit/04-state-room.webp",         ar: 1.11, alt: "The State Room marquee: Tonight, OK Go, Sold Out" },
    { img: "post/gallery/life-exhibit/05-guitar-case.webp",        ar: 0.68, alt: "A guitar case leaning against sheer curtains in soft light" },
    { img: "post/gallery/life-exhibit/06-holding-hands.webp",      ar: 1.34, alt: "Two people holding hands on a hospital bed, paper bands on one wrist" },
    { img: "post/gallery/life-exhibit/07-evil-eye.webp",           ar: 0.75, crop: "50% 35%", alt: "A glass evil eye set in a round stamped-brass cuff on a wrist with a leaf tattoo, a weathered wooden railing behind" },
    { img: "post/gallery/life-exhibit/08-mural-alley.webp",        ar: 0.75, alt: "A narrow alley between graffiti-painted brick walls, set with café tables and chairs under string lights" },
    { img: "post/gallery/life-exhibit/09-stencil-cowboy.webp",     ar: 0.75, crop: "50% 15%", alt: "Stencil graffiti of a cowboy with a rifle on a painted cinder-block wall" },
    { img: "post/gallery/life-exhibit/10-towers.webp",             ar: 1.00, alt: "Looking straight up between glass towers into cloud" },
    // (Nov 4) photo 11 is Kathi's self-portrait by the window (it replaced the steel door). crop "50% 0%" keeps the top
    // of the photo in the square, so the whole beanie fits.
    { img: "post/gallery/life-exhibit/11-self-portrait.webp",      ar: 0.75, crop: "50% 0%", alt: "A self-portrait by a sunlit window: smiling in a knit beanie and headphones, rays of light streaming across her, a vine tattoo on her forearm" },
    { img: "post/gallery/life-exhibit/12-dog-sofa.webp",           ar: 1.36, alt: "A small white dog resting on a tufted sofa beside a knit pillow" },
    { img: "post/gallery/life-exhibit/13-payphone.webp",           ar: 0.81, alt: "A pay phone glimpsed between two posts" },
    { img: "post/gallery/life-exhibit/14-plant-window.webp",       ar: 1.33, alt: "A man in a hoodie at a café table by a sunny window, surrounded by tall leafy plants" },
    { img: "post/gallery/life-exhibit/15-mca-denver.webp",         ar: 1.34, crop: "100% 50%", alt: "Museum of Contemporary Art Denver, in white letters on a dark wooden wall beside a long ramp" },
    // (Nov 1) photo 16 is the speakeasy sign (it replaced the window blinds). crop "70% 50%" keeps the whole sign,
    // wooden frame and all, in the square: the sign is wider than the photo is tall, so the square sits toward the right.
    { img: "post/gallery/life-exhibit/16-speakeasy.webp",          ar: 1.33, crop: "70% 50%", alt: "A hand-painted SPEAKEASY sign in a wooden frame, its tail curling into an arrow, above a wooden bench between two planters of flowers" }
  ],

  /* THE POSTER ON THE BLACK WALL (Oct 31, 2026)
     The storefront window's #1 NOT RISING MAGAZINE / BEST STORYTELLER poster (Poetic Drift by Joel Lymneos),
     blown up and hung on the blank black brick behind the lounge: the stretch between the back corner (by the café)
     and the word LIFE.
     The pictures are the storefront poster itself, redrawn 4 times bigger (3456 x 4408 pixels) with its book cover
     sharpened by an AI upscaler (tools/render-poster.js), so it stays crisp however big it's seen. Phones get a copy
     half that size (still twice the original), which is plenty for a phone and easier on its memory.
     It is hung live by post/cafe.html, on top of the wall's picture (not baked into it), so it keeps every pixel.
     WHERE IT HANGS, in metres, for each room shape (wide = computers and tablets on their side, narrow = phones):
       from, to      the stretch of black wall it fills, measured from the back corner toward the door.
                     LIFE starts 6.63 m from the corner on wide screens (7.14 m on phones), so "to" stops 0.28 m
                     short of it: the same gap the Gallery leaves between LIFE and its photos.
       bottom, top   how high its bottom and top edges are off the floor. The room is 7.2 m tall and the ivy hangs
                     about 1.5 m down from the top; the longest strands drape over the poster's top edge.
     The poster is made as big as fits inside that box without stretching (it keeps its 864 : 1102 shape), and is
     centred in it. To make it bigger or smaller, move these edges.
     (It fills the full height under the ivy. It can't also fill the full length: the wall is wider than the poster's
     shape allows, so it sits toward LIFE, the end you see best from the door; the far corner is hidden by the bulbs.) */
  WALL_POSTER: {
    img:   "post/poster-best-storyteller.webp",        // computers (3456 x 4408) (now only for the backup 3D version)
    phone: "post/poster-best-storyteller-phone.webp",  // phones (1728 x 2204), and the popup up close on every screen
    // (Oct 31) what the wall itself shows: 864 x 1102, made from the big one by tools/shrink-poster.py. The wall is only
    // ever seen at ~160 pixels a metre, so this is all it needs: 49 KB instead of 267 KB, and no 15-megapixel unpacking.
    wall:  "post/poster-best-storyteller-wall.webp",
    closeup: "post/poster-best-storyteller-phone.webp",
    shape: 864 / 1102,                                  // width : height
    alt: "A towering poster: #1 NOT RISING Magazine, Best Storyteller. New book by Joel Lymneos, Poetic Drift.",
    wide:   { from: 1.9, to: 6.35, bottom: 0.25, top: 5.8 },
    narrow: { from: 2.4, to: 6.86, bottom: 0.25, top: 5.8 }
  }
};

