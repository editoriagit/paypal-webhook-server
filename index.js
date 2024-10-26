const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const sheets = google.sheets('v4');

const app = express();
app.use(bodyParser.json()); // Parse JSON data from PayPal

const PORT = process.env.PORT || 3000; // Render will assign a port

// Set up Google Sheets API authentication using environment variables
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Function to save subscriber details to Google Sheets
async function saveSubscriber(email, firstName, lastName, subscriptionId) {
    try {
        console.log("Starting saveSubscriber function");

        const authClient = await auth.getClient();
        const spreadsheetId = '1mlUHCWhawGYfx44QgYKN2Frw9ReT_MNbfrfKpF1JBHY'; // Replace with your Google Sheets ID
        const range = 'Sheet1!A:E'; // Adjust the range based on your sheet structure

        // Format the timestamp to a more readable format
        const formattedTimestamp = new Date().toLocaleString('en-GB', {
            timeZone: 'UTC',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });

        // Log the data being sent to Google Sheets
        console.log(`Saving to Google Sheets: ${email}, ${firstName}, ${lastName}, ${subscriptionId}, ${formattedTimestamp}`);

        const values = [[email, firstName, lastName, subscriptionId, formattedTimestamp]];
        const resource = { values };

        const response = await sheets.spreadsheets.values.append({
            auth: authClient,
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource,
        });

        console.log("Google Sheets API Response:", response.data);
        console.log("Finished saveSubscriber function");
    } catch (err) {
        console.error("Error saving to Google Sheets:", err);
    }
}

// Root route for server status check
app.get('/', (req, res) => {
    res.send("The PayPal webhook server is running!");
});

// Full webhook route for PayPal
app.post('/paypal-webhook', (req, res) => {
    const event = req.body;

    console.log("Received PayPal webhook event:", event);

    if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
        const subscriptionId = event.resource.id;
        const email = event.resource.subscriber.email_address;
        const firstName = event.resource.subscriber.name.given_name;
        const lastName = event.resource.subscriber.name.surname;

        console.log(`New subscription activated for: ${firstName} ${lastName} (${email})`);

        // Save subscriber details to Google Sheets
        saveSubscriber(email, firstName, lastName, subscriptionId);
    }

    res.status(200).send("Webhook received and processed.");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
