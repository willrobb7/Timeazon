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
export const productCatalogHandler = async (event, context) => {
  logInvocationDetails(event, context);

  try {
    // When Aurora is wired in and env vars are set:
    //
    // const result = await runQuery(`
    //   SELECT id, name, description, price_credit, image_url
    //   FROM products
    //   WHERE image_url IS NOT NULL
    //   ORDER BY id;
    // `);
    //
    // const rows = normaliseRows(result);
    // const productObjects = rows.map((r) => ({
    //   id: r.id,
    //   name: r.name,
    //   description: r.description,
    //   priceCredit: r.price_credit,
    //   imageUrl: r.image_url,
    //   slug: r.image_url.replace(/\.image$/i, '')
    // }));
    //
    // const productSlugs = productObjects.map((p) => p.slug);

    // For now, static mock until DB is ready:
    return jsonResponse(200, {
      status: 'ok',
      product: {
        product_id: 'productId',
        name: 'Magna Carta',
        description:
          'The Magna Carta, also known as the Great Charter, is a historic document that was signed in 1215. It established the principle that everyone, including the king, is subject to the law.',
        priceCredit: '500',
        image: 'magna-carta.png'
      }
      // featuredProduct: process.env.FEATURED_PRODUCT || null,
      // products: productSlugs,
      // productDetails: productObjects
    });
  } catch (error) {
    console.error('productCatalogHandler error:', error);

    return jsonResponse(500, {
      status: 'error',
      message: 'Failed to load products'
    });
  }
};

// -------------------------
// USERS
// -------------------------
export const postUsersHandler = async (event, context) => {
  logInvocationDetails(event, context);

  try {
    // Later: parse event.body and actually insert into DB using runQuery.
    // For now, return a static payload.
    return jsonResponse(200, {
      status: 'User created successfully',
      user: {
        user_id: 'userId',
        name: 'Darshan Dave',
        username: 'darshan_dave',
        email: 'darshan@example.com'
      }
    });
  } catch (error) {
    console.error('postUsersHandler error:', error);

    return jsonResponse(500, {
      status: 'error',
      message: 'Failed to create user'
    });
  }
};
