import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") as string;

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting mood check-in reminder process...");

    // Get all student profiles with their user emails
    const { data: students, error: studentsError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, full_name")
      .eq("role", "student");

    if (studentsError) {
      console.error("Error fetching students:", studentsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch students" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!students || students.length === 0) {
      console.log("No students found");
      return new Response(
        JSON.stringify({ success: true, message: "No students to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${students.length} students to notify`);

    // Check if users have already done their mood check-in today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const { data: todayCheckins, error: checkinsError } = await supabaseAdmin
      .from("mood_check_ins")
      .select("user_id")
      .gte("created_at", `${today}T00:00:00.000Z`)
      .lt("created_at", `${today}T23:59:59.999Z`);

    if (checkinsError) {
      console.error("Error fetching today's check-ins:", checkinsError);
    }

    const usersWithCheckins = new Set(todayCheckins?.map(checkin => checkin.user_id) || []);
    const studentsNeedingReminder = students.filter(student => !usersWithCheckins.has(student.user_id));

    console.log(`${studentsNeedingReminder.length} students need mood check-in reminders`);

    let emailsSent = 0;
    let emailsSkipped = 0;

    // Send emails to students who haven't checked in today
    for (const student of studentsNeedingReminder) {
      try {
        // Get user email from Auth
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(student.user_id);

        if (userError || !userData?.user?.email) {
          console.error(`Error fetching user ${student.user_id}:`, userError);
          emailsSkipped++;
          continue;
        }

        const userEmail = userData.user.email;
        const userName = student.full_name || "there";

        // Check if we already sent a mood reminder today to avoid spam
        const { data: recentNotifications } = await supabaseAdmin
          .from("email_notifications")
          .select("sent_at")
          .eq("recipient_email", userEmail)
          .eq("type", "mood_reminder")
          .gte("created_at", `${today}T00:00:00.000Z`)
          .limit(1);

        if (recentNotifications && recentNotifications.length > 0) {
          console.log(`Skipping ${userEmail} - already sent mood reminder today`);
          emailsSkipped++;
          continue;
        }

        const subject = "Time for your daily mood check-in - Bridge";
        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto;">
            <h2 style="margin: 0 0 16px; color: #0ea5e9;">Daily Mood Check-in Reminder</h2>
            <p>Hi ${userName},</p>
            <p>It's time for your daily mood check-in! Taking a moment to reflect on your day and emotions is an important part of your wellness journey.</p>
            <p>Your check-in helps you:</p>
            <ul style="margin: 16px 0; padding-left: 20px;">
              <li>Track your emotional patterns over time</li>
              <li>Share insights with your counselor (if you choose to)</li>
              <li>Build self-awareness and mindfulness</li>
            </ul>
            <p style="margin-top: 24px;">
              <a href="https://bridgewellness.app/student/mood-tracking" target="_blank" rel="noopener noreferrer"
                 style="display:inline-block;padding:12px 24px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
                Complete Your Mood Check-in
              </a>
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 32px;">
              This reminder is sent daily at 9:30 PM Eastern. You can adjust your notification preferences in the Bridge app.
            </p>
            <p style="font-size: 12px; color: #888; margin-top: 16px;">
              If you've already completed your check-in today, you can ignore this email.
            </p>
          </div>
        `;

        const { error: emailError } = await resend.emails.send({
          from: "Bridge <notifications@bridgewellness.app>",
          to: [userEmail],
          subject,
          html,
        });

        if (emailError) {
          console.error(`Error sending email to ${userEmail}:`, emailError);
          emailsSkipped++;
          continue;
        }

        // Log the successful notification
        await supabaseAdmin
          .from("email_notifications")
          .insert({
            recipient_id: student.user_id,
            recipient_email: userEmail,
            sender_name: "Bridge System",
            type: "mood_reminder",
            thread_key: `mood_reminder_${student.user_id}`,
            sent_at: new Date().toISOString()
          });

        emailsSent++;
        console.log(`Mood reminder sent to ${userEmail}`);

        // Small delay to avoid overwhelming email service
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing student ${student.user_id}:`, error);
        emailsSkipped++;
      }
    }

    console.log(`Mood reminder process completed: ${emailsSent} sent, ${emailsSkipped} skipped`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent, 
        emailsSkipped,
        totalStudents: students.length,
        studentsNeedingReminder: studentsNeedingReminder.length
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("send-mood-reminder error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});