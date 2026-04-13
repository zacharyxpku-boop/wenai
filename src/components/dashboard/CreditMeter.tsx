'use client'
import { useQuery } from '@tanstack/react-query'
import { Coins } from 'lucide-react'

export function CreditMeter({ initialBalance }: { initialBalance: number }) {
  const { data: balance } = useQuery({
    queryKey: ['credit-balance'],
    queryFn: () =>
      fetch('/api/credits/balance')
        .then(r => r.json())
        .then(d => d.balance as number),
    initialData: initialBalance,
    refetchInterval: 10_000,
  })

  const low = typeof balance === 'number' && balance < 10

  return (
    <div className="flex items-center gap-2 text-sm">
      <Coins className={`w-4 h-4 ${low ? 'text-amber-400' : 'text-emerald-500'}`} />
      <span className={`font-mono font-medium ${low ? 'text-amber-400' : 'text-zinc-50'}`}>
        {balance ?? initialBalance}
      </span>
      <span className="text-zinc-500">credits</span>
    </div>
  )
}
