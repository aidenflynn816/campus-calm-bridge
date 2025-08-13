import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { counselorId, date } = await req.json()

    // Get counselor's Google Calendar info
    const { data: counselor, error: counselorError } = await supabase
      .from('profiles')
      .select('user_id, google_access_token, google_calendar_id, calendar_connected')
      .eq('user_id', counselorId)
      .eq('role', 'counselor')
      .single()

    if (counselorError || !counselor) {
      throw new Error('Counselor not found')
    }

    // Get counselor's availability schedule
    const requestDate = new Date(date)
    const dayOfWeek = requestDate.getDay()

    const { data: availability, error: availabilityError } = await supabase
      .from('counselor_availability')
      .select('*')
      .eq('counselor_id', counselorId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true)

    if (availabilityError) {
      throw new Error('Failed to fetch availability')
    }

    // Get existing appointments for the date
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('time, status')
      .eq('counselor_id', counselorId)
      .eq('date', date)
      .in('status', ['pending', 'confirmed'])

    if (appointmentsError) {
      throw new Error('Failed to fetch appointments')
    }

    let availableSlots: string[] = []

    if (availability && availability.length > 0) {
      // Generate time slots based on counselor's availability
      for (const slot of availability) {
        const slots = generateTimeSlots(slot.start_time, slot.end_time)
        availableSlots.push(...slots)
      }

      // Remove booked slots
      const bookedTimes = appointments?.map(apt => apt.time) || []
      availableSlots = availableSlots.filter(slot => !bookedTimes.includes(slot))

      // If counselor has Google Calendar connected, check for conflicts
      if (counselor.calendar_connected && counselor.google_access_token) {
        try {
          const calendarBusySlots = await getGoogleCalendarBusySlots(
            counselor.google_access_token,
            counselor.google_calendar_id || 'primary',
            date
          )
          
          availableSlots = availableSlots.filter(slot => {
            return !calendarBusySlots.some(busySlot => isTimeConflict(slot, busySlot))
          })
        } catch (calendarError) {
          console.warn('Google Calendar check failed:', calendarError)
          // Continue with basic availability if calendar check fails
        }
      }
    } else {
      // Fallback to default time slots if no availability is set
      availableSlots = [
        '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
      ]
      
      // Remove booked slots
      const bookedTimes = appointments?.map(apt => apt.time) || []
      availableSlots = availableSlots.filter(slot => !bookedTimes.includes(slot))
    }

    return new Response(JSON.stringify({ 
      availableSlots,
      calendarConnected: counselor.calendar_connected 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Availability check error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

function generateTimeSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = []
  const start = new Date(`2000-01-01T${startTime}`)
  const end = new Date(`2000-01-01T${endTime}`)
  
  const current = new Date(start)
  
  while (current < end) {
    slots.push(current.toTimeString().slice(0, 5))
    current.setHours(current.getHours() + 1)
  }
  
  return slots
}

async function getGoogleCalendarBusySlots(accessToken: string, calendarId: string, date: string) {
  const startDate = new Date(date)
  startDate.setHours(0, 0, 0, 0)
  
  const endDate = new Date(date)
  endDate.setHours(23, 59, 59, 999)

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?` +
    `timeMin=${startDate.toISOString()}&` +
    `timeMax=${endDate.toISOString()}&` +
    `singleEvents=true&` +
    `orderBy=startTime`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch calendar events: ${response.statusText}`)
  }

  const data = await response.json()
  
  return data.items?.map((event: any) => ({
    start: new Date(event.start.dateTime || event.start.date).toTimeString().slice(0, 5),
    end: new Date(event.end.dateTime || event.end.date).toTimeString().slice(0, 5)
  })) || []
}

function isTimeConflict(slot: string, busySlot: { start: string, end: string }): boolean {
  return slot >= busySlot.start && slot < busySlot.end
}