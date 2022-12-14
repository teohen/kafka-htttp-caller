const { Kafka } = require('kafkajs')
const package = require('../../package.json')

const kafka = new Kafka({
  clientId: process.env.CLIENT_ID,
  brokers: [process.env.BROKERS]
})

const admin = kafka.admin()
const producer = kafka.producer()
const consumer = kafka.consumer({ groupId: `${package.name}-group` })

const getProducer = () => {
  return producer
}

const getConsumer = () => {
  return consumer
}

const getClientAdmin = () => {
  return admin
}

const produceMessage = async (payload, topic, key, headers) => {
  await producer.connect()
  await producer.send({
    topic,
    messages: [{
      "key": key,
      "value": JSON.stringify(payload),
      "headers": headers
    }],
  })
}

const consumeTopic = async (topicsToConsume, processMessage) => {
  try {
    console.log('consuming...')
    await consumer.connect()
    await consumer.subscribe({ topics: topicsToConsume, fromBeginning: true })

    await consumer.run({
      autoCommit: false,
      eachMessage: processMessage
    })
  } catch (err) {
    console.log(`Error consuming topic: ${topicsToConsume} - Error: ${err}`)
    throw err
  }
}

module.exports = {
  getProducer,
  getConsumer,
  getClientAdmin,
  produceMessage,
  consumeTopic
}