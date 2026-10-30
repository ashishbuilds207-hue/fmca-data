export function num(value: unknown): number | null {
    if (value == null || value === '') return null
    const n = Number(String(value).replace(/,/g, '').replace(/%/g, ''))
    return Number.isFinite(n) ? n : null
}

export function formatNumber(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value)) return '—'
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}

export function formatPercent(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value)) return '—'
    return `${value.toFixed(1)}%`
}

export function formatMoney(value: number | null | undefined) {
    if (value == null || !Number.isFinite(value)) return '—'
    const dollars = value > 0 && value < 10000 ? value * 1000 : value
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(dollars)
}

export function formatPhone(value: string | null | undefined) {
    const digits = String(value || '').replace(/\D/g, '')
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    if (digits.length === 11 && digits.startsWith('1')) {
        return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }
    return value?.trim() || null
}

export function formatYmd(value: string | null | undefined) {
    if (!value) return null
    const digits = String(value).replace(/\D/g, '')
    if (digits.length < 8) return String(value)
    const date = new Date(
        Number(digits.slice(0, 4)),
        Number(digits.slice(4, 6)) - 1,
        Number(digits.slice(6, 8)),
    )
    if (Number.isNaN(date.getTime())) return String(value)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export function monthKey(value: string | null | undefined) {
    const digits = String(value || '').replace(/\D/g, '')
    if (digits.length < 6) return null
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}`
}

export function labelize(key: string) {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function statusLabel(code: string | null) {
    if (!code) return 'Unknown'
    const map: Record<string, string> = {
        A: 'Active',
        I: 'Inactive',
        P: 'Pending',
        N: 'Not rated',
    }
    return map[code.toUpperCase()] || code
}

export function safetyLabel(code: string | null) {
    if (!code) return 'Not rated'
    const map: Record<string, string> = {
        S: 'Satisfactory',
        C: 'Conditional',
        U: 'Unsatisfactory',
    }
    return map[code.toUpperCase()] || code
}

export function operationLabel(code: string | null) {
    if (!code) return null
    const map: Record<string, string> = {
        A: 'Interstate',
        B: 'Intrastate hazmat',
        C: 'Intrastate non-hazmat',
    }
    return map[code.toUpperCase()] || code
}

const ENTITY: Record<string, string> = {
    C: 'Carrier',
    S: 'Shipper',
    B: 'Broker',
    F: 'Freight forwarder',
    R: 'Registrant',
    T: 'Cargo tank',
    I: 'Intermodal equipment',
}

export function entityTypes(value: string | null) {
    if (!value) return []
    return value
        .split(/[;,\s]+/)
        .map((part) => part.trim().toUpperCase())
        .filter(Boolean)
        .map((part) => ENTITY[part] || part)
}

const FLEET: Record<string, string> = {
    A: '1 power unit',
    B: '2–3 power units',
    C: '4–6 power units',
    D: '7–8 power units',
    E: '9–11 power units',
    F: '12–14 power units',
    G: '15–17 power units',
    H: '18–19 power units',
    I: '20–23 power units',
    J: '24–28 power units',
    K: '29–32 power units',
    L: '33–38 power units',
    M: '39–44 power units',
    N: '45–55 power units',
    O: '56–75 power units',
    P: '76–100 power units',
    Q: '101–200 power units',
    R: '201–300 power units',
    S: '301–400 power units',
    T: '401–550 power units',
    U: '551–999 power units',
    V: '1,000–2,000 power units',
    W: '2,001–3,000 power units',
    X: '3,001–4,000 power units',
    Y: '4,001–5,000 power units',
    Z: '5,001+ power units',
}

export function fleetSizeLabel(code: string | null) {
    if (!code) return null
    return FLEET[code.toUpperCase()] || `Fleet code ${code}`
}

const CARGO: Record<string, string> = {
    crgo_genfreight: 'General freight',
    crgo_household: 'Household goods',
    crgo_metalsheet: 'Metal sheets and coils',
    crgo_motoveh: 'Motor vehicles',
    crgo_drivetow: 'Driveaway / towaway',
    crgo_logpole: 'Logs, poles, lumber',
    crgo_bldgmat: 'Building materials',
    crgo_mobilehome: 'Mobile homes',
    crgo_machlrg: 'Machinery and large objects',
    crgo_produce: 'Fresh produce',
    crgo_liqgas: 'Liquids and gases',
    crgo_intermodal: 'Intermodal containers',
    crgo_passengers: 'Passengers',
    crgo_oilfield: 'Oilfield equipment',
    crgo_livestock: 'Livestock',
    crgo_grainfeed: 'Grain, feed, hay',
    crgo_coalcoke: 'Coal and coke',
    crgo_meat: 'Meat',
    crgo_garbage: 'Garbage and refuse',
    crgo_usmail: 'U.S. mail',
    crgo_chem: 'Chemicals',
    crgo_drybulk: 'Dry bulk commodities',
    crgo_coldfood: 'Refrigerated food',
    crgo_beverages: 'Beverages',
    crgo_paperprod: 'Paper products',
    crgo_utility: 'Utility',
    crgo_farmsupp: 'Farm supplies',
    crgo_construct: 'Construction',
    crgo_waterwell: 'Water well',
    crgo_cargoothr: 'Other cargo',
}

export function cargoList(record: Record<string, unknown>) {
    const items: string[] = []
    for (const [key, value] of Object.entries(record)) {
        if (!key.startsWith('crgo_') || key.endsWith('_desc')) continue
        if (String(value).toUpperCase() !== 'X') continue
        if (key === 'crgo_cargoothr' && record.crgo_cargoothr_desc) {
            items.push(`Other: ${record.crgo_cargoothr_desc}`)
        } else {
            items.push(CARGO[key] || labelize(key.replace(/^crgo_/, '')))
        }
    }
    return items
}

export function windowStart(months = 24) {
    const date = new Date()
    date.setMonth(date.getMonth() - months)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}${m}${d}`
}

export function monthAxis(sinceYmd: string) {
    const start = new Date(
        Number(sinceYmd.slice(0, 4)),
        Number(sinceYmd.slice(4, 6)) - 1,
        1,
    )
    const end = new Date()
    const months: string[] = []
    const cursor = new Date(start)
    while (cursor <= end && months.length < 30) {
        months.push(
            `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`,
        )
        cursor.setMonth(cursor.getMonth() + 1)
    }
    return months
}

export function parseDots(input: string) {
    const found = input.toUpperCase().match(/\d{1,8}/g) || []
    const unique: string[] = []
    for (const dot of found) {
        const normalized = String(Number(dot))
        if (normalized === '0' || unique.includes(normalized)) continue
        unique.push(normalized)
    }
    return unique
}

export function yes(value: unknown) {
    return String(value || '').toUpperCase() === 'Y'
}
