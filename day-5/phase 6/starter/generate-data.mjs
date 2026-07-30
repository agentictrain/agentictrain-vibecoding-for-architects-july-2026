import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ROW_COUNT = 5000
const SEED = 20260730
const OUTPUT = fileURLToPath(new URL('./data.csv', import.meta.url))

const regions = ['North', 'South', 'East', 'West']
const channels = ['Web', 'Retail', 'Partner', 'Mobile']
const products = [
  { name: 'Beverages', averagePrice: 28 },
  { name: 'Grocery', averagePrice: 44 },
  { name: 'Home', averagePrice: 86 },
  { name: 'Personal Care', averagePrice: 52 },
  { name: 'Pet Care', averagePrice: 63 }
]

function mulberry32 (seed) {
  return function random () {
    let value = seed += 0x6D2B79F5
    value = Math.imul(value ^ value >>> 15, value | 1)
    value ^= value + Math.imul(value ^ value >>> 7, value | 61)
    return ((value ^ value >>> 14) >>> 0) / 4294967296
  }
}

function choose (values, random) {
  return values[Math.floor(random() * values.length)]
}

function isoDateForDay (dayOfYear) {
  const date = new Date(Date.UTC(2025, 0, dayOfYear + 1))
  return date.toISOString().slice(0, 10)
}

const random = mulberry32(SEED)
const rows = []

for (let index = 0; index < ROW_COUNT; index += 1) {
  const region = choose(regions, random)
  const channel = choose(channels, random)
  const product = choose(products, random)
  const date = isoDateForDay(Math.floor(random() * 365))
  const orders = 20 + Math.floor(random() * 181)
  const priceVariation = 0.82 + random() * 0.36
  const revenue = Math.round(orders * product.averagePrice * priceVariation)
  const baseReturnRate = 0.012 + random() * 0.045
  const channelAdjustment = channel === 'Web' || channel === 'Mobile' ? 0.009 : 0
  const returns = Math.min(
    orders,
    Math.round(orders * (baseReturnRate + channelAdjustment))
  )

  rows.push({
    batchId: `BATCH-${String(index + 1).padStart(6, '0')}`,
    date,
    region,
    channel,
    product: product.name,
    revenue,
    orders,
    returns
  })
}

rows.sort((left, right) =>
  left.date.localeCompare(right.date) ||
  left.batchId.localeCompare(right.batchId)
)

const uniqueIds = new Set(rows.map(row => row.batchId))
if (rows.length !== ROW_COUNT || uniqueIds.size !== ROW_COUNT) {
  throw new Error('Generated dataset has an unexpected row count or duplicate ID.')
}
if (rows.some(row =>
  row.revenue < 0 ||
  row.orders < 0 ||
  row.returns < 0 ||
  row.returns > row.orders
)) {
  throw new Error('Generated dataset violates a numeric integrity constraint.')
}

const lines = [
  'BatchId,Date,Region,Channel,Product,Revenue,Orders,Returns',
  ...rows.map(row => [
    row.batchId,
    row.date,
    row.region,
    row.channel,
    row.product,
    row.revenue,
    row.orders,
    row.returns
  ].join(','))
]

writeFileSync(OUTPUT, `${lines.join('\n')}\n`, 'utf8')
console.log(`Wrote ${ROW_COUNT} rows to ${OUTPUT} with seed ${SEED}.`)
