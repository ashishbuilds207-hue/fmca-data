import { buildScore } from '@/lib/lookup/score'
import {
    cargoList,
    entityTypes,
    fleetSizeLabel,
    formatPhone,
    formatYmd,
    labelize,
    monthAxis,
    monthKey,
    num,
    operationLabel,
    safetyLabel,
    statusLabel,
    windowStart,
    yes,
} from '@/lib/lookup/format'
import type {
    AuthorityRow,
    BasicRow,
    CarrierReport,
    CrashMonth,
    SourceState,
} from '@/lib/lookup/types'

const SODA = 'https://data.transportation.gov/resource'
const SMS_FILES = [
    { id: 'm3ry-qcip', name: 'SMS AB Pass' },
    { id: '4y6x-dmck', name: 'SMS AB PassProperty' },
    { id: 'h3zn-uid9', name: 'SMS C Pass' },
    { id: 'h9zy-gjn8', name: 'SMS C PassProperty' },
]
const BASIC_DEFS = [
    ['unsafe_driv', 'Unsafe driving'],
    ['hos_driv', 'Hours of service'],
    ['driv_fit', 'Driver fitness'],
    ['contr_subst', 'Controlled substances'],
    ['veh_maint', 'Vehicle maintenance'],
] as const

type Row = Record<string, unknown>

async function getJson(url: string | URL) {
    const response = await fetch(String(url), {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(20000),
    })
    const text = await response.text()
    let data: unknown = null
    try {
        data = JSON.parse(text)
    } catch {
        data = text
    }
    const message =
        data && typeof data === 'object' && 'message' in data
            ? String((data as { message?: unknown }).message || '')
            : ''
    if (!response.ok || (data && typeof data === 'object' && 'error' in data && (data as { error?: unknown }).error)) {
        throw new Error(message || `HTTP ${response.status}`)
    }
    return data
}

function rowsOf(data: unknown): Row[] {
    return Array.isArray(data) ? (data as Row[]) : []
}

function text(value: unknown) {
    const clean = String(value ?? '').trim()
    return clean || null
}

function readBasics(row: Row): BasicRow[] {
    return BASIC_DEFS.map(([key, name]) => ({
        name,
        measure: text(row[`${key}_measure`]),
        percentile: text(row[`${key}_pct`]),
        alert: yes(row[`${key}_basic_alert`]) || yes(row[`${key}_rd_alert`]),
        acute: yes(row[`${key}_ac`]),
        inspectionsWithViolation: num(row[`${key}_insp_w_viol`]),
    })).filter(
        (basic) =>
            basic.measure ||
            basic.percentile ||
            basic.alert ||
            basic.acute ||
            basic.inspectionsWithViolation != null,
    )
}

function rate(part: number | null, whole: number | null) {
    if (part == null || !whole) return null
    return (part / whole) * 100
}

function insuranceAmount(value: unknown) {
    const amount = num(value)
    if (amount == null) return null
    return amount > 0 && amount < 10000 ? amount * 1000 : amount
}

function forHire(record: Row) {
    const classdef = String(record.classdef || '')
    const carship = String(record.carship || '').toUpperCase()
    return /AUTHORIZED FOR HIRE|EXEMPT FOR HIRE|BROKER|FREIGHT FORWARDER/i.test(classdef) || /[BF]/.test(carship)
}

function censusFields(record: Row) {
    return Object.entries(record)
        .filter(([, value]) => value != null && String(value).trim() !== '')
        .map(([key, value]) => ({ label: labelize(key), value: String(value) }))
        .sort((a, b) => a.label.localeCompare(b.label))
}

function mcNumbers(record: Row) {
    const numbers: string[] = []
    for (const slot of [1, 2, 3]) {
        const prefix = text(record[`docket${slot}prefix`])
        const docket = text(record[`docket${slot}`])
        if (prefix && docket) numbers.push(`${prefix}${docket}`)
        else if (docket) numbers.push(docket)
    }
    return numbers
}

