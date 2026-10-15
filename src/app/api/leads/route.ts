import { NextResponse } from "next/server";
import { getLeads } from "@/lib/leads";

export async function GET(req: Request) {
  try {
    const leads = await getLeads();
    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (error: unknown) {
    console.error("Error retrieving leads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
