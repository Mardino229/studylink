import {useEffect, useMemo, useState} from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb.tsx";
import {mockCourses, listChapters, generateExam, gradeExam, listBank, submitBankItem} from "../../services/mock/exams";
import type {ExamSpec, GeneratedExam, QuestionType, BankExamMeta, ExamResult} from "../../types/exams";

const questionTypes: { key: QuestionType; label: string }[] = [
  { key: "qcm", label: "QCM" },
  { key: "short", label: "Réponse courte" },
  { key: "long", label: "Réponse longue" },
  { key: "truefalse", label: "Vrai/Faux" },
];

export default function Exams() {
  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: course + chapters
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [chaptersByCourse, setChaptersByCourse] = useState<Record<string, string[]>>({});
  const [selectedChapters, setSelectedChapters] = useState<Record<string, string[]>>({});

  // Step 2: question types & counts
  const [qSelection, setQSelection] = useState<Record<QuestionType, number>>({ qcm: 5, short: 0, long: 0, truefalse: 0 });

  // Step 3: generated
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState<GeneratedExam | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [imageAnswer, setImageAnswer] = useState<File | null>(null);

  // Bank
  const [bank, setBank] = useState<BankExamMeta[]>([]);
  const [bankQuery, setBankQuery] = useState("");
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitFaculty, setSubmitFaculty] = useState("");
  const [submitProgram, setSubmitProgram] = useState("");
  const [submitYear, setSubmitYear] = useState("");
  const [submitFile, setSubmitFile] = useState<File | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listBank().then(setBank).catch(() => setBank([]));
  }, []);

  // Load chapters for selected courses
  useEffect(() => {
    (async () => {
      const missing = selectedCourses.filter((c) => !chaptersByCourse[c]);
      if (missing.length === 0) return;
      const updates: Record<string, string[]> = {};
      for (const c of missing) {
        updates[c] = await listChapters(c);
      }
      setChaptersByCourse((prev) => ({ ...prev, ...updates }));
    })();
  }, [selectedCourses]);

  const spec: ExamSpec | null = useMemo(() => {
    if (selectedCourses.length === 0) return null;
    const items = selectedCourses.map((cid) => ({
      courseId: cid,
      courseName: mockCourses.find((c) => c.id === cid)?.name || cid,
      chapters: selectedChapters[cid] || [],
    }));
    const questions = (Object.keys(qSelection) as QuestionType[])
      .filter((t) => qSelection[t] > 0)
      .map((t) => ({ type: t, count: qSelection[t] }));
    return { items, questions };
  }, [selectedCourses, selectedChapters, qSelection]);

  async function onGenerate() {
    if (!spec || spec.questions.length === 0) return;
    setLoading(true);
    try {
      const ex = await generateExam(spec);
      setExam(ex);
      setStep(3);
      setAnswers({});
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function onGrade() {
    if (!exam) return;
    setGrading(true);
    try {
      // Mock: if a photo is provided, pretend we parsed answers from it
      const res = await gradeExam(exam.id, answers);
      setResult(res);
    } finally {
      setGrading(false);
    }
  }

  async function onSubmitBank(e: React.FormEvent) {
    e.preventDefault();
    if (!submitTitle.trim()) return;
    setSubmitting(true);
    try {
      await submitBankItem({ title: submitTitle, faculty: submitFaculty, program: submitProgram, year: submitYear }, submitFile);
      setSubmitTitle(""); setSubmitFaculty(""); setSubmitProgram(""); setSubmitYear(""); setSubmitFile(undefined);
      const fresh = await listBank(); setBank(fresh);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageMeta title="Mes épreuves et examens" description="Générez des examens et consultez la banque d'épreuves" />
      <PageBreadcrumb pageTitle="Mes épreuves et examens" />

      <section className="space-y-8">
        {/* Wizard header */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 text-sm">
            <span className={`${step===1?"bg-blue-600 text-white":"bg-background text-foreground/70 border border-border"} px-2 py-1 rounded-full`}>Étape 1</span>
            <span className="text-foreground/50">→</span>
            <span className={`${step===2?"bg-blue-600 text-white":"bg-background text-foreground/70 border border-border"} px-2 py-1 rounded-full`}>Étape 2</span>
            <span className="text-foreground/50">→</span>
            <span className={`${step===3?"bg-blue-600 text-white":"bg-background text-foreground/70 border border-border"} px-2 py-1 rounded-full`}>Étape 3</span>
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="p-6 rounded-lg border border-border bg-card space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Sélection des cours et chapitres</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-foreground/70">Cours</p>
                <div className="space-y-2">
                  {mockCourses.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-foreground/90">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(c.id)}
                        onChange={(e) => {
                          setSelectedCourses((prev) => e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id));
                        }}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <p className="text-sm text-foreground/70">Chapitres</p>
                {selectedCourses.length === 0 && (
                  <p className="text-foreground/60 text-sm">Sélectionnez au moins un cours pour voir ses chapitres.</p>
                )}
                {selectedCourses.map((cid) => (
                  <div key={cid} className="p-3 rounded-md border border-border bg-background">
                    <p className="text-sm font-medium text-foreground mb-2">{mockCourses.find(c=>c.id===cid)?.name}</p>
                    <div className="flex flex-wrap gap-3">
                      {(chaptersByCourse[cid]||[]).map((ch) => (
                        <label key={ch} className="flex items-center gap-2 text-foreground/80">
                          <input
                            type="checkbox"
                            checked={(selectedChapters[cid]||[]).includes(ch)}
                            onChange={(e) => {
                              setSelectedChapters((prev) => {
                                const cur = new Set(prev[cid]||[]);
                                if (e.target.checked) cur.add(ch); else cur.delete(ch);
                                return { ...prev, [cid]: Array.from(cur) };
                              });
                            }}
                          />
                          {ch}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded-md bg-foreground text-background disabled:opacity-50" disabled={selectedCourses.length===0} onClick={()=>setStep(2)}>Suivant</button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="p-6 rounded-lg border border-border bg-card space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Types de questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questionTypes.map((qt) => (
                <div key={qt.key} className="p-4 rounded-md border border-border bg-background flex items-center justify-between">
                  <span className="text-foreground">{qt.label}</span>
                  <input
                    type="number" min={0} className="w-24 rounded-md border border-border bg-card text-foreground px-2 py-1"
                    value={qSelection[qt.key]}
                    onChange={(e)=> setQSelection((prev)=> ({...prev, [qt.key]: Math.max(0, Number(e.target.value)||0)}))}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button className="px-4 py-2 rounded-md border border-border text-foreground" onClick={()=>setStep(1)}>Retour</button>
              <button className="px-4 py-2 rounded-md bg-foreground text-background disabled:opacity-50" onClick={onGenerate} disabled={!spec || spec.questions.length===0 || loading}>{loading?"Génération...":"Générer l'examen"}</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && exam && (
          <div className="p-6 rounded-lg border border-border bg-card space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Examen généré</h2>
            <div className="space-y-4">
              {exam.questions.map((q) => (
                <div key={q.id} className="p-4 rounded-md border border-border bg-background">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/60">{q.type.toUpperCase()}</span>
                    <span className="text-xs text-foreground/50">{q.id}</span>
                  </div>
                  <p className="mt-1 text-foreground">{q.prompt}</p>
                  {q.type === "qcm" ? (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {(q.choices||[]).map((c, i) => (
                        <label key={i} className="flex items-center gap-2 text-foreground/90">
                          <input type="radio" name={q.id} value={c} onChange={(e)=> setAnswers((prev)=> ({...prev, [q.id]: e.target.value}))} />
                          {c}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input type="text" className="mt-2 w-full rounded-md border border-border bg-card text-foreground px-2 py-1" placeholder="Votre réponse"
                           onChange={(e)=> setAnswers((prev)=> ({...prev, [q.id]: e.target.value}))} />
                  )}
                </div>
              ))}
            </div>
            {/* Upload d'une photo de réponses (correction IA mock) */}
            <div className="p-4 rounded-md border border-border bg-background">
              <div className="text-sm text-foreground/70 mb-2">Ou téléversez une photo de votre copie pour correction (mock)</div>
              <input type="file" accept="image/*" onChange={(e)=> setImageAnswer(e.target.files?.[0] || null)} className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2" />
              {imageAnswer && (<p className="mt-1 text-xs text-foreground/60">Fichier sélectionné: {imageAnswer.name}</p>)}
            </div>
            <div className="flex justify-between">
              <button className="px-4 py-2 rounded-md border border-border text-foreground" onClick={()=>setStep(2)}>Retour</button>
              <button className="px-4 py-2 rounded-md bg-foreground text-background disabled:opacity-50" onClick={onGrade} disabled={grading}>{grading?"Correction...":"Corriger"}</button>
            </div>
            {result && (
              <div className="mt-4 p-4 rounded-md border border-border bg-background space-y-3">
                <p className="text-foreground">Score: <span className="font-semibold">{result.score}%</span></p>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {result.details.map((d)=> (
                    <div key={d.questionId} className="p-3 rounded border border-border bg-card">
                      <div className="flex items-center justify-between text-sm">
                        <span className={d.correct?"text-emerald-600":"text-red-600"}>{d.correct?"Correct":"Incorrect"}</span>
                        <span className="text-foreground/50">{d.questionId}</span>
                      </div>
                      <div className="mt-1 text-sm text-foreground/80"><span className="font-medium">Votre réponse:</span> {d.userAnswer || "-"}</div>
                      {d.correctAnswer && (
                        <div className="text-sm text-foreground/70"><span className="font-medium">Réponse attendue:</span> {d.correctAnswer}</div>
                      )}
                      {d.explanation && (
                        <div className="text-xs text-foreground/60">{d.explanation}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bank list */}
        <div className="p-6 rounded-lg border border-border bg-card space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Banque d'épreuves</h2>
          <div className="flex items-center gap-2">
            <input value={bankQuery} onChange={(e)=> setBankQuery(e.target.value)} placeholder="Rechercher par titre, filière, programme, année" className="w-full rounded-md border border-border bg-background text-foreground px-3 py-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bank.filter(b => {
              const q = bankQuery.trim().toLowerCase();
              if (!q) return true;
              return [b.title,b.faculty,b.program,b.year].filter(Boolean).some(v=> String(v).toLowerCase().includes(q));
            }).map((b) => (
              <div key={b.id} className="p-3 rounded-md border border-border bg-background">
                <p className="font-medium text-foreground">{b.title}</p>
                <p className="text-sm text-foreground/70">{[b.faculty,b.program,b.year].filter(Boolean).join(" • ")}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Submission form */}
        <form onSubmit={onSubmitBank} className="p-6 rounded-lg border border-border bg-card space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Soumettre une épreuve</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="rounded-md border border-border bg-background text-foreground px-3 py-2" placeholder="Titre" value={submitTitle} onChange={(e)=>setSubmitTitle(e.target.value)} required />
            <input className="rounded-md border border-border bg-background text-foreground px-3 py-2" placeholder="Faculté (optionnel)" value={submitFaculty} onChange={(e)=>setSubmitFaculty(e.target.value)} />
            <input className="rounded-md border border-border bg-background text-foreground px-3 py-2" placeholder="Programme (optionnel)" value={submitProgram} onChange={(e)=>setSubmitProgram(e.target.value)} />
            <input className="rounded-md border border-border bg-background text-foreground px-3 py-2" placeholder="Année (optionnel)" value={submitYear} onChange={(e)=>setSubmitYear(e.target.value)} />
            <input className="rounded-md border border-border bg-background text-foreground px-3 py-2 md:col-span-2" type="file" onChange={(e)=> setSubmitFile(e.target.files?.[0])} />
          </div>
          {(() => {
            const isDuplicate = bank.some(b =>
              b.title.trim().toLowerCase() === submitTitle.trim().toLowerCase() &&
              (!!submitYear ? (b.year||"").toLowerCase() === submitYear.trim().toLowerCase() : true)
            );
            return (
              <div className="flex items-center justify-between">
                <div className="text-xs text-foreground/60">
                  {isDuplicate ? "Un élément similaire existe déjà (même titre/année)." : "Gagnez des crédits en soumettant vos épreuves de qualité."}
                </div>
                <button disabled={!submitTitle || submitting || isDuplicate} className="px-4 py-2 rounded-md bg-foreground text-background disabled:opacity-50" type="submit">{submitting?"Envoi...":"Soumettre"}</button>
              </div>
            );
          })()}
        </form>
      </section>
    </>
  );
}