async function loadSms(dot: string) {
    const hits = await Promise.all(
        SMS_FILES.map(async (file) => {
            try {
                const data = await getJson(`${SODA}/${file.id}.json?dot_number=${dot}&$limit=1`)
                const row = rowsOf(data)[0]
                return row ? { file, row } : null
            } catch {
                return null
            }
        }),
    )
    const found = hits.filter((hit): hit is { file: (typeof SMS_FILES)[number]; row: Row } => Boolean(hit))
    const richness = (row: Row) => {
        const basics = readBasics(row)
        return basics.filter((item) => item.percentile).length * 10 + basics.filter((item) => item.alert || item.acute).length
    }
    found.sort((a, b) => richness(b.row) - richness(a.row) || (num(b.row.insp_total) || 0) - (num(a.row.insp_total) || 0))
    return found[0] || null
}

async function loadCrashes(dot: string, since: string) {
    const where = `dot_number='${dot}' AND report_date>='${since}'`
    const countUrl = new URL(`${SODA}/aayw-vxb3.json`)
    countUrl.searchParams.set('$select', 'count(*) as crashes')
    countUrl.searchParams.set('$where', where)
    const rowsUrl = new URL(`${SODA}/aayw-vxb3.json`)
    rowsUrl.searchParams.set('$select', 'report_date,fatalities,injuries,state,city,tow_away')
    rowsUrl.searchParams.set('$where', where)
    rowsUrl.searchParams.set('$order', 'report_date DESC')
    rowsUrl.searchParams.set('$limit', '400')

    const [countResult, rowsResult] = await Promise.allSettled([getJson(countUrl), getJson(rowsUrl)])
    if (countResult.status === 'rejected' && rowsResult.status === 'rejected') {
        throw countResult.reason
    }
    const countRow = countResult.status === 'fulfilled' ? rowsOf(countResult.value)[0] : null
    const crashRows = rowsResult.status === 'fulfilled' ? rowsOf(rowsResult.value) : []
    const count = num(countRow?.crashes) ?? crashRows.length
    const fatalities = crashRows.reduce((sum, row) => sum + (num(row.fatalities) || 0), 0)
    const injuries = crashRows.reduce((sum, row) => sum + (num(row.injuries) || 0), 0)
    const partial = crashRows.length > 0 && count > crashRows.length
    const byMonth = new Map<string, CrashMonth>()
    if (!partial) {
        for (const month of monthAxis(since)) {
            byMonth.set(month, { month, crashes: 0, fatalities: 0, injuries: 0 })
        }
    }
    for (const row of crashRows) {
        const key = monthKey(text(row.report_date))
        if (!key) continue
        if (!byMonth.has(key)) {
            if (!partial) continue
            byMonth.set(key, { month: key, crashes: 0, fatalities: 0, injuries: 0 })
        }
        const bucket = byMonth.get(key)!
        bucket.crashes += 1
        bucket.fatalities += num(row.fatalities) || 0
        bucket.injuries += num(row.injuries) || 0
    }
    return {
        count,
        fatalities: rowsResult.status === 'fulfilled' ? fatalities : null,
        injuries: rowsResult.status === 'fulfilled' ? injuries : null,
        partial,
        monthly: Array.from(byMonth.values()).sort((a, b) => a.month.localeCompare(b.month)),
        recent: crashRows.slice(0, 6).map((row) => ({
            date: formatYmd(text(row.report_date)) || '—',
            place: [text(row.city), text(row.state)].filter(Boolean).join(', ') || '—',
            fatalities: num(row.fatalities) || 0,
            injuries: num(row.injuries) || 0,
            towAway: yes(row.tow_away),
        })),
        ok: countResult.status === 'fulfilled' || rowsResult.status === 'fulfilled',
    }
}

function source(id: string, label: string, state: SourceState['state'], note: string): SourceState {
    return { id, label, state, note }
}

