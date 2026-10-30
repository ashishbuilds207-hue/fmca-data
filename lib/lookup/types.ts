export type Grade = 'A' | 'B' | 'C' | 'D'
export type Fit = 'use' | 'review' | 'avoid'

export type CategoryScore = {
    id: 'registration' | 'authority' | 'roadside' | 'crashes'
    label: string
    score: number | null
    detail: string
}

export type FitScore = {
    value: number
    grade: Grade
    verdict: string
    fit: Fit
    summary: string
    categories: CategoryScore[]
    reasons: string[]
}

export type BasicRow = {
    name: string
    measure: string | null
    percentile: string | null
    alert: boolean
    acute: boolean
    inspectionsWithViolation: number | null
}

export type AuthorityRow = {
    docket: string
    type: string
    status: string
    minCoverage: number | null
    bipdOnFile: number | null
    cargoRequired: boolean
    cargoOnFile: boolean
    bondRequired: boolean
    bondOnFile: boolean
}

export type CrashMonth = {
    month: string
    crashes: number
    fatalities: number
    injuries: number
}

export type SourceState = {
    id: string
    label: string
    state: 'loaded' | 'empty' | 'error'
    note: string
}

export type CarrierReport = {
    dot: string
    name: string
    dba: string | null
    location: string
    street: string | null
    phone: string | null
    email: string | null
    officers: string[]
    statusCode: string | null
    statusLabel: string
    safetyRatingCode: string | null
    safetyRatingLabel: string
    safetyRatingDate: string | null
    censusDate: string | null
    operationLabel: string | null
    entityTypes: string[]
    classification: string[]
    cargo: string[]
    fleet: {
        powerUnits: number | null
        trucks: number | null
        buses: number | null
        drivers: number | null
        cdlDrivers: number | null
        mileage: number | null
        mileageYear: string | null
        fleetSize: string | null
        hazmat: boolean
    }
    mcNumbers: string[]
    authorities: AuthorityRow[]
    sms: {
        source: string | null
        inspections: number | null
        driverInspections: number | null
        driverOos: number | null
        driverOosRate: number | null
        vehicleInspections: number | null
        vehicleOos: number | null
        vehicleOosRate: number | null
        basics: BasicRow[]
    } | null
    inspectionCount24: number | null
    crashes: {
        count: number | null
        fatalities: number | null
        injuries: number | null
        partial: boolean
        monthly: CrashMonth[]
        recent: { date: string; place: string; fatalities: number; injuries: number; towAway: boolean }[]
    }
    live: {
        ok: boolean
        allowedToOperate: boolean | null
        outOfService: boolean | null
        complaintCount: number | null
        driverOosRate: number | null
        vehicleOosRate: number | null
        driverBenchmark: number | null
        vehicleBenchmark: number | null
        crashTotal: number | null
        fatalCrash: number | null
        injuryCrash: number | null
        basics: BasicRow[]
        notes: string[]
    } | null
    censusFields: { label: string; value: string }[]
    score: FitScore
    links: { label: string; href: string }[]
    sources: SourceState[]
    error?: string
}
