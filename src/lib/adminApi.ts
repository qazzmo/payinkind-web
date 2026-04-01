import { api } from './api'

export const Admin = {
  metrics:      ()                          => api.get('/admin/metrics'),
  members:      (p?: { status?: string; limit?: number; offset?: number }) =>
                  api.get('/admin/members', { params: p }),
  setMemberStatus: (id: string, status: string) =>
                  api.patch(`/admin/members/${id}/status`, { status }),
  exchanges:    (p?: { status?: string })   => api.get('/admin/exchanges', { params: p }),
  setExchangeStatus: (id: string, status: string) =>
                  api.patch(`/admin/exchanges/${id}/status`, { status }),
  pods:         ()                          => api.get('/admin/pods'),
  tokenLedger:  (p?: { txType?: string })   => api.get('/admin/token-ledger', { params: p }),
  ledgerCheck:  ()                          => api.get('/admin/token-ledger/balance-check'),
  subscriptions:()                          => api.get('/admin/subscriptions'),
}