function emptyReport(dot: string, message: string): CarrierReport {
    return {
        dot,
        name: `USDOT ${dot}`,
        dba: null,
        location: '—',
        street: null,
        phone: null,
        email: null,
        officers: [],
        statusCode: null,
        statusLabel: 'Unknown',
        safetyRatingCode: null,
        safetyRatingLabel: 'Not rated',
        safetyRatingDate: null,
        censusDate: null,
        operationLabel: null,
        entityTypes: [],
        classification: [],
        cargo: [],
        fleet: {
            powerUnits: null,
            trucks: null,
            buses: null,
            drivers: null,
            cdlDrivers: null,
            mileage: null,
            mileageYear: null,
            fleetSize: null,
            hazmat: false,
        },
        mcNumbers: [],
        authorities: [],
        sms: null,
        inspectionCount24: null,
        crashes: { count: null, fatalities: null, injuries: null, partial: false, monthly: [], recent: [] },
        live: null,
        censusFields: [],
        score: buildScore({
            censusFound: false,
            status: null,
            safetyRating: null,
            priorRevoke: false,
            forHire: false,
            motusOk: false,
            motusCount: 0,
            activeAuthority: false,
            insuranceShort: false,
            bondMissing: false,
            cargoInsuranceMissing: false,
            smsPresent: false,
            alertCount: 0,
            acuteCount: 0,
            driverOosRate: null,
            vehicleOosRate: null,
            driverBenchmark: 5.51,
            vehicleBenchmark: 20.72,
            crashOk: false,
            crashes: null,
            fatalities: null,
            injuries: null,
            fatalitiesPartial: false,
            powerUnits: null,
            notAllowed: false,
            outOfService: false,
            complaintCount: null,
        }),
        links: governmentLinks(dot),
        sources: [source('all', 'Lookup', 'error', message)],
        error: message,
    }
}

function governmentLinks(dot: string) {
    return [
        {
            label: 'SAFER snapshot',
            href: `https://safer.fmcsa.dot.gov/query.asp?searchtype=ANY&query_type=queryCarrierSnapshot&query_param=USDOT&query_string=${dot}`,
        },
        {
            label: 'SMS overview',
            href: `https://ai.fmcsa.dot.gov/SMS/Carrier/${dot}/Overview.aspx`,
        },
        { label: 'Census file', href: 'https://data.transportation.gov/Trucking-and-Motorcoaches/Company-Census-File/az4n-8mr2' },
        { label: 'MOTUS authorities', href: 'https://data.transportation.gov/Trucking-and-Motorcoaches/Motus-Carrier-All-With-History/inys-ebih' },
        { label: 'Crash file', href: 'https://data.transportation.gov/Trucking-and-Motorcoaches/Crash-File/aayw-vxb3' },
    ]
}

async function fmcsa(path: string, webKey: string) {
    const url = `https://mobile.fmcsa.dot.gov/qc/services${path}?webKey=${encodeURIComponent(webKey)}`
    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
            'User-Agent': 'DOTFILE/1.0',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
    })
    const text = await response.text()
    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('FMCSA refused the live request (403). The web key is set on the server, and the other government files still loaded.')
        }
        throw new Error(`FMCSA returned HTTP ${response.status}`)
    }
    try {
        return JSON.parse(text) as unknown
    } catch {
        throw new Error('FMCSA returned a response that was not JSON.')
    }
}

function liveCarrier(payload: unknown): Row | null {
    if (!payload || typeof payload !== 'object') return null
    const root = payload as Row
    const content = (root.content && typeof root.content === 'object' ? root.content : root) as Row
    const carrier = content.carrier
    return carrier && typeof carrier === 'object' ? (carrier as Row) : null
}

