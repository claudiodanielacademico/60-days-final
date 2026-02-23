export default async function handler(req: any, res: any) {
    try {
        console.log("Webhook test received", req.method);
        return res.status(200).json({
            message: "Conexão com a API OK!",
            method: req.method,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({ error: "Erro interno no teste", details: error });
    }
}
