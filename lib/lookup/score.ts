import type { Fit, FitScore, Grade } from '@/lib/lookup/types'

export const GRADE_SCALE: {
    grade: Grade
    min: number
    range: string
    label: string
    fit: Fit
    hint: string
    color: string
}[] = [
    { grade: 'A', min: 76, range: '76–100', label: 'Use', fit: 'use', hint: 'Strong public file', color: '#3e9d52' },
    { grade: 'B', min: 65, range: '65–75', label: 'Good', fit: 'use', hint: 'Usable if you read the notes', color: '#c6b15a' },
    { grade: 'C', min: 51, range: '51–64', label: 'Review', fit: 'review', hint: 'Mixed record', color: '#e39b3a' },
    { grade: 'D', min: 0, range: '0–50', label: 'Do not use', fit: 'avoid', hint: 'Not a file to use', color: '#8d97a6' },
]

export function gradeFor(value: number): Grade {
    return GRADE_SCALE.find((band) => value >= band.min)?.grade || 'D'
}

export function toneFor(score: number) {
    return GRADE_SCALE.find((band) => score >= band.min)?.color || '#8d97a6'
}

export type ScoreInput = {
    censusFound: boolean
    status: string | null
    safetyRating: string | null
    priorRevoke: boolean
    forHire: boolean
    motusOk: boolean
    motusCount: number
    activeAuthority: boolean
    insuranceShort: boolean
    bondMissing: boolean
    cargoInsuranceMissing: boolean
    smsPresent: boolean
    alertCount: number
    acuteCount: number
    driverOosRate: number | null
    vehicleOosRate: number | null
    driverBenchmark: number
    vehicleBenchmark: number
    crashOk: boolean
    crashes: number | null
    fatalities: number | null
    injuries: number | null
    fatalitiesPartial: boolean
    powerUnits: number | null
    notAllowed: boolean
    outOfService: boolean
    complaintCount: number | null
}

function clamp(value: number) {
    return Math.min(100, Math.max(1, Math.round(value)))
}

function oosPenalty(rate: number | null, benchmark: number) {
    if (rate == null) return { penalty: 0, text: 'no rate on file' }
    const over = rate - benchmark
    if (over <= 0) {
        return {
            penalty: 0,
            text: `${rate.toFixed(1)}% vs ${benchmark.toFixed(1)}% benchmark`,
        }
    }
    return {
        penalty: Math.min(40, Math.max(5, Math.round(over / 4) * 5)),
        text: `${rate.toFixed(1)}% is ${over.toFixed(1)} points over the ${benchmark.toFixed(1)}% benchmark`,
    }
}

