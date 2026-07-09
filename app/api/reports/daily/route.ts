import { NextResponse } from "next/server";
import { requireOwnerAndMonth } from "@/lib/reports/auth";
import { buildDailyMonthlyWorkbook } from "@/lib/reports/monthly";

export async function GET(request: Request) {
  const check = await requireOwnerAndMonth(request);
  if ("error" in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const workbook = await buildDailyMonthlyWorkbook(check.month);
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="reporte-diario-${check.month}.xlsx"`,
    },
  });
}
