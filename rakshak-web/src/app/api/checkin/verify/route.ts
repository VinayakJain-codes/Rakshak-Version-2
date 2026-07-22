import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getAdminClient } from '@/utils/supabase/admin'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scheduleId, imageBase64 } = await request.json()

    if (!scheduleId || !imageBase64) {
      return NextResponse.json({ error: 'Missing scheduleId or image' }, { status: 400 })
    }

    // 1. SIMULATED PYTHON VERIFICATION SERVICE
    // In a real Phase 6 implementation, we would POST the imageBase64 to a Python FastAPI backend here.
    // We are simulating the "eyes-open, face detected" check.
    const isSuccess = Math.random() > 0.1 // 90% success rate for simulation

    if (!isSuccess) {
      // 6.2 - Return specific actionable reason to the guard
      return NextResponse.json({ 
        success: false, 
        reason: 'No clear face detected or eyes appear closed. Please ensure good lighting and look directly at the camera.' 
      }, { status: 400 })
    }

    // 2. Upload image to Supabase Storage using Admin Client (Service Role)
    const adminClient = getAdminClient()
    const buffer = Buffer.from(imageBase64.split(',')[1], 'base64')
    const fileName = `${user.id}/${scheduleId}-${Date.now()}.jpg`

    const { error: uploadError } = await adminClient.storage
      .from('checkin_photos')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    // 3. Get tenant_id and site_id from the schedule
    const { data: schedule } = await adminClient
      .from('guard_schedules')
      .select('tenant_id, site_id')
      .eq('id', scheduleId)
      .single()

    // 4. Insert into guard_checkins table
    const { error: dbError } = await adminClient
      .from('guard_checkins')
      .insert({
        schedule_id: scheduleId,
        guard_id: user.id,
        tenant_id: schedule?.tenant_id,
        site_id: schedule?.site_id,
        photo_url: fileName,
        verification_result: 'PASS',
        verification_score: 98.5, // simulated score
        model_version: 'v1-simulated'
      })

    if (dbError) {
      console.error('Database insert error:', dbError)
      return NextResponse.json({ error: 'Failed to save check-in record' }, { status: 500 })
    }

    // 5. Mark the schedule as completed
    await adminClient
      .from('guard_schedules')
      .update({ is_completed: true })
      .eq('id', scheduleId)

    return NextResponse.json({ success: true, photo_url: fileName })
  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