function liveBasics(payload: unknown): BasicRow[] {
    if (!payload || typeof payload !== 'object') return []
    const content = (payload as Row).content
    const list = Array.isArray(content) ? content : []
    return list.map((item) => {
        const row = item as Row
        const basic = (row.basic && typeof row.basic === 'object' ? row.basic : {}) as Row
        const percentile = text(row.percentile) || text(basic.percentile)
        return {
            name: text(basic.basicsShortDesc) || text(basic.basicShortDesc) || text(row.basicShortDesc) || 'BASIC',
            measure: text(row.measure),
            percentile: percentile && percentile.toLowerCase() !== 'inconclusive' ? percentile : percentile,
            alert: yes(row.rdDeficient) || yes(row.rdsvDeficient) || yes(row.svDeficient),
            acute: yes(row.svDeficient),
            inspectionsWithViolation: num(row.totalInspectionWithViolation),
        }
    })
}

function flag(value: unknown): boolean | null {
    if (value == null || value === '') return null
    const token = String(value).toUpperCase()
    if (token === 'Y') return true
    if (token === 'N') return false
    return null
}

export async function loadCarrier(dot: string): Promise<CarrierReport> {
    try {
        return await loadCarrierInner(dot)
    } catch (error) {
        return emptyReport(dot, error instanceof Error ? error.message : 'Lookup failed')
    }
}

