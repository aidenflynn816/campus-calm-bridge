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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Processing email notification batches...");

    // Fetch unsent notifications
    const { data: notifications, error: fetchError } = await supabaseAdmin
      .from("email_notifications")
      .select("*")
      .is("sent_at", null)
      .order("recipient_email", { ascending: true })
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Error fetching notifications:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch notifications" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    if (!notifications || notifications.length === 0) {
      console.log("No notifications to process");
      return new Response(JSON.stringify({ processed: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Group by recipient email
    const batches = new Map<string, typeof notifications>();
    for (const notification of notifications) {
      const email = notification.recipient_email;
      if (!batches.has(email)) {
        batches.set(email, []);
      }
      batches.get(email)!.push(notification);
    }

    let processedCount = 0;
    const processedIds: string[] = [];

    // Process each batch
    for (const [recipientEmail, batch] of batches) {
      try {
        // Group by thread/sender for better email organization
        const threadGroups = new Map<string, typeof batch>();
        for (const notif of batch) {
          const key = notif.thread_key || notif.sender_name || "unknown";
          if (!threadGroups.has(key)) {
            threadGroups.set(key, []);
          }
          threadGroups.get(key)!.push(notif);
        }

        // Build email content
        let subject: string;
        let messagesList = "";

        if (batch.length === 1) {
          subject = `New message from ${batch[0].sender_name} - Bridge`;
          messagesList = `<p>You received a new message from <strong>${batch[0].sender_name}</strong>.</p>`;
        } else {
          const uniqueSenders = new Set(batch.map(n => n.sender_name));
          if (uniqueSenders.size === 1) {
            subject = `${batch.length} new messages from ${batch[0].sender_name} - Bridge`;
            messagesList = `<p>You received <strong>${batch.length} new messages</strong> from <strong>${batch[0].sender_name}</strong>.</p>`;
          } else {
            subject = `${batch.length} new messages - Bridge`;
            messagesList = "<ul style='margin: 8px 0; padding-left: 20px;'>";
            for (const [threadKey, threadNotifs] of threadGroups) {
              const senderName = threadNotifs[0].sender_name || "Bridge user";
              if (threadNotifs.length === 1) {
                messagesList += `<li>1 message from <strong>${senderName}</strong></li>`;
              } else {
                messagesList += `<li>${threadNotifs.length} messages from <strong>${senderName}</strong></li>`;
              }
            }
            messagesList += "</ul>";
          }
        }

        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222">
            <h2 style="margin: 0 0 12px;">You have new messages</h2>
            ${messagesList}
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

        // Send batched email
        const { error: emailError } = await resend.emails.send({
          from: "Bridge <notifications@bridgewellness.app>",
          to: [recipientEmail],
          subject,
          html,
        });

        if (emailError) {
          console.error(`Error sending email to ${recipientEmail}:`, emailError);
          continue; // Skip marking as sent for this batch
        }

        // Mark notifications as sent
        const batchIds = batch.map(n => n.id);
        processedIds.push(...batchIds);
        processedCount += batch.length;

        console.log(`Sent batched email to ${recipientEmail} with ${batch.length} notifications`);

      } catch (batchError) {
        console.error(`Error processing batch for ${recipientEmail}:`, batchError);
      }
    }

    // Update sent_at for successfully processed notifications
    if (processedIds.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from("email_notifications")
        .update({ sent_at: new Date().toISOString() })
        .in("id", processedIds);

      if (updateError) {
        console.error("Error marking notifications as sent:", updateError);
      }
    }

    console.log(`Successfully processed ${processedCount} notifications`);

    return new Response(JSON.stringify({ 
      processed: processedCount,
      batches: batches.size
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    console.error("process-email-notifications error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});