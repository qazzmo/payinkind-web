import axios from 'axios'

export const api = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  withCredentials: true,
})

// Inject JWT on every request
api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('pik_token')
    : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('pik_refresh')
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken: refresh }
        )
        localStorage.setItem('pik_token', data.token)
        original.headers.Authorization = `Bearer ${data.token}`
        return api(original)
      } catch {
        localStorage.removeItem('pik_token')
        localStorage.removeItem('pik_refresh')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Typed API helpers ─────────────────────────────────────────────────────────

export const Auth = {
  register: (body: RegisterBody)      => api.post('/auth/register', body),
  login:    (body: LoginBody)         => api.post('/auth/login', body),
  refresh:  (refreshToken: string)    => api.post('/auth/refresh', { refreshToken }),
}

export const Listings = {
  list:         ()          => api.get('/listings'),
  my:           ()          => api.get('/listings/my'),
  serviceTypes: ()          => api.get('/listings/service-types'),
  create:       (b: any)    => api.post('/listings', b),
  update:       (id: string, b: any) => api.patch(`/listings/${id}`, b),
  archive:      (id: string)         => api.delete(`/listings/${id}`),
}

export const Exchanges = {
  list:     ()                     => api.get('/exchanges'),
  get:      (id: string)           => api.get(`/exchanges/${id}`),
  propose:  (b: ProposeBody)       => api.post('/exchanges', b),
  accept:   (id: string)           => api.patch(`/exchanges/${id}/accept`),
  complete: (id: string)           => api.patch(`/exchanges/${id}/complete`),
}

export const Tokens = {
  balance:         ()                      => api.get('/tokens/balance'),
  history:         ()                      => api.get('/tokens/history'),
  buy:             (cashAmountCents: number) => api.post('/tokens/buy', { cashAmountCents }),
  transfer:        (toUserId: string, tokenAmount: number) =>
                     api.post('/tokens/transfer', { toUserId, tokenAmount }),
  redeem:          (tokenAmount: number)   => api.post('/tokens/redeem', { tokenAmount }),
  paySubscription: (months: number)        => api.post('/tokens/pay-subscription', { months }),
}

export const Chat = {
  history: (exchangeId: string) => api.get(`/chat/${exchangeId}/history`),
  connect: (exchangeId: string, token: string) => {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000')
      .replace('http', 'ws')
    return new WebSocket(`${base}/chat/${exchangeId}?token=${token}`)
  },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface RegisterBody {
  fullName: string; email: string; phone?: string
  password: string; address?: string
  city?: string; state?: string; zip?: string
  lat?: number; lng?: number
}
interface LoginBody   { email: string; password: string }
interface ProposeBody {
  listingAId: string; listingBId: string
  qtyA: number; qtyB: number
  cashTopUp?: number; scheduledAt?: string
}
