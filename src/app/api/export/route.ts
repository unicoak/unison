import { auth } from "@/auth";
import { EXPORT_TYPES, buildAllTables, buildTable, toCsv, toXlsx, type ExportType } from "@/lib/export";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "TEACHER" && role !== "GOD") return new Response("Forbidden", { status: 403 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "all";
  const format = searchParams.get("format") === "csv" ? "csv" : "xlsx";
  const stamp = new Date().toISOString().slice(0, 10);

  if (type !== "all" && !EXPORT_TYPES.includes(type as ExportType)) {
    return new Response("Unknown export type", { status: 400 });
  }
  if (type === "all" && format === "csv") {
    return new Response("CSV: choose a single table", { status: 400 });
  }

  const headers = (ext: string, contentType: string) => ({
    "Content-Type": contentType,
    "Content-Disposition": `attachment; filename="export-${type}-${stamp}.${ext}"`,
    "Cache-Control": "no-store",
  });

  if (format === "csv") {
    return new Response(toCsv(await buildTable(type as ExportType)), { headers: headers("csv", "text/csv; charset=utf-8") });
  }

  const tables = type === "all" ? await buildAllTables() : [await buildTable(type as ExportType)];
  const body = new Uint8Array(await toXlsx(tables));
  return new Response(body, {
    headers: headers("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
  });
}
