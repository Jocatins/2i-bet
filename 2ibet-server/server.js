const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const events = [];

app.post("/events", (req, res) => {
	const { eventName, eventDate, bettingOptions } = req.body;

	if (new Date(eventDate) <= new Date()) {
		return res.status(400).json({ error: "Event date must be in the future." });
	}

	const optionNames = bettingOptions.map((o) => o.name.trim());
	if (new Set(optionNames).size !== optionNames.length) {
		return res
			.status(400)
			.json({ error: "Betting option names must be unique." });
	}

	if (bettingOptions.some((o) => o.odds <= 1.0 || isNaN(parseFloat(o.odds)))) {
		return res.status(400).json({
			error: "Odds must be positive decimal numbers greater than 1.0.",
		});
	}

	events.push({ eventName, eventDate, bettingOptions });
	console.log("Current Events:", events);
	res.status(201).json({ message: "Event created successfully." });
});

app.get("/events", (req, res) => {
	res.json(events);
});

// Endpoint to suspend a betting option
app.patch("/events/:eventName/options/:optionName/suspend", (req, res) => {
	const { eventName, optionName } = req.params;

	// Find the event
	const event = events.find((e) => e.eventName === eventName);
	if (!event) {
		return res.status(404).json({ error: "Event not found." });
	}

	// Find the betting option
	const option = event.bettingOptions.find((o) => o.name === optionName);
	if (!option) {
		return res.status(404).json({ error: "Betting option not found." });
	}

	// Suspend the betting option
	option.suspended = true;
	console.log(
		`Betting option '${optionName}' suspended for event '${eventName}'.`
	);
	res.json({
		message: `Betting option '${optionName}' suspended successfully.`,
	});
});

// DELETE route (server-side only)
app.delete("/events", (req, res) => {
	// Clear the in-memory array
	events.length = 0;
	console.log("All events have been deleted.");
	res.json({ message: "All events have been deleted successfully." });
});

const PORT = 4000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
