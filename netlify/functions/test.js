export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Netlify functions are working!',
      timestamp: new Date().toISOString(),
      event: {
        method: event.httpMethod,
        path: event.path,
        headers: event.headers
      }
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };
}
