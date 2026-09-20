/* Schwa — curriculum.
   full = ce qui est écrit · red = ce qu'on entend réellement · ipa = transcription large (anglais américain)
   fr   = sens · tags = patterns de parole connectée en jeu */

const LESSONS = [
  {
    id: "schwa",
    title: "Le schwa et les formes faibles",
    sub: "Pourquoi « to », « of », « and » disparaissent",
    why: `L'anglais a deux vitesses : les mots porteurs de sens (verbes, noms, adjectifs) sont prononcés en entier, tout le reste est écrasé sur une seule voyelle neutre, le schwa /ə/. « to » devient /tə/, « of » devient /ə/, « and » devient /ən/, « are » devient /ɚ/. Le français ne réduit jamais ses voyelles : c'est exactement pour ça que tu entends une bouillie là où un anglophone entend des mots.

Le cas le plus traître : « can » /kən/ est réduit, « can't » /kænt/ est accentué. Si tu entends une voyelle claire, c'est une négation. Si tu entends du flou, c'est l'affirmative. Beaucoup de francophones comprennent l'inverse de ce qui est dit.`,
    examples: [
      { full: "A cup of tea.", red: "a cuppə tea", ipa: "ə ˈkʌp ə ˈtiː", fr: "Une tasse de thé." },
      { full: "I can do it tomorrow.", red: "I kən do it tomorrow", ipa: "aɪ kən ˈduː ɪt təˈmɑːroʊ", fr: "Je peux le faire demain." },
      { full: "I can't do it tomorrow.", red: "I KÆNT do it tomorrow", ipa: "aɪ ˈkænt ˈduː ɪt təˈmɑːroʊ", fr: "Je ne peux pas le faire demain." },
      { full: "Fish and chips.", red: "fish ən chips", ipa: "ˈfɪʃ ən ˈtʃɪps", fr: "Poisson-frites." },
      { full: "I'll send it to you.", red: "I'll sendit tə ya", ipa: "aɪl ˈsend ɪt tə jə", fr: "Je te l'envoie." },
      { full: "What are you looking for?", red: "whadər ya lookin' fər", ipa: "ˈwʌdɚ jə ˈlʊkɪn fɚ", fr: "Tu cherches quoi ?" }
    ],
    drill: [
      { full: "There were a lot of them.", red: "there wər ə lotta them", ipa: "ðɚ wɚ ə ˈlɑːɾə ðəm", fr: "Il y en avait beaucoup." },
      { full: "She was supposed to call.", red: "she wəz sposta call", ipa: "ʃi wəz spoʊstə ˈkɔːl", fr: "Elle était censée appeler." },
      { full: "I can hear you.", red: "I kən hear ya", ipa: "aɪ kən ˈhɪɚ jə", fr: "Je t'entends." },
      { full: "It's for the best.", red: "it's fər the best", ipa: "ɪts fɚ ðə ˈbest", fr: "C'est mieux comme ça." },
      { full: "He's been at it for hours.", red: "he's been adit fər ahrs", ipa: "hiz bɪn ˈæɾ ɪt fɚ ˈaʊɚz", fr: "Ça fait des heures qu'il est dessus." }
    ]
  },
  {
    id: "gonna",
    title: "Gonna, wanna, gotta",
    sub: "Les contractions que personne ne t'a apprises",
    why: `Ce ne sont pas des fautes ni de l'argot : tout anglophone natif dit « gonna » dans une conversation normale, y compris à la BBC. « going to », « want to », « got to » ne sont quasiment jamais prononcés en entier à l'oral.

Tu dois les reconnaître à l'oreille, pas les traduire mot à mot. Note que « gonna » ne marche que pour le futur : « I'm going to Paris » (déplacement) reste « going to », jamais « gonna ».`,
    examples: [
      { full: "I'm going to call you back.", red: "I'm gonna call ya back", ipa: "aɪm ˈɡʌnə ˈkɔːl jə ˈbæk", fr: "Je te rappelle." },
      { full: "Do you want to grab a coffee?", red: "ya wanna grab a coffee", ipa: "jə ˈwɑːnə ˈɡɹæb ə ˈkɔːfi", fr: "Tu veux prendre un café ?" },
      { full: "I've got to go.", red: "I gotta go", ipa: "aɪ ˈɡɑːɾə ˈɡoʊ", fr: "Je dois y aller." },
      { full: "It's kind of weird.", red: "it's kinda weird", ipa: "ɪts ˈkaɪndə ˈwɪɚd", fr: "C'est un peu bizarre." },
      { full: "Let me know.", red: "lemme know", ipa: "ˈlemi ˈnoʊ", fr: "Tiens-moi au courant." },
      { full: "I don't know.", red: "I dunno", ipa: "aɪ dəˈnoʊ", fr: "Je sais pas." },
      { full: "Get out of here.", red: "gedoudda here", ipa: "ɡeɾ ˈaʊɾə hɪɚ", fr: "Dégage. / Arrête, c'est pas vrai." }
    ],
    drill: [
      { full: "What are you going to do about it?", red: "whaddaya gonna do aboudit", ipa: "ˈwʌdəjə ˈɡʌnə ˈduː əˈbaʊɾ ɪt", fr: "Tu vas faire quoi ?" },
      { full: "I want to show you something.", red: "I wanna show ya somethin'", ipa: "aɪ ˈwɑːnə ˈʃoʊ jə ˈsʌmθɪn", fr: "Je veux te montrer un truc." },
      { full: "You've got to be kidding me.", red: "you godda be kiddin' me", ipa: "jə ˈɡɑːɾə bi ˈkɪdɪn mi", fr: "Tu te fous de moi." },
      { full: "Give me a second.", red: "gimme a second", ipa: "ˈɡɪmi ə ˈsekənd", fr: "Donne-moi une seconde." },
      { full: "It's sort of a long story.", red: "it's sorta long story", ipa: "ɪts ˈsɔːɹɾə ə ˈlɔːŋ ˈstɔːɹi", fr: "C'est un peu une longue histoire." }
    ]
  },
  {
    id: "linking",
    title: "La liaison",
    sub: "Pourquoi les mots se collent les uns aux autres",
    why: `Quand un mot finit par une consonne et que le suivant commence par une voyelle, la consonne saute sur le mot d'après. « Turn it off » devient un seul bloc : « tur-ni-toff ». Exactement comme la liaison française dans « les‿amis », sauf que l'anglais le fait partout, tout le temps.

Résultat : les frontières entre les mots ne sont pas là où tu les attends. Ton oreille cherche « it », elle entend « nit ». C'est la première cause du sentiment de « flot ininterrompu ».`,
    examples: [
      { full: "Turn it off.", red: "tur-ni-toff", ipa: "ˈtɝː nɪ ˈtɔːf", fr: "Éteins ça." },
      { full: "An hour ago.", red: "a-naw-ra-go", ipa: "ə ˈnaʊ ɹ‿əˈɡoʊ", fr: "Il y a une heure." },
      { full: "Pick it up.", red: "pi-ki-dup", ipa: "ˈpɪ kɪ ˈdʌp", fr: "Ramasse-le. / Décroche." },
      { full: "Take it easy.", red: "tay-ki-teasy", ipa: "ˈteɪ kɪ ˈtiː zi", fr: "Détends-toi." },
      { full: "Come on in.", red: "cuh-maw-nin", ipa: "kə ˈmɑː nɪn", fr: "Entre donc." },
      { full: "Is it all right?", red: "i-zi-tall-right", ipa: "ˈɪ zɪ ˈtɔːl ˈɹaɪt", fr: "Ça va ?" }
    ],
    drill: [
      { full: "Hang on a minute.", red: "hay-ngo-na-minute", ipa: "ˈhæ ŋɑː nə ˈmɪnɪt", fr: "Attends une minute." },
      { full: "I ran out of time.", red: "I ra-nau-dov time", ipa: "aɪ ˈɹæ ˈnaʊ ɾəv ˈtaɪm", fr: "Je n'ai pas eu le temps." },
      { full: "Give it another shot.", red: "gi-vi-ta-nother shot", ipa: "ˈɡɪ vɪ ɾəˈnʌðɚ ˈʃɑːt", fr: "Retente le coup." },
      { full: "Check it out.", red: "che-ki-dout", ipa: "ˈtʃe kɪ ˈdaʊt", fr: "Regarde ça." },
      { full: "Put it on the table.", red: "pu-di-don the table", ipa: "ˈpʊ ɾɪ ˈdɑːn ðə ˈteɪbl̩", fr: "Pose-le sur la table." }
    ]
  },
  {
    id: "flap",
    title: "Le T qui devient D",
    sub: "water → « wader »",
    why: `En anglais américain, un T (ou un D) coincé entre deux voyelles, et non accentué, devient un petit coup de langue rapide qui sonne comme un D : le « flap » /ɾ/. « water » → « wader », « better » → « bedder », « a lot of it » → « a lodda vit ».

C'est massif dans les séries américaines. Si tu attends un /t/ net, tu ne reconnais pas des mots que tu connais parfaitement à l'écrit. Attention : en anglais britannique le T reste net (ou devient un coup de glotte : « wa'er »).`,
    examples: [
      { full: "Can I get a glass of water?", red: "kən I geda glassa wader", ipa: "kən aɪ ˈɡeɾ ə ˈɡlæs ə ˈwɑːɾɚ", fr: "Je peux avoir un verre d'eau ?" },
      { full: "It's a little bit of a problem.", red: "it's a liddle bidda problem", ipa: "ɪts ə ˈlɪɾl̩ ˈbɪɾ ə ə ˈpɹɑːbləm", fr: "C'est un petit peu problématique." },
      { full: "Better late than never.", red: "bedder late thən never", ipa: "ˈbeɾɚ ˈleɪt ðən ˈnevɚ", fr: "Mieux vaut tard que jamais." },
      { full: "I thought about it.", red: "I thoughda-boudit", ipa: "aɪ ˈθɔːɾ əˈbaʊɾ ɪt", fr: "J'y ai pensé." },
      { full: "What if I told you?", red: "wuddifi toldja", ipa: "ˈwʌɾ ɪf aɪ ˈtoʊldʒə", fr: "Et si je te disais ?" },
      { full: "Whatever it takes.", red: "whadever it takes", ipa: "wʌˈdevɚ ɪt ˈteɪks", fr: "Quoi qu'il en coûte." }
    ],
    drill: [
      { full: "Put it in the bottom of the bag.", red: "pudidin the boddom of the bag", ipa: "ˈpʊɾ ɪɾ ɪn ðə ˈbɑːɾəm ə ðə ˈbæɡ", fr: "Mets-le au fond du sac." },
      { full: "I'd rather not talk about it.", red: "I'd radder not talk aboudit", ipa: "aɪd ˈɹæðɚ ˈnɑːt ˈtɔːk əˈbaʊɾ ɪt", fr: "Je préfère ne pas en parler." },
      { full: "That's a pretty big deal.", red: "that's a priddy big deal", ipa: "ðæts ə ˈpɹɪɾi ˈbɪɡ ˈdiːl", fr: "C'est assez important." },
      { full: "Let it go.", red: "leddit go", ipa: "ˈleɾ ɪt ˈɡoʊ", fr: "Laisse tomber." },
      { full: "Thirty or forty of them.", red: "thirdy or fordy of 'em", ipa: "ˈθɝːɾi ɚ ˈfɔːɹɾi ə ðəm", fr: "Une trentaine ou une quarantaine." }
    ]
  },
  {
    id: "elision",
    title: "Les consonnes qui tombent",
    sub: "next day → « nexday »",
    why: `Quand trois consonnes se bousculent, celle du milieu saute — presque toujours un /t/ ou un /d/. « next day » → « nexday », « must be » → « muss be », « last night » → « lasnight », « friendship » → « frenship ».

Le piège : le -ed du passé et le -s du pluriel disparaissent à l'oreille. « He asked me » sonne « he ass me ». Tu n'entends pas le temps du verbe, tu dois le déduire du contexte. C'est normal, les natifs font pareil.`,
    examples: [
      { full: "I'll see you next day.", red: "I'll see ya nexday", ipa: "aɪl ˈsiː jə ˈneks ˈdeɪ", fr: "On se voit le lendemain." },
      { full: "It must be broken.", red: "it muss be broken", ipa: "ɪt ˈmʌs bi ˈbɹoʊkən", fr: "Ça doit être cassé." },
      { full: "I saw him last night.", red: "I saw im lasnight", ipa: "aɪ ˈsɔː ɪm ˈlæs ˈnaɪt", fr: "Je l'ai vu hier soir." },
      { full: "He asked me first.", red: "he ass me first", ipa: "hi ˈæs mi ˈfɝːst", fr: "Il m'a demandé en premier." },
      { full: "Do you want a sandwich?", red: "ya wanna samwich", ipa: "jə ˈwɑːnə ˈsæmwɪtʃ", fr: "Tu veux un sandwich ?" },
      { full: "I don't think so.", red: "I don' think so", ipa: "aɪ ˈdoʊn ˈθɪŋk soʊ", fr: "Je ne crois pas." }
    ],
    drill: [
      { full: "That's the best thing about it.", red: "that's the bess thing aboudit", ipa: "ðæts ðə ˈbes ˈθɪŋ əˈbaʊɾ ɪt", fr: "C'est ce qu'il y a de mieux là-dedans." },
      { full: "We finished the first part.", red: "we finish the firs' part", ipa: "wi ˈfɪnɪʃ ðə ˈfɝːs ˈpɑːɹt", fr: "On a fini la première partie." },
      { full: "I couldn't find the address.", red: "I coun't find the address", ipa: "aɪ ˈkʊnt ˈfaɪn ði əˈdɹes", fr: "Je n'ai pas trouvé l'adresse." },
      { full: "He looked tired.", red: "he look tired", ipa: "hi ˈlʊk ˈtaɪɚd", fr: "Il avait l'air fatigué." },
      { full: "Hold on, don't hang up.", red: "hol' on, don' hang up", ipa: "ˈhoʊl ˈɑːn ˈdoʊn ˈhæŋ ˈʌp", fr: "Attends, ne raccroche pas." }
    ]
  },
  {
    id: "assim",
    title: "did you → « didja »",
    sub: "Quand deux sons fusionnent en un troisième",
    why: `Un /d/ ou un /t/ suivi de « you » (/j/) fusionne en /dʒ/ ou /tʃ/. « did you » → « didja », « don't you » → « doncha », « would you » → « wouldja », « meet you » → « meetcha », « got you » → « gotcha ».

Le son produit n'existe dans aucun des deux mots d'origine. C'est pour ça que « Whaddaya want? » est illisible même quand tu connais chaque mot séparément : le son que tu cherches n'est simplement plus là.`,
    examples: [
      { full: "Did you see that?", red: "didja see that", ipa: "ˈdɪdʒə ˈsiː ðæt", fr: "T'as vu ça ?" },
      { full: "Don't you think so?", red: "doncha think so", ipa: "ˈdoʊntʃə ˈθɪŋk soʊ", fr: "Tu ne trouves pas ?" },
      { full: "Would you mind?", red: "wudja mind", ipa: "ˈwʊdʒə ˈmaɪnd", fr: "Ça te dérangerait ?" },
      { full: "Nice to meet you.", red: "nice tə meetcha", ipa: "ˈnaɪs tə ˈmiːtʃə", fr: "Enchanté." },
      { full: "I've got you.", red: "I gotcha", ipa: "aɪ ˈɡɑːtʃə", fr: "Je te tiens. / J'ai compris." },
      { full: "What do you want?", red: "whaddaya want", ipa: "ˈwʌdəjə ˈwɑːnt", fr: "Tu veux quoi ?" }
    ],
    drill: [
      { full: "Did you get what you needed?", red: "didja get whatcha needed", ipa: "ˈdɪdʒə ˈɡet ˈwʌtʃə ˈniːɾɪd", fr: "Tu as eu ce qu'il te fallait ?" },
      { full: "Aren't you coming with us?", red: "arncha comin' with us", ipa: "ˈɑːɹntʃə ˈkʌmɪn wɪθ ˈʌs", fr: "Tu ne viens pas avec nous ?" },
      { full: "I'll let you know.", red: "I'll letcha know", ipa: "aɪl ˈletʃə ˈnoʊ", fr: "Je te tiens au courant." },
      { full: "Could you help me out?", red: "cudja help me out", ipa: "ˈkʊdʒə ˈhelp mi ˈaʊt", fr: "Tu pourrais me donner un coup de main ?" },
      { full: "What did you tell them?", red: "whadidja tell 'em", ipa: "ˈwʌ dɪdʒə ˈtel əm", fr: "Tu leur as dit quoi ?" }
    ]
  },
  {
    id: "hdrop",
    title: "Les pronoms sans H",
    sub: "tell him → « tellim »",
    why: `À l'intérieur d'une phrase, le H de « he », « him », « her », « his », « have », « had » disparaît. « tell him » → « tellim », « ask her » → « asker », « did he » → « diddy », « is he » → « izzy ».

Conséquence directe : le pronom se colle au verbe et devient une syllabe de plus, invisible. Tu entends « asker » et tu cherches un verbe « to asker ». Il n'existe pas. Le H ne revient qu'en début de phrase ou sur un mot accentué.`,
    examples: [
      { full: "Tell him I called.", red: "tellim I called", ipa: "ˈtel ɪm aɪ ˈkɔːld", fr: "Dis-lui que j'ai appelé." },
      { full: "Ask her about it.", red: "asker aboudit", ipa: "ˈæs kɚ əˈbaʊɾ ɪt", fr: "Demande-lui." },
      { full: "Did he say anything?", red: "diddy say anything", ipa: "ˈdɪ di ˈseɪ ˈeniθɪŋ", fr: "Il a dit quelque chose ?" },
      { full: "Is he still here?", red: "izzy still here", ipa: "ˈɪ zi ˈstɪl ˈhɪɚ", fr: "Il est encore là ?" },
      { full: "I gave her his number.", red: "I gaver iz number", ipa: "aɪ ˈɡeɪ vɚ ɪz ˈnʌmbɚ", fr: "Je lui ai donné son numéro." },
      { full: "What has he done?", red: "whadazzy done", ipa: "ˈwʌɾ əz i ˈdʌn", fr: "Qu'est-ce qu'il a fait ?" }
    ],
    drill: [
      { full: "Could you give him a call?", red: "cudja givim a call", ipa: "ˈkʊdʒə ˈɡɪv ɪm ə ˈkɔːl", fr: "Tu pourrais l'appeler ?" },
      { full: "I told her not to worry.", red: "I tolder not tə worry", ipa: "aɪ ˈtoʊl dɚ ˈnɑːt tə ˈwɝːi", fr: "Je lui ai dit de ne pas s'inquiéter." },
      { full: "Where has he been?", red: "where zee been", ipa: "ˈwer əz i ˈbɪn", fr: "Où est-ce qu'il était ?" },
      { full: "Let her finish.", red: "ledder finish", ipa: "ˈleɾ ɚ ˈfɪnɪʃ", fr: "Laisse-la finir." },
      { full: "I saw him with her yesterday.", red: "I sawim with er yesterday", ipa: "aɪ ˈsɔː ɪm wɪð ɚ ˈjestɚdeɪ", fr: "Je l'ai vu avec elle hier." }
    ]
  },
  {
    id: "rhythm",
    title: "Le rythme, pas les mots",
    sub: "La différence structurelle avec le français",
    why: `C'est le pattern le plus profond, et celui qui explique tous les autres. Le français donne à peu près la même durée à chaque syllabe. L'anglais donne la même durée à chaque **syllabe accentuée**, et écrase tout ce qu'il y a entre elles pour tenir le tempo.

Écoute ces trois phrases : elles durent le même temps, parce qu'elles ont toutes les trois trois temps forts.
• CATS eat FISH.
• The CATS have EAten the FISH.
• The CATS would have EAten the FISH.

Les mots ajoutés ne rallongent pas la phrase, ils se font compresser. « would have » devient « wuh-dəv » en un dixième de seconde. Tu ne rateras jamais un mot accentué ; tu rateras systématiquement ce qu'il y a entre. Arrête d'essayer d'entendre chaque mot — accroche-toi aux temps forts et reconstruis le reste.`,
    examples: [
      { full: "Cats eat fish.", red: "CATS · EAT · FISH", ipa: "ˈkæts ˈiːt ˈfɪʃ", fr: "Les chats mangent du poisson." },
      { full: "The cats have eaten the fish.", red: "the CATS əv EAten the FISH", ipa: "ðə ˈkæts əv ˈiːtn̩ ðə ˈfɪʃ", fr: "Les chats ont mangé le poisson." },
      { full: "The cats would have eaten the fish.", red: "the CATS wuhdəv EAten the FISH", ipa: "ðə ˈkæts wʊɾəv ˈiːtn̩ ðə ˈfɪʃ", fr: "Les chats auraient mangé le poisson." },
      { full: "I would have told you about it.", red: "I WOODəv TOLDja əBOUDit", ipa: "aɪ ˈwʊɾəv ˈtoʊldʒə əˈbaʊɾ ɪt", fr: "Je t'en aurais parlé." },
      { full: "She could have been anywhere.", red: "she COODəv bin ENYwhere", ipa: "ʃi ˈkʊɾəv bɪn ˈeniwer", fr: "Elle aurait pu être n'importe où." }
    ],
    drill: [
      { full: "He should have called me back.", red: "he SHOODəv CALLED me BACK", ipa: "hi ˈʃʊɾəv ˈkɔːld mi ˈbæk", fr: "Il aurait dû me rappeler." },
      { full: "They must have left already.", red: "they MUSSəv LEFT awREDy", ipa: "ðeɪ ˈmʌsəv ˈleft ɔlˈɹedi", fr: "Ils ont dû partir déjà." },
      { full: "It might have been a mistake.", red: "it MIGHDəv bin a misTAKE", ipa: "ɪt ˈmaɪɾəv bɪn ə mɪˈsteɪk", fr: "C'était peut-être une erreur." },
      { full: "You didn't have to do that.", red: "you DIDn' hafta DO that", ipa: "jə ˈdɪdn̩ ˈhæftə ˈduː ðæt", fr: "Tu n'étais pas obligé." },
      { full: "I'd have said something.", red: "I'Dəv SED somethin'", ipa: "aɪɾəv ˈsed ˈsʌmθɪn", fr: "J'aurais dit quelque chose." }
    ]
  }
];

