
import { supabase } from './supabase'

export async function generateOverdueAlerts(userId: string) {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString()

  // Find pending medication doses overdue by at least 30 minutes.
  const { data: overdueLogs, error: logsError } = await supabase
    .from('medication_logs')
    .select('id, medication_id, user_id')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lt('scheduled_for', cutoff)

  if (logsError) {
    throw logsError
  }

  if (!overdueLogs || overdueLogs.length === 0) {
    return 0
  }

  const alerts = overdueLogs.map((log) => ({
    user_id: log.user_id,
    medication_id: log.medication_id,
    medication_log_id: log.id,
    alert_type: 'overdue_dose' as const,
    message: 'A scheduled medication dose is overdue by more than 30 minutes.',
  }))

  // medication_log_id is unique, so repeated checks won't duplicate alerts.
  const { error: insertError } = await supabase
    .from('care_alerts')
    .upsert(alerts, {
      onConflict: 'medication_log_id',
      ignoreDuplicates: true,
    })

  if (insertError) {
    throw insertError
  }

  return alerts.length
}
