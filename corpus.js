/* Schwa — estimation de difficulté, accents, sources d'écoute */

/* Mots les plus fréquents de l'anglais. Sert uniquement à estimer la charge
   lexicale d'un segment : la proportion de mots hors liste est un bon proxy. */
const FREQ = new Set(("the be to of and a in that have i it for not on with he as you do at this " +
"but his by from they we say her she or an will my one all would there their what so up out if about who get " +
"which go me when make can like time no just him know take people into year your good some could them see other " +
"than then now look only come its over think also back after use two how our work first well way even new want " +
"because any these give day most us is are was were been has had did does am being having doing said says went " +
"gone got gets getting made making came coming took taken taking saw seen seeing knew known knowing thought " +
"thinking told telling felt feeling found finding left leaving put putting kept keeping let letting began " +
"beginning seemed seems help talk turn start might show hear play run move live believe hold bring happen write " +
"provide sit stand lose pay meet include continue set learn change lead understand watch follow stop create " +
"speak read allow add spend grow open walk win offer remember love consider appear buy wait serve die send " +
"expect build stay fall cut reach remain suggest raise pass sell require report decide pull man woman child " +
"world life hand part eye place week case point company number group problem fact money month lot right study " +
"book job word business issue side kind head house service friend father mother power hour game line end member " +
"law car city community name team minute idea kid body information parent face others level office door " +
"health person art history party result morning reason research girl guy moment air teacher force " +
"education foot boy age policy process music market sense nation plan college interest experience effect " +
"class control care field development role effort rate heart voice wife mind price decision son hope view " +
"relationship town road arm difference video sound approach cost couple situation street area season " +
"film movie series episode story night day today tomorrow yesterday phone email message coffee food water " +
"new first last long great little own old big high different small large next early young important " +
"few public bad same able best better sure free true whole real nice full easy hard late strong special clear " +
"recent certain personal red difficult available likely short single medium common poor natural significant " +
"similar hot central happy serious ready simple physical general environmental financial blue green black white " +
"not no yes very too just even still only really more most much many well always never often sometimes " +
"here there where when why how again ever already almost enough perhaps maybe quite rather pretty far away " +
"down off around through between before after during while since until against " +
"you he she it we they me him her us them my your his its our their mine yours theirs myself yourself " +
"himself herself itself ourselves themselves who whom whose " +
"an or but so if than as because although though unless whether whereas " +
"am done will shall may must ought need dare used going gonna wanna gotta lets okay yeah yep nope hey hello " +
"thanks thank please sorry cool wrong false actually basically " +
"literally honestly obviously probably definitely absolutely exactly totally completely seriously").split(/\s+/));

/* Mots-outils : ce sont eux que l'anglais écrase entre les temps forts.
   Leur densité prédit assez bien la difficulté de décodage. */
const FUNCTION_WORDS = new Set(("a an the to of and or but in on at for from with as that this it he she they them him her his " +
"its was were is are am be been have has had do does did can could would should will shall may might must " +
"you your i my me we us our there here than then so if when what which who up out about into over just not " +
"no all some any one get got going gonna gotta wanna hafta by too").split(/\s+/));

/* ── Accents ─────────────────────────────────────────────────────────────── */

const ACCENTS = [
  { code: "en-US", label: "Américain",     flag: "US", note: "Le flap T règne : « water » sonne « wader »." },
  { code: "en-GB", label: "Britannique",   flag: "GB", note: "T net ou coup de glotte, R final muet." },
  { code: "en-AU", label: "Australien",    flag: "AU", note: "Voyelles très déplacées, débit rapide." },
  { code: "en-IE", label: "Irlandais",     flag: "IE", note: "Mélodie montante, R bien prononcé." },
  { code: "en-IN", label: "Indien",        flag: "IN", note: "Rythme plus syllabique — trompeur quand on vient du français." },
  { code: "en-ZA", label: "Sud-africain",  flag: "ZA", note: "Voyelles courtes et tendues." },
  { code: "en-NZ", label: "Néo-zélandais", flag: "NZ", note: "Le i se réduit presque à un schwa." },
  { code: "en-CA", label: "Canadien",      flag: "CA", note: "Proche de l'américain, diphtongues relevées." }
];

/* ── Sources d'écoute ───────────────────────────────────────────────────────
   Des liens, pas du contenu embarqué : tu importes ce que tu veux. */

const SOURCES = [
  { name: "YouTube", tag: "Ta source principale",
    what: "Films, podcasts, interviews, vlogs — tout, et tous les accents.",
    how: "Sous la vidéo : « Plus » → « Afficher la transcription ». Tu la copies, tu la colles dans Schwa. Avec Premium, la vidéo continue en Picture-in-Picture pendant que tu tapes.",
    url: "https://www.youtube.com" },
  { name: "VOA Learning English", tag: "Pour démarrer",
    what: "Actualité lue par des voix américaines, en version ralentie puis normale.",
    how: "Chaque article a son MP3 et sa transcription. Production du gouvernement américain, donc domaine public : téléchargement libre, audio inclus.",
    url: "https://learningenglish.voanews.com" },
  { name: "LibriVox", tag: "Variété d'accents",
    what: "Livres audio lus par des bénévoles du monde entier.",
    how: "MP3 téléchargeables, texte correspondant sur Project Gutenberg. Domaine public.",
    url: "https://librivox.org" },
  { name: "TED", tag: "Niveau C1",
    what: "Conférences en anglais soutenu, locuteurs natifs et non natifs.",
    how: "Transcription interactive sous chaque vidéo.",
    url: "https://www.ted.com/talks" },
  { name: "Mozilla Common Voice", tag: "Accents extrêmes",
    what: "Des milliers de phrases lues par des locuteurs de partout.",
    how: "Jeux de données téléchargeables avec transcription, sous licence CC0.",
    url: "https://commonvoice.mozilla.org/en/datasets" },
  { name: "Les sous-titres de tes séries", tag: "Le plus efficace",
    what: "Tu connais déjà l'histoire : ton cerveau peut se consacrer entièrement au son.",
    how: "Récupère le .srt de l'épisode, et le fichier audio si tu l'as. Sinon transcription seule, et tu lis l'épisode sur ton lecteur habituel.",
    url: "" }
];

/* ── Prompt d'enrichissement ───────────────────────────────────────────────── */

AI.enrich = function (segments) {
  return `For each English sentence below, describe how it sounds in fast natural speech, for a French-speaking learner.

Sentences:
${segments.map((s, i) => (i + 1) + ". " + s.full).join("\n")}

Reply with only a JSON array of exactly ${segments.length} objects, in the same order, no other text:
{"red": "respelled the way it actually sounds, e.g. whaddaya gonna do aboudit",
 "ipa": "broad IPA with primary stress marks",
 "fr": "natural French translation",
 "tags": ["schwa"|"gonna"|"linking"|"flap"|"elision"|"assim"|"hdrop"|"rhythm", ...]}`;
};
