# covid-19-incidence-notifier
> 🤒⏰ Get notified about new COVID-19 incidences in your location (Norway only)

[![Docker Pulls](https://img.shields.io/docker/pulls/knutkirkhorn/covid-19-incidence-notifier)](https://hub.docker.com/r/knutkirkhorn/covid-19-incidence-notifier) [![Docker Image Size](https://badgen.net/docker/size/knutkirkhorn/covid-19-incidence-notifier)](https://hub.docker.com/r/knutkirkhorn/covid-19-incidence-notifier)

Notifies on Discord if there are new COVID-19 incidences in your location (Norway only). Uses the [Corona API](https://redutv-api.vg.no/corona/v1/) from [vg.no](https://www.vg.no/) about incidences in municipalities. It notifies to a Discord channel using [Discord Webhooks](https://discord.com/developers/docs/resources/webhook).

<div align="center">
	<img src="https://raw.githubusercontent.com/Knutakir/covid-19-incidence-notifier/master/media/top-image.png" alt="COVID-19 incidence notification example">
</div>

## Usage
### Within a Docker container
#### From Docker Hub Image
This will pull the image from [Docker Hub](https://hub.docker.com/) and run the image with the provided configuration for web hooks as below. One can provide only the Webhook URL or both the Webhook ID and token.

```sh
# Providing Discord Webhook URL
$ docker run -d -e DISCORD_WEBHOOK_URL=<URL_HERE> knutkirkhorn/covid-19-incidence-notifier

# Providing a single area ID
$ docker run -d \
    -e DISCORD_WEBHOOK_URL=<URL_HERE> \
    -e AREA_IDS=1577 \
    knutkirkhorn/covid-19-incidence-notifier

# Providing two area IDs
$ docker run -d \
    -e DISCORD_WEBHOOK_URL=<URL_HERE> \
    -e AREA_IDS=1577,4651 \
    knutkirkhorn/covid-19-incidence-notifier
```

#### From source code
```sh
# Build container from source
$ docker build -t covid-19-incidence-notifier .

# Run the built container with default configuration
$ docker run -d -e DISCORD_WEBHOOK_URL=<URL_HERE> covid-19-incidence-notifier

# Providing a single area ID
$ docker run -d \
    -e DISCORD_WEBHOOK_URL=<URL_HERE> \
    -e AREA_IDS=1577 \
    covid-19-incidence-notifier

# Providing two area IDs
$ docker run -d \
    -e DISCORD_WEBHOOK_URL=<URL_HERE> \
    -e AREA_IDS=1577,4651 \
    covid-19-incidence-notifier
```

### Outside of a Docker container
```sh
# Install
$ npm install

# Run
$ npm start
```

### Environment variables
Provide these with the docker run command or store these in a `.env` file. Only `DISCORD_WEBHOOK_URL` or both `DISCORD_WEBHOOK_ID` and `DISCORD_WEBHOOK_TOKEN` are required, but other values are recommended to change to its own personal usage.

- `DISCORD_WEBHOOK_URL`
    - URL to the Discord Webhook containing both the ID and the token
    - Format: `DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/<ID_HERE>/<TOKEN_HERE>`
- `DISCORD_WEBHOOK_ID`
    - ID for the Discord Webhook
- `DISCORD_WEBHOOK_TOKEN`
    - Token for the Discord Webhook
- `WAIT_TIMEOUT` ***(optional)***
    - The time interval in milliseconds between each check to the APIs.
    - Default: `3600000` (60 minutes)
- `AREA_IDS` ***(optional)***
    - The area ID(s) of the municipality/municipalities to notify about new incidences. Specified as a single four digit number or comma separeted list of four digit numbers.
    - Default: `1577` (Volda)
    - Different municipality IDs can be viewed [here](https://redutv-api.vg.no/corona/v1/areas/municipalities/).
- `TIME_LOCALE` ***(optional)***
    - The time locale for the `Updated` field in the Discord message.
    - Default: `en`
- `TIME_FORMAT` ***(optional)***
    - The time format for the `Updated` field in the Discord message.
    - Default: `dddd D MMMM YYYY HH:mm`

## License
MIT © [Knut Kirkhorn](https://github.com/Knutakir/covid-19-incidence-notifier/blob/master/LICENSE)
