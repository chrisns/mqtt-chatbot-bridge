const builder = require('claudia-bot-builder')
const tlTemplate = builder.telegramTemplate
const AWS = require('aws-sdk')
const tlReply = require('claudia-bot-builder/lib/telegram/reply')

const api = builder((request, apiReq) =>
  new Promise((resolve, reject) =>
    new AWS.IotData({endpoint: apiReq.env.AWS_IOT_ENDPOINT})
      .publish({
        topic: `notify/out/${request.originalRequest.message.from.id}`,
        payload: request.text.toLowerCase()
      }, (err, data) => {
        if (err)
          reject(err)
        resolve(data)
      }))
    .then(() => new tlTemplate.ChatAction('typing').get())
)

api.intercept(event => {
  if (!event.topic) return event
  const recipient = event.topic.split("/").reverse()[0]
  const message = event.image ?
    new tlTemplate.Photo(event.image, event.message) :
    new tlTemplate.Text(event.message)

  if (event.buttons && event.buttons.length > 0)
    message.addReplyKeyboard(event.buttons.map(val => {
      return [{text: val.title, callback_data: ""}]
    }), false, true)

  if (event.disableNotification)
    message.disableNotification()

  return tlReply(
    {
      sender: recipient,
      originalRequest: {}
    },
    message.get(),
    process.env.telegramAccessToken
  )
    .then(() => false)
  // return api.interceptImages(event)
  //   .then((event) => {
  //     console.log(event.topic)
  //     console.log(event);
  //     return event;
  //   })
  //   .then(fbReply(api.getRecipientFromMQTT(event), api.generateMessageFromMQTT(event), process.env.facebookAccessToken))
  //   .then(response => console.log(response))
  //   .then(() => false)
})

// api.generateMessageFromMQTT = (event) => {
//   if (!event.buttons && !event.image) return event.message
//   const message = new fbTemplate.Generic()
//   message.addBubble(event.message.substr(0, 80))
//   if (event.image) message.addImage(event.image)
//   if (event.buttons) {
//     event.buttons.splice(0, 3).forEach(
//       button => message.addButton(button.title, button.value)
//     )
//   }
//   console.log(JSON.stringify(message.get()))
//   return message.get()
// }

// api.getRecipientFromMQTT = event => event.topic.split("/").pop()
api.addPostDeployConfig('AWS_IOT_ENDPOINT', 'AWS-IOT endpoint:', 'configure-iot')

// api.interceptImages = event => new Promise((resolve) => {
//   if (!event.inlineImage) return resolve(event)
//
//   request({
//     url: `https://graph.facebook.com/v2.6/me/message_attachments?access_token=${process.env.facebookAccessToken}`,
//     method: 'POST',
//     formData: {
//       filedata: {
//         value: Buffer.from(event.inlineImage, 'base64'),
//         options: {
//           filename: "img",
//           contentType: "image/jpeg"
//         }
//       },
//       message: JSON.stringify({attachment: {type: "image", payload: {is_reusable: true}}})
//     }
//   }, (err, resp, body) => {
//     if (err) {
//       throw err
//     }
//     fbReply(api.getRecipientFromMQTT(event), {
//       attachment: {
//         type: "image",
//         payload: {
//           attachment_id: JSON.parse(body).attachment_id
//         }
//       }
//     }, process.env.facebookAccessToken)
//       .then(() => resolve(event))
//   })
// })

module.exports = api