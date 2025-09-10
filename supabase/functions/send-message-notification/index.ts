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

interface NotifyRequest {
  sender_id: string;
  recipient_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sender_id, recipient_id } = (await req.json()) as NotifyRequest;

    if (!sender_id || !recipient_id) {
      return new Response(
        JSON.stringify({ error: "sender_id and recipient_id are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch sender name from profiles
    const { data: senderProfile, error: senderProfileError } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("user_id", sender_id)
      .maybeSingle();

    if (senderProfileError) {
      console.error("Error fetching sender profile:", senderProfileError);
    }

    const senderName = senderProfile?.full_name || "Bridge user";

    // Fetch recipient email from Auth
    const { data: recipientUserData, error: recipientUserError } = await supabaseAdmin.auth.admin.getUserById(
      recipient_id
    );

    if (recipientUserError || !recipientUserData?.user?.email) {
      console.error("Error fetching recipient user:", recipientUserError);
      return new Response(
        JSON.stringify({ error: "Recipient email not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const recipientEmail = recipientUserData.user.email as string;

    // Check if we sent an email to this recipient recently (within 3 minutes)
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    const { data: recentEmails, error: recentEmailsError } = await supabaseAdmin
      .from("email_notifications")
      .select("sent_at")
      .eq("recipient_email", recipientEmail)
      .eq("type", "message")
      .gte("sent_at", threeMinutesAgo)
      .order("sent_at", { ascending: false })
      .limit(1);

    if (recentEmailsError) {
      console.error("Error checking recent emails:", recentEmailsError);
    }

    // If we found a recent email, skip sending and just log the batched notification
    if (recentEmails && recentEmails.length > 0) {
      console.log(`Batching email notification for ${recipientEmail} - last sent: ${recentEmails[0].sent_at}`);
      
      // Log the notification without sending email
      await supabaseAdmin
        .from("email_notifications")
        .insert({
          recipient_id,
          recipient_email: recipientEmail,
          sender_name: senderName,
          type: "message",
          thread_key: `${sender_id}-${recipient_id}`,
          sent_at: null // Mark as not sent
        });

      return new Response(
        JSON.stringify({ success: true, batched: true, message: "Email batched due to recent notification" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send privacy-safe email (no message content)
    const subject = `New message from ${senderName} - Bridge`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222">
        <h2 style="margin: 0 0 12px;">You have a new message</h2>
        <p>You received a new message from <strong>${senderName}</strong> in Bridge.</p>
        <p>For your privacy, we don't include message content in email.</p>
        <p style="margin-top: 16px;">Please open the Bridge app to read and reply.</p>
        <p>
          <a href="https://bridgewellness.app" target="_blank" rel="noopener noreferrer"
             style="display:inline-block;padding:10px 16px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:6px;margin-top:8px;">
            Open Bridge
          </a>
        </p>
        <p style="font-size: 12px; color: #666; margin-top: 24px;">If you weren't expecting this, you can ignore this email.</p>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from: "Bridge <notifications@bridgewellness.app>",
      to: [recipientEmail],
      subject,
      html,
    });

    if (emailError) {
      console.error("Error sending email via Resend:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log the successful email notification
    const currentTime = new Date().toISOString();
    await supabaseAdmin
      .from("email_notifications")
      .insert({
        recipient_id,
        recipient_email: recipientEmail,
        sender_name: senderName,
        type: "message",
        thread_key: `${sender_id}-${recipient_id}`,
        sent_at: currentTime
      });

    console.log(`Email sent successfully to ${recipientEmail} from ${senderName}`);

    return new Response(
      JSON.stringify({ success: true, sent: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("send-message-notification error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});