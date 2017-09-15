const bot = require("../bot")
const expect = require("chai").expect
//
// describe('GET /', function () {
//   it('respond with json', function () {
//     return expect(true).to.be.false
//   });
// });

describe('getRecipientFromMQTT', () => {
  it('should extract the recipent from the mqtt topic', () => {
    expect(bot.getRecipientFromMQTT({topic: "notify/in/1234"})).to.eql("1234")
  })
})

describe('generateMessageFromMQTT', () => {
  it("should just send a simple message if all we have is text", () =>
    expect(bot.generateMessageFromMQTT({message: "just this"})).to.eql("just this")
  )
  it("should include an image if we give one", () =>
    expect(bot.generateMessageFromMQTT({
      message: "foo",
      image: ["http://someurl.jpg"]
    }).attachment.payload.elements[0].image_url[0]).to.eql("http://someurl.jpg")
  )
  it("should put the message in a bubble title", () =>
    expect(bot.generateMessageFromMQTT({
      message: "foo",
      image: ["http://someurl.jpg"]
    }).attachment.payload.elements[0].title).to.eql("foo")
  )

  it("should add a button", () =>
    expect(bot.generateMessageFromMQTT({
      message: "foo",
      buttons: [
        {title: "foo", value: "bar"}
      ]
    }).attachment.payload.elements[0].buttons[0]).to.eql({
      title: "foo",
      type: "postback",
      payload: "bar"
    }))

  it("should add multiple buttons", () =>
    expect(bot.generateMessageFromMQTT({
      message: "foo",
      buttons: [
        {title: "foo", value: "bar"},
        {title: "foo", value: "bar"}
      ]
    }).attachment.payload.elements[0].buttons).to.have.lengthOf(2))

  it("should upload and reference a base64 image", () => {

  })
})

