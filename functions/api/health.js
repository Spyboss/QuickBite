/**
 * Health check endpoint for QuickBite API
 * This is a simple function to verify that Cloudflare Functions are working
 */
export async function onRequest(context) {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: context.env.NODE_ENV || 'development',
    version: '1.0.0'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
