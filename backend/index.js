import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error de conexión:', err))

const MessageSchema = new mongoose.Schema({
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Message = mongoose.model('Message', MessageSchema)

app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 })
  res.json(messages)
})

app.post('/messages', async (req, res) => {
  const { text } = req.body
  const message = new Message({ text })
  await message.save()
  res.json({ success: true, message })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`🚀 API corriendo en http://localhost:${port}`)
})