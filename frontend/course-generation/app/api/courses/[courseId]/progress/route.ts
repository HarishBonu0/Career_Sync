import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Mock progress data - no database
    return NextResponse.json({
      success: true,
      courseId: params.courseId,
      overallProgress: 0,
      totalTopics: 0,
      completedTopics: 0,
      topicProgress: [],
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const body = await request.json()
    
    // Mock response - no database save
    return NextResponse.json({
      success: true,
      message: 'Progress tracked',
    })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
