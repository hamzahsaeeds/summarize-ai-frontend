import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  console.log("FROM OUR ROUTE HANDLER:", req.body);

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

  return new Response(JSON.stringify({ transcript: transcriptData }));
}
