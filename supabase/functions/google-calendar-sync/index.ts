import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleCalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
  }>
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

    const { action, appointmentId, eventData } = await req.json()

    // Get the appointment and user data
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        student:profiles!appointments_student_id_fkey(full_name, user_id),
        counselor:profiles!appointments_counselor_id_fkey(full_name, user_id, google_access_token, google_calendar_id)
      `)
      .eq('id', appointmentId)
      .single()

    if (appointmentError || !appointment) {
      throw new Error('Appointment not found')
    }

    const counselor = appointment.counselor
    if (!counselor.google_access_token) {
      throw new Error('Counselor has not connected Google Calendar')
    }

    // Prepare calendar event data
    const startDateTime = new Date(`${appointment.date}T${appointment.time}`)
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000) // 1 hour duration

    const calendarEvent: GoogleCalendarEvent = {
      summary: `Counseling Session with ${appointment.student.full_name}`,
      description: appointment.reason || 'Counseling appointment',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/New_York' // Default timezone, could be configurable
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/New_York'
      },
      attendees: [
        {
          email: counselor.user_id, // This would need to be the actual email
          displayName: counselor.full_name
        }
      ]
    }

    let result

    switch (action) {
      case 'create':
        result = await createCalendarEvent(counselor.google_access_token, counselor.google_calendar_id || 'primary', calendarEvent)
        
        // Update appointment with Google event ID
        await supabase
          .from('appointments')
          .update({ google_event_id: result.id })
          .eq('id', appointmentId)
        break

      case 'update':
        if (!appointment.google_event_id) {
          throw new Error('No Google event ID found for this appointment')
        }
        result = await updateCalendarEvent(counselor.google_access_token, counselor.google_calendar_id || 'primary', appointment.google_event_id, calendarEvent)
        break

      case 'delete':
        if (!appointment.google_event_id) {
          throw new Error('No Google event ID found for this appointment')
        }
        result = await deleteCalendarEvent(counselor.google_access_token, counselor.google_calendar_id || 'primary', appointment.google_event_id)
        break

      default:
        throw new Error('Invalid action')
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Calendar sync error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function createCalendarEvent(accessToken: string, calendarId: string, event: GoogleCalendarEvent) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to create calendar event: ${response.statusText}`)
  }

  return await response.json()
}

async function updateCalendarEvent(accessToken: string, calendarId: string, eventId: string, event: GoogleCalendarEvent) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to update calendar event: ${response.statusText}`)
  }

  return await response.json()
}

async function deleteCalendarEvent(accessToken: string, calendarId: string, eventId: string) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to delete calendar event: ${response.statusText}`)
  }

  return { deleted: true }
}