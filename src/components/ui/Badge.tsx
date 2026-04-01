import clsx from 'clsx'

const STYLES: Record<string, string> = {
  active:                'bg-green-50  text-green-800',
  completed:             'bg-green-50  text-green-800',
  accepted:              'bg-blue-50   text-blue-800',
  proposed:              'bg-purple-50 text-purple-800',
  pending_verification:  'bg-yellow-50 text-yellow-800',
  inactive:              'bg-gray-100  text-gray-500',
  cancelled:             'bg-gray-100  text-gray-500',
  suspended:             'bg-red-50    text-red-800',
  disputed:              'bg-red-50    text-red-800',
  expired:               'bg-gray-100  text-gray-500',
  past_due:              'bg-orange-50 text-orange-800',
  purchase:              'bg-purple-50 text-purple-800',
  transfer_in:           'bg-green-50  text-green-800',
  transfer_out:          'bg-orange-50 text-orange-800',
  redeem:                'bg-blue-50   text-blue-800',
  exchange_fee:          'bg-gray-100  text-gray-600',
  subscription_payment:  'bg-teal-50   text-teal-800',
}

export function Badge({ status }: { status: string }) {
  return (
    <span className={clsx(
      'inline-block text-xs font-medium px-2 py-0.5 rounded-full',
      STYLES[status] ?? 'bg-gray-100 text-gray-500'
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
