import { createClient } from '@supabase/supabase-js'

export default async function handler(req: any, res: any) {
    const SUPABASE_URL = process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    const KIRVANO_WEBHOOK_TOKEN = process.env.KIRVANO_WEBHOOK_TOKEN

    // Verificação de segurança: Variáveis de ambiente
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        console.error("ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas.")
        return res.status(500).json({ error: 'Configuração do servidor incompleta.' })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Apenas aceitar POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            message: 'Esta URL está aguardando Webhooks da Kirvano via POST.'
        })
    }

    // Validar token da Kirvano
    const token = req.headers['x-kirvano-token']
    if (KIRVANO_WEBHOOK_TOKEN && token !== KIRVANO_WEBHOOK_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const body = req.body
    const buyersEmail = body.customer?.email
    const productName = body.product?.name?.toLowerCase() || ''

    if (!buyersEmail) {
        return res.status(400).json({ error: 'Missing customer email' })
    }

    try {
        // Lógica de Tiers/Prazos
        let tier = 'monthly'
        let daysToAdd: number | null = 30

        if (productName.includes('vitalício') || productName.includes('lifetime')) {
            tier = 'lifetime'
            daysToAdd = null
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

        const expiryDate = daysToAdd ? new Date() : null
        if (expiryDate && daysToAdd) {
            expiryDate.setDate(expiryDate.getDate() + daysToAdd)
        }

        const subscriptionData = {
            subscription_tier: tier,
            subscription_status: 'active',
            subscription_end_date: expiryDate ? expiryDate.toISOString() : null
        }

        // 1. Tentar atualizar pelo email (se existir no profile)
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update(subscriptionData)
            .eq('email', buyersEmail)
            .select()

        // 2. Fallback: Buscar por email no Auth e atualizar por user_id
        if (updateError || !updatedProfile?.length) {
            const { data: { users } } = await supabase.auth.admin.listUsers()
            const targetUser = users.find(u => u.email?.toLowerCase() === buyersEmail.toLowerCase())

            if (targetUser) {
                await supabase
                    .from('profiles')
                    .update(subscriptionData)
                    .eq('user_id', targetUser.id)
            }
        }

        console.log(`Assinatura processada: ${buyersEmail} -> ${tier}`)
        return res.status(200).json({ success: true, tier })
    } catch (err) {
        console.error('Webhook error:', err)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
