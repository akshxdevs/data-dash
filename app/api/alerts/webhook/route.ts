type AlertWebhookBody = {
  url?: string;
  message?: string;
  payload?: Record<string, unknown>;
};

function isValidHttpsUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as AlertWebhookBody;
  const url = body.url?.trim() ?? "";

  if (!url || !isValidHttpsUrl(url)) {
    return Response.json({ ok: false, error: "Webhook URL must be a valid https URL" }, { status: 400 });
  }

  const payload = body.payload ?? {
    text: body.message ?? "Data Dash alert triggered",
    timestamp: new Date().toISOString(),
  };

  try {
    const webhookResponse = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return Response.json({ ok: webhookResponse.ok, status: webhookResponse.status });
  } catch {
    return Response.json({ ok: false, error: "Webhook request failed to reach destination" }, { status: 502 });
  }
}
