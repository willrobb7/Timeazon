import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    DeleteCommand
} from '@aws-sdk/lib-dynamodb'

const TABLE_NAME = process.env.CART_TABLE_NAME
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const normaliseEmail = (email) => String(email || '').trim().toLowerCase()

const normaliseProductId = (productId) => String(productId || '').trim()

export async function addToCart(req, res) {
    try {
        if (!TABLE_NAME) {
            return res.status(500).json({
                status: 'error',
                message: 'Missing CART_TABLE_NAME env var'
            })
        }

        const email = normaliseEmail(req.body?.email)
        const productId = normaliseProductId(req.body?.productId)

        if (!email || !productId) {
            return res.status(400).json({
                status: 'error',
                message: 'email and productId are required'
            })
        }

        const item = {
            email,
            productId,
            createdAt: new Date().toISOString()
        }

        await ddb.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: item
            })
        )

        return res.status(201).json({
            status: 'added to cart',
            cartItem: item
        })
    } catch (error) {
        console.error('addToCart error:', error)
        return res.status(500).json({
            status: 'error',
            message: 'Could not add product to cart'
        })
    }
}

export async function getCart(req, res) {
    try {
        if (!TABLE_NAME) {
            return res.status(500).json({
                status: 'error',
                message: 'Missing CART_TABLE_NAME env var'
            })
        }

        const email = normaliseEmail(req.query?.email)

        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing email query parameter'
            })
        }

        const result = await ddb.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: '#email = :email',
                ExpressionAttributeNames: { '#email': 'email' },
                ExpressionAttributeValues: { ':email': email }
            })
        )

        const cartItems = result?.Items || []

        return res.status(200).json({
            status: 'ok',
            email,
            count: cartItems.length,
            cartItems
        })
    } catch (error) {
        console.error('getCart error:', error)
        return res.status(500).json({
            status: 'error',
            message: 'Could not load cart'
        })
    }
}

export async function removeFromCart(req, res) {
    try {
        if (!TABLE_NAME) {
            return res.status(500).json({
                status: 'error',
                message: 'Missing CART_TABLE_NAME env var'
            })
        }

        const email = normaliseEmail(req.body?.email)
        const productId = normaliseProductId(req.body?.productId)

        if (!email || !productId) {
            return res.status(400).json({
                status: 'error',
                message: 'email and productId are required'
            })
        }

        await ddb.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: { email, productId }
            })
        )

        return res.status(200).json({
            status: 'deleted',
            email,
            productId
        })
    } catch (error) {
        console.error('removeFromCart error:', error)
        return res.status(500).json({
            status: 'error',
            message: 'Could not delete product from cart'
        })
    }
}
