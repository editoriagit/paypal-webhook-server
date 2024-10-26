
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // Parse JSON data from PayPal

const PORT = process.env.PORT || 3000; // Render will assign a port

// Webhook endpoint to receive PayPal events
app.post('/paypal-webhook', (req, res) => {
    const event = req.body;

    console.log("Received PayPal webhook event:", event); // Log for debugging

    // Check for subscription activation events
    if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
        const subscriptionId = event.resource.id;
        const email = event.resource.subscriber.email_address;

        console.log(`New subscription activated for: ${email}`);

        // Optional: Save subscriber details to a database
        saveSubscriber(email, subscriptionId);
    }

    // Respond to confirm receipt of the event
    res.status(200).send("Webhook received and processed.");
});

// Placeholder function to save subscriber details
function saveSubscriber(email, subscriptionId) {
    console.log(`Saving subscriber to database: Email: ${email}, Subscription ID: ${subscriptionId}`);
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
