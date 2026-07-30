# Beyblade QOTD Bot

## Deploy to Render

1. Push this repository to GitHub.
2. Create a new Web Service on Render and connect the GitHub repo.
3. Use the following settings:
   - Build Command: npm install
   - Start Command: npm start
4. Add the environment variables below.
5. Deploy the service.
6. After the bot is online, run the command deployment once:
   - npm run deploy

## Environment Variables

- DISCORD_TOKEN
- CLIENT_ID
- GUILD_ID (optional for global commands)
- QOTD_POST_TIME (example: 09:00)
- QOTD_TIMEZONE (example: Europe/London)
- DB_PATH (optional; leave unset unless you want to override the storage location)
