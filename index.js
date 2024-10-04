const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]
// Middleware
app.use(express.json())
app.use(morgan('tiny'))

// API endpoints
app.use(morgan((tokens, req, res) => {
  return 
  tokens.method(req, res),
  tokens.url(req, res),
  tokens.status(req, res),
  tokens.res(req, res, 'content-length'), '-',
  tokens['response-time', 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}))
morgan.token('body', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


//genera id`s buscando el numero maximo de registros y sumandole 1
// const generateId = () => {
//     const maxId = persons.length > 0
//       ? Math.max(...persons.map(n => n.id))
//       : 0
//     return maxId + 1
//   }
//Este codigo genera un id random, busca que no concuerde con ningun id existente
  const generateId = () => {
    let newId
    do {
      newId = Math.floor(Math.random() * 1000000)
    } while (persons.some(person => person.id === newId))
    return newId
  }
app.get('/', (request, response) => {
    response.send('<h1>Backend Agenda Telefonica</h1>')
  })

  app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

  app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
  //   const info = `
  //   <p>Phonebook has info for ${persons.length} people</p>
  //   <p>${new Date()}</p>
  // `
  // response.send(info)
  })

  app.get('/api/persons/:id', (request, response) => {

    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
      } else {
        response.status(404).json({ 
          error: 'Person not found' 
        }).end()
      }
  })
  //convierte la primera letra de cada palabra en Mayuscula
  const capitalizeName = (name) => {
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
  app.post('/api/persons', (request, response) => {
    const body = request.body
  
    if (!body.name || !body.number) {
      let msg
      //mensaje especifico al dato faltante
      if (!body.name) {
        msg = "name missing"
      }else{
        msg = "number missing"
      }
      return response.status(400).json({ 
        error: msg
      })
    }
    //Se busca si existe el nombre para indicar que no puede ser agregado
    const existeNombre = persons.some(person => person.name.toLowerCase() === body.name.toLowerCase())
    if (existeNombre) {
      return response.status(400).json({ 
        error: 'name must be unique' 
      })
    }
    const person = {
      id: generateId(),
      name: capitalizeName(body.name),
      number: body.number
    }
  
    persons = persons.concat(person)
  
    response.json(person)
  })
  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
    //response.status(200).json({ message: 'Person deleted successfully' })
  })

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })