import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactMail } from "@/lib/server/mail";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.email().max(200),
  subject: z.string().min(4).max(200),
  message: z.string().min(20).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    await sendContactMail(data);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 422 });
    }
    console.error("[contact]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
