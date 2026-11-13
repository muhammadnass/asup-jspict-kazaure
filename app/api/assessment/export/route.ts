import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// NBTE grading scale
function getGrade(pct: number) {
  if (pct >= 70) return { grade: "A", remark: "Pass" };
  if (pct >= 60) return { grade: "B", remark: "Pass" };
  if (pct >= 50) return { grade: "C", remark: "Pass" };
  if (pct >= 45) return { grade: "D", remark: "Pass" };
  return { grade: "F", remark: "Fail" };
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const assessmentId = searchParams.get("id");
  const format = searchParams.get("format") ?? "excel"; // 'excel' | 'pdf'

  if (!assessmentId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Fetch assessment
  const { data: assessment } = await supabase
    .from("assessments")
    .select("*, members(full_name, title, department)")
    .eq("id", assessmentId)
    .single();

  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Fetch all submitted attempts with student info
  const { data: attempts } = await supabase
    .from("assessment_attempts")
    .select("*, students(full_name, reg_number, department)")
    .eq("assessment_id", assessmentId)
    .in("status", ["submitted", "timed_out"])
    .order("score", { ascending: false });

  const rows = (attempts ?? []).map((a: any, i: number) => {
    const student = a.students as any;
    const pct = a.percentage ?? 0;
    const weighted = parseFloat(((pct / 100) * assessment.weight_pct).toFixed(2));
    const { grade, remark } = getGrade(pct);
    return {
      sn: i + 1,
      full_name: student?.full_name ?? "—",
      reg_number: student?.reg_number ?? "—",
      department: student?.department ?? assessment.department,
      score: `${a.score ?? 0}/${a.total_marks ?? assessment.total_marks}`,
      percentage: `${pct}%`,
      weighted: `${weighted}/${assessment.weight_pct}`,
      grade,
      remark,
      tab_switches: a.tab_switches ?? 0,
      submitted_at: a.submitted_at ? new Date(a.submitted_at).toLocaleString("en-NG") : "—",
    };
  });

  const passCount = rows.filter(r => r.remark === "Pass").length;
  const avgPct = rows.length > 0
    ? (rows.reduce((s, r) => s + parseFloat(r.percentage), 0) / rows.length).toFixed(1)
    : "0.0";

  const lecturer = assessment.members as any;
  const lecturerName = `${lecturer?.title ? lecturer.title + " " : ""}${lecturer?.full_name ?? "—"}`;
  const typeLabel = assessment.type === "ca" ? "Continuous Assessment (CA)" : "Examination";

  if (format === "excel") {
    // Build CSV (opens in Excel perfectly)
    const lines: string[] = [];
    lines.push(`"JOS STATE POLYTECHNIC ICT DEPARTMENT — ${typeLabel.toUpperCase()} RESULT SHEET"`);
    lines.push(`""`);
    lines.push(`"Course:","${assessment.course_code} – ${assessment.course_title}"`);
    lines.push(`"Assessment Title:","${assessment.title}"`);
    lines.push(`"Type:","${typeLabel} (${assessment.weight_pct}%)"`);
    lines.push(`"Academic Year:","${assessment.academic_year ?? "—"}"`);
    lines.push(`"Semester:","${assessment.semester ?? "—"}"`);
    lines.push(`"Department:","${assessment.department}"`);
    lines.push(`"Lecturer:","${lecturerName}"`);
    lines.push(`"Date Generated:","${new Date().toLocaleDateString("en-NG")}"`);
    lines.push(`""`);
    lines.push(`"S/N","Student Name","Registration No.","Department","Score","Percentage","Weighted Score (/${assessment.weight_pct})","Grade","Remark","Tab Switches","Submitted At"`);

    rows.forEach(r => {
      lines.push(`"${r.sn}","${r.full_name}","${r.reg_number}","${r.department}","${r.score}","${r.percentage}","${r.weighted}","${r.grade}","${r.remark}","${r.tab_switches}","${r.submitted_at}"`);
    });

    lines.push(`""`);
    lines.push(`"Total Students Sat:","${rows.length}"`);
    lines.push(`"Pass:","${passCount}"`);
    lines.push(`"Fail:","${rows.length - passCount}"`);
    lines.push(`"Pass Rate:","${rows.length > 0 ? ((passCount / rows.length) * 100).toFixed(1) : 0}%"`);
    lines.push(`"Class Average:","${avgPct}%"`);
    lines.push(`""`);
    lines.push(`"Grading Scale:","A = 70-100% | B = 60-69% | C = 50-59% | D = 45-49% | F = Below 45%"`);
    lines.push(`""`);
    lines.push(`"Lecturer Signature:","_______________________","Date:","_____________"`);

    const csv = lines.join("\n");
    const filename = `JSPICT_${assessment.course_code}_${assessment.type.toUpperCase()}_Results.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // PDF: return structured HTML for printing (browser prints to PDF)
  if (format === "pdf") {
    const tableRows = rows.map(r => `
      <tr class="${r.remark === 'Fail' ? 'fail' : ''}">
        <td>${r.sn}</td>
        <td>${r.full_name}</td>
        <td>${r.reg_number}</td>
        <td>${r.score}</td>
        <td>${r.percentage}</td>
        <td>${r.weighted}</td>
        <td><strong>${r.grade}</strong></td>
        <td class="${r.remark === 'Pass' ? 'pass' : 'fail-text'}">${r.remark}</td>
        ${r.tab_switches > 2 ? `<td class="flag">⚠️ ${r.tab_switches}</td>` : `<td>${r.tab_switches}</td>`}
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>JSPICT Result Sheet</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Times New Roman', serif; font-size: 12px; color: #000; padding: 20px; }
  .header { text-align: center; margin-bottom: 20px; border-bottom: 3px double #000; padding-bottom: 12px; }
  .header h1 { font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
  .header h2 { font-size: 13px; font-weight: normal; margin-top: 4px; }
  .header h3 { font-size: 14px; font-weight: bold; margin-top: 8px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; margin: 14px 0; font-size: 11px; }
  .meta-item { display: flex; gap: 6px; }
  .meta-label { font-weight: bold; white-space: nowrap; }
  table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 11px; }
  th { background: #00214D; color: white; padding: 7px 6px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
  td { padding: 6px; border-bottom: 1px solid #ddd; }
  tr:nth-child(even) td { background: #f9f9f9; }
  tr.fail td { background: #fff5f5; }
  .pass { color: #166534; font-weight: bold; }
  .fail-text { color: #dc2626; font-weight: bold; }
  .flag { color: #dc2626; }
  .summary { margin-top: 20px; border: 1px solid #000; padding: 10px 14px; display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; font-size: 11px; }
  .summary-item { text-align: center; }
  .summary-value { font-size: 18px; font-weight: bold; color: #00214D; }
  .grading { margin-top: 12px; font-size: 10px; color: #555; }
  .signatures { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .sig-line { border-top: 1px solid #000; padding-top: 4px; font-size: 10px; }
  @media print {
    body { padding: 10px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <h1>Jos State Polytechnic</h1>
    <h2>Department of ICT — ${assessment.department}</h2>
    <h3>${typeLabel.toUpperCase()} RESULT SHEET</h3>
  </div>

  <div class="meta">
    <div class="meta-item"><span class="meta-label">Course:</span>${assessment.course_code} – ${assessment.course_title}</div>
    <div class="meta-item"><span class="meta-label">Academic Year:</span>${assessment.academic_year ?? "—"}</div>
    <div class="meta-item"><span class="meta-label">Assessment:</span>${assessment.title}</div>
    <div class="meta-item"><span class="meta-label">Semester:</span>${assessment.semester ?? "—"}</div>
    <div class="meta-item"><span class="meta-label">Type:</span>${typeLabel} (${assessment.weight_pct}% weight)</div>
    <div class="meta-item"><span class="meta-label">Date Generated:</span>${new Date().toLocaleDateString("en-NG")}</div>
    <div class="meta-item"><span class="meta-label">Lecturer:</span>${lecturerName}</div>
    <div class="meta-item"><span class="meta-label">Total Questions:</span>${assessment.total_marks}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>S/N</th>
        <th>Student Name</th>
        <th>Reg. No.</th>
        <th>Score</th>
        <th>%</th>
        <th>Weighted (/${assessment.weight_pct})</th>
        <th>Grade</th>
        <th>Remark</th>
        <th>Flags</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div class="summary">
    <div class="summary-item"><div class="summary-value">${rows.length}</div><div>Students Sat</div></div>
    <div class="summary-item"><div class="summary-value">${passCount}</div><div>Passed</div></div>
    <div class="summary-item"><div class="summary-value">${rows.length - passCount}</div><div>Failed</div></div>
    <div class="summary-item"><div class="summary-value">${avgPct}%</div><div>Class Average</div></div>
  </div>

  <div class="grading">
    <strong>Grading Scale (NBTE):</strong> A = 70–100% (Distinction) &nbsp;|&nbsp; B = 60–69% (Credit) &nbsp;|&nbsp; C = 50–59% (Merit) &nbsp;|&nbsp; D = 45–49% (Pass) &nbsp;|&nbsp; F = Below 45% (Fail)<br>
    ⚠️ Flag column shows number of tab switches detected during assessment (potential malpractice indicator).
  </div>

  <div class="signatures">
    <div class="sig-line"><strong>Lecturer:</strong> ${lecturerName}<br><br>Signature: ___________________<br>Date: ___________________</div>
    <div class="sig-line"><strong>HOD:</strong><br><br>Signature: ___________________<br>Date: ___________________</div>
    <div class="sig-line"><strong>Examiner:</strong><br><br>Signature: ___________________<br>Date: ___________________</div>
  </div>

  <button class="no-print" onclick="window.print()" style="margin-top:20px;padding:10px 24px;background:#00214D;color:white;border:none;font-size:14px;cursor:pointer;border-radius:6px;">
    🖨️ Print / Save as PDF
  </button>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return NextResponse.json({ error: "Invalid format" }, { status: 400 });
}
