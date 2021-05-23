const Discord = require('discord.js');
const got = require('got');
const dayjs = require('dayjs');
const advancedFormat = require('dayjs/plugin/advancedFormat');
const {httpHeader} = require('./util');
const config = require('./config');

const {discordWebhookUrl, discordWebhookID, discordWebhookToken} = config;

// Load dayjs locale if it's not the default `en` (English)
if (config.timeLocale !== 'en') {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    require(`dayjs/locale/${config.timeLocale}`);
}

// Use extended formatting
dayjs.extend(advancedFormat);

// Set the locale for the deadline
dayjs.locale(config.timeLocale);

// Check if either Discord Webhook URL or Discord Webhook ID and token is provided
if (!(discordWebhookUrl || (discordWebhookID !== '' && discordWebhookToken !== ''))) {
    throw new Error('You need to specify either Discord Webhook URL or both Discord Webhook ID and token!');
}

// Retrieve the ID and token from the Webhook URL
// This is from the Discord Webhook URL format:
// 'https://discord.com/api/webhooks/<ID_HERE>/<TOKEN_HERE>'
// If the Webhook URL is empty get the values from the provided ID and token
const [webhookID, webhookToken] = discordWebhookUrl ? discordWebhookUrl.split('/').splice(5, 2) : [discordWebhookID, discordWebhookToken];
const discordHookClient = new Discord.WebhookClient(webhookID, webhookToken);

// Wait for a specified time (milliseconds)
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const areaIds = config.areaIds.split(',').map(areaId => areaId.trim());
const areas = areaIds.map(areaId => {
    // Area ID should be a string consisting of 4 digits
    if (areaId.length !== 4 || !/\d{4}/g.exec(areaId)) {
        throw new Error('`AREA_IDS` needs to be a comma separated list specified by four digit number(s)');
    }

    const countyId = areaId.substring(0, 2);

    return {
        casesUrl: `https://redutv-api.vg.no/corona/v1/areas/municipalities/${areaId}/key`,
        visualCasesUrl: `https://www.vg.no/spesial/2020/corona/fylker/${countyId}/kommuner/${areaId}`,
        lastestUpdate: '',
        previousCases: 0,
        firstIncidenceCheck: true
    };
});

const trends = {
    lessThanMinLimit: 'No change',
    flat: 'Flat',
    increasing: 'Increasing'
};

function getChangeLast14Days(timeSeries) {
    const last14Days = timeSeries.slice(-14);

    return last14Days.reduce((previous, current) => previous + current.value, 0);
}

async function checkAreaForNewIncidence(area) {
    const response = await got(area.casesUrl, {headers: httpHeader}).json();
    const areaMetas = response.meta;

    let {
        lastestUpdate,
        previousCases,
        firstIncidenceCheck
    } = area;

    if (areaMetas.updated === lastestUpdate) {
        return area;
    }

    lastestUpdate = areaMetas.updated;
    const currentCases = areaMetas.total.cases;

    // If the first iteration, run an initial check of number of cases
    if (firstIncidenceCheck) {
        previousCases = currentCases;
        firstIncidenceCheck = false;
    } else if (previousCases < currentCases) {
        const difference = currentCases - previousCases;
        previousCases = currentCases;
        const locationName = areaMetas.area.name;
        const trend = response.items[2].latest;
        const changeLast14Days = getChangeLast14Days(response.items[1].data);
        console.log(` - Found new incidence(s) for ${locationName}`);

        const embedMessage = new Discord.MessageEmbed()
            .setColor('#b5312f')
            .setTitle(`🤒⚠ **New COVID-19 incidence${difference > 1 ? 's' : ''}** ⚠🤒`)
            .addField('Location', locationName)
            .addField('Updated', dayjs(lastestUpdate).format(config.timeFormat))
            .addField('New', difference)
            .addField('Total', currentCases)
            .addField('Trend', `${trends[trend.key]}`)
            .addField('Change last 14 days', `+${changeLast14Days}`)
            .addField('URL', `View more information [here](${area.visualCasesUrl})`);

        await discordHookClient.send(embedMessage);
    }

    return {
        ...area,
        lastestUpdate,
        previousCases,
        firstIncidenceCheck
    };
}

(async () => {
    // Make it run forever
    while (true) {
        try {
            console.log('Checking for COVID-19 incidences at:', new Date());

            for (let i = 0; i < areas.length; i++) {
                const area = areas[i];
                // eslint-disable-next-line no-await-in-loop
                areas[i] = await checkAreaForNewIncidence(area);
            }
        } catch (error) {
            console.log(error);
        } finally {
            // eslint-disable-next-line no-await-in-loop
            await wait(config.waitTimeout);
        }
    }
})();