/* ── Packs de dictée de départ ─────────────────────────────────────────────── */

const PACKS = [
  {
    id: "daily",
    title: "Conversation de tous les jours",
    sub: "Ce qui sort vraiment de la bouche des gens",
    level: "B1–B2",
    segments: [
      { full: "Hang on, let me check my calendar.", red: "hangon, lemme check my calendar", ipa: "ˈhæŋ ˈɑːn ˈlemi ˈtʃek maɪ ˈkælɪndɚ", fr: "Attends, je regarde mon agenda.", tags: ["linking", "gonna"] },
      { full: "I was going to call you, but I ran out of time.", red: "I wəz gonna call ya, bud I ranoudda time", ipa: "aɪ wəz ˈɡʌnə ˈkɔːl jə bəɾ aɪ ˈɹæn ˈaʊɾə ˈtaɪm", fr: "J'allais t'appeler, mais je n'ai pas eu le temps.", tags: ["gonna", "flap", "schwa"] },
      { full: "Do you want me to pick it up on the way?", red: "d'ya want me tə pikidup on the way", ipa: "djə ˈwɑːnt mi tə ˈpɪ kɪ ˈdʌp ɑːn ðə ˈweɪ", fr: "Tu veux que je le prenne en chemin ?", tags: ["linking", "schwa"] },
      { full: "It's not a big deal, don't worry about it.", red: "it's nod a big deal, don' worry aboudit", ipa: "ɪts ˈnɑːɾ ə ˈbɪɡ ˈdiːl ˈdoʊn ˈwɝːi əˈbaʊɾ ɪt", fr: "C'est pas grave, t'inquiète.", tags: ["flap", "elision"] },
      { full: "I'll let you know as soon as I hear back.", red: "I'll letcha know əz soon əz I hear back", ipa: "aɪl ˈletʃə ˈnoʊ əz ˈsuːn əz aɪ ˈhɪɚ ˈbæk", fr: "Je te tiens au courant dès que j'ai une réponse.", tags: ["assim", "schwa"] },
      { full: "What have you been up to lately?", red: "whadəv ya bin upta lately", ipa: "ˈwʌɾ əv jə bɪn ˈʌp tə ˈleɪtli", fr: "Tu deviens quoi en ce moment ?", tags: ["flap", "schwa", "rhythm"] },
      { full: "Could you send it over when you get a chance?", red: "cudja sendidover when ya geda chance", ipa: "ˈkʊdʒə ˈsen ɾɪ ˈdoʊvɚ wen jə ˈɡeɾ ə ˈtʃæns", fr: "Tu peux me l'envoyer quand tu as un moment ?", tags: ["assim", "linking", "flap"] },
      { full: "I don't think she's coming.", red: "I don' think she's comin'", ipa: "aɪ ˈdoʊn ˈθɪŋk ʃiz ˈkʌmɪn", fr: "Je crois qu'elle ne vient pas.", tags: ["elision"] },
      { full: "That's what I was trying to tell you.", red: "that's whad I wəz tryna tellya", ipa: "ðæts ˈwʌɾ aɪ wəz ˈtɹaɪnə ˈtel jə", fr: "C'est ce que j'essayais de te dire.", tags: ["flap", "gonna", "schwa"] },
      { full: "Give me a couple of minutes.", red: "gimme a coupla minutes", ipa: "ˈɡɪmi ə ˈkʌpl̩ ə ˈmɪnɪts", fr: "Donne-moi deux minutes.", tags: ["gonna", "schwa"] },
      { full: "I should have asked him first.", red: "I shoodəv ass-tim first", ipa: "aɪ ˈʃʊɾəv ˈæs tɪm ˈfɝːst", fr: "J'aurais dû lui demander d'abord.", tags: ["rhythm", "hdrop", "elision"] },
      { full: "Is there anything else you need?", red: "izzer anything else ya need", ipa: "ˈɪz ɚ ˈeniθɪŋ ˈels jə ˈniːd", fr: "Il te faut autre chose ?", tags: ["linking", "schwa"] },
      { full: "He said he'd be here at eight.", red: "he said he'd be here ad eight", ipa: "hi ˈsed hid bi ˈhɪɚ əɾ ˈeɪt", fr: "Il a dit qu'il serait là à huit heures.", tags: ["flap", "schwa"] },
      { full: "I've got to run, talk to you later.", red: "I gotta run, talk to ya later", ipa: "aɪ ˈɡɑːɾə ˈɹʌn ˈtɔːk tə jə ˈleɪɾɚ", fr: "Je dois filer, à plus.", tags: ["gonna", "flap"] },
      { full: "Would you mind waiting a minute?", red: "wudja mind waiding a minute", ipa: "ˈwʊdʒə ˈmaɪnd ˈweɪɾɪŋ ə ˈmɪnɪt", fr: "Ça te dérange d'attendre une minute ?", tags: ["assim", "flap"] },
      { full: "It turned out better than I expected.", red: "it turnedout bedder thən I expected", ipa: "ɪt ˈtɝːnd ˈaʊt ˈbeɾɚ ðən aɪ ɪkˈspektɪd", fr: "Ça s'est mieux passé que prévu.", tags: ["linking", "flap", "schwa"] }
    ]
  },
  {
    id: "series",
    title: "Répliques de séries",
    sub: "Débit rapide, registre familier",
    level: "B2",
    segments: [
      { full: "You've got to be kidding me right now.", red: "you godda be kiddin' me right now", ipa: "jə ˈɡɑːɾə bi ˈkɪdɪn mi ˈɹaɪt ˈnaʊ", fr: "Tu te fous de moi, là.", tags: ["gonna", "flap"] },
      { full: "What's that supposed to mean?", red: "what's that sposta mean", ipa: "wʌts ðæt spoʊstə ˈmiːn", fr: "Qu'est-ce que c'est censé vouloir dire ?", tags: ["schwa", "elision"] },
      { full: "I didn't sign up for any of this.", red: "I didn' sign up fer enny of this", ipa: "aɪ ˈdɪdn̩ ˈsaɪn ˈʌp fɚ ˈeni ə ðɪs", fr: "Je n'ai pas signé pour ça.", tags: ["elision", "schwa"] },
      { full: "Don't you dare walk out on me.", red: "doncha dare walkoudon me", ipa: "ˈdoʊntʃə ˈder ˈwɔːk ˈaʊɾ ɑːn mi", fr: "N'ose même pas me laisser en plan.", tags: ["assim", "flap", "linking"] },
      { full: "We're going to have to do this the hard way.", red: "we're gonna hafta do this the hard way", ipa: "wɚ ˈɡʌnə ˈhæftə ˈduː ðɪs ðə ˈhɑːɹd ˈweɪ", fr: "On va devoir le faire à la dure.", tags: ["gonna", "rhythm"] },
      { full: "How long have you known about it?", red: "how long əv ya known aboudit", ipa: "ˈhaʊ ˈlɔːŋ əv jə ˈnoʊn əˈbaʊɾ ɪt", fr: "Ça fait combien de temps que tu le sais ?", tags: ["schwa", "flap"] },
      { full: "I told her it wasn't a good idea.", red: "I tolder it wuzn' a good idea", ipa: "aɪ ˈtoʊl dɚ ɪt ˈwʌzn̩ ə ˈɡʊd aɪˈdiːə", fr: "Je lui ai dit que ce n'était pas une bonne idée.", tags: ["hdrop", "elision"] },
      { full: "Get out of my house.", red: "gedoudda my house", ipa: "ˈɡeɾ ˈaʊɾ ə maɪ ˈhaʊs", fr: "Sors de chez moi.", tags: ["flap", "gonna"] },
      { full: "You had one job.", red: "you had ONE JOB", ipa: "jə həd ˈwʌn ˈdʒɑːb", fr: "Tu avais une seule chose à faire.", tags: ["rhythm"] },
      { full: "That's not what I meant and you know it.", red: "that's nod whad I ment an' ya know it", ipa: "ðæts ˈnɑːɾ ˈwʌɾ aɪ ˈment ən jə ˈnoʊ ɪt", fr: "Ce n'est pas ce que je voulais dire et tu le sais.", tags: ["flap", "schwa"] },
      { full: "Where the hell have you been?", red: "where the hell əv ya bin", ipa: "ˈwer ðə ˈhel əv jə ˈbɪn", fr: "Où est-ce que t'étais passé ?", tags: ["schwa"] },
      { full: "I need you to trust me on this one.", red: "I needja tə trust me on this one", ipa: "aɪ ˈniːdʒə tə ˈtɹʌst mi ɑːn ˈðɪs ˈwʌn", fr: "J'ai besoin que tu me fasses confiance là-dessus.", tags: ["assim", "schwa"] },
      { full: "It could have been a lot worse.", red: "it coodəv bin a lot worse", ipa: "ɪt ˈkʊɾəv bɪn ə ˈlɑːt ˈwɝːs", fr: "Ça aurait pu être bien pire.", tags: ["rhythm", "flap"] },
      { full: "Did he say where he was going?", red: "diddy say where he wəz goin'", ipa: "ˈdɪ di ˈseɪ ˈwer i wəz ˈɡoʊɪn", fr: "Il a dit où il allait ?", tags: ["hdrop", "schwa"] },
      { full: "Let me get this straight.", red: "lemme get this straight", ipa: "ˈlemi ˈɡet ðɪs ˈstɹeɪt", fr: "Attends que je récapitule.", tags: ["gonna"] },
      { full: "I'm not going anywhere until you talk to me.", red: "I'm nod goin' anywhere until ya talk tə me", ipa: "aɪm ˈnɑːɾ ˈɡoʊɪn ˈeniwer ənˈtɪl jə ˈtɔːk tə mi", fr: "Je ne bouge pas d'ici tant que tu ne me parles pas.", tags: ["flap", "schwa"] }
    ]
  },
  {
    id: "podcast",
    title: "Podcast et explication",
    sub: "Débit posé, phrases plus longues",
    level: "B2–C1",
    segments: [
      { full: "What I find interesting about it is the timing.", red: "whad I find int'resting aboudit is the timing", ipa: "ˈwʌɾ aɪ ˈfaɪnd ˈɪntɹəstɪŋ əˈbaʊɾ ɪɾ ɪz ðə ˈtaɪmɪŋ", fr: "Ce que je trouve intéressant là-dedans, c'est le moment choisi.", tags: ["flap", "elision"] },
      { full: "There's a lot of evidence pointing in that direction.", red: "there's a lodda evidence pointin' in that direction", ipa: "ðerz ə ˈlɑːɾə ˈevɪdəns ˈpɔɪntɪn ɪn ðæt dəˈɹekʃən", fr: "Beaucoup d'éléments vont dans ce sens.", tags: ["flap", "schwa"] },
      { full: "I would have expected the opposite, to be honest.", red: "I woodəv expected the opposite, tə be onnest", ipa: "aɪ ˈwʊɾəv ɪkˈspektɪd ði ˈɑːpəzɪt tə bi ˈɑːnɪst", fr: "Honnêtement, je m'attendais au contraire.", tags: ["rhythm", "schwa"] },
      { full: "It comes down to how much time you're willing to put in.", red: "it comes down tə how much time yer willing tə pudin", ipa: "ɪt ˈkʌmz ˈdaʊn tə ˈhaʊ ˈmʌtʃ ˈtaɪm jɚ ˈwɪlɪŋ tə ˈpʊɾ ˈɪn", fr: "Tout dépend du temps que tu es prêt à y consacrer.", tags: ["schwa", "flap", "linking"] },
      { full: "That's a fair point, but I'd push back a little.", red: "that's a fair point, bud I'd push back a liddle", ipa: "ðæts ə ˈfer ˈpɔɪnt bəɾ aɪd ˈpʊʃ ˈbæk ə ˈlɪɾl̩", fr: "C'est un argument valable, mais je nuancerais.", tags: ["flap"] },
      { full: "We ended up having to start over from scratch.", red: "we endedup havin' tə startover frəm scratch", ipa: "wi ˈendɪd ˈʌp ˈhævɪn tə ˈstɑːɹɾ ˈoʊvɚ fɹəm ˈskɹætʃ", fr: "On a fini par devoir tout reprendre de zéro.", tags: ["linking", "flap", "schwa"] },
      { full: "The thing people tend to forget is the cost.", red: "the thing people tendə fərget is the cost", ipa: "ðə ˈθɪŋ ˈpiːpl̩ ˈtend ə fɚˈɡet ɪz ðə ˈkɔːst", fr: "Ce que les gens ont tendance à oublier, c'est le coût.", tags: ["schwa", "elision"] },
      { full: "I'm not sure that follows, necessarily.", red: "I'm not sure that follows, nessəsairly", ipa: "aɪm ˈnɑːt ˈʃʊɹ ðæt ˈfɑːloʊz ˌnesəˈserəli", fr: "Je ne suis pas sûr que ça découle, forcément.", tags: ["schwa"] },
      { full: "Let's come back to that in a second.", red: "let's come backta thad in a second", ipa: "lets ˈkʌm ˈbæk tə ˈðæɾ ɪn ə ˈsekənd", fr: "On y revient dans une seconde.", tags: ["schwa", "flap", "linking"] },
      { full: "It had nothing to do with any of that.", red: "it had nothin' tə do with enny of that", ipa: "ɪt həd ˈnʌθɪn tə ˈduː wɪθ ˈeni ə ðæt", fr: "Ça n'avait rien à voir avec tout ça.", tags: ["schwa", "elision"] },
      { full: "You could argue it either way.", red: "you cood argue id either way", ipa: "jə ˈkʊd ˈɑːɹɡjuː ɪɾ ˈiːðɚ ˈweɪ", fr: "On peut défendre les deux positions.", tags: ["flap", "schwa"] },
      { full: "The numbers have been going up steadily since then.", red: "the numbers əv bin goin' up steadily since then", ipa: "ðə ˈnʌmbɚz əv bɪn ˈɡoʊɪn ˈʌp ˈstedəli sɪns ˈðen", fr: "Les chiffres augmentent régulièrement depuis.", tags: ["schwa", "rhythm"] },
      { full: "I think there's more to it than that.", red: "I think there's more toid thən that", ipa: "aɪ ˈθɪŋk ðerz ˈmɔːɹ tuː ɪt ðən ˈðæt", fr: "Je pense qu'il y a plus que ça.", tags: ["linking", "schwa"] },
      { full: "At the end of the day, it's about consistency.", red: "at the endəv the day, it's abou' consistency", ipa: "əɾ ði ˈend ə ðə ˈdeɪ ɪts əˈbaʊt kənˈsɪstənsi", fr: "Au bout du compte, c'est une question de régularité.", tags: ["linking", "schwa", "flap"] }
    ]
  }
];

