import express from 'express'
const cogniacAuth = require("../apis/cogniac/auth")

// Create express router
const router = express.Router()

// Transform req & res to have the same API as express
// So we can use res.status() & res.json()
const app = express()
router.use((req, res, next) => {
  Object.setPrototypeOf(req, app.request)
  Object.setPrototypeOf(res, app.response)
  req.res = res
  res.req = req
  next()
})

// Add POST - /api/login
router.post('/login', (req, res) => {
  if (req.body.username === 'demo' && req.body.password === 'demo') {
    const tenantId = process.env.COG_TENANT
    const username = process.env.COG_USER
    const password = process.env.COG_PASS
    cogniacAuth.login({tenantId, username, password}).then((_res)=>{
      req.session.authUser = { username: 'demo', c: _res.access_token }
      req.session.c = _res.access_token
      return res.json({ username: 'demo', c: _res.access_token })
    }, (error)=>{
      console.log('[ERROR]  POST /login: ', error)
      return res.status(401).json({ message: error })
    })
  }
  else {
    return res.status(401).json({ message: 'POST /login: Bad credentials' })
  }
})

// Add POST - /api/logout
router.post('/logout', (req, res) => {
  delete req.session.authUser
  res.json({ ok: true })
})

// Export the server middleware
export default {
  path: '/api',
  handler: router
}
