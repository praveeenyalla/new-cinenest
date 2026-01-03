import { neon } from '@netlify/neon';

export const handler = async (event, context) => {
    try {
        // The neon() wrapper automatically uses the NETLIFY_DATABASE_URL environment variable
        const sql = neon();
        const result = await sql`SELECT NOW() as time`;

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: "success",
                message: "Connected to Neon PostgreSQL",
                timestamp: result[0].time
            })
        };
    } catch (error) {
        console.error("Neon Connection Error:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                status: "error",
                message: error.message
            })
        };
    }
};
