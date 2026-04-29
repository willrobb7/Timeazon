import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import { createImageUploadUrl } from './controllers/uploads.controller.js'

import { createUser, loginUser } from './controllers/users.controller.js'

import { addToCart, getCart, removeFromCart } from './controllers/cart.controller.js'

import { getProducts, createProduct, deleteProduct } from './controllers/products.controller.js'

import { bootstrap } from './controllers/bootstrap.controller.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Health
app.get('/api/healthcheck', (req, res) => {
    return res.status(200).json({ status: 'ok' })
})

// Products
app.get('/api/products', getProducts)
app.post('/api/products', createProduct)
app.delete('/api/products/:id', deleteProduct)

// Users
app.post('/api/users', createUser)
app.post('/api/login', loginUser)

// Cart
app.get('/api/addtocart', getCart)
app.post('/api/addtocart', addToCart)
app.delete('/api/addtocart', removeFromCart)

// Upload URL
app.post('/api/image-upload-url', createImageUploadUrl)

// Bootstrap
app.post('/api/bootstrap', bootstrap)

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`)
})
