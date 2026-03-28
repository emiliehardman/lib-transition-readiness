"use client";
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, ClipboardList, RefreshCcw } from "lucide-react";

type ResponseValue = 0 | 1 | 2;

type Question = {
  id: number;
  text: string;
};

type SectionKey = "endings" | "neutralZone" | "newBeginnings" | "leadershipInterpretation";

type Section = {
  key: SectionKey;
  title: string;
  shortTitle: string;
  description: string;
  purpose: string;
  questions: Question[];
  interpretation: {
    low: string;
    mid: string;
    high: string;
  };
  leadershipTask: {
    low: string;
    mid: string;
    high: string;
  };
};

type SectionScore = {
  raw: number;
  max: number;
  percent: number;
  band: "weak" | "partial" | "strong";
};

type Results = Record<SectionKey, SectionScore>;

type Answers = Record<number, ResponseValue | null>;

type Notes = {
  lettingGo: string;
  ambiguity: string;
  futureCredibility: string;
  misreadResistance: string;
  nextStep: string;
};

const responseOptions: { label: string; value: ResponseValue; helper: string }[] = [
  { label: "Not yet", value: 0, helper: "This is not yet true in my leadership context." },
  { label: "Partly true", value: 1, helper: "This is somewhat present, but inconsistent or incomplete." },
  { label: "Mostly true", value: 2, helper: "This is largely true of my current practice." },
];

