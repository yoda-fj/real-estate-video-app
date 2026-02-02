import { NextRequest, NextResponse } from 'next/server';
import { jobQueue } from '@/lib/jobQueue';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;

  const job = jobQueue.get(jobId);

  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    jobId,
    ...job,
  });
}
