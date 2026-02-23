import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
    const SUPABASE_URL = process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const KIRVANO_WEBHOOK_TOKEN = process.env.KIRVANO_WEBHOOK_TOKEN

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error("ERRO: Variáveis SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas na Vercel.")
        return res.status(500).json({ error: 'Configuração do servidor incompleta. Verifique as variáveis de ambiente na Vercel.' })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST para enviar webhooks da Kirvano.' })
    }

    // Validar token da Kirvano
    const token = req.headers['x-kirvano-token']
    if (KIRVANO_WEBHOOK_TOKEN && token !== KIRVANO_WEBHOOK_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const body = req.body
    const buyersEmail = body.customer?.email
    const event = body.event // 'venda_aprovada', 'assinatura_ativada'
    const status = body.status // 'aprovada', 'completa'
    const productName = body.product?.name?.toLowerCase() || ''

    if (!buyersEmail) {
        return res.status(400).json({ error: 'Missing customer email' })
    }

    try {
        // Mapear planos pelos preços informados ou nome
        let tier = 'monthly' // Padrão
        let daysToAdd: number | null = 30

        if (productName.includes('vitalício') || productName.includes('lifetime')) {
            tier = 'lifetime'
            daysToAdd = null // Sem expiração
        } else if (productName.includes('semanal')) {
            tier = 'weekly'
            daysToAdd = 7
        } else if (productName.includes('semestral')) {
            tier = 'semiannual'
            daysToAdd = 180
        } else if (productName.includes('anual')) {
            tier = 'annual'
            daysToAdd = 365
        }

        const expiryDate = daysToAdd ? new Date() : null;
        if (expiryDate && daysToAdd) {
            expiryDate.setDate(expiryDate.getDate() + daysToAdd);
        }

        const subscriptionData = {
            subscription_tier: tier,
            subscription_status: 'active',
            subscription_end_date: expiryDate ? expiryDate.toISOString() : null
        };

        // 1. Tentar atualizar o perfil diretamente se o email estiver lá
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update(subscriptionData)
            .eq('email', buyersEmail)
            .select();

        // 2. Se falhar (e.g. email não está em profiles), buscar no auth.users
        if (updateError || !updatedProfile?.length) {
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
            const targetUser = users.find(u => u.email?.toLowerCase() === buyersEmail.toLowerCase())

            if (targetUser) {
                await supabase
                    .from('profiles')
                    .update({
                        subscription_tier: tier,
                        subscription_status: 'active',
                        subscription_end_date: expiryDate ? expiryDate.toISOString() : null
                    })
                    .eq('user_id', targetUser.id)
            }
        }

        console.log(`Assinatura ativa para: ${buyersEmail} - Plano: ${tier}`)
        return res.status(200).json({ success: true, message: 'Subscription processed' })
    } catch (err) {
        console.error('Webhook processing error:', err)
        return res.status(500).json({ error: 'Internal error' })
    }
}
