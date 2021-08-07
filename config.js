import dotenv from 'dotenv';

// Load the stored variables from `.env` file into process.env
dotenv.config();

// Default is 60 minutes for the wait timeout
const HOUR_IN_MILLESECONDS = 3600000;

export default {
    discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
    discordWebhookID: process.env.DISCORD_WEBHOOK_ID || '',
    discordWebhookToken: process.env.DISCORD_WEBHOOK_TOKEN || '',
    waitTimeout: process.env.WAIT_TIMEOUT || HOUR_IN_MILLESECONDS,
    areaIds: process.env.AREA_IDS || '1577', // Defaults to `1577` (Volda)
    timeLocale: process.env.TIME_LOCALE || 'en',
    timeFormat: process.env.TIME_FORMAT || 'dddd D MMMM YYYY HH:mm'
};
