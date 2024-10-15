const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const Person = require('./models/person')

const errorHandler = (error, request, response, next) => {
  console.error('mensaje error', error.message)
  console.log('error. errors', error.errors)


  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    if (error.errors.name && error.errors.name.kind === 'minlength') {
      return response.status(400).json({ error: 'Name must be at least 3 characters long' })
    } if (error.errors && error.errors.number) {
      return response.status(400).json({ error: 'Invalid phone number format. Must be in the format XX-XXXXXXX or XXX-XXXXXXXX' })
    }
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(cors())
//agregamos el middleware integrado de Express llamado static
app.use(express.static('dist'))

// let persons = [
//   {
//     "id": 1,
//     "name": "Arto Hellas",
//     "number": "040-123456"
//   },
//   {
//     "id": 2,
//     "name": "Ada Lovelace",
//     "number": "39-44-5323523"
//   },
//   {
//     "id": 3,
//     "name": "Dan Abramov",
//     "number": "12-43-234345"
//   },
//   {
//     "id": 4,
//     "name": "Mary Poppendieck",
//     "number": "39-23-6423122"
//   }
// ]
// Middleware
app.use(express.json())
app.use(morgan('tiny'))

// API endpoints
app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}))

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
//genera id`s buscando el numero maximo de registros y sumandole 1
// const generateId = () => {
//     const maxId = persons.length > 0
//       ? Math.max(...persons.map(n => n.id))
//       : 0
//     return maxId + 1
//   }
//Este codigo genera un id random, busca que no concuerde con ningun id existente
// const generateId = () => {
//   let newId
//   do {
//     newId = Math.floor(Math.random() * 1000000)
//   } while (persons.some(person => person.id === newId))
//   return newId
// }
app.get('/', (request, response) => {
  response.send('<h1>Backend Agenda Telefonica</h1>')
})
// app.get('/api/persons', (request, response) => {
//   response.json(persons)
// })
//configuracion get para consulta en mongodb
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})
app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${Person.length} people</p><p>${new Date()}</p>`)
  //   const info = `
  //   <p>Phonebook has info for ${persons.length} people</p>
  //   <p>${new Date()}</p>
  // `
  // response.send(info)
})

// app.get('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id)
//   const person = persons.find(person => person.id === id)
//   if (person) {
//     response.json(person)
//   } else {
//     response.status(404).json({
//       error: 'Person not found'
//     }).end()
//   }
// })

//buscar persona por ID con mongoose
app.get('/api/persons/:id', (request, response, next) => {
  console.log(request.params.id)
  const id = request.params.id

  // if (!mongoose.Types.ObjectId.isValid(id)) {
  //   return response.status(400).json({ error: 'malformatted id' })
  // }
  //const objectId = mongoose.Types.ObjectId(id)

  Person.findById(id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

//convierte la primera letra de cada palabra en Mayuscula
const capitalizeName = (name) => {
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
app.post('/api/persons', (request, response, next) => {
  //app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    let msg
    //mensaje especifico al dato faltante
    if (!body.name) {
      msg = 'name missing'
    } else {
      msg = 'number missing'
    }
    return response.status(400).json({
      error: msg
    })
  }
  //Se busca si existe el nombre para indicar que no puede ser agregado
  //  const existeNombre = person.some(person => person.name.toLowerCase() === body.name.toLowerCase())
  //  if (existeNombre) {
  //   return response.status(400).json({
  //      error: 'name must be unique'
  //  })
  //  }
  // Person.find({ name: capitalizeName(body.name) })
  //   .then(existeNombre => {
  //     if (existeNombre) {
  //       return response.status(400).json({
  //         error: 'name must be unique'
  //       })
  //     }
  // Validar el formato del número de teléfono
  const phoneRegex = /^\d{2,3}-\d{5,}$/
  if (!phoneRegex.test(body.number)) {
    let phone = 'Invalid phone number format'
    return response.status(400).json({ error: phone })
  }
  const person = new Person({
    //id: generateId(),
    name: capitalizeName(body.name),
    number: body.number,
    //date: { type: Date, default: Date.now },
  })

  // persons = persons.concat(person)
  person.save().then(savePerson => {
    response.json(savePerson)
  })
    .catch(error => next(error))
  //response.json(person)
})
// .catch(error => {
//   console.error('Error:', error.message)
//   response.status(500).json({ error: 'An error occurred while adding the person' })
//})
// })
// app.delete('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id)
//   persons = Person.filter(person => person.id !== id)
//   response.status(204).end()
//   //response.status(200).json({ message: 'Person deleted successfully' })
// })

//Actualizar numero de telefono con mongosse
app.put('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const body = request.body

  if (!body.number) {
    return response.status(400).json({ error: 'number missing' })
  }
  const updatedPerson = {
    number: body.number
  }

  Person.findByIdAndUpdate(id, updatedPerson, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch(error => {
      console.error('Error updating person:', error.message)
      response.status(500).json({ error: 'An error occurred while updating the person' })
    })
})

//eliminar registro por id en mongoose
app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).json({ error: 'Invalid ID format' })
  }
  Person.findByIdAndDelete(id)
    .then(result => {
      if (result) {
        response.status(204).end()
      } else {
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch(error => {
      console.error('Error during deletion:', error.message)
      response.status(500).json({ error: 'An error occurred while deleting the person' })
    })
})

app.use(unknownEndpoint)
app.use(errorHandler)
//const PORT = process.env.PORT || 3001
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})