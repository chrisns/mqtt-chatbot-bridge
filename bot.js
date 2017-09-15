const builder = require('claudia-bot-builder')
const fbTemplate = builder.fbTemplate
const request = require('request')
const AWS = require('aws-sdk')
const fbReply = require('claudia-bot-builder/lib/facebook/reply')

const api = builder((request, apiReq) =>
  new Promise((resolve, reject) =>
    new AWS.IotData({endpoint: apiReq.env.AWS_IOT_ENDPOINT})
      .publish({
        topic: `notify/out/${request.sender}`,
        payload: request.text
      }, (err, data) => {
        if (err)
          reject(err)
        resolve(data)
      }))
    .then(() => true)
)

api.intercept(event => {
  if (!event.topic) return event
  return api.interceptImages(event)
    .then(fbReply(api.getRecipientFromMQTT(event), api.generateMessageFromMQTT(event), process.env.facebookAccessToken))
    .then(() => false)
})

api.generateMessageFromMQTT = (event) => {
  if (!event.buttons && !event.image) return event.message
  const message = new fbTemplate.Generic()
  message.addBubble(event.message)
  if (event.image) message.addImage(event.image)
  if (event.buttons) {
    event.buttons.forEach(
      button => message.addButton(button.title, button.value)
    )
  }
  return message.get()
}

api.getRecipientFromMQTT = event => event.topic.split("/").pop()
api.addPostDeployConfig('AWS_IOT_ENDPOINT', 'AWS-IOT endpoint:', 'configure-iot')

api.interceptImages = event => new Promise((resolve) => {
  if (!event.inlineImage) return resolve(event)

  request({
    url: `https://graph.facebook.com/v2.6/me/message_attachments?access_token=${process.env.facebookAccessToken}`,
    method: 'POST',
    formData: {
      filedata: {
        value: Buffer.from(event.inlineImage, 'base64'),
        options: {
          filename: "img",
          contentType: "image/jpeg"
        }
      },
      message: JSON.stringify({attachment: {type: "image", payload: {is_reusable: true}}})
    }
  }, (err, resp, body) => {
    if (err) {
      throw err
    }
    fbReply(api.getRecipientFromMQTT(event), {
      attachment: {
        type: "image",
        payload: {
          attachment_id: JSON.parse(body).attachment_id
        }
      }
    }, process.env.facebookAccessToken)
      .then(() => resolve(event))
  })
})

module.exports = api