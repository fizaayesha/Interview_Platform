import { getRandomInterviewCover } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/firebase/admin"; // or wherever your admin.ts file is located

export async function GET() {
  return Response.json({ success: true, data: "THANK YOU" }, { status: 200 });
}

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      prompt: `Prepare questions for a job interview.
  The job role is ${role}.
  The job experience level is ${level}.
  The job techstack is ${techstack}.
  The focus between behavioural and technial questions is lean towards: ${type}.
  The amount of questions required is ${amount}.
  Please return only the questions, without any additional text.
  The questions are going to be read by a voice assistant, so please make sure they are clear and easy to understand.
  Thank You!
  `,
    });

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: questions
        .split("\n")
        .map((q) => q.trim())
        .filter((q) => q.length > 0),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ success: false, error }, { status: 500 });
  }
}
