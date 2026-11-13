import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const {
    assessmentId,
    courseCode,
    courseTitle,
    sourceText,       // lecturer-pasted text (optional)
    noteIds,          // array of lecture_note ids to pull from DB (optional)
    mcqCount,
    tfCount,
    difficultyHint,   // "easy" | "medium" | "hard"
  } = await req.json();

  // Build source content
  let contextText = sourceText ?? "";

  if (noteIds?.length > 0) {
    const { data: notes } = await supabase
      .from("lecture_notes")
      .select("title, content")
      .in("id", noteIds);

    if (notes) {
      // Strip HTML tags for cleaner AI input
      const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      contextText += "\n\n" + notes.map((n: any) => `Topic: ${n.title}\n${stripHtml(n.content)}`).join("\n\n---\n\n");
    }
  }

  if (!contextText.trim()) {
    return NextResponse.json({ error: "No source content provided" }, { status: 400 });
  }

  const totalQuestions = (mcqCount ?? 0) + (tfCount ?? 0);
  const difficulty = difficultyHint ?? "medium";

  const prompt = `You are an experienced Nigerian polytechnic lecturer creating exam questions for JSPICT (Jos State Polytechnic ICT Department).

Course: ${courseCode} – ${courseTitle}
Difficulty: ${difficulty}

SOURCE MATERIAL:
${contextText.slice(0, 8000)}

TASK: Generate exactly ${mcqCount ?? 0} Multiple Choice Questions (MCQ) and ${tfCount ?? 0} True/False questions.

RULES:
- Write in clear, simple English appropriate for Nigerian ND/HND students
- MCQ must have exactly 4 options labeled A, B, C, D
- Each question must test understanding, not just memorization
- Vary question styles (definition, application, comparison, example-based)
- For True/False, make statements that are clearly true or clearly false
- Do NOT repeat questions
- Do NOT include "All of the above" or "None of the above" as options
- Use Nigerian context in examples where appropriate (banks, markets, phones, JAMB etc.)

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown, no explanation:
{
  "questions": [
    {
      "question_text": "...",
      "question_type": "mcq",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": "A",
      "explanation": "Brief reason why this is correct"
    },
    {
      "question_text": "True or False: ...",
      "question_type": "truefalse",
      "options": ["True", "False"],
      "correct_answer": "True",
      "explanation": "Brief reason"
    }
  ]
}`;

  try {
    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini error:", err);
      return NextResponse.json({ error: "AI generation failed", detail: err }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Parse JSON from response (strip any markdown fences)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "AI returned invalid format", raw: rawText }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const questions = parsed.questions ?? [];

    // Save to assessment_questions table
    if (assessmentId && questions.length > 0) {
      // Delete existing AI questions first (keep manual ones)
      await supabase
        .from("assessment_questions")
        .delete()
        .eq("assessment_id", assessmentId)
        .eq("source", "ai");

      const rows = questions.map((q: any, i: number) => ({
        assessment_id: assessmentId,
        question_number: i + 1,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        correct_answer: q.correct_answer,
        marks: 1,
        source: "ai",
        approved: false,
      }));

      await supabase.from("assessment_questions").insert(rows);
    }

    return NextResponse.json({ questions, count: questions.length });

  } catch (err: any) {
    console.error("Generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
