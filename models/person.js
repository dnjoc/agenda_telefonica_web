//se importa mongoose
const mongoose = require('mongoose')
//Configuracion de mongodb atlas
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.connect(url)
  .then(result => {
    console.log(result)
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })
const phoneSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /\d{2,3}-\d{5,}/.test(v) // Expresión regular para validar el número de teléfono
      },
      message: props => `${props.value} no es un número de teléfono válido!`
    }
  },
  date: { type: Date, default: Date.now },
})

phoneSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
module.exports = mongoose.model('Person', phoneSchema)