const sections: Section[] = [
  {
    key: "endings",
    title: "Endings",
    shortTitle: "Recognizing loss and disruption",
    description:
      "This section looks at whether you are recognizing what staff may feel they are losing as a result of change.",
    purpose:
      "Low morale often begins with unacknowledged loss. This section helps identify whether you are naming disruption clearly enough and responding to it with credibility.",
    questions: [
      { id: 1, text: "I can identify what staff may feel is ending as a result of this change." },
      { id: 2, text: "I have acknowledged that some staff may be losing familiar routines, confidence, or professional identity." },
      { id: 3, text: "I have named what is changing in concrete terms rather than relying on broad language about innovation or improvement." },
      { id: 4, text: "I make room for frustration or hesitation without automatically treating it as resistance." },
      { id: 5, text: "I understand which roles or teams are likely to feel most disrupted." },
      { id: 6, text: "I have taken care not to present the change in ways that erase what may feel difficult or costly." },
    ],
    interpretation: {
      low: "You may be underrecognizing what people feel they are losing. Staff reactions may be getting mislabeled as reluctance or negativity when they are actually responses to disruption, loss of confidence, or loss of clarity.",
      mid: "You are recognizing some losses, but the picture is still uneven. Certain staff or roles may feel seen while others remain insufficiently acknowledged.",
      high: "You appear to be naming endings with reasonable clarity. Staff are more likely to experience your leadership as credible because you are not pretending the change is cost-free.",
    },
    leadershipTask: {
      low: "Your immediate task is acknowledgment. Name what is ending, identify who is most affected, and create space for people to register difficulty without penalty.",
      mid: "Your task is to sharpen specificity. Make sure losses are not only recognized in general, but translated into role-based conversations and concrete support.",
      high: "Keep reinforcing what is ending and why, especially as new issues surface. Even when this area is relatively strong, people can re-enter an endings dynamic as the change deepens.",
    },
  },
  {
    key: "neutralZone",
    title: "Neutral Zone",
    shortTitle: "Managing ambiguity, frustration, and strain",
    description:
      "This section looks at how well you are leading people through the unstable in-between period where the old way is no longer sufficient and the new way is not yet fully clear.",
    purpose:
      "This is often where frustration, fatigue, drift, and fear accumulate most intensely. The issue may not be resistance to the destination, but the strain of the transition process itself.",
    questions: [
      { id: 7, text: "I recognize that staff may be working in an unstable in-between period where the old way is no longer sufficient and the new way is not yet fully clear." },
      { id: 8, text: "I have provided enough short-term clarity for people to continue doing their work." },
      { id: 9, text: "I am attentive to signs of overload, drift, confusion, or frustration." },
      { id: 10, text: "I am helping staff distinguish between what is settled, what is still evolving, and what can be deferred." },
      { id: 11, text: "I am communicating often enough to reduce unnecessary uncertainty." },
      { id: 12, text: "I understand where people may feel they are operating under competing expectations or two systems at once." },
      { id: 13, text: "I am helping staff prioritize rather than simply asking them to absorb more." },
    ],
    interpretation: {
      low: "Your team may be absorbing too much ambiguity. This is often where morale problems, frustration, and fatigue become most intense.",
      mid: "You are providing some stabilizing structure, but staff may still be carrying more uncertainty than is sustainable, especially in roles already under strain.",
      high: "You appear to be managing the middle period with reasonable steadiness. People are more likely to remain functional and trusting when ambiguity is named and bounded rather than ignored.",
    },
    leadershipTask: {
      low: "Your task is to stabilize the middle. Clarify temporary expectations, reduce contradiction, set short decision cycles, and make prioritization visible.",
      mid: "Your task is to tighten the scaffolding. Focus on where people still feel caught between old and new expectations, and reduce avoidable uncertainty.",
      high: "Continue treating the neutral zone as an active leadership responsibility. Even well-supported teams need repeated clarification as details shift.",
    },
  },
  {
    key: "newBeginnings",
    title: "New Beginnings",
    shortTitle: "Making the future feel credible",
    description:
      "This section looks at whether the future state feels concrete and inhabitable enough for staff to invest in it.",
    purpose:
      "A formal rollout does not automatically create commitment. People are more likely to move forward when they can see what success looks like and how they fit within it.",
    questions: [
      { id: 14, text: "I can describe the future state in ways that feel specific and real to staff." },
      { id: 15, text: "I have connected the change to mission, values, or user need in a way that is credible." },
      { id: 16, text: "I am helping staff understand what success will look like in practice." },
      { id: 17, text: "I am creating opportunities for people to build confidence in the new way of working." },
      { id: 18, text: "I can point to early signs that the new direction is becoming workable." },
      { id: 19, text: "I am helping staff see how they fit into the future state." },
    ],
    interpretation: {
      low: "The future state may not yet feel believable or inhabitable. Staff may be outwardly compliant without being meaningfully invested.",
      mid: "You have begun to make the future more concrete, but it may still feel unevenly defined across roles or teams.",
      high: "You appear to be making the new beginning reasonably credible. People are more likely to commit when they can see practical evidence of where the change is going.",
    },
    leadershipTask: {
      low: "Your task is to make the future concrete. Define what success looks like, connect the change to real work and mission, and create small opportunities for confidence-building.",
      mid: "Your task is to keep translating the future into everyday practice. Focus on the places where the vision is still too abstract to guide real work.",
      high: "Continue reinforcing the new beginning with specificity and visible proof. Credibility grows when staff can see that the future state is actually workable.",
    },
  },
  {
    key: "leadershipInterpretation",
    title: "Leadership Interpretation",
    shortTitle: "Using the model to interpret staff experience",
    description:
      "This section looks at whether you are using transition as an interpretive framework rather than treating all difficult reactions as the same problem.",
    purpose:
      "Leaders often see symptoms before they see the underlying transition dynamic. This section tests whether you can differentiate loss, ambiguity, and weak confidence in the future.",
    questions: [
      { id: 20, text: "I can distinguish between reactions rooted in loss, reactions rooted in ambiguity, and reactions rooted in lack of confidence in the future." },
      { id: 21, text: "I recognize that different staff or teams may be in different phases of transition at the same time." },
      { id: 22, text: "I seek evidence of how the transition is being experienced rather than relying only on formal compliance." },
      { id: 23, text: "I can identify at least one concrete leadership action that would better support staff in the current phase of transition." },
    ],
    interpretation: {
      low: "You may be seeing surface reactions without a sufficiently clear way to interpret them. The risk here is overgeneralizing with labels like resistance or burnout without distinguishing the underlying transition dynamic.",
      mid: "You are reading some of the transition dynamics accurately, but your interpretation may still be too broad or inconsistent to guide the best response in every area.",
      high: "You appear to be using the model in a practical way. That makes it more likely that your interventions will match what staff are actually experiencing.",
    },
    leadershipTask: {
      low: "Your task is diagnostic. Listen more closely, map where people are in the transition, and tailor your response rather than defaulting to generic explanations.",
      mid: "Your task is to strengthen your interpretive discipline. Notice where you are still defaulting to broad labels rather than phase-specific analysis.",
      high: "Keep using the model as a live interpretive tool. Reassess periodically, because teams can shift across phases as implementation unfolds.",
    },
  },
];

const initialAnswers: Answers = Object.fromEntries(
  sections.flatMap((section) => section.questions.map((question) => [question.id, null]))
) as Answers;

