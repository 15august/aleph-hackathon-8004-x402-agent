const BACKEND_URL = "https://ai-agent-property-production.up.railway.app";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const backendResponse = await fetch(`${BACKEND_URL}/api/search/${jobId}`);

  if (!backendResponse.ok) {
    return Response.json(
      { error: "Job not found" },
      { status: backendResponse.status }
    );
  }

  const data = await backendResponse.json();
  return Response.json(data);
}