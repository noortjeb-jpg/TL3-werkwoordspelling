import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  PlayCircle,
  CheckCircle2,
  ArrowLeft,
  Lightbulb,
  PencilLine,
  Video,
  ClipboardCheck,
} from "lucide-react";
import { motion } from "framer-motion";

type Tag = "pv" | "tt" | "vt" | "vd" | "gbw";

type Screen =
  | { kind: "home" }
  | { kind: "module"; moduleId: Tag }
  | { kind: "toets" }
  | {
      kind: "resultaat";
      results: Record<Tag, { goed: number; totaal: number }>;
      totalGoed: number;
      totalTotaal: number;
    };

type PracticeQuestion = {
  id: string;
  prompt: string;
  type: "multiple" | "fill";
  choices?: string[];
  answer: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  tag: Tag;
};

type ToetsQuestion = {
  id: string;
  prompt: string;
  type: "multiple" | "fill";
  choices?: string[];
  answer: string;
  tag: Tag;
};

const TAG_LABEL: Record<Tag, string> = {
  pv: "Onderdeel 1",
  tt: "Onderdeel 2",
  vt: "Onderdeel 3",
  vd: "Onderdeel 4",
  gbw: "Onderdeel 5",
};

const TAG_TITLE: Record<Tag, string> = {
  pv: "Persoonsvorm herkennen",
  tt: "Persoonsvorm spellen (tt)",
  vt: "Persoonsvorm spellen (vt)",
  vd: "Voltooid deelwoord",
  gbw: "Gebiedende wijs",
};

const TAG_TIP: Record<Tag, string> = {
  pv: "Tip: gebruik tijdproef, getalproef of maak de zin vragend.",
  tt: "Tip: zet eerst in de ik-vorm en kijk dan naar het onderwerp (jij voor of achter).",
  vt: "Tip: maak de ik-vorm, kies -te of -de met ’t kofschip en let op veranderletters.",
  vd: "Tip: maak de ik-vorm, kies t of d met ’t kofschip en voeg ge- toe (als dat kan).",
  gbw: "Tip: gebruik de ik-vorm zonder ik en zonder t. Het onderwerp ontbreekt.",
};

function tagLabel(tag: Tag) {
  return TAG_LABEL[tag];
}

function tagTitle(tag: Tag) {
  return TAG_TITLE[tag];
}

function tagTip(tag: Tag, score: number, totaal: number) {
  const ratio = totaal ? score / totaal : 0;
  if (ratio >= 0.75) return "Dit onderdeel gaat goed. Blijf af en toe herhalen.";
  return TAG_TIP[tag];
}

function softRandomId(prefix: string, i: number) {
  return `${prefix}-${i + 1}`;
}

