import "server-only";

export async function sendPasswordReset(to: string, link: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const text = [
    "A password reset was requested for your Great Kaspah account.",
    "",
    `Reset your password: ${link}`,
    "",
    "This link expires in one hour. If you did not ask for this, you can ignore this email.",
  ].join("\n");

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") console.info(`Password reset link: ${link}`);
    return { delivered: false as const };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Reset your Great Kaspah password",
      text,
    }),
  });
  if (!response.ok) {
    console.error("Password reset email was not accepted.");
    return { delivered: false as const };
  }
  return { delivered: true as const };
}

export function appUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
