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
    const { testEmail } = await req.json();
    
    if (!testEmail) {
      return new Response(
        JSON.stringify({ error: "Test email address is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending test mood reminder to ${testEmail}`);

    const subject = "Test: Daily mood check-in reminder - Bridge";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto;">
        <h2 style="margin: 0 0 16px; color: #0ea5e9;">🧪 Test Email - Daily Mood Check-in Reminder</h2>
        <p>Hi there,</p>
        <p>This is a <strong>test email</strong> for the daily mood check-in reminder system!</p>
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
        <div style="background: #f9f9f9; border-left: 4px solid #0ea5e9; padding: 12px; margin: 24px 0;">
          <p style="margin: 0; font-style: italic; color: #666;">
            <strong>Note:</strong> This is a test email. The actual reminder emails will be sent daily at 9:30 PM Eastern to students who haven't completed their mood check-in for the day.
          </p>
        </div>
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
      to: [testEmail],
      subject,
      html,
    });

    if (emailError) {
      console.error(`Error sending test email:`, emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send test email", details: emailError }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Test email sent successfully to ${testEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Test mood reminder sent to ${testEmail}`,
        testEmail 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("test-mood-reminder error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});