export default function TL3WerkwoordspellingApp() {
  const [screen, setScreen] = useState<Screen>({ kind: "home" });

  const sections = useMemo(
    () => [
      {
        id: "pv" as const,
        title: "Persoonsvorm herkennen",
        color: "bg-blue-100",
        icon: <BookOpen className="w-6 h-6" />,
        description: "Leer hoe je de persoonsvorm vindt en of een zin in de tt of vt staat.",
      },
      {
        id: "tt" as const,
        title: "Persoonsvorm spellen (tt)",
        color: "bg-green-100",
        icon: <CheckCircle2 className="w-6 h-6" />,
        description: "Oefen met de ik-vorm en de spelling in de tegenwoordige tijd.",
      },
      {
        id: "vt" as const,
        title: "Persoonsvorm spellen (vt)",
        color: "bg-yellow-100",
        icon: <CheckCircle2 className="w-6 h-6" />,
        description: "Leer de verleden tijd met ’t kofschip en veranderletters.",
      },
      {
        id: "vd" as const,
        title: "Voltooid deelwoord",
        color: "bg-purple-100",
        icon: <CheckCircle2 className="w-6 h-6" />,
        description: "Oefen zwakke en sterke werkwoorden in de voltooide tijd.",
      },
      {
        id: "gbw" as const,
        title: "Gebiedende wijs",
        color: "bg-pink-100",
        icon: <PlayCircle className="w-6 h-6" />,
        description: "Geef opdrachten met de juiste vorm van het werkwoord.",
      },
    ],
    []
  );

  const pvModule = useMemo(() => {
    const theory = [
      {
        title: "Wat is de persoonsvorm?",
        points: [
          "De persoonsvorm is een werkwoord.",
          "Je gebruikt de persoonsvorm bij zinsontleding: je zoekt hem meestal als eerste.",
          "Je kunt de persoonsvorm in een zin op drie manieren vinden.",
        ],
      },
      {
        title: "3 manieren om de persoonsvorm te vinden",
        points: [
          "Verander van tijd: zet de zin in een andere tijd. Het werkwoord dat mee verandert is de persoonsvorm.",
          "Verander van aantal: maak enkelvoud meervoud (of andersom). Het werkwoord dat mee verandert is de persoonsvorm.",
          "Maak de zin vragend: de persoonsvorm is dan het eerste werkwoord.",
        ],
      },
      {
        title: "Let op",
        points: [
          "Als een zin al een vraag is, begint hij soms met een ander woord (bijvoorbeeld wanneer of hoe). Controleer: een persoonsvorm is altijd een werkwoord.",
          "In samengestelde zinnen kunnen meerdere persoonsvormen staan.",
        ],
      },
      {
        title: "Tijd bepalen (in deze app)",
        points: [
          "We werken alleen met twee tijden:",
          "Tegenwoordige tijd (tt): nu, vandaag, meestal.",
          "Verleden tijd (vt): gisteren, vroeger, toen.",
        ],
      },
    ];

    const examples = [
      {
        label: "Voorbeeld 1 (verander van tijd)",
        text: "Ik loop naar de stad.",
        transform: "Gisteren liep ik naar de stad.",
        explanation: "Loop wordt liep. Dus loop is de persoonsvorm.",
      },
      {
        label: "Voorbeeld 2 (verander van aantal)",
        text: "Ik loop naar de stad.",
        transform: "Wij lopen naar de stad.",
        explanation: "Loop wordt lopen. Dus loop is de persoonsvorm.",
      },
      {
        label: "Voorbeeld 3 (maak vragend)",
        text: "Ik loop naar de stad.",
        transform: "Loop ik naar de stad?",
        explanation: "In de vraag is loop het eerste werkwoord. Dus loop is de persoonsvorm.",
      },
    ];

    const videos = [
      {
        title: "Persoonsvorm herkennen – uitleg",
        url: "https://www.youtube.com/watch?v=NCwSdXYdbTQ&t=5s",
        note: "Uitleg over het herkennen van de persoonsvorm en het bepalen van de tijd (tt/vt).",
      },
    ];

    const practice: PracticeQuestion[] = [
      {
        id: softRandomId("pv", 0),
        prompt: "Kies de persoonsvorm in de zin: Elke dag kan Noor naar school fietsen.",
        type: "multiple",
        choices: ["Elke", "dag", "kan", "Noor", "naar", "school", "fietsen"],
        answer: "kan",
        feedbackCorrect: "Goed. Je hebt het werkwoord gekozen dat de tijd laat zien.",
        feedbackIncorrect: "Niet helemaal. Tip: verander de tijd (bijvoorbeeld naar gisteren). Het werkwoord dat mee verandert is de persoonsvorm.",
        tag: "pv",
      },
      {
        id: softRandomId("pv", 1),
        prompt: "Kies de persoonsvorm in de zin: Gisteren moest Jamal zijn huiswerk maken.",
        type: "multiple",
        choices: ["Gisteren", "moest", "Jamal", "zijn", "huiswerk", "maken"],
        answer: "moest",
        feedbackCorrect: "Goed. Je hebt het werkwoord gekozen dat de tijd laat zien.",
        feedbackIncorrect: "Niet helemaal. Tip: er staan meerdere werkwoorden. Zoek het werkwoord dat de tijd laat zien (tijdproef).",
        tag: "pv",
      },
      {
        id: softRandomId("pv", 2),
        prompt: "Kies de persoonsvorm in de zin: Ik ga elke avond lezen.",
        type: "multiple",
        choices: ["Ik", "ga", "elke", "avond", "lezen"],
        answer: "ga",
        feedbackCorrect: "Goed. Je hebt het werkwoord gekozen dat de tijd laat zien.",
        feedbackIncorrect: "Niet helemaal. Tip: maak de zin vragend. Het eerste werkwoord in de vraag is de persoonsvorm.",
        tag: "pv",
      },
      {
        id: softRandomId("pv", 3),
        prompt: "Kies de persoonsvorm in de zin: Vorige week heeft Noor haar tas moeten pakken.",
        type: "multiple",
        choices: ["Vorige", "week", "heeft", "Noor", "haar", "tas", "moeten", "pakken"],
        answer: "heeft",
        feedbackCorrect: "Goed. Je hebt het werkwoord gekozen dat de tijd laat zien.",
        feedbackIncorrect: "Niet helemaal. Tip: verander de tijd (bijvoorbeeld naar gisteren). Het werkwoord dat mee verandert is de persoonsvorm.",
        tag: "pv",
      },

      {
        id: softRandomId("tt", 0),
        prompt: "Vul in (tt): Hij ___ (werken) elke dag thuis.",
        type: "fill",
        answer: "werkt",
        feedbackCorrect: "Goed.",
        feedbackIncorrect: "Tip: zet het werkwoord eerst in de ik-vorm en kijk naar het onderwerp.",
        tag: "tt",
      },
      {
        id: softRandomId("tt", 1),
        prompt: "Vul in (tt): Jij ___ (vinden) dit leuk.",
        type: "fill",
        answer: "vindt",
        feedbackCorrect: "Goed.",
        feedbackIncorrect: "Tip: jij staat vóór de persoonsvorm, dus meestal +t.",
        tag: "tt",
      },
      {
        id: softRandomId("tt", 2),
        prompt: "Vul in (tt): ___ jij dat leuk? (vinden)",
        type: "fill",
        answer: "vind",
        feedbackCorrect: "Goed.",
        feedbackIncorrect: "Tip: bij een vraag staat jij achter de persoonsvorm. Dan geen t.",
        tag: "tt",
      },
      {
        id: softRandomId("tt", 3),
        prompt: "Vul in (tt): Wij ___ (werken) samen.",
        type: "fill",
        answer: "werken",
        feedbackCorrect: "Goed.",
        feedbackIncorrect: "Tip: bij wij gebruik je het hele werkwoord.",
        tag: "tt",
      },
    ];

    return { theory, examples, videos, practice };
  }, []);

  const activeModule = screen.kind === "module" ? screen.moduleId : null;
  const activeSection = activeModule ? sections.find((s) => s.id === activeModule) : null;

  const toetsVragen: ToetsQuestion[] = useMemo(
    () => [
      { id: "t-pv-1", tag: "pv", type: "multiple", prompt: "Onderdeel 1: Kies de persoonsvorm. Zin: Gisteren moest Amir naar huis fietsen.", choices: ["gisteren", "moest", "naar", "fietsen"], answer: "moest" },
      { id: "t-pv-2", tag: "pv", type: "multiple", prompt: "Onderdeel 1: Kies de persoonsvorm. Zin: Elke dag kan Noor vroeg opstaan.", choices: ["Elke", "dag", "kan", "opstaan"], answer: "kan" },
      { id: "t-pv-3", tag: "pv", type: "multiple", prompt: "Onderdeel 1: Bepaal de tijd (tt of vt). Zin: Vorige week speelde het team een wedstrijd.", choices: ["tt", "vt"], answer: "vt" },
      { id: "t-pv-4", tag: "pv", type: "multiple", prompt: "Onderdeel 1: Bepaal de tijd (tt of vt). Zin: Ik lees elke avond een hoofdstuk.", choices: ["tt", "vt"], answer: "tt" },

      { id: "t-tt-1", tag: "tt", type: "fill", prompt: "Onderdeel 2 (tt): Vul in. Hij ___ (werken) elke dag thuis.", answer: "werkt" },
      { id: "t-tt-2", tag: "tt", type: "fill", prompt: "Onderdeel 2 (tt): Vul in. Jij ___ (vinden) dit leuk.", answer: "vindt" },
      { id: "t-tt-3", tag: "tt", type: "fill", prompt: "Onderdeel 2 (tt): Vul in. ___ jij mee? (gaan)", answer: "ga" },
      { id: "t-tt-4", tag: "tt", type: "fill", prompt: "Onderdeel 2 (tt): Vul in. Wij ___ (maken) een plan.", answer: "maken" },

      { id: "t-vt-1", tag: "vt", type: "fill", prompt: "Onderdeel 3 (vt): Vul in. Gisteren ___ ik (werken) lang door.", answer: "werkte" },
      { id: "t-vt-2", tag: "vt", type: "fill", prompt: "Onderdeel 3 (vt): Vul in. Vorige week ___ wij (spelen) een wedstrijd.", answer: "speelden" },
      { id: "t-vt-3", tag: "vt", type: "fill", prompt: "Onderdeel 3 (vt): Vul in. Hij ___ (pakken) zijn tas.", answer: "pakte" },
      { id: "t-vt-4", tag: "vt", type: "fill", prompt: "Onderdeel 3 (vt): Vul in. Vorig jaar ___ zij (verhuizen) naar Amersfoort.", answer: "verhuisde" },

      { id: "t-vd-1", tag: "vd", type: "fill", prompt: "Onderdeel 4: Vul in. Ik heb hard ___ (werken).", answer: "gewerkt" },
      { id: "t-vd-2", tag: "vd", type: "fill", prompt: "Onderdeel 4: Vul in. Wij hebben de tas ___ (pakken).", answer: "gepakt" },
      { id: "t-vd-3", tag: "vd", type: "fill", prompt: "Onderdeel 4: Vul in. Hij heeft zich ___ (vervelen).", answer: "verveeld" },
      { id: "t-vd-4", tag: "vd", type: "fill", prompt: "Onderdeel 4: Vul in. Zij is naar huis ___ (gaan).", answer: "gegaan" },

      { id: "t-gbw-1", tag: "gbw", type: "fill", prompt: "Onderdeel 5: Vul in (gebiedende wijs). ___ door! (lopen)", answer: "loop" },
      { id: "t-gbw-2", tag: "gbw", type: "fill", prompt: "Onderdeel 5: Vul in (gebiedende wijs). ___ je jas aan. (doen)", answer: "doe" },
      { id: "t-gbw-3", tag: "gbw", type: "multiple", prompt: "Onderdeel 5: Welke zin is gebiedende wijs?", choices: ["Jij pakt je tas.", "Pak je tas.", "Hij pakt zijn tas.", "Wij pakken onze tas."], answer: "Pak je tas." },
      { id: "t-gbw-4", tag: "gbw", type: "multiple", prompt: "Onderdeel 5: Welke zin is gebiedende wijs?", choices: ["Ga jij mee?", "Ga naar binnen.", "Hij gaat naar binnen.", "Wij gaan naar binnen."], answer: "Ga naar binnen." },
    ],
    []
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">TL3 Werkwoordspelling</h1>
          <p className="text-sm text-slate-600 mt-1">Oefenen per onderdeel, met directe feedback en een oefentoets.</p>
        </div>
        {screen.kind !== "home" ? (
          <Button variant="secondary" className="rounded-xl" onClick={() => setScreen({ kind: "home" })}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Terug
          </Button>
        ) : null}
      </motion.div>

      {screen.kind === "home" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, index) => (
              <motion.div key={section.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                <Card className={`${section.color} rounded-2xl shadow-md`}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      {section.icon}
                      <h2 className="text-xl font-semibold">{section.title}</h2>
                    </div>
                    <p className="text-sm mb-4">{section.description}</p>
                    <Button className="rounded-xl" onClick={() => setScreen({ kind: "module", moduleId: section.id })}>
                      Start
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div className="mt-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Card className="bg-slate-100 rounded-2xl shadow-inner">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <ClipboardCheck className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">Oefentoets</h2>
                </div>
                <p className="mb-4">20 vragen: 4 per onderdeel. Je krijgt na afloop een analyse per onderdeel.</p>
                <Button variant="secondary" className="rounded-xl" onClick={() => setScreen({ kind: "toets" })}>
                  Start oefentoets
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </>
      ) : null}

      {screen.kind === "module" ? (
        <ModuleView
          title={activeSection?.title ?? "Onderdeel"}
          colorClass={activeSection?.color ?? "bg-slate-100"}
          moduleId={activeModule ?? "pv"}
          pvModule={pvModule}
        />
      ) : null}

      {screen.kind === "toets" ? (
        <ToetsView questions={toetsVragen} onFinish={(results, totalGoed, totalTotaal) => setScreen({ kind: "resultaat", results, totalGoed, totalTotaal })} />
      ) : null}

      {screen.kind === "resultaat" ? (
        <ResultView results={screen.results} totalGoed={screen.totalGoed} totalTotaal={screen.totalTotaal} onRetry={() => setScreen({ kind: "toets" })} />
      ) : null}
    </div>
  );
}

