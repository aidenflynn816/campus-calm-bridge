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

    // Send privacy-safe email (no message content)
    const subject = `New message from ${senderName} - Bridge`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222">
        <h2 style="margin: 0 0 12px;">You have a new message</h2>
        <p>You received a new message from <strong>${senderName}</strong> in Bridge.</p>
        <p>For your privacy, we don't include message content in email.</p>
        <p style="margin-top: 16px;">Please open the Bridge app to read and reply.</p>
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

    return new Response(
      JSON.stringify({ success: true }),
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