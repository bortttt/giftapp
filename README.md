# Gift Garden

Gift Garden is a minimalistic companion for families and friends to remember the celebrations that matter most. It keeps birthdays, anniversaries, and other special milestones on a shared calendar, offers customizable reminders, and surfaces gift inspiration that adapts to every loved one's personality.

## Features

- **Profile cards** for everyone you celebrate with likes, dislikes, hobbies, and relationship context.
- **Recurring celebrations** with reminder preferences ranging from same-day to a month in advance.
- **Interactive calendar** that highlights every upcoming birthday or anniversary for the selected month.
- **Reminder center** that surfaces events approaching their notification window.
- **Gift ideas** sourced via the public [DummyJSON](https://dummyjson.com/products) catalog based on each profile's interests and hobbies.
- **Local storage persistence** so your data stays on the device where you saved it.

## Getting started

```bash
npm install  # (optional, no external dependencies required)
npm start
```

The bundled server runs on [http://localhost:3000](http://localhost:3000) and serves the static web application from the `public/` directory. If you already have a preferred static file server, you can host the contents of `public/` directly.

### Gift suggestions

Gift Garden queries the DummyJSON product search endpoint to provide inspiration. In a production environment you can replace the `fetchGiftSuggestions` function inside `public/app.js` with a connector to your preferred gift or retail API.

### Notifications

The app computes reminders client-side whenever you view a profile. To deliver push notifications or emails you can extend the reminder logic (`computeUpcomingReminders`) and integrate it with your preferred messaging provider.

## Tech stack

- Vanilla HTML, CSS, and JavaScript
- Node.js static server (optional convenience for local development)

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.
