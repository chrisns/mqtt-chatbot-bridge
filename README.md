# MQTT <> Telegram chat bot

To get going:
```bash
claudia --profile claudia create --version dev --api-module bot --region eu-west-2 --policies AWSIoTDataAccess
claudia --profile claudia update --configure-telegram-bot
claudia --profile claudia update --configure-iot
claudia --profile claudia update --set-env AWS_IOT_ENDPOINT=AAAA.iot.eu-west-2.amazonaws.com,telegramAccessToken=ZZZZZZ


claudia --profile claudia add-iot-topic-rule --ruleName notify --sql "select * , topic() AS topic from 'notify/in/+/+'"
```

you can then publish to MQTT topic ` notify/in/[page-scoped-user-id]`

```json
{
  "message": "Hello from AWS IoT",
  "buttons": [{"title":"Do Something", "value": "do something"}],
  "inlineImage": "<BASE64 JPG>"
}
```

or

```json
{
  "message": "Hello from AWS IoT",
  "buttons": [{"title":"Do Something", "value": "do something"}],
  "image": "image url"
}
```

or

```json
{
  "message": "Hello from AWS IoT"
}
```

anything sent to the bot will get published to `notify/out/user_id`