import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({})

export async function createImageUploadUrl(req, res) {
    try {
        const { fileName, fileType } = req.body || {}

        if (!fileName || !fileType) {
        return res.status(400).json({
            message: 'fileName and fileType are required'
        })
        }

        const bucketName = process.env.STATIC_IMAGES_BUCKET
        const baseUrl = process.env.STATIC_IMAGES_BASE_URL

        if (!bucketName || !baseUrl) {
        return res.status(500).json({
            message: 'Missing static image environment variables'
        })
        }

        const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_')

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: safeName,
            ContentType: fileType
        })

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 })
        const finalUrl = `${baseUrl}/${safeName}`

        return res.status(200).json({
            uploadUrl,
            finalUrl,
            key: safeName
        })
    } catch (error) {
        console.error('createImageUploadUrl error:', error)

        return res.status(500).json({
            message: 'Could not create upload url'
        })
    }
}
