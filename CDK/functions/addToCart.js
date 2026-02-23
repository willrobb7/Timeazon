// functions/addToCart.js
export const postToCartHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok' })
  }
}

export const getToCartHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok' })
  }
}

export const deleteFromCartHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok' })
  }
}

// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import {
//   DynamoDBDocumentClient,
//   PutCommand,
//   QueryCommand,
//   DeleteCommand
// } from "@aws-sdk/lib-dynamodb";

// // CDK sets these via lambdaEnvVars
// const TABLE_NAME = process.env.FAVOURITES_TABLE_NAME;
// const REGION = process.env.DYNAMO_REGION;

// const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }));

// const jsonResponse = (statusCode, body) => ({
//   statusCode,
//   headers: {
//     "Content-Type": "application/json",
//     "Access-Control-Allow-Origin": "*"
//   },
//   body: JSON.stringify(body)
// });

// const parseBody = (event) => {
//   if (!event?.body) return {};
//   try {
//     return JSON.parse(event.body);
//   } catch {
//     return {};
//   }
// };

// const normaliseEmail = (email) => String(email || "").trim().toLowerCase();
// const normaliseProductId = (productId) => String(productId || "").trim();

// POST /api/addToCart
// Body: { email, productId }
// Adds to cart (idempotent: calling again just overwrites same item)
// export const postToCartHandler = async (event) => {
//   console.log("event:", JSON.stringify(event));
//   console.log("body:", event.body);
//   try {
//     if (!TABLE_NAME) return jsonResponse(500, { status: "error", message: "Missing FAVOURITES_TABLE_NAME" });
//     if (!REGION) return jsonResponse(500, { status: "error", message: "Missing DYNAMO_REGION" });

//     const body = parseBody(event);
//     const email = normaliseEmail(body.email);
//     const productId = normaliseProductId(body.productId);

//     if (!email || !productId) {
//       return jsonResponse(400, { status: "error", message: "Email and productId are required" });
//     }

//     const item = {
//       email,
//       productId,
//       createdAt: new Date().toISOString()
//     };

//     await ddb.send(
//       new PutCommand({
//         TableName: TABLE_NAME,
//         Item: item
//       })
//     );

//     return jsonResponse(201, {
//       status: "added to cart",
//       favourite: item
//     });
//   } catch (err) {
//     console.error("postToCartHandler error:", err);
//     return jsonResponse(500, { status: "error", message: "Could not add product to cart" });
//   }
// };

// GET /api/addToCart?email=...
// Returns all products in cart for a user using Query on the partition key
// export const getToCartHandler = async (event) => {
//   console.log("event:", JSON.stringify(event));
//   console.log("body:", event.body);
//   try {
//     if (!TABLE_NAME) return jsonResponse(500, { status: "error", message: "Missing FAVOURITES_TABLE_NAME" });
//     if (!REGION) return jsonResponse(500, { status: "error", message: "Missing DYNAMO_REGION" });

//     const email = normaliseEmail(event?.queryStringParameters?.email);

//     if (!email) {
//       return jsonResponse(400, { status: "error", message: "Missing email query parameter" });
//     }

//     const result = await ddb.send(
//       new QueryCommand({
//         TableName: TABLE_NAME,
//         KeyConditionExpression: "#email = :email",
//         ExpressionAttributeNames: { "#email": "email" },
//         ExpressionAttributeValues: { ":email": email }
//       })
//     );

//     const favourites = result?.Items || [];

//     return jsonResponse(200, {
//       status: "ok",
//       email,
//       count: favourites.length,
//       favourites
//     });
//   } catch (err) {
//     console.error("getToCartHandler error:", err);
//     return jsonResponse(500, { status: "error", message: "Could not load the cart" });
//   }
// };

// DELETE /api/favourites
// Body: { email, productId }
// Removes a favourite if it exists
// export const deleteFromCartHandler = async (event) => {
//   console.log("event:", JSON.stringify(event));
//   console.log("body:", event.body);
//   try {
//     if (!TABLE_NAME) return jsonResponse(500, { status: "error", message: "Missing FAVOURITES_TABLE_NAME" });
//     if (!REGION) return jsonResponse(500, { status: "error", message: "Missing DYNAMO_REGION" });

//     const body = parseBody(event);
//     const email = normaliseEmail(body.email);
//     const productId = normaliseProductId(body.productId);

//     if (!email || !productId) {
//       return jsonResponse(400, { status: "error", message: "Email and productId are required" });
//     }

//     await ddb.send(
//       new DeleteCommand({
//         TableName: TABLE_NAME,
//         Key: { email, productId }
//       })
//     );

//     return jsonResponse(200, {
//       status: "deleted",
//       email,
//       productId
//     });
//   } catch (err) {
//     console.error("deleteFromCartHandler error:", err);
//     return jsonResponse(500, { status: "error", message: "Could not delete product from cart" });
//   }
// };