export function buildScore(input: ScoreInput): FitScore {
    const status = input.status?.toUpperCase() || null
    const rating = input.safetyRating?.toUpperCase() || null

    let registration = !input.censusFound ? 20 : status === 'A' ? 90 : status === 'P' ? 50 : status === 'I' ? 25 : 60
    if (input.censusFound) {
        if (rating === 'S') registration += 10
        else if (rating === 'C') registration -= 30
        else if (rating === 'U') registration = Math.min(registration, 20)
        else registration -= 5
        if (input.priorRevoke) registration -= 25
    }
    registration = clamp(registration)

    const registrationDetail = !input.censusFound
        ? 'No company census row for this USDOT.'
        : [
        status === 'A' ? 'USDOT status is active' : status === 'I' ? 'USDOT status is inactive' : status === 'P' ? 'USDOT status is pending' : 'USDOT status was not in the census file',
        rating === 'S' ? 'FMCSA safety rating is Satisfactory' : rating === 'C' ? 'FMCSA safety rating is Conditional' : rating === 'U' ? 'FMCSA safety rating is Unsatisfactory' : 'no Satisfactory / Conditional / Unsatisfactory rating is posted',
        input.priorRevoke ? 'a prior revoke flag is on the census' : null,
    ]
        .filter(Boolean)
        .join('. ') + '.'

    let authority = 75
    let authorityDetail = 'MOTUS authority could not be checked.'
    if (!input.censusFound && input.motusOk && input.motusCount === 0) {
        authority = 20
        authorityDetail = 'No MOTUS docket and no census record for this USDOT.'
    } else if (input.motusOk && input.motusCount === 0) {
        authority = input.forHire ? 30 : 75
        authorityDetail = input.forHire
            ? 'Census shows for-hire or broker activity, and MOTUS has no authority for this USDOT.'
            : 'No MOTUS docket. Private and exempt operations often do not need operating authority.'
    } else if (input.motusOk && !input.activeAuthority) {
        authority = 25
        authorityDetail = 'MOTUS has dockets for this USDOT, and none are active.'
    } else if (input.motusOk) {
        authority = 90
        const gaps: string[] = []
        if (input.insuranceShort) {
            authority -= 25
            gaps.push('BI&PD on file is below the MOTUS required amount')
        }
        if (input.bondMissing) {
            authority -= 15
            gaps.push('a required bond is not on file')
        }
        if (input.cargoInsuranceMissing) {
            authority -= 15
            gaps.push('required cargo insurance is not on file')
        }
        authorityDetail = gaps.length
            ? `Active authority is on file, but ${gaps.join(' and ')}.`
            : 'Active MOTUS authority is on file, and the posted insurance meets the required flags.'
    }
    authority = clamp(authority)

    const driver = oosPenalty(input.driverOosRate, input.driverBenchmark)
    const vehicle = oosPenalty(input.vehicleOosRate, input.vehicleBenchmark)
    let roadside = input.smsPresent ? 90 : 55
    if (input.smsPresent) {
        roadside -= Math.min(45, input.alertCount * 15)
        roadside -= Math.min(40, input.acuteCount * 20)
        roadside -= driver.penalty
        roadside -= vehicle.penalty
    }
    if ((input.complaintCount || 0) > 25) roadside -= 10
    else if ((input.complaintCount || 0) > 5) roadside -= 5
    roadside = clamp(roadside)
    const roadsideFlags = [
        input.acuteCount ? `${input.acuteCount} acute or critical flag${input.acuteCount === 1 ? '' : 's'}` : null,
        input.alertCount ? `${input.alertCount} SMS alert${input.alertCount === 1 ? '' : 's'}` : null,
    ].filter(Boolean)
    const roadsideDetail = input.smsPresent
        ? `${roadsideFlags.length ? roadsideFlags.join(' and ') : 'No SMS alert or acute flag'}. Driver out-of-service ${driver.text}. Vehicle out-of-service ${vehicle.text}.`
        : 'This USDOT is not in the current public SMS passenger or property extracts, so roadside percentiles could not be scored.'

    let crashes: number | null = null
    let crashDetail = 'The 24-month crash file did not load, so crashes were left out of the score.'
    if (input.crashOk && input.crashes != null) {
        const units = input.powerUnits && input.powerUnits > 0 ? input.powerUnits : null
        const rate = units ? input.crashes / units : null
        if (!input.censusFound && input.crashes === 0) {
            crashes = null
            crashDetail = 'No census record, so a zero in the crash file is not treated as a clean safety record.'
        } else {
            if (input.crashes === 0) crashes = 100
            else if (rate == null) crashes = input.crashes <= 2 ? 70 : input.crashes <= 8 ? 45 : 25
            else if (rate < 0.05) crashes = 80
            else if (rate < 0.12) crashes = 65
            else if (rate < 0.25) crashes = 45
            else crashes = 25
            const deaths = input.fatalities || 0
            const deathRate = units && deaths > 0 ? deaths / units : null
            let crashScore = crashes || 0
            if (deaths > 0 && deathRate == null) crashScore -= Math.min(40, deaths * 10)
            else if (deathRate != null && deathRate >= 0.02) crashScore -= 40
            else if (deathRate != null && deathRate >= 0.005) crashScore -= 25
            else if (deaths > 0) crashScore -= 10
            crashes = clamp(crashScore)
            const fatalityText =
                input.fatalities == null
                    ? 'fatality totals were not returned'
                    : input.fatalitiesPartial
                      ? `at least ${input.fatalities} fatalities in the latest reports`
                      : `${input.fatalities} fatalities`
            crashDetail = units
                ? `${input.crashes} crashes in 24 months across ${units.toLocaleString('en-US')} power units (${rate!.toFixed(2)} per unit). ${fatalityText}.`
                : `${input.crashes} crashes in 24 months. Power units were not on the census, so this uses the raw count. ${fatalityText}.`
        }
    }

    const weighted = [
        { weight: 0.22, score: registration },
        { weight: 0.28, score: authority },
        { weight: 0.32, score: roadside },
        { weight: 0.18, score: crashes },
    ].filter((part): part is { weight: number; score: number } => part.score != null)
    const weightSum = weighted.reduce((sum, part) => sum + part.weight, 0)
    let value = weighted.reduce((sum, part) => sum + part.weight * part.score, 0) / weightSum

    const reasons: string[] = []
    if (!input.censusFound) {
        value = Math.min(value, 20)
        reasons.push('No company census record. This USDOT is not a file to use.')
    }
    if (input.outOfService) {
        value = Math.min(value, 15)
        reasons.push('FMCSA live data shows an out-of-service order.')
    }
    if (input.notAllowed) {
        value = Math.min(value, 20)
        reasons.push('FMCSA live data says this carrier is not allowed to operate.')
    }
    if (rating === 'U') {
        value = Math.min(value, 30)
        reasons.push('The posted FMCSA safety rating is Unsatisfactory.')
    }
    if (status === 'I') {
        value = Math.min(value, 40)
        reasons.push('The USDOT number is inactive in the company census.')
    }
    if (input.forHire && input.motusOk && !input.activeAuthority) {
        value = Math.min(value, 40)
        reasons.push('For-hire activity is on the census without an active MOTUS authority.')
    }
    if (input.insuranceShort) reasons.push('Insurance on file is short of the MOTUS required BI&PD amount.')
    if (input.alertCount > 0) reasons.push(`${input.alertCount} SMS behavior category is over the alert line.`)
    if (input.acuteCount > 0) reasons.push('An acute or critical SMS flag is on this carrier.')
    if ((input.fatalities || 0) > 0) reasons.push('The 24-month crash file includes fatal crashes.')
    if (driver.penalty > 0 || vehicle.penalty > 0) {
        reasons.push('A roadside out-of-service rate is above the benchmark used for this score.')
    }

    const score = clamp(value)
    const grade = gradeFor(score)
    const band = GRADE_SCALE.find((item) => item.grade === grade)!
    if (reasons.length === 0) {
        reasons.push(
            score >= 65
                ? 'Active registration, authority, roadside rates, and the crash window all sit in a usable range.'
                : 'No single disqualifier fired, but the combined file is not strong enough for a higher band.',
        )
    }

    return {
        value: score,
        grade,
        verdict: band.label,
        fit: band.fit,
        summary: `Fit score ${score} of 100, grade ${grade}. ${band.hint}. 100 is the strongest file.`,
        categories: [
            { id: 'registration', label: 'Registration', score: registration, detail: registrationDetail },
            { id: 'authority', label: 'Authority', score: authority, detail: authorityDetail },
            { id: 'roadside', label: 'Roadside', score: roadside, detail: roadsideDetail },
            { id: 'crashes', label: 'Crashes', score: crashes, detail: crashDetail },
        ],
        reasons: reasons.slice(0, 5),
    }
}