async function loadCarrierInner(dot: string): Promise<CarrierReport> {
    const since = windowStart(24)
    const webKey = process.env.FMCSA_WEB_KEY
    const inspUrl = new URL(`${SODA}/fx4q-ay7w.json`)
    inspUrl.searchParams.set('$select', 'count(*) as inspections')
    inspUrl.searchParams.set('$where', `dot_number='${dot}' AND insp_date>='${since}'`)

    const [censusResult, motusResult, smsResult, crashResult, inspResult, liveResult] = await Promise.allSettled([
        getJson(`${SODA}/az4n-8mr2.json?dot_number=${dot}&$limit=1`),
        getJson(`${SODA}/inys-ebih.json?usdot_number=${dot}&$limit=25`),
        loadSms(dot),
        loadCrashes(dot, since),
        getJson(inspUrl),
        webKey
            ? Promise.allSettled([
                  fmcsa(`/carriers/${dot}`, webKey),
                  fmcsa(`/carriers/${dot}/basics`, webKey),
                  fmcsa(`/carriers/${dot}/cargo-carried`, webKey),
                  fmcsa(`/carriers/${dot}/operation-classification`, webKey),
                  fmcsa(`/carriers/${dot}/docket-numbers`, webKey),
                  fmcsa(`/carriers/${dot}/authority`, webKey),
              ])
            : Promise.reject(new Error('Add FMCSA_WEB_KEY to .env.local to call the live FMCSA API.')),
    ])

    const census = censusResult.status === 'fulfilled' ? rowsOf(censusResult.value)[0] || null : null
    const motusRows = motusResult.status === 'fulfilled' ? rowsOf(motusResult.value) : []
    const smsHit = smsResult.status === 'fulfilled' ? smsResult.value : null
    const crashes = crashResult.status === 'fulfilled' ? crashResult.value : null
    const inspectionCount24 =
        inspResult.status === 'fulfilled' ? num(rowsOf(inspResult.value)[0]?.inspections) : null

    const authorities: AuthorityRow[] = motusRows.map((row) => ({
        docket: text(row.docket_number) || '—',
        type: text(row.op_auth_type) || '—',
        status: text(row.op_auth_status) || 'Unknown',
        minCoverage: insuranceAmount(row.min_cov_amount),
        bipdOnFile: insuranceAmount(row.bipd_file),
        cargoRequired: yes(row.cargo_req),
        cargoOnFile: yes(row.cargo_file),
        bondRequired: yes(row.bond_req),
        bondOnFile: yes(row.bond_file),
    }))
    const active = authorities.filter((row) => row.status.toLowerCase() === 'active')
    const insuranceShort = active.some(
        (row) => row.minCoverage != null && row.minCoverage > 0 && (row.bipdOnFile || 0) < row.minCoverage,
    )
    const bondMissing = active.some((row) => row.bondRequired && !row.bondOnFile)
    const cargoInsuranceMissing = active.some((row) => row.cargoRequired && !row.cargoOnFile)

    const smsBasics = smsHit ? readBasics(smsHit.row) : []
    const driverInspections = num(smsHit?.row.driver_insp_total)
    const driverOos = num(smsHit?.row.driver_oos_insp_total)
    const vehicleInspections = num(smsHit?.row.vehicle_insp_total)
    const vehicleOos = num(smsHit?.row.vehicle_oos_insp_total)

    let live: CarrierReport['live'] = null
    let liveCarrierRow: Row | null = null
    let liveError: string | null = null
    if (liveResult.status === 'fulfilled') {
        const [carrierCall, basicsCall] = liveResult.value
        liveCarrierRow = carrierCall.status === 'fulfilled' ? liveCarrier(carrierCall.value) : null
        const basics = basicsCall.status === 'fulfilled' ? liveBasics(basicsCall.value) : []
        if (!liveCarrierRow && carrierCall.status === 'rejected') {
            liveError = carrierCall.reason instanceof Error ? carrierCall.reason.message : 'FMCSA carrier call failed'
        }
        if (liveCarrierRow || basics.length) {
            live = {
                ok: true,
                allowedToOperate: flag(liveCarrierRow?.allowedToOperate ?? liveCarrierRow?.allowToOperate),
                outOfService: flag(liveCarrierRow?.outOfService),
                complaintCount: num(liveCarrierRow?.complaintCount),
                driverOosRate: num(liveCarrierRow?.driverOosRate),
                vehicleOosRate: num(liveCarrierRow?.vehicleOosRate),
                driverBenchmark: num(liveCarrierRow?.driverOosRateNationalAverage),
                vehicleBenchmark: num(liveCarrierRow?.vehicleOosRateNationalAverage),
                crashTotal: num(liveCarrierRow?.crashTotal),
                fatalCrash: num(liveCarrierRow?.fatalCrash),
                injuryCrash: num(liveCarrierRow?.injCrash),
                basics,
                notes: [],
            }
        }
    } else {
        liveError = liveResult.reason instanceof Error ? liveResult.reason.message : 'FMCSA live API failed'
    }

    const driverOosRate = live?.driverOosRate ?? rate(driverOos, driverInspections)
    const vehicleOosRate = live?.vehicleOosRate ?? rate(vehicleOos, vehicleInspections)
    const basicsForScore = smsBasics.length ? smsBasics : live?.basics || []
    const alertCount = basicsForScore.filter((basic) => basic.alert && !basic.acute).length
    const acuteCount = basicsForScore.filter((basic) => basic.acute).length

    const record = census || {}
    const officers = [text(record.company_officer_1), text(record.company_officer_2)].filter((item): item is string => Boolean(item))
    const city = text(record.phy_city) || text(motusRows[0]?.bus_city)
    const state = text(record.phy_state) || text(motusRows[0]?.bus_state_code)
    const safetyCode = text(record.safety_rating) || text(liveCarrierRow?.safetyRating)
    const name = text(record.legal_name) || text(motusRows[0]?.legal_name) || text(liveCarrierRow?.legalName) || `USDOT ${dot}`

    const score = buildScore({
        censusFound: Boolean(census),
        status: text(record.status_code),
        safetyRating: safetyCode,
        priorRevoke: yes(record.prior_revoke_flag),
        forHire: census ? forHire(record) : false,
        motusOk: motusResult.status === 'fulfilled',
        motusCount: authorities.length,
        activeAuthority: active.length > 0,
        insuranceShort,
        bondMissing,
        cargoInsuranceMissing,
        smsPresent: Boolean(smsHit) || Boolean(live?.basics.length),
        alertCount,
        acuteCount,
        driverOosRate,
        vehicleOosRate,
        driverBenchmark: live?.driverBenchmark ?? 5.51,
        vehicleBenchmark: live?.vehicleBenchmark ?? 20.72,
        crashOk: Boolean(crashes?.ok),
        crashes: crashes?.count ?? null,
        fatalities: crashes?.fatalities ?? null,
        injuries: crashes?.injuries ?? null,
        fatalitiesPartial: Boolean(crashes?.partial),
        powerUnits: num(record.power_units),
        notAllowed: live?.allowedToOperate === false,
        outOfService: live?.outOfService === true,
        complaintCount: live?.complaintCount ?? null,
    })

    const sources: SourceState[] = [
        censusResult.status === 'fulfilled'
            ? source('census', 'Company census', census ? 'loaded' : 'empty', census ? 'data.transportation.gov census' : 'No census row for this USDOT')
            : source('census', 'Company census', 'error', censusResult.reason instanceof Error ? censusResult.reason.message : 'Census failed'),
        motusResult.status === 'fulfilled'
            ? source('motus', 'MOTUS', authorities.length ? 'loaded' : 'empty', authorities.length ? `${authorities.length} authority rows` : 'No MOTUS docket')
            : source('motus', 'MOTUS', 'error', 'MOTUS file failed'),
        smsHit
            ? source('sms', 'SMS', 'loaded', smsHit.file.name)
            : source('sms', 'SMS', 'empty', 'Not in the current SMS extracts'),
        crashes?.ok
            ? source('crashes', 'Crash file', 'loaded', `${crashes.count ?? 0} in 24 months`)
            : source('crashes', 'Crash file', 'error', 'Crash file failed'),
        live?.ok
            ? source('fmcsa', 'FMCSA live', 'loaded', 'QCMobile web key')
            : source('fmcsa', 'FMCSA live', 'error', liveError?.includes('403') ? 'HTTP 403' : liveError || 'Live FMCSA data did not load'),
    ]

    return {
        dot,
        name,
        dba: text(record.dba_name) || text(motusRows[0]?.dba_name),
        location: [city, state].filter(Boolean).join(', ') || '—',
        street: text(record.phy_street) || text(motusRows[0]?.bus_street_po),
        phone: formatPhone(text(record.phone) || text(motusRows[0]?.bus_telno)),
        email: text(record.email_address),
        officers,
        statusCode: text(record.status_code),
        statusLabel: statusLabel(text(record.status_code)),
        safetyRatingCode: safetyCode,
        safetyRatingLabel: safetyLabel(safetyCode),
        safetyRatingDate: formatYmd(text(record.safety_rating_date)),
        censusDate: formatYmd(text(record.mcs150_date)),
        operationLabel: operationLabel(text(record.carrier_operation)),
        entityTypes: entityTypes(text(record.carship)),
        classification: String(record.classdef || '')
            .split(';')
            .map((item) => item.trim())
            .filter(Boolean),
        cargo: census ? cargoList(record) : [],
        fleet: {
            powerUnits: num(record.power_units),
            trucks: num(record.truck_units),
            buses: num(record.bus_units),
            drivers: num(record.total_drivers),
            cdlDrivers: num(record.total_cdl),
            mileage: num(record.mcs150_mileage),
            mileageYear: text(record.mcs150_mileage_year),
            fleetSize: fleetSizeLabel(text(record.fleetsize)),
            hazmat: yes(record.hm_ind),
        },
        mcNumbers: mcNumbers(record),
        authorities,
        sms: smsHit
            ? {
                  source: smsHit.file.name,
                  inspections: num(smsHit.row.insp_total),
                  driverInspections,
                  driverOos,
                  driverOosRate: rate(driverOos, driverInspections),
                  vehicleInspections,
                  vehicleOos,
                  vehicleOosRate: rate(vehicleOos, vehicleInspections),
                  basics: smsBasics,
              }
            : null,
        inspectionCount24,
        crashes: crashes
            ? {
                  count: crashes.count,
                  fatalities: crashes.fatalities,
                  injuries: crashes.injuries,
                  partial: crashes.partial,
                  monthly: crashes.monthly,
                  recent: crashes.recent,
              }
            : { count: null, fatalities: null, injuries: null, partial: false, monthly: [], recent: [] },
        live,
        censusFields: census ? censusFields(census) : [],
        score,
        links: governmentLinks(dot),
        sources,
    }
}
