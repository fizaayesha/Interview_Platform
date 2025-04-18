"use client";
import { feedbackSchema } from "@/constants";
import { db } from "@/firebase/admin";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();
  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getLatestInterview(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();
  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interview").doc(id).get();
  return interview.data() as Interview | null;
}

export async function createFeedback(params:CreateFeedbackParams){
  const {interviewId, userId, transript} = params;
  try{
    const formattedTranscript = transcript.map((sentence:{role: string; content:string})=>(
      `- ${sentence.role}: ${sentence.content}\n`
    )).join('');
    const {object:{totalScore, categoryScores, strengths,areasForImprovement, finalAssessment}} = await generateObject({
      model: google('gemini-2.0-flash-001',{
        structuredOutputs:false,
      }),
      schema: feedbackSchema,
      prompt:`You are an AI interviewer. I will provide the transcript of a technical interview between a candidate and an interviewer. Your task is to assess the candidate's performance based on their responses.

Please provide the following in your feedback:
1. **Overall Performance Summary**
2. **Strengths**
3. **Areas of Improvement**
4. **Communication Skills**
5. **Final Verdict** – (Yes/No)

Transcript:
"""
${formattedTranscript}
"""`,
      system: 'You are a professional interviewer.'
    });
    const feedback = await db.collection('feedback').add({
      interviewId, userId, totalScore, categoryScores, strengths, areasForImprovement, finalAssessment, createdAt: new Date().toISOString()
    })
    return {
      success: true,
      feedbackId: feedback.id  
    }
  } catch(e){
    console.error('Error saving feedback',e);
    return {success: false}
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId} = params;
  const feedback = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();
  if (feedback.empty) return null;
  const feedbackDoc = feedback.docs[0];
  return {
    id: feedbackDoc.id,
    ...feedbackDoc.data(),
  } as Feedback;
}
