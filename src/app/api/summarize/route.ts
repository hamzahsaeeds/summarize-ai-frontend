import { getAuthToken } from "@/data/services/get-token";
import { getUserMeLoader } from "@/data/services/get-user-me-loader";
import { NextRequest } from "next/server";

const TEMPLATE = `
INSTRUCTIONS: 
  For this {text} complete the following steps.
  Generate the title based on the content provided
  Summarize the following content and include 5 key topics, writing in first person using normal tone of voice.
  
  Write a youtube video description
    - Include heading and sections.  
    - Incorporate keywords and key takeaways

  Generate bulleted list of key points and benefits

  Return possible and best recommended key words
`;

async function generateSummaryHuggingFace(content: string, template: string) {
  const API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"; // Replace with desired model
  const API_KEY = process.env.HUGGINGFACE_API_KEY;

  if (!API_KEY) {
    throw new Error("Hugging Face API key is not set.");
  }

  const prompt = template.replace("{text}", content);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result || !result.length) {
      throw new Error("No summary received from Hugging Face API.");
    }

    return result[0].summary_text || result[0]; // Adjust based on API response
  } catch (error) {
    console.error("Error with Hugging Face API:", error);
    throw new Error("Failed to generate summary using Hugging Face API.");
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserMeLoader();
  const token = await getAuthToken();

  if (!user.ok || !token) {
    return new Response(
      JSON.stringify({ data: null, error: "Not authenticated" }),
      { status: 401 }
    );
  }

  if (user.data.credits < 1) {
    return new Response(
      JSON.stringify({
        data: null,
        error: "Insufficient credits",
      }),
      { status: 402 }
    );
  }

  const body = await req.json();
  const videoId = body.videoId;
  const url = `https://deserving-harmony-9f5ca04daf.strapiapp.com/utilai/yt-transcript/${videoId}`;

  let transcriptData;

  try {
    const transcript = await fetch(url);
    transcriptData = await transcript.text();
  } catch (error) {
    console.error("Error processing request:", error);
    if (error instanceof Error)
      return new Response(JSON.stringify({ error: error.message }));
    return new Response(JSON.stringify({ error: "Unknown error" }));
  }

  let summary: Awaited<ReturnType<typeof generateSummaryHuggingFace>>;

  try {
    summary = await generateSummaryHuggingFace(transcriptData, TEMPLATE);
    return new Response(JSON.stringify({ data: summary, error: null }));
  } catch (error) {
    console.error("Error processing request:", error);
    if (error instanceof Error)
      return new Response(JSON.stringify({ error: error.message }));
    return new Response(
      JSON.stringify({ error: "Error generating summary." })
    );
  }
}