function ModuleView(props: {
  title: string;
  colorClass: string;
  moduleId: Tag;
  pvModule: {
    theory: { title: string; points: string[] }[];
    examples: { label: string; text: string; transform: string; explanation: string }[];
    videos: { title: string; url: string; note: string }[];
    practice: PracticeQuestion[];
  };
}) {
  const { title, colorClass, moduleId, pvModule } = props;

  if (moduleId === "tt") {
    const ttTheory = [
      "Gebruik altijd de ik-vorm als basis.",
      "Bij hij/zij/het komt meestal een -t.",
      "Bij jij: staat jij vóór de persoonsvorm, dan +t; staat jij erachter, dan geen t.",
      "Bij wij/jullie/zij gebruik je het hele werkwoord.",
    ];

    const ttExamples = [
      "ik werk – jij werkt – hij werkt – wij werken",
      "ik vind – jij vindt – hij vindt – wij vinden",
      "Werk jij vandaag? / Jij werkt vandaag.",
    ];

    const ttVideos = [
      { title: "Persoonsvorm spellen (tt) – ik-vorm", url: "https://www.youtube.com/watch?v=HomtTOllv_o", note: "Uitleg over ik-vorm en -t." },
      { title: "Tegenwoordige tijd oefenen", url: "https://www.taal-oefenen.nl/videos/werkwoordspelling/persoonsvorm-tegenwoordige-tijd", note: "Extra voorbeelden." },
    ];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className={`${colorClass} rounded-2xl shadow-md`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl font-semibold">{title}</h2>
                <p className="text-sm text-slate-700 mt-1">Je leert de persoonsvorm spellen in de tegenwoordige tijd.</p>
              </div>
              <Badge className="rounded-xl">Uitgewerkt</Badge>
            </div>

            <Tabs defaultValue="theorie" className="w-full">
              <TabsList className="rounded-2xl">
                <TabsTrigger value="theorie" className="rounded-xl"><Lightbulb className="w-4 h-4 mr-2" /> Theorie</TabsTrigger>
                <TabsTrigger value="voorbeelden" className="rounded-xl"><BookOpen className="w-4 h-4 mr-2" /> Voorbeelden</TabsTrigger>
                <TabsTrigger value="videos" className="rounded-xl"><Video className="w-4 h-4 mr-2" /> Video’s</TabsTrigger>
                <TabsTrigger value="oefenen" className="rounded-xl"><PencilLine className="w-4 h-4 mr-2" /> Oefenen</TabsTrigger>
              </TabsList>

              <TabsContent value="theorie" className="mt-4">
                <Card className="bg-white/70 rounded-2xl shadow-sm"><CardContent className="p-5 text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    {ttTheory.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="voorbeelden" className="mt-4">
                <Card className="bg-white/70 rounded-2xl shadow-sm"><CardContent className="p-5 text-sm space-y-2">
                  {ttExamples.map((e, i) => <p key={i}>{e}</p>)}
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="videos" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ttVideos.map((v, i) => (
                    <Card key={i} className="bg-white/70 rounded-2xl shadow-sm"><CardContent className="p-5">
                      <h3 className="font-semibold text-lg">{v.title}</h3>
                      <p className="text-sm text-slate-700 mt-1">{v.note}</p>
                      <div className="mt-4"><a href={v.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">{v.url}</a></div>
                    </CardContent></Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="oefenen" className="mt-4">
                <PracticeBlock questions={pvModule.practice.filter(q => q.tag === "tt")} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (moduleId === "gbw") {
    const gbwVideos = [
      { title: "Gebiedende wijs (uitleg)", url: "https://www.taal-oefenen.nl/videos/werkwoordspelling/gebiedende-wijs", note: "Uitleg en voorbeelden." },
      { title: "Gebiedende wijs oefenen", url: "https://www.youtube.com/watch?v=QGJr5F3Z8cs", note: "Extra herhaling." },
    ];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className={`${colorClass} rounded-2xl shadow-md`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl font-semibold">{title}</h2>
                <p className="text-sm text-slate-700 mt-1">Je leert opdrachten maken met de juiste werkwoordsvorm.</p>
              </div>
              <Badge className="rounded-xl">Uitgewerkt</Badge>
            </div>

            <Tabs defaultValue="theorie" className="w-full">
              <TabsList className="rounded-2xl">
                <TabsTrigger value="theorie" className="rounded-xl"><Lightbulb className="w-4 h-4 mr-2" /> Theorie</TabsTrigger>
                <TabsTrigger value="voorbeelden" className="rounded-xl"><BookOpen className="w-4 h-4 mr-2" /> Voorbeelden</TabsTrigger>
                <TabsTrigger value="videos" className="rounded-xl"><Video className="w-4 h-4 mr-2" /> Video’s</TabsTrigger>
                <TabsTrigger value="oefenen" className="rounded-xl"><PencilLine className="w-4 h-4 mr-2" /> Oefenen</TabsTrigger>
              </TabsList>

              <TabsContent value="theorie" className="mt-4">
                <Card className="bg-white/70 rounded-2xl shadow-sm"><CardContent className="p-5 text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Je gebruikt de ik-vorm zonder ik.</li>
                    <li>Er komt nooit een t achter.</li>
                    <li>Het onderwerp ontbreekt.</li>
                  </ul>
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="voorbeelden" className="mt-4">
                <Card className="bg-white/70 rounded-2xl shadow-sm"><CardContent className="p-5 text-sm space-y-2">
                  <p><strong>Loop</strong> door.</p>
                  <p><strong>Pak</strong> je tas.</p>
                  <p><strong>Wees</strong> stil.</p>
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="videos" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gbwVideos.map((v, i) => (
                    <Card key={i} className="bg-white/70 rounded-2xl shadow-sm"><CardContent className="p-5">
                      <h3 className="font-semibold text-lg">{v.title}</h3>
                      <p className="text-sm text-slate-700 mt-1">{v.note}</p>
                      <div className="mt-4"><a href={v.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">{v.url}</a></div>
                    </CardContent></Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="oefenen" className="mt-4">
                <PracticeBlock
                  questions={[
                    { id: "gbw-1", prompt: "Vul het juiste woord in (gebiedende wijs): ___ door! (lopen)", type: "fill", answer: "loop", feedbackCorrect: "Goed.", feedbackIncorrect: "Tip: gebruik de ik-vorm zonder ik en zonder t.", tag: "gbw" },
                    { id: "gbw-2", prompt: "Vul het juiste woord in (gebiedende wijs): ___ je jas aan. (doen)", type: "fill", answer: "doe", feedbackCorrect: "Goed.", feedbackIncorrect: "Tip: dit is de ik-vorm zonder ik.", tag: "gbw" },
                    { id: "gbw-3", prompt: "Welke zin is gebiedende wijs?", type: "multiple", choices: ["Jij pakt je tas.", "Pak je tas.", "Hij pakt zijn tas.", "Wij pakken onze tas."], answer: "Pak je tas.", feedbackCorrect: "Goed.", feedbackIncorrect: "Tip: bij de gebiedende wijs ontbreekt het onderwerp en staat het werkwoord vooraan.", tag: "gbw" },
                    { id: "gbw-4", prompt: "Welke zin is gebiedende wijs?", type: "multiple", choices: ["Ga jij mee?", "Ga naar binnen.", "Hij gaat naar binnen.", "Wij gaan naar binnen."], answer: "Ga naar binnen.", feedbackCorrect: "Goed.", feedbackIncorrect: "Tip: een gebiedende wijs is een opdracht. Het werkwoord staat aan het begin.", tag: "gbw" },
                  ]}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className={`${colorClass} rounded-2xl shadow-md`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-semibold">{title}</h2>
              <p className="text-sm text-slate-700 mt-1">Je leert de persoonsvorm vinden en of een zin in de tt of vt staat.</p>
            </div>
            <Badge className="rounded-xl">Uitgewerkt</Badge>
          </div>

          <Tabs defaultValue="theorie" className="w-full">
            <TabsList className="rounded-2xl">
              <TabsTrigger value="theorie" className="rounded-xl"><Lightbulb className="w-4 h-4 mr-2" /> Theorie</TabsTrigger>
              <TabsTrigger value="voorbeelden" className="rounded-xl"><BookOpen className="w-4 h-4 mr-2" /> Voorbeelden</TabsTrigger>
              <TabsTrigger value="videos" className="rounded-xl"><Video className="w-4 h-4 mr-2" /> Video’s</TabsTrigger>
              <TabsTrigger value="oefenen" className="rounded-xl"><PencilLine className="w-4 h-4 mr-2" /> Oefenen</TabsTrigger>
            </TabsList>

            <TabsContent value="theorie" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pvModule.theory.map((block, i) => (
                  <Card key={i} className="bg-white/70 rounded-2xl shadow-sm"><CardContent className="p-5">
                    <h3 className="font-semibold text-lg mb-2">{block.title}</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {block.points.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </CardContent></Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="voorbeelden" className="mt-4">
              <div className="space-y-4">
                {pvModule.examples.map((ex, i) => (
                  <Card key={i} className="bg-white/70 rounded-2xl shadow-sm"><CardContent className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-lg">{ex.label}</h3>
                      <Badge variant="secondary" className="rounded-xl">PV</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-slate-500">Zin</div><div className="mt-1 font-medium">{ex.text}</div></div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-slate-500">Aangepaste zin</div><div className="mt-1 font-medium">{ex.transform}</div></div>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{ex.explanation}</p>
                  </CardContent></Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="videos" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pvModule.videos.map((v, i) => (
                  <Card key={i} className="bg-white/70 rounded-2xl shadow-sm"><CardContent className="p-5">
                    <h3 className="font-semibold text-lg">{v.title}</h3>
                    <p className="text-sm text-slate-700 mt-1">{v.note}</p>
                    <div className="mt-4"><a href={v.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">{v.url}</a></div>
                  </CardContent></Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="oefenen" className="mt-4">
              <PracticeBlock questions={pvModule.practice} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PracticeBlock(props: { questions: PracticeQuestion[] }) {
  const { questions } = props;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const q = questions[index];
  const progress = Math.round(((index + 1) / questions.length) * 100);

  const normalizedAnswer = (q.answer ?? "").trim().toLowerCase();
  const normalizedSelected = (selected ?? "").trim().toLowerCase();
  const normalizedTyped = typed.trim().toLowerCase();

  const isCorrect = submitted ? (q.type === "fill" ? normalizedTyped === normalizedAnswer : normalizedSelected === normalizedAnswer) : false;

  function resetForNext() {
    setSelected(null);
    setTyped("");
    setSubmitted(false);
  }

  function submit() {
    if (submitted) return;
    if (q.type === "fill") {
      if (!typed.trim()) return;
      setSubmitted(true);
      if (normalizedTyped === normalizedAnswer) setCorrectCount((c) => c + 1);
      return;
    }
    if (!selected) return;
    setSubmitted(true);
    if (normalizedSelected === normalizedAnswer) setCorrectCount((c) => c + 1);
  }

  function next() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      resetForNext();
      return;
    }
    setIndex(0);
    setSelected(null);
    setTyped("");
    setSubmitted(false);
    setCorrectCount(0);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg">Oefenvragen</h3>
          <p className="text-sm text-slate-700">Vraag {index + 1} van {questions.length}</p>
        </div>
        <div className="min-w-[160px]">
          <Progress value={progress} />
          <div className="text-xs text-slate-600 mt-1 text-right">{progress}%</div>
        </div>
      </div>

      <Card className="bg-white/80 rounded-2xl shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="secondary" className="rounded-xl">{q.tag.toUpperCase()}</Badge>
            <div className="text-sm text-slate-700">Score: {correctCount}/{questions.length}</div>
          </div>

          <p className="mt-3 font-medium">{q.prompt}</p>

          {q.type === "fill" ? (
            <div className="mt-4">
              <input
                value={typed}
                onChange={(e) => {
                  if (submitted) return;
                  setTyped(e.target.value);
                }}
                placeholder="Typ je antwoord..."
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm outline-none focus:border-slate-400"
              />
              {submitted && !isCorrect ? (
                <div className="mt-2">
                  <Badge variant="secondary" className="rounded-xl">Niet juist</Badge>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(q.choices ?? []).map((c) => {
                const active = selected === c;
                const showIncorrect = submitted && active && c.trim().toLowerCase() !== normalizedAnswer;

                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      if (submitted) return;
                      setSelected(c);
                    }}
                    className={
                      "text-left rounded-2xl p-3 bg-white shadow-sm border transition " +
                      (active ? "border-slate-400" : "border-transparent") +
                      (showIncorrect ? " ring-2 ring-slate-300" : "")
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm">{c}</span>
                      {showIncorrect ? <Badge variant="secondary" className="rounded-xl">Niet juist</Badge> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <Button className="rounded-xl" onClick={submit} disabled={submitted || (q.type === "fill" ? !typed.trim() : !selected)}>
              Controleer
            </Button>
            <Button variant="secondary" className="rounded-xl" onClick={next} disabled={!submitted}>
              {index < questions.length - 1 ? "Volgende" : "Opnieuw"}
            </Button>
          </div>

          {submitted ? (
            <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
              <div className="text-sm font-semibold">Feedback</div>
              <p className="text-sm text-slate-700 mt-1">{isCorrect ? q.feedbackCorrect : q.feedbackIncorrect}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="bg-slate-50 rounded-2xl shadow-inner">
        <CardContent className="p-5">
          <h4 className="font-semibold">Tip</h4>
          <p className="text-sm text-slate-700 mt-1">Gebruik het stappenplan van dit onderdeel. Bij fout: probeer opnieuw met de tip uit de feedback.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function ToetsView(props: {
  questions: ToetsQuestion[];
  onFinish: (results: Record<Tag, { goed: number; totaal: number }>, totalGoed: number, totalTotaal: number) => void;
}) {
  const { questions, onFinish } = props;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const q = questions[index];
  const progress = Math.round(((index + 1) / questions.length) * 100);

  const currentAnswer = answers[q.id] ?? "";
  const canContinue = currentAnswer.trim().length > 0;

  function setCurrent(val: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  }

  function finish() {
    const results: Record<Tag, { goed: number; totaal: number }> = {
      pv: { goed: 0, totaal: 0 },
      tt: { goed: 0, totaal: 0 },
      vt: { goed: 0, totaal: 0 },
      vd: { goed: 0, totaal: 0 },
      gbw: { goed: 0, totaal: 0 },
    };

    let totalGoed = 0;
    for (const item of questions) {
      const given = (answers[item.id] ?? "").trim().toLowerCase();
      const correct = (item.answer ?? "").trim().toLowerCase();
      results[item.tag].totaal += 1;
      if (given === correct) {
        results[item.tag].goed += 1;
        totalGoed += 1;
      }
    }

    onFinish(results, totalGoed, questions.length);
  }

  function next() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      return;
    }
    finish();
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-100 rounded-2xl shadow-inner">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">Oefentoets</h2>
              <p className="text-sm text-slate-700 mt-1">Geen feedback tussendoor. Na afloop krijg je een analyse per onderdeel.</p>
            </div>
            <Badge className="rounded-xl">Vraag {index + 1}/{questions.length}</Badge>
          </div>

          <div className="mt-4">
            <Progress value={progress} />
            <div className="text-xs text-slate-600 mt-1 text-right">{progress}%</div>
          </div>

          <Card className="bg-white/80 rounded-2xl shadow-sm mt-4">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="secondary" className="rounded-xl">{tagLabel(q.tag)}: {tagTitle(q.tag)}</Badge>
                <Badge className="rounded-xl">{q.tag.toUpperCase()}</Badge>
              </div>

              <p className="mt-3 font-medium">{q.prompt}</p>

              {q.type === "fill" ? (
                <div className="mt-4">
                  <input
                    value={currentAnswer}
                    onChange={(e) => setCurrent(e.target.value)}
                    placeholder="Typ je antwoord..."
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-sm outline-none focus:border-slate-400"
                  />
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(q.choices ?? []).map((c) => {
                    const active = currentAnswer === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrent(c)}
                        className={"text-left rounded-2xl p-3 bg-white shadow-sm border transition " + (active ? "border-slate-400" : "border-transparent")}
                      >
                        <span className="text-sm">{c}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="text-xs text-slate-600">Je kunt later altijd verbeteren met de onderdelen.</div>
                <Button className="rounded-xl" onClick={next} disabled={!canContinue}>
                  {index < questions.length - 1 ? "Volgende" : "Bekijk resultaat"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </motion.div>
  );
}
