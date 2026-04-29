// controllers/bootstrap.controller.js

import { bootstrapDatabase } from '../db/db.js'

export async function bootstrap(req, res) {
    try {
        await bootstrapDatabase()

        return res.status(201).json({
            status: 'ok',
            message: 'Database reset and seeded'
        })
    } catch (error) {
        console.error('bootstrap error:', error)

        return res.status(500).json({
            status: 'error',
            message: 'Failed to bootstrap database'
        })
    }
}
