import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<{ result?: string; error?: string }>> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("voidnap_session");

  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ZHIPU_API_KEY not configured" }, { status: 500 });
  }

  try {
    console.log("[AI Test] Testing Zhipu API...");
    console.log("[AI Test] API Key format:", apiKey.includes(".") ? "Has dot separator" : "No dot separator");

    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "glm-4-flash",
        messages: [{ role: "user", content: "你好，请简单回复：测试成功" }],
        max_tokens: 50,
      }),
    });

    console.log("[AI Test] Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI Test] Error response:", errorText);
      return NextResponse.json({ error: `API Error: ${response.status} - ${errorText}` }, { status: 500 });
    }

    const data = await response.json();
    console.log("[AI Test] Response data:", JSON.stringify(data));

    const content = data.choices?.[0]?.message?.content || "No content";
    return NextResponse.json({ result: content });
  } catch (error) {
    console.error("[AI Test] Exception:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
