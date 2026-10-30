'use client'

import { FormEvent, useState, type ReactNode } from 'react'
import { ArrowUpRight, Loader2, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatMoney, formatNumber, formatPercent, parseDots } from '@/lib/lookup/format'
import { GRADE_SCALE } from '@/lib/lookup/score'
import type { AuthorityRow, CarrierReport } from '@/lib/lookup/types'
import { CategoryChart, CompareChart, CrashChart, ScoreGauge } from '@/components/lookup/visuals'

const EXAMPLES = [
    { label: 'Greyhound · 44110', value: '44110' },
    { label: 'Compare two', value: '44110, 54283' },
]

export default function LookupApp() {
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [results, setResults] = useState<CarrierReport[] | null>(null)
    const [active, setActive] = useState(0)
    const [generatedAt, setGeneratedAt] = useState<string | null>(null)

    async function search(value: string) {
        const dots = parseDots(value)
        if (!dots.length) {
            setError('Enter a USDOT number.')
            return
        }
        if (dots.length > 6) {
            setError('Look up to 6 USDOT numbers at a time.')
            return
        }
        setQuery(value)
        setLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dots }),
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Lookup failed')
            setResults(data.results)
            setActive(0)
            setGeneratedAt(data.generatedAt)
            requestAnimationFrame(() => {
                document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            })
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Lookup failed')
        } finally {
            setLoading(false)
        }
    }

    function onSubmit(event: FormEvent) {
        event.preventDefault()
        void search(query)
    }

    const selected = results?.[active]

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-[#06080c] text-[#e8eef7]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:76px_76px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
            <div className="lane-pulse pointer-events-none absolute -top-28 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-[#f0b429]/20 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-[#3ee0a2]/10 blur-3xl" />

            <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
                <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-[#f0b429] text-sm font-bold text-[#1a1203]">D</span>
                    <span className="text-sm font-semibold tracking-[0.18em] text-white">DOTFILE</span>
                </div>
                <p className="hidden text-xs text-[#9aa6b8] sm:block">FMCSA · MOTUS · data.transportation.gov</p>
            </header>

            <main className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
                <section className="lane-rise pt-8 sm:pt-16">
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#f0b429]">Public carrier file</p>
                    <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                        Enter a DOT. See the whole file.
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-[#b7c0ce] sm:text-lg">
                        One USDOT, or several. DOTFILE reads the company census, MOTUS authority and insurance, the SMS safety extract, and the last 24 months of crashes, then scores the file from 1 to 100.
                    </p>

                    <form onSubmit={onSubmit} className="mt-8">
                        <label htmlFor="dots" className="text-xs font-medium uppercase tracking-[0.16em] text-[#8b97a8]">
                            USDOT numbers
                        </label>
                        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#8b97a8]" />
                                <input
                                    id="dots"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="44110 or 44110, 54283"
                                    className="h-14 w-full rounded-2xl bg-[#10151c] pl-11 pr-4 text-base text-white outline-none ring-1 ring-white/10 placeholder:text-[#6f7b8c] focus:ring-[#f0b429]"
                                />
                            </div>
                            <Button type="submit" size="extralarge" className="h-14 rounded-2xl px-6 text-sm" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : <Search />}
                                {loading ? 'Reading files' : 'Get the file'}
                            </Button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            {EXAMPLES.map((example) => (
                                <button
                                    key={example.value}
                                    type="button"
                                    onClick={() => void search(example.value)}
                                    className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-[#d5dbe6] ring-1 ring-white/10 transition hover:bg-white/10"
                                >
                                    {example.label}
                                </button>
                            ))}
                            <span className="text-xs text-[#8b97a8]">Up to 6 numbers, separated by commas or spaces.</span>
                        </div>
                        {error ? <p className="mt-3 text-sm text-[#ff8d8d]">{error}</p> : null}
                    </form>
                </section>

                <section className="lane-rise mt-14 grid gap-3 sm:grid-cols-3" style={{ animationDelay: '80ms' }}>
                    {[
                        ['Census + live FMCSA', 'Legal name, status, fleet, officers, and the QCMobile record when the web key is accepted.'],
                        ['MOTUS authority', 'Docket, active or inactive authority, and whether BI&PD, cargo, and bond insurance are on file.'],
                        ['SMS and crashes', 'Roadside out-of-service rates, BASIC alerts, and crashes from the last 24 months.'],
                    ].map(([title, copy]) => (
                        <Card key={title} className="border-0 bg-[#10151c]/80 p-4 text-[#e8eef7] shadow-none ring-1 ring-white/10">
                            <h2 className="text-sm font-semibold text-white">{title}</h2>
                            <p className="mt-2 text-sm leading-6 text-[#9aa6b8]">{copy}</p>
                        </Card>
                    ))}
                </section>

                <section className="mt-8">
                    <div className="grid gap-2 sm:grid-cols-4">
                        {GRADE_SCALE.map((band) => (
                            <div key={band.grade} className="rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/10">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-lg font-semibold text-white">{band.grade}</span>
                                    <span className="text-xs text-[#8b97a8]">{band.range}</span>
                                </div>
                                <p className="mt-1 text-sm text-white">{band.label}</p>
                                <p className="text-xs text-[#8b97a8]">{band.hint}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-[#8b97a8]">
                        100 is the strongest file. A is 76–100, use. B is 65–75, good. C is 51–64, review the record. D is 0–50, do not use. This is DOTFILE’s reading of public government data, not an official FMCSA safety rating.
                    </p>
                </section>

                {loading ? (
                    <div className="mt-10 grid gap-3 sm:grid-cols-3">
                        {[0, 1, 2].map((item) => (
                            <div key={item} className="h-36 animate-pulse rounded-3xl bg-white/5 ring-1 ring-white/10" />
                        ))}
                    </div>
                ) : null}

                {selected ? (
                    <section id="results" className="mt-12 scroll-mt-6">
                        {results && results.length > 1 ? (
                            <Card className="mb-4 border-0 bg-[#10151c]/90 p-4 text-[#e8eef7] shadow-none ring-1 ring-white/10 sm:p-5">
                                <div className="mb-3 flex items-end justify-between gap-3">
                                    <h2 className="text-lg font-semibold text-white">Side by side</h2>
                                    <p className="text-xs text-[#8b97a8]">{results.length} carriers</p>
                                </div>
                                <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                                    {results.map((item, index) => (
                                        <button
                                            key={item.dot}
                                            type="button"
                                            onClick={() => setActive(index)}
                                            className={`min-w-44 rounded-2xl p-3 text-left ring-1 transition ${
                                                index === active ? 'bg-white text-[#14181f] ring-white' : 'bg-white/[0.03] text-[#e8eef7] ring-white/10 hover:bg-white/[0.06]'
                                            }`}
                                        >
                                            <div className="text-[11px] tracking-[0.14em] text-current/70">USDOT {item.dot}</div>
                                            <div className="mt-1 line-clamp-1 text-sm font-semibold">{item.name}</div>
                                            <div className="mt-2 text-2xl font-semibold">{item.score.value}</div>
                                            <div className="text-xs">{item.score.verdict}</div>
                                        </button>
                                    ))}
                                </div>
                                <CompareChart rows={results.map((item) => ({ dot: item.dot, score: item.score.value }))} />
                            </Card>
                        ) : null}

                        <CarrierBoard key={selected.dot} report={selected} generatedAt={generatedAt} />
                    </section>
                ) : null}
            </main>
        </div>
    )
}

function CarrierBoard({ report, generatedAt }: { report: CarrierReport; generatedAt: string | null }) {
    return (
        <div className="lane-rise grid gap-4 lg:grid-cols-[400px_1fr]">
            <Card className="h-fit border-0 bg-[#10151c]/95 p-5 text-[#e8eef7] shadow-none ring-1 ring-white/10">
                <ScoreGauge value={report.score.value} grade={report.score.grade} verdict={report.score.verdict} />
                <p className="mt-4 text-sm leading-6 text-[#b7c0ce]">{report.score.summary}</p>
                <ul className="mt-4 space-y-2">
                    {report.score.reasons.map((reason) => (
                        <li key={reason} className="text-sm leading-6 text-[#d5dbe6]">
                            {reason}
                        </li>
                    ))}
                </ul>
                <div className="mt-4">
                    <CategoryChart rows={report.score.categories.map((item) => ({ label: item.label, score: item.score }))} />
                    <div className="space-y-2">
                        {report.score.categories.map((item) => (
                            <p key={item.id} className="text-xs leading-5 text-[#8b97a8]">
                                <span className="text-[#d5dbe6]">{item.label} {item.score ?? '—'}/100.</span> {item.detail}
                            </p>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="space-y-4">
                <Card className="border-0 bg-[#10151c]/95 p-5 text-[#e8eef7] shadow-none ring-1 ring-white/10">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs tracking-[0.16em] text-[#f0b429]">USDOT {report.dot}</p>
                            <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{report.name}</h2>
                            {report.dba ? <p className="text-sm text-[#9aa6b8]">DBA {report.dba}</p> : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant={report.statusCode === 'A' ? 'success' : report.statusCode === 'I' ? 'danger' : 'pending'} size="small">
                                {report.statusLabel}
                            </Badge>
                            <Badge variant={report.safetyRatingCode === 'S' ? 'green' : report.safetyRatingCode === 'U' ? 'danger' : 'pending'} size="small">
                                Rating {report.safetyRatingLabel}
                            </Badge>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-[#b7c0ce]">
                        {[report.street, report.location].filter(Boolean).join(', ') || 'Address not on the census'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#d5dbe6]">
                        {report.phone ? <span>{report.phone}</span> : null}
                        {report.email ? <span>{report.email}</span> : null}
                        {report.mcNumbers.map((mc) => (
                            <span key={mc}>{mc}</span>
                        ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {report.sources.map((item) => (
                            <span
                                key={item.id}
                                title={item.note}
                                className={`rounded-full px-2.5 py-1 text-[11px] ring-1 ${
                                    item.state === 'loaded'
                                        ? 'bg-[#3ee0a2]/10 text-[#b8ffe0] ring-[#3ee0a2]/30'
                                        : item.state === 'empty'
                                          ? 'bg-white/5 text-[#b7c0ce] ring-white/10'
                                          : 'bg-[#ff6b6b]/10 text-[#ffb4b4] ring-[#ff6b6b]/30'
                                }`}
                            >
                                {item.label}: {item.note}
                            </span>
                        ))}
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-4">
                        <Stat label="Power units" value={formatNumber(report.fleet.powerUnits)} />
                        <Stat label="Drivers" value={formatNumber(report.fleet.drivers)} />
                        <Stat label="24-mo crashes" value={formatNumber(report.crashes.count)} />
                        <Stat label="24-mo inspections" value={formatNumber(report.inspectionCount24)} />
                    </div>
                </Card>

                <Tabs defaultValue="overview">
                    <TabsList className="flex w-full gap-1 overflow-x-auto rounded-full bg-white/5 p-1">
                        {['overview', 'authority', 'safety', 'record'].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="rounded-full px-3 py-1.5 text-xs capitalize text-[#b7c0ce] hover:bg-white/10 hover:text-white data-[state=active]:bg-white data-[state=active]:text-[#14181f]"
                            >
                                {tab === 'record' ? 'Full census' : tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value="overview" className="mt-3">
                        <Card className="space-y-4 border-0 bg-[#10151c]/95 p-5 text-[#e8eef7] shadow-none ring-1 ring-white/10">
                            <div className="flex flex-wrap gap-2">
                                {report.operationLabel ? <Chip>{report.operationLabel}</Chip> : null}
                                {report.entityTypes.map((item) => (
                                    <Chip key={item}>{item}</Chip>
                                ))}
                                {report.fleet.hazmat ? <Chip>Hazmat</Chip> : null}
                                {report.fleet.fleetSize ? <Chip>{report.fleet.fleetSize}</Chip> : null}
                            </div>
                            {report.classification.length ? (
                                <p className="text-sm leading-6 text-[#b7c0ce]">{report.classification.join(' · ')}</p>
                            ) : null}
                            <div className="grid gap-2 sm:grid-cols-3">
                                <Stat label="Trucks" value={formatNumber(report.fleet.trucks)} />
                                <Stat label="Buses" value={formatNumber(report.fleet.buses)} />
                                <Stat label="CDL drivers" value={formatNumber(report.fleet.cdlDrivers)} />
                                <Stat label="Mileage" value={report.fleet.mileageYear ? `${formatNumber(report.fleet.mileage)} (${report.fleet.mileageYear})` : formatNumber(report.fleet.mileage)} />
                                <Stat label="Census date" value={report.censusDate || '—'} />
                                <Stat label="Rating date" value={report.safetyRatingDate || '—'} />
                            </div>
                            {report.officers.length ? (
                                <p className="text-sm text-[#d5dbe6]">Officers: {report.officers.join(', ')}</p>
                            ) : null}
                            {report.cargo.length ? (
                                <div>
                                    <h3 className="text-xs uppercase tracking-[0.16em] text-[#8b97a8]">Cargo on the census</h3>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {report.cargo.map((item) => (
                                            <Chip key={item}>{item}</Chip>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                            <div className="flex flex-wrap gap-3">
                                {report.links.map((link) => (
                                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-[#f0b429] hover:text-white">
                                        {link.label}
                                        <ArrowUpRight className="size-3.5" />
                                    </a>
                                ))}
                            </div>
                            {generatedAt ? (
                                <p className="text-xs text-[#8b97a8]">Pulled {new Date(generatedAt).toLocaleString()}</p>
                            ) : null}
                        </Card>
                    </TabsContent>
                    <TabsContent value="authority" className="mt-3">
                        <Card className="border-0 bg-[#10151c]/95 p-5 text-[#e8eef7] shadow-none ring-1 ring-white/10">
                            {report.authorities.length ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[640px] text-left text-sm">
                                        <thead className="text-[11px] uppercase tracking-[0.14em] text-[#8b97a8]">
                                            <tr>
                                                <th className="pb-2 pr-3 font-medium">Docket</th>
                                                <th className="pb-2 pr-3 font-medium">Authority</th>
                                                <th className="pb-2 pr-3 font-medium">Status</th>
                                                <th className="pb-2 pr-3 font-medium">BI&PD required</th>
                                                <th className="pb-2 font-medium">On file</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.authorities.map((row) => (
                                                <AuthorityLine key={`${row.docket}-${row.type}`} row={row} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-[#b7c0ce]">No MOTUS authority rows for this USDOT.</p>
                            )}
                        </Card>
                    </TabsContent>
                    <TabsContent value="safety" className="mt-3 space-y-3">
                        <Card className="border-0 bg-[#10151c]/95 p-5 text-[#e8eef7] shadow-none ring-1 ring-white/10">
                            <div className="flex items-baseline justify-between gap-3">
                                <h3 className="text-sm font-semibold text-white">Roadside SMS</h3>
                                <p className="text-xs text-[#8b97a8]">{report.sms?.source || 'No SMS row'}</p>
                            </div>
                            {report.sms ? (
                                <>
                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                        <RateMeter
                                            label="Driver out of service"
                                            rate={report.live?.driverOosRate ?? report.sms.driverOosRate}
                                            count={`${formatNumber(report.sms.driverOos)} of ${formatNumber(report.sms.driverInspections)}`}
                                            benchmark={report.live?.driverBenchmark ?? 5.51}
                                        />
                                        <RateMeter
                                            label="Vehicle out of service"
                                            rate={report.live?.vehicleOosRate ?? report.sms.vehicleOosRate}
                                            count={`${formatNumber(report.sms.vehicleOos)} of ${formatNumber(report.sms.vehicleInspections)}`}
                                            benchmark={report.live?.vehicleBenchmark ?? 20.72}
                                        />
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {report.sms.basics.map((basic) => (
                                            <BasicLine key={basic.name} name={basic.name} percentile={basic.percentile} measure={basic.measure} alert={basic.alert} acute={basic.acute} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="mt-3 text-sm text-[#b7c0ce]">This USDOT is not in the current public SMS extracts.</p>
                            )}
                            {!report.live?.ok ? (
                                <p className="mt-4 text-sm leading-6 text-[#ffb4b4]">
                                    FMCSA’s live QCMobile API refused this server. The web key is in the server environment and was sent with the request. Census, MOTUS, SMS, and the crash file still loaded.
                                </p>
                            ) : null}
                            {report.live?.ok ? (
                                <div className="mt-4 rounded-2xl bg-white/[0.03] p-3 text-sm text-[#d5dbe6] ring-1 ring-white/10">
                                    <p className="font-medium text-white">FMCSA live snapshot</p>
                                    <p className="mt-1">
                                        Allowed to operate: {yesNo(report.live.allowedToOperate)} · Out of service: {yesNo(report.live.outOfService)} · Complaints: {formatNumber(report.live.complaintCount)}
                                    </p>
                                    <p>
                                        Live crashes {formatNumber(report.live.crashTotal)} · fatal {formatNumber(report.live.fatalCrash)} · injury {formatNumber(report.live.injuryCrash)}
                                    </p>
                                </div>
                            ) : null}
                        </Card>
                        <Card className="border-0 bg-[#10151c]/95 p-5 text-[#e8eef7] shadow-none ring-1 ring-white/10">
                            <div className="flex items-baseline justify-between">
                                <h3 className="text-sm font-semibold text-white">Crashes, last 24 months</h3>
                                <p className="text-xs text-[#8b97a8]">
                                    {formatNumber(report.crashes.fatalities)} fatal · {formatNumber(report.crashes.injuries)} injured
                                </p>
                            </div>
                            {report.crashes.partial ? (
                                <p className="mt-2 text-xs text-[#f0b429]">Fatality totals use the latest 400 reports. The crash count is the full window.</p>
                            ) : null}
                            <CrashChart rows={report.crashes.monthly} />
                            {report.crashes.recent.length ? (
                                <ul className="mt-2 divide-y divide-white/5 text-sm">
                                    {report.crashes.recent.map((crash, index) => (
                                        <li key={`${crash.date}-${index}`} className="flex justify-between gap-3 py-2 text-[#d5dbe6]">
                                            <span>{crash.date} · {crash.place}</span>
                                            <span className="text-[#8b97a8]">{crash.fatalities} fatal · {crash.injuries} injured{crash.towAway ? ' · tow' : ''}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-[#b7c0ce]">No crash rows in this window.</p>
                            )}
                        </Card>
                    </TabsContent>
                    <TabsContent value="record" className="mt-3">
                        <Card className="border-0 bg-[#10151c]/95 p-5 text-[#e8eef7] shadow-none ring-1 ring-white/10">
                            {report.censusFields.length ? (
                                <dl className="grid max-h-[32rem] gap-x-6 gap-y-3 overflow-auto sm:grid-cols-2">
                                    {report.censusFields.map((field) => (
                                        <div key={field.label}>
                                            <dt className="text-[11px] uppercase tracking-[0.12em] text-[#8b97a8]">{field.label}</dt>
                                            <dd className="text-sm text-[#e8eef7]">{field.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            ) : (
                                <p className="text-sm text-[#b7c0ce]">No census fields came back for this USDOT.</p>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function AuthorityLine({ row }: { row: AuthorityRow }) {
    const active = row.status.toLowerCase() === 'active'
    return (
        <tr className="border-t border-white/5 align-top">
            <td className="py-2.5 pr-3 font-medium text-white">{row.docket}</td>
            <td className="py-2.5 pr-3 text-[#d5dbe6]">{row.type}</td>
            <td className="py-2.5 pr-3">
                <span className={active ? 'text-[#3ee0a2]' : 'text-[#ffb4b4]'}>{row.status}</span>
                <div className="text-[11px] text-[#8b97a8]">
                    {row.cargoRequired ? `Cargo ${row.cargoOnFile ? 'on file' : 'missing'}` : 'Cargo not required'}
                    {' · '}
                    {row.bondRequired ? `Bond ${row.bondOnFile ? 'on file' : 'missing'}` : 'Bond not required'}
                </div>
            </td>
            <td className="py-2.5 pr-3">{formatMoney(row.minCoverage)}</td>
            <td className="py-2.5">{formatMoney(row.bipdOnFile)}</td>
        </tr>
    )
}

function BasicLine({
    name,
    percentile,
    measure,
    alert,
    acute,
}: {
    name: string
    percentile: string | null
    measure: string | null
    alert: boolean
    acute: boolean
}) {
    const width = percentile ? Number(percentile.replace('%', '')) : null
    return (
        <div>
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-white">{name}</span>
                <span className="text-xs text-[#9aa6b8]">
                    {percentile ? `percentile ${percentile}` : measure ? `measure ${measure}` : '—'}
                    {alert ? ' · alert' : ''}
                    {acute ? ' · acute' : ''}
                </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                    className="h-full rounded-full"
                    style={{
                        width: `${Math.max(0, Math.min(100, width || 0))}%`,
                        background: alert || acute ? '#ff6b6b' : '#3ee0a2',
                    }}
                />
            </div>
        </div>
    )
}

function RateMeter({
    label,
    rate,
    count,
    benchmark,
}: {
    label: string
    rate: number | null
    count: string
    benchmark: number
}) {
    const over = rate != null && rate > benchmark
    return (
        <div className="rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/10">
            <div className="text-[11px] uppercase tracking-[0.14em] text-[#8b97a8]">{label}</div>
            <div className="mt-1 text-2xl font-semibold text-white">{formatPercent(rate)}</div>
            <p className="text-xs text-[#9aa6b8]">{count} · benchmark {benchmark.toFixed(2)}%</p>
            <div className="relative mt-2 h-1.5 rounded-full bg-white/10">
                <div className="absolute top-0 h-full rounded-full" style={{ width: `${Math.min(100, benchmark)}%`, background: 'rgba(255,255,255,0.18)' }} />
                <div className="absolute top-0 h-full rounded-full" style={{ width: `${Math.min(100, rate || 0)}%`, background: over ? '#ff6b6b' : '#3ee0a2' }} />
            </div>
        </div>
    )
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/10">
            <div className="text-[11px] uppercase tracking-[0.14em] text-[#8b97a8]">{label}</div>
            <div className="mt-1 text-sm font-semibold text-white">{value}</div>
        </div>
    )
}

function Chip({ children }: { children: ReactNode }) {
    return <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-[#d5dbe6] ring-1 ring-white/10">{children}</span>
}

function yesNo(value: boolean | null) {
    if (value == null) return '—'
    return value ? 'Yes' : 'No'
}
