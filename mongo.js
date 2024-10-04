const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const nombre = process.argv[3]

const phone = process.argv[4]

const url =
  `mongodb+srv://dnjoc:${password}@cluster0.1o0ya.mongodb.net/phoneApp?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const phoneSchema = new mongoose.Schema({
  content: String,
  phone: String,
  date: { type: Date, default: Date.now },
})

const Agenda = mongoose.model('Agenda', phoneSchema)

if (process.argv.length === 3) {
    Agenda.find({}).then(result => {
      console.log('Phonebook:')
      result.forEach(agenda => {
        console.log(`${agenda.content} ${agenda.phone}`)
      })
      mongoose.connection.close()
    })
  } else if (process.argv.length === 5) {
    const agenda = new Agenda({
      content: nombre,
      phone: phone,
      date: new Date(),
    })
  
    agenda.save().then(result => {
      console.log(`added ${nombre} ${phone} to phonebook`)
      mongoose.connection.close()
    })
  } else {
    console.log('Incorrect number of arguments')
    process.exit(1)
  }