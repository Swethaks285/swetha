const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
app.get('/players/', async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
        Player_id;`
  const booksArray = await db.all(getBooksQuery)
  response.send(
    booksArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})
app.use(express.json())
app.post('/players/', async (request, response) => {
  const reDetails = request.body
  const {player_id, player_name, jersey_number, role} = reDetails
  const createSql = `
  INSERT INTO cricket_team(
    player_name,jersey_number,role
  )
  VALUES(
  '${player_name}',
  '${jersey_number}',
  '${role}');`

  const dbResponse = await db.run(createSql)
  const bookId = dbResponse.lastID
  response.send('Player Added to Team')
})
const convert = db => {
  return {
    playerId: db.player_id,
    playerName: db.player_name,
    jerseyNumber: db.jersey_number,
    role: db.role,
  }
}
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`
  const books = await db.get(getQuery)
  response.send(convert(books))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const teamDetails = request.body
  const {player_id, player_name, jersey_number, role} = teamDetails
  const updateTeam = `
  UPDATE 
    cricket_team
  SET
  player_name='${player_name}',
  jersey_number = '${jersey_number}',
  role = '${role}'
  WHERE
     player_id = ${playerId};`

  await db.run(updateTeam)
  response.send('Player Details Updated')
})
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deleteBookQuer = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`
  await db.run(deleteBookQuer)
  response.send('Player Removed')
})

module.exports = app
