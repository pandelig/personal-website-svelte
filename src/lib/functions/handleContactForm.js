export async function handleContactForm({ request, platform }) {
	const formData = await request.formData();

	// Check for spam
	const spam = formData.get("spam");
	if (spam !== "human") {
		console.error("Spam detected.");
		return {
			success: false,
			message: "Message not sent "
		};
	}

	const name = formData.get("name");
	const email = formData.get("email");
	const message = formData.get("message");
	const pageURLPathname = formData.get("pageURLPathname");

	// Prepare the Mailjet API request payload
	const mailjetData = {
		Messages: [
			{
				From: {
					Email: "pandelig@gmail.com",
					Name: "pandelig.com Website"
				},
				To: [
					{
						Email: "pandelig@gmail.com",
						Name: "pandelig@gmail.com Personal Email"
					}
				],
				Subject: `pandelig.com: New message from ${name}`,
				TextPart: `Name: ${name}\nEmail: ${email}\nPage URL Pathname: ${pageURLPathname}\n\nMessage: ${message}`
			}
		]
	};

	// Fetch Mailjet API keys from Cloudflare Workers secrets
	const MAILJET_API_KEY = platform.env.MAILJET_API_KEY;
	const MAILJET_SECRET_KEY = platform.env.MAILJET_SECRET_KEY;

	try {
		// Send the email via Mailjet API
		const response = await fetch("https://api.mailjet.com/v3.1/send", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
                "Authorization": "Basic " + btoa(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`)
			},
			body: JSON.stringify(mailjetData)
		});

		if (!response.ok) {
			throw new Error(`Mailjet API error: ${response.statusText}`);
		}

		return {
			success: true,
			message: "Message sent! "
		};
	} catch (error) {
		console.error("Error sending email:", error);
		return {
			success: false,
			message: "Message not sent "
		};
	}
}