const initialNotes: Notes = {
  lettingGo: "",
  ambiguity: "",
  futureCredibility: "",
  misreadResistance: "",
  nextStep: "",
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function getBand(raw: number, max: number): "weak" | "partial" | "strong" {
  const ratio = raw / max;
  if (ratio <= 0.4) return "weak";
  if (ratio <= 0.75) return "partial";
  return "strong";
}

function scoreSection(section: Section, answers: Answers): SectionScore {
  const raw = section.questions.reduce((sum, question) => sum + (answers[question.id] ?? 0), 0);
  const max = section.questions.length * 2;
  const percent = clampPercent(Math.round((raw / max) * 100));
  const band = getBand(raw, max);
  return { raw, max, percent, band };
}

function getBandLabel(band: "weak" | "partial" | "strong") {
  if (band === "weak") return "Needs attention";
  if (band === "partial") return "Partly in place";
  return "Relatively strong";
}

function getBandClasses(band: "weak" | "partial" | "strong") {
  if (band === "weak") return "bg-red-50 text-red-700 border-red-200";
  if (band === "partial") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function getInterpretation(section: Section, score: SectionScore) {
  if (score.band === "weak") {
    return {
      summary: section.interpretation.low,
      action: section.leadershipTask.low,
    };
  }
  if (score.band === "partial") {
    return {
      summary: section.interpretation.mid,
      action: section.leadershipTask.mid,
    };
  }
  return {
    summary: section.interpretation.high,
    action: section.leadershipTask.high,
  };
}

function buildOverallSummary(results: Results) {
  const entries = sections.map((section) => ({
    section,
    score: results[section.key],
  }));

  const sorted = [...entries].sort((a, b) => a.score.percent - b.score.percent);
  const lowest = sorted[0];

  const profileMap: Record<SectionKey, string> = {
    endings: "You may be moving people forward before what is being left behind has been adequately named.",
    neutralZone: "Your biggest challenge is likely not opposition to change but the strain of prolonged ambiguity.",
    newBeginnings: "The destination may not yet feel concrete or credible enough for staff to invest in it.",
    leadershipInterpretation: "You may need a stronger framework for interpreting what your staff are actually experiencing.",
  };

  const strongest = sorted[sorted.length - 1];

  return {
    primaryNeed: lowest.section.title,
    profile: profileMap[lowest.section.key],
    strongestArea: strongest.section.title,
    narrative:
      lowest.section.key === "endings"
        ? "At this point, the human cost of the transition may be more underacknowledged than the technical plan itself. Before asking for more momentum, it may be necessary to name what staff believe they are losing."
        : lowest.section.key === "neutralZone"
          ? "The most pressing issue appears to be the middle period of transition. Staff may not be rejecting the direction so much as carrying too much uncertainty, overload, or contradiction while the new reality remains unsettled."
          : lowest.section.key === "newBeginnings"
            ? "The future state may still be too abstract to command genuine commitment. People are more likely to invest when they can see what success looks like and how they fit within it."
            : "The leadership challenge may be interpretive before it is operational. Better diagnosis can help you distinguish loss, ambiguity, and weak confidence in the future so that your response matches the actual problem.",
  };
}

export default function BridgesLeadershipTransitionAssessment() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [notes, setNotes] = useState<Notes>(initialNotes);
  const [showResults, setShowResults] = useState(false);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value !== null).length,
    [answers]
  );
  const totalQuestions = Object.keys(answers).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const results = useMemo<Results>(() => {
    return sections.reduce((acc, section) => {
      acc[section.key] = scoreSection(section, answers);
      return acc;
    }, {} as Results);
  }, [answers]);

  const overall = useMemo(() => buildOverallSummary(results), [results]);

  const allAnswered = answeredCount === totalQuestions;

  const handleAnswer = (questionId: number, value: ResponseValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setAnswers(initialAnswers);
    setNotes(initialNotes);
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buttonStyle = (variant: "primary" | "ghost") => {
    if (variant === "primary") {
      return "rounded-2xl px-4 py-2 text-sm font-medium shadow-sm";
    }
    return "rounded-2xl px-4 py-2 text-sm font-medium";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-8 grid gap-4 lg:grid-cols-[1.6fr_.9fr]"
        >
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge className="mb-3 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">
                    Leadership self-assessment
                  </Badge>
                  <CardTitle className="text-3xl leading-tight">Bridges-Informed Leadership Transition Assessment</CardTitle>
                  <CardDescription className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                    This assessment helps library leaders evaluate how well they are leading people through transition,
                    not just managing the technical side of change. It focuses on the three Bridges phases: endings,
                    the neutral zone, and new beginnings.
                  </CardDescription>
                </div>
                <div className="hidden rounded-2xl bg-slate-100 p-3 lg:block">
                  <ClipboardList className="h-6 w-6 text-slate-700" />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {responseOptions.map((option) => (
                  <div key={option.value} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-semibold text-slate-900">{option.label}</div>
                    <div className="mt-1 text-sm leading-6 text-slate-600">{option.helper}</div>
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Progress</CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600">
                Complete all items, then generate your transition summary.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>{answeredCount} of {totalQuestions} answered</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 rounded-full" />
              </div>
              <div className="rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">
                Use this tool to identify whether your leadership challenge is centered in unacknowledged loss,
                prolonged ambiguity, a weakly defined future state, or an interpretive gap in how you are reading
                staff responses.
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleSubmit} disabled={!allAnswered} className={buttonStyle("primary")}>
                  Generate summary
                </Button>
                <Button variant="ghost" onClick={handleReset} className={buttonStyle("ghost")}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
              {!allAnswered && (
                <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Results will unlock once every item has a response.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {showResults && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="rounded-3xl border-slate-200 shadow-sm">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  <CardTitle className="text-2xl">Interpretation summary</CardTitle>
                </div>
                <CardDescription className="max-w-4xl text-base leading-7 text-slate-600">
                  {overall.narrative}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-medium text-slate-500">Primary area needing attention</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{overall.primaryNeed}</div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{overall.profile}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-medium text-slate-500">Strongest area</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{overall.strongestArea}</div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    This is the area where your current leadership pattern appears most developed. It can serve as a platform for strengthening weaker phases.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-medium text-slate-500">Use this summary to ask</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Am I naming what people are losing, stabilizing the in-between period well enough for them to function, and making the future state concrete enough for them to trust?
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => {
              const sectionScore = results[section.key];
              const sectionInterpretation = getInterpretation(section, sectionScore);
              return (
                <motion.div
                  key={section.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.03 }}
                >
                  <Card className="rounded-3xl border-slate-200 shadow-sm">
                    <CardHeader className="space-y-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-sm font-medium uppercase tracking-wide text-slate-500">Section {sectionIndex + 1}</div>
                          <CardTitle className="mt-1 text-2xl">{section.title}</CardTitle>
                          <CardDescription className="mt-2 text-base leading-7 text-slate-600">
                            <span className="font-medium text-slate-700">{section.shortTitle}. </span>
                            {section.description}
                          </CardDescription>
                        </div>
                        <div className="min-w-[180px] rounded-2xl bg-slate-100 p-4">
                          <div className="text-xs uppercase tracking-wide text-slate-500">Current section score</div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-2xl font-semibold text-slate-900">{sectionScore.raw}</span>
                            <span className="text-sm text-slate-500">/ {sectionScore.max}</span>
                          </div>
                          <div className="mt-3">
                            <Progress value={sectionScore.percent} className="h-2 rounded-full" />
                          </div>
                          <Badge className={`mt-3 rounded-full border ${getBandClasses(sectionScore.band)} hover:${getBandClasses(sectionScore.band)}`}>
                            {getBandLabel(sectionScore.band)}
                          </Badge>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">{section.purpose}</div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {section.questions.map((question) => (
                        <div key={question.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="text-sm font-medium leading-6 text-slate-900">{question.id}. {question.text}</div>
                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {responseOptions.map((option) => {
                              const selected = answers[question.id] === option.value;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => handleAnswer(question.id, option.value)}
                                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                                    selected
                                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                                  }`}
                                >
                                  <div className="text-sm font-semibold">{option.label}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {showResults && (
                        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">What your score suggests</div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{sectionInterpretation.summary}</p>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">Leadership task</div>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{sectionInterpretation.action}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6 rounded-3xl border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Reflection notes</CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-600">
                  Use these prompts to turn your scores into next steps.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">What do you think people are being asked to let go of right now?</label>
                  <Textarea
                    value={notes.lettingGo}
                    onChange={(e) => setNotes((prev) => ({ ...prev, lettingGo: e.target.value }))}
                    className="min-h-[96px] rounded-2xl"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">Where is the transition creating the most confusion or drag?</label>
                  <Textarea
                    value={notes.ambiguity}
                    onChange={(e) => setNotes((prev) => ({ ...prev, ambiguity: e.target.value }))}
                    className="min-h-[96px] rounded-2xl"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">What would make the future state feel more tangible to staff?</label>
                  <Textarea
                    value={notes.futureCredibility}
                    onChange={(e) => setNotes((prev) => ({ ...prev, futureCredibility: e.target.value }))}
                    className="min-h-[96px] rounded-2xl"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">What have you perhaps interpreted as resistance that may actually be loss or uncertainty?</label>
                  <Textarea
                    value={notes.misreadResistance}
                    onChange={(e) => setNotes((prev) => ({ ...prev, misreadResistance: e.target.value }))}
                    className="min-h-[96px] rounded-2xl"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-900">What is one concrete action you could take in the next month?</label>
                  <Textarea
                    value={notes.nextStep}
                    onChange={(e) => setNotes((prev) => ({ ...prev, nextStep: e.target.value }))}
                    className="min-h-[96px] rounded-2xl"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
