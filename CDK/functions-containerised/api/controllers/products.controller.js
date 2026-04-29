import { runQuery } from '../db/db.js'

export async function getProducts(req, res) {
    try {
        const result = await runQuery(`
        SELECT id, name, description, price_credit, image_url, era
        FROM products;
        `)

        const products = result?.records || result?.rows || []

        return res.status(200).json({
            status: 'ok',
            products
        })
    } catch (error) {
        console.error('Catalog error:', error)

        return res.status(500).json({
            status: 'error',
            message: 'Failed to load products'
        })
    }
}

export async function createProduct(req, res) {
    try {
        const body = req.body || {}

        if (!body.name || typeof body.price_credit !== 'number') {
        return res.status(400).json({
            status: 'error',
            message: 'name and price_credit required'
        })
        }

        const insertSql = `
        INSERT INTO products (name, description, price_credit, image_url, era)
        VALUES (:name, :description, :price_credit, :image_url, :era)
        RETURNING id, name, description, price_credit, image_url, era
        `

        const result = await runQuery(insertSql, {
            name: body.name,
            description: body.description || '',
            price_credit: body.price_credit,
            image_url: body.image_url || '',
            era: body.era || ''
        })

        const product = result?.records?.[0] || result?.rows?.[0]

        return res.status(201).json({
            status: 'created',
            product
        })
    } catch (error) {
        console.error('Error creating product:', error)

        return res.status(500).json({
            status: 'error',
            message: 'Could not create product'
        })
    }
}

export async function deleteProduct(req, res) {
    try {
        const id = req.params?.id

        if (!id) {
        return res.status(400).json({
            status: 'error',
            message: 'Product Id is required'
        })
        }

        const deleteSql = `
        DELETE FROM products
        WHERE id = :id
        RETURNING id, name, description, price_credit, image_url, era
        `

        const result = await runQuery(deleteSql, { id })

        const product =
        result?.records?.[0] ||
        result?.rows?.[0]

        if (!product) {
        return res.status(404).json({
            status: 'error',
            message: 'Product not found'
        })
        }

        return res.status(200).json({
            status: 'deleted',
            product
        })
    } catch (error) {
        console.error('Error deleting product:', error)

        return res.status(500).json({
            status: 'error',
            message: 'Could not delete product'
        })
    }
}
