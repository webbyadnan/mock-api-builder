import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful API mock generator. The user will ask for some data. You must return ONLY a valid JSON object or array. Do not include markdown formatting like ```json or any conversational text. Just the raw JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "{}";
    
    // Attempt to parse just to ensure it's valid JSON
    try {
      const parsed = JSON.parse(responseContent);
      return NextResponse.json(parsed);
    } catch (e) {
      // If groq returned markdown blocks, try to strip them
      const stripped = responseContent.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      try {
        const parsed = JSON.parse(stripped);
        return NextResponse.json(parsed);
      } catch (err) {
         return NextResponse.json({ error: "Failed to generate valid JSON. Please try again with a more specific prompt." }, { status: 500 });
      }
    }
  } catch (error) {
    console.error("AI Generation Error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
