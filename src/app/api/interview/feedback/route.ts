import { NextRequest, NextResponse } from "next/server";

const TOKENLB_KEY = "sk-mOpKxPG24lnBWjrJ2IEw5vfisXSuEqD2EStVYLhznjRTWME4";
const TOKENLB_URL = "https://tokenlb.net/v1/chat/completions";

const SYSTEM_PROMPT = `You are an expert interview coach for Indian campus placements.
Your job is to evaluate the user's answer and provide:
1. A score from 1-10
2. Detailed, specific feedback on what they did well and what they could improve
3. An improved version of their answer

Be specific to the company's interview style. For TCS, expect STAR format answers.
For Accenture, emphasize client-facing skills. For Amazon, emphasize leadership principles.

The user is a college student in India preparing for campus placements. Be encouraging but honest.
Respond in JSON format only.

{
  "score": number,
  "feedback": "detailed feedback text",
  "improvedAnswer": "a better version of their answer"
}`;

export async function POST(request: NextRequest) {
  try {
    const { company, question, answer } = await request.json();

    if (!company || !question || !answer) {
      return NextResponse.json(
        { error: "Missing required fields: company, question, answer" },
        { status: 400 }
      );
    }

    const res = await fetch(TOKENLB_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKENLB_KEY}`,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Company: ${company}\nQuestion: ${question}\nAnswer: ${answer}`,
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("TokenLB error:", errorText);
      return NextResponse.json(
        { error: "AI feedback service unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Invalid response from AI service." },
        { status: 502 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        score: 7,
        feedback: content,
        improvedAnswer: "Could not generate improved answer. Review the feedback above.",
      };
    }

    return NextResponse.json({
      score: parsed.score || 7,
      feedback:
        parsed.feedback ||
        "Good attempt! Try to structure your answer using the STAR method (Situation, Task, Action, Result).",
      improvedAnswer:
        parsed.improvedAnswer ||
        "Consider adding more specific details about your role and the outcome of the situation.",
    });
  } catch (err) {
    console.error("Feedback error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
