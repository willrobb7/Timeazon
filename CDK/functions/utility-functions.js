// functions/utility-functions.js
import { runQuery, bootstrapDatabase } from './db.js';

// Small helper to keep responses consistent
function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    body: JSON.stringify(payload)
  };
}

// Normalise the result from data-api-client / RDS Data API
const normaliseRows = (result) => {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.rows)) return result.rows;
  if (Array.isArray(result.records)) return result.records;
  return [];
};

const logInvocationDetails = (event, context) => {
  console.log('Event received:');
  console.log(JSON.stringify(event, null, 2));

  if (context) {
    console.log('Context received:');
    console.log({
      functionName: context.functionName,
      functionVersion: context.functionVersion,
      awsRequestId: context.awsRequestId,
      remainingTimeMs: context.getRemainingTimeInMillis()
    });
  }
};

// -------------------------
// BOOTSTRAP HANDLER (optional)
// -------------------------
export const bootstrapHandler = async (event, context) => {
  logInvocationDetails(event, context);

  try {
    const code = await bootstrapDatabase();

    return jsonResponse(code, {
      status: 'ok',
      message: 'Database reset and seeded with sample timeazon data'
    });
  } catch (err) {
    console.error('bootstrapHandler error:', err);

    return jsonResponse(500, {
      status: 'error',
      message: 'Failed to bootstrap database'
    });
  }
};

// -------------------------
// PRODUCTS
// -------------------------
export const productCatalogHandler = async () => {
  try {
    const result = await runQuery(`
      SELECT id, name, description, price_credit, image_url, era
      FROM products;
    `);

    const products =
      result?.records ||
      result?.rows ||
      [];

    return {
      statusCode: 200,
      body: JSON.stringify({
        status: "ok",
        products
      })
    };

  } catch (error) {
    console.error("Catalog error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "error",
        message: "Failed to load products"
      })
    };
  }
};

  // try {
    
//     const result = await runQuery(`
//       SELECT name, description, price_credit, image_url, era
//       FROM products;
//     `)

//     const rows = normaliseRows(result)

//     // Use the pdf_url to derive the slug the front end expects
//     const productObjects = rows.map((r) => ({
//       name: r.name,
//       description: r.description,
//       priceCredit: r.price_credit,
//       imageUrl: r.image_url,
//       slug: r.image_url.replace(/\.image$/i, '')
//     }))

//     const productSlugs = productObjects.map((p) => p.slug)

//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         status: 'ok',
//         featuredProduct: process.env.FEATURED_PRODUCT || null,
//         products: productSlugs,        // what the UI already uses
//         productDetails: productObjects // extra data if you need it later
//       })
//     }
//   } catch (error) {
//     console.error('productCatalogHandler error:', error)

//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         status: 'error',
//         message: 'Failed to load products'
//       })
//     }
//   }
// }

export const postProductHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.name || typeof body.price_credit !== "number") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: "error",
          message: "name and price_credit required"
        })
      };
    }

    const insertSql = `
      INSERT INTO products (name, description, price_credit, image_url, era)
      VALUES (:name, :description, :price_credit, :image_url, :era)
      RETURNING id, name, description, price_credit, image_url, era
    `;

    const result = await runQuery(insertSql, {
      name: body.name,
      description: body.description || "",
      price_credit: body.price_credit,
      image_url: body.image_url || "",
      era: body.era || ""
    });

    const product =
      result?.records?.[0] ||
      result?.rows?.[0];

    return {
      statusCode: 201,
      body: JSON.stringify({
        status: "created",
        product
      })
    };

  } catch (error) {
    console.error("Error creating product:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "error",
        message: "Could not create product"
      })
    };
  }
};

  //Signup 
  export const postUsersHandler = async (event, context) => {
  logInvocationDetails(event, context);

  try {
    if (!event.body) {
      return jsonResponse(400, {
        status: 'error',
        message: 'Request body is required'
      });
    }

    const { user_id, name, username, email } = JSON.parse(event.body);

    // Basic validation
    if (!user_id || !name || !username || !email) {
      return jsonResponse(400, {
        status: 'error',
        message: 'user_id, name, username, and email are required'
      });
    }

    // For now, just echo back what was sent
    return jsonResponse(201, {
      status: 'User created successfully',
      user: {
        user_id,
        name,
        username,
        email
      }
    });

  } catch (error) {
    console.error('postUsersHandler error:', error);

    return jsonResponse(500, {
      status: 'error',
      message: 'Failed to create user'
    });
  }
}


