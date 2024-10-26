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
        const authClient = await auth.getClient();
        const spreadsheetId = '<1mlUHCWhawGYfx44QgYKN2Frw9ReT_MNbfrfKpF1JBHY>'; // Replace with your Google Sheets ID
        const range = 'Sheet1!A:E'; // Adjust the range based on your sheet structure

        // Append email, first name, last name, subscription ID, and timestamp
        const values = [[email, firstName, lastName, subscriptionId, new Date().toISOString()]];
        const resource = { values };

        await sheets.spreadsheets.values.append({
            auth: authClient,
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource,
        });

        console.log(`Saved subscriber to Google Sheets: ${email}`);
    } catch (err) {
        console.error("Error saving to Google Sheets:", err);
    }
}

// Webhook endpoint to receive PayPal events
/*app.post('/paypal-webhook', (req, res) => {
    const event = req.body;

    console.log("Received PayPal webhook event:", event);

    // Check for subscription activation events
    if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
        const subscriptionId = event.resource.id;
        const email = event.resource.subscriber.email_address;
        const firstName = event.resource.subscriber.name.given_name;
        const lastName = event.resource.subscriber.name.surname;

        console.log(`New subscription activated for: ${firstName} ${lastName} (${email})`);

        // Save subscriber details to Google Sheets
        saveSubscriber(email, firstName, lastName, subscriptionId);
    }

    // Respond to confirm receipt of the event
    res.status(200).send("Webhook received and processed.");
});
*/

app.post('/paypal-webhook', (req, res) => {
    console.log("Webhook endpoint received a request");
    res.status(200).send("Webhook received successfully");
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
