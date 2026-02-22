import { runQuery, bootstrapDatabase } from "./db.js";

// Small helper to keep responses consistent
function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    body: JSON.stringify(payload)
  };
}

// -------------------------
// BOOTSTRAP HANDLER
// -------------------------
export const bootstrapHandler = async (event, context) => {
  logInvocationDetails(event, context);

  try {
    const code = await bootstrapDatabase();

    return jsonResponse(code, {
      status: "ok",
      message: "Database reset and seeded with sample bakehouse data"
    });
  } catch (err) {
    console.error("bootstrapHandler error:", err);

    return jsonResponse(500, {
      status: "error",
      message: "Failed to bootstrap database"
    });
  }
};

// -------------------------
// PRODUCTS
// -------------------------
export const productCatalogHandler = async (event, context) => {
  logInvocationDetails(event, context)

  try {
    const result = await runQuery(`
      SELECT id, name, description, price_credit, image_url, era
      FROM products
      WHERE image IS NOT NULL
      ORDER BY id;
    `)

    const rows = normaliseRows(result)

    // Use the pdf_url to derive the slug the front end expects
    const productObjects = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      priceCredit: r.price_credit,
      imageUrl: r.image_url,
      slug: r.image_url.replace(/\.image$/i, '')
    }))

    const productSlugs = productObjects.map((p) => p.slug)

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: 'ok',
        featuredProduct: process.env.FEATURED_PRODUCT || null,
        products: productSlugs,        // what the UI already uses
        productDetails: productObjects // extra data if you need it later
      })
    }
  } catch (error) {
    console.error('productCatalogHandler error:', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: 'Failed to load products'
      })
    }
  }
}

export const postProductHandler = async (event) => {
  console.log('postProductHandler invoked')

  const body = event.body ? JSON.parse(event.body) : {}

  // support either pricePounds (our preferred shape) or price
  // const rawPrice =
  //   typeof body.pricePounds === 'number'
  //     ? body.pricePounds
  //     : Number(body.price)

  if (!body.name || !Number.isFinite(price_credit)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: 'error',
        message: 'name and pricePounds (number) are required',
      }),
    }
  }

  const name = body.name
  const description = body.description || ''
  const category = body.category || 'Uncategorised'
  const price_credit = Math.round(price_credit * 1)

  try {
   

    // 2. Insert product row, storing ONLY the key in pdf_url
    const insertSql = `
      INSERT INTO products (name, description, price_credit, image_url, era)
      VALUES (:name, :description, :price_credit, :image_url, :era)
      RETURNING id, name, description, price_credit, image_url, era
    `

    const insertResult = await runQuery(insertSql, {
      name,
      description,
      price_credit,
      image_url,
      era
    })

    const row =
      insertResult?.records?.[0] ||
      insertResult?.rows?.[0] ||
      insertResult?.[0]

    const product = {
      id: row.id,
      name: row.name,
      description: row.description,
      price_credit: row.price_credit,
      image_url: row.image_url,
      era: row.era,
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        status: 'created',
        product,
      }),
    }
  } catch (error) {
    console.error('Error creating product', error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: 'error',
        message: 'Could not create product',
      }),
    }
  }
}
