const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const nombre = process.argv[3]

const phone = process.argv[4]

const url =
    `mongodb+srv://dnjoc:${password}@cluster0.1o0ya.mongodb.net/phoneApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const phoneSchema = new mongoose.Schema({
  name: String,
  number: String,
  date: { type: Date, default: Date.now },
})

const Person = mongoose.model('Person', phoneSchema)

if (process.argv.length === 3) {
  Person.find({}).then(result => {
    console.log('Phonebook:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
  const person = new Person({
    name: nombre,
    number: phone,
    date: new Date(),
  })

  person.save().then(result => {
    console.log(result)
    console.log(`added ${nombre} ${phone} to phonebook`)
    mongoose.connection.close()
  })
} else {
  console.log('Incorrect number of arguments')
  process.exit(1)
}