/* ── Sujets d'écriture ─────────────────────────────────────────────────────── */

const WRITING_PROMPTS = [
  "Describe the last film or series episode you watched. What worked, what didn't, and would you recommend it?",
  "Something annoyed you this week. Explain what happened and why it got to you.",
  "Explain your job (or your studies) to someone who knows nothing about the field.",
  "Argue for an unpopular opinion you actually hold. Two reasons, one counter-argument.",
  "Describe a place in Belgium to someone who has never been there. Make them want to go.",
  "Write the message you'd send to cancel plans without sounding rude.",
  "What's a skill you'd like to have, and what's actually stopping you from learning it?",
  "Tell the story of a time something went wrong and you had to improvise.",
  "Compare two things you know well — two cities, two apps, two ways of doing something.",
  "What would you change about how English is taught in schools?",
  "Describe your ideal week. Be specific about the hours, not vague about the feelings.",
  "Someone asks you for advice about moving to your city. What do you tell them?",
  "Explain a decision you made recently and the reasoning behind it.",
  "What's something you believed five years ago that you no longer believe?"
];

/* ── Prompts envoyés à Claude ──────────────────────────────────────────────── */

const AI = {
  dictationPack(level, topic, n) {
    return `You are building listening-dictation material for a French-speaking Belgian learner at ${level} whose main weakness is decoding fast connected speech in films, series and podcasts.

Produce ${n} short English sentences on the theme: "${topic}".

Rules:
- 6 to 14 words each. Natural spoken English, the way a native actually speaks — not textbook English.
- Every sentence must contain at least one reduction: weak forms/schwa, gonna/wanna/gotta, linking, flap T, elision, did-you→didja assimilation, or H-dropping.
- Vary the patterns across the set. No two sentences should feel like the same drill.

Reply with only a JSON array. Each element:
{"full": "the sentence in correct written English",
 "red": "respelled the way it actually sounds, e.g. whaddaya gonna do aboudit",
 "ipa": "broad General American IPA with primary stress marks",
 "fr": "natural French translation",
 "tags": ["schwa"|"gonna"|"linking"|"flap"|"elision"|"assim"|"hdrop"|"rhythm", ...]}

Example element:
{"full":"I was going to call you.","red":"I wəz gonna call ya","ipa":"aɪ wəz ˈɡʌnə ˈkɔːl jə","fr":"J'allais t'appeler.","tags":["gonna","schwa"]}`;
  },

  correction(text, recurring) {
    const hist = recurring && recurring.length
      ? `\n\nThis learner's recurring errors so far, in order of frequency: ${recurring.join(", ")}. Check specifically whether they repeated any of these.`
      : "";
    return `A French-speaking Belgian learner (around B1–B2, aiming for B2–C1) wrote the English text below. Correct it as a demanding but encouraging tutor.${hist}

Their text:
"""
${text}
"""

Reply with only a JSON object:
{
 "corrected": "the full text rewritten in natural, idiomatic English — keep their voice and their ideas, fix what is wrong, and upgrade clumsy-but-correct phrasing too",
 "errors": [
   {"was": "what they wrote", "now": "what it should be", "why": "one short sentence in FRENCH explaining the rule", "type": "a short label in FRENCH, e.g. Préposition, Temps du verbe, Article, Ordre des mots, Faux ami, Collocation"}
 ],
 "focus": {"title": "one grammar or usage point in FRENCH they should drill next", "explain": "2-3 sentences in FRENCH, with one English example of the mistake and one of the fix"},
 "upgrades": [{"plain": "their ordinary phrasing", "better": "a more natural native phrasing", "note": "short note in FRENCH"}],
 "level": "their approximate CEFR level for this text, e.g. B1+",
 "verdict": "two sentences in FRENCH: what they did well, and the single most useful thing to work on"
}

Include at most 8 errors — the most instructive ones, not every typo. Include 2 to 4 upgrades. If the text is genuinely error-free, return an empty errors array and say so in the verdict.`;
  },

  conversation(history, topic) {
    return [
      {
        role: "user",
        content: `You are an English conversation partner for a French-speaking Belgian learner at B1–B2 who wants to reach fluency, especially in understanding natural speech.

Rules for every reply:
- Answer in natural, spoken English. 2 to 4 sentences. Ask one follow-up question so the conversation keeps going.
- Use real connected-speech spelling occasionally in parentheses when you use a reduction, e.g. I'm going to (gonna) check.
- If their last message had an error that blocks meaning or is a recurring French-speaker mistake, add at the very end a single line starting with "↳ " giving the fix in FRENCH, briefly. Otherwise no correction line — don't interrupt the flow for small things.
- Never write in French except in that "↳" line.

Topic to open on: ${topic}`
      },
      { role: "assistant", content: "Got it — I'll keep it natural and ask questions back. Ready when you are." },
      ...history
    ];
  },

  explainMiss(segment, missed) {
    return `A French-speaking learner was doing an English dictation. Here is the sentence they heard:

"${segment.full}"

They failed to catch these words: ${missed.join(", ")}.

In FRENCH, in 2 to 3 sentences maximum, explain what phonetically happened to those specific words in fast speech that made them impossible to catch — the reduction, the liaison, the dropped consonant, whatever it was. Be concrete and mention the actual sounds. No preamble, no encouragement, just the explanation.`;
  },

  segmentTranscript(raw) {
    return `Below is an English transcript. Split it into dictation segments of 6 to 16 words each, cutting at natural breath groups (clause and sentence boundaries), never mid-phrase.

Transcript:
"""
${raw}
"""

Reply with only a JSON array, at most 40 elements. Each element:
{"full": "the segment, exactly as written in the transcript, punctuation kept",
 "red": "respelled as it would actually sound in fast natural speech",
 "ipa": "broad General American IPA with stress marks",
 "fr": "natural French translation",
 "tags": ["schwa"|"gonna"|"linking"|"flap"|"elision"|"assim"|"hdrop"|"rhythm", ...]}

Keep the original wording in "full" — do not rewrite or correct it.`;
  }
};

const PATTERN_LABEL = {
  schwa:   "Formes faibles",
  gonna:   "Contraction orale",
  linking: "Liaison",
  flap:    "Flap T",
  elision: "Consonne tombée",
  assim:   "Assimilation",
  hdrop:   "H muet",
  rhythm:  "Rythme accentuel"
};
