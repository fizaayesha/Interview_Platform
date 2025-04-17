import { getRandomInterviewCover } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/firebase/admin";

interface InterviewRequest {
  type: string;
  role: string;
  level: string;
  techstack: string;
  amount: number;
  userid: string;
}

export async function GET() {
  return Response.json({ success: true, data: "THANK YOU" }, { status: 200 });
}

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid }: InterviewRequest = await request.json();

  // Validate input
  if (!role || !type || !level || !techstack || !amount || !userid) {
    return Response.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Generate interview questions from AI model
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      prompt: `Prepare questions for a job interview.
  The job role is ${role}.
  The job experience level is ${level}.
  The job techstack is ${techstack}.
  The focus between behavioural and technical questions is lean towards: ${type}.
  The amount of questions required is ${amount}.
  Please return only the questions, without any additional text.
  The questions are going to be read by a voice assistant, so please make sure they are clear and easy to understand.
  Thank You!
  `,
    });

    // Clean and validate the questions
    const questionList = questions
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    if (questionList.length === 0) {
      return Response.json({ success: false, error: "No valid questions generated" }, { status: 400 });
    }

    // Create the interview object
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: questionList,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    // Save to the database
    await db.collection("interviews").add(interview);
    
    return Response.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return Response.json({ success: false, error: error.message || error }, { status: 500 });
  }
}
