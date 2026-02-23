import { createClient } from '@supabase/supabase-js'

// Estas variáveis devem ser configuradas no Supabase/Vercel
const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const KIRVANO_WEBHOOK_TOKEN = process.env.KIRVANO_WEBHOOK_TOKEN!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    // Validar token da Kirvano (se enviado)
    const token = req.headers['x-kirvano-token']
    if (KIRVANO_WEBHOOK_TOKEN && token !== KIRVANO_WEBHOOK_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const body = req.body
    const buyersEmail = body.customer?.email
    const event = body.event // e.g., 'venda_confirmada', 'assinatura_ativada'
    const status = body.status // e.g., 'aprovada', 'pendente', 'cancelada'
    const productTier = body.product?.name?.toLowerCase() || 'monthly' // Exemplo simplificado

    if (!buyersEmail) {
        return res.status(400).json({ error: 'Missing customer email' })
    }

    try {
        // Mapear planos da Kirvano para nossos tiers
        let tier = 'free'
        if (productTier.includes('semanal')) tier = 'weekly'
        else if (productTier.includes('mensal')) tier = 'monthly'
        else if (productTier.includes('semestral')) tier = 'semiannual'
        else if (productTier.includes('anual')) tier = 'annual'

        // Calcular data de expiração (Simplificado)
        let days = 30
        if (tier === 'weekly') days = 7
        else if (tier === 'semiannual') days = 180
        else if (tier === 'annual') days = 365

        const endDate = new Date()
        endDate.setDate(endDate.getDate() + days)

        // Atualizar no banco de dados
        const { error } = await supabase
            .from('profiles')
            .update({
                subscription_tier: tier,
                subscription_status: status === 'aprovada' ? 'active' : 'inactive',
                subscription_end_date: endDate.toISOString()
            })
            .eq('email', buyersEmail) // Assumindo que temos o campo email em profiles OU precisamos buscar por Auth

        // Se não tivermos o email direto em profiles, buscar o user_id no auth
        if (error) {
            // Alternativa: Buscar o usuário pelo email no auth.users
            const { data: userData } = await supabase.auth.admin.listUsers()
            const targetUser = userData.users.find(u => u.email === buyersEmail)

            if (targetUser) {
                await supabase
                    .from('profiles')
                    .update({
                        subscription_tier: tier,
                        subscription_status: status === 'aprovada' ? 'active' : 'inactive',
                        subscription_end_date: endDate.toISOString()
                    })
                    .eq('user_id', targetUser.id)
            }
        }

        return res.status(200).json({ success: true })
    } catch (err) {
        console.error('Webhook error:', err)
        return res.status(500).json({ error: 'Internal Server Error' })
    }
}
