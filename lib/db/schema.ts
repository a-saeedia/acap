import { pgTable, text, boolean, timestamp, integer, bigint, jsonb, real } from 'drizzle-orm/pg-core'

// Better Auth required tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  role: text('role').default('user'),
  banned: boolean('banned').default(false),
  banReason: text('banReason'),
  banExpires: timestamp('banExpires'),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// App tables
export const userProfile = pgTable('user_profile', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  phone: text('phone').notNull(),
  age: integer('age'),
  investmentCapital: bigint('investmentCapital', { mode: 'number' }),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const quizResult = pgTable('quiz_result', {
  id: text('id').primaryKey(),
  userId: text('userId'),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  score: integer('score').notNull(),
  investorType: text('investorType').notNull(),
  answers: jsonb('answers').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const subscription = pgTable('subscription', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  acapPlus: boolean('acapPlus').notNull().default(false),
  acapPlusSince: timestamp('acapPlusSince'),
  acapPlusUntil: timestamp('acapPlusUntil'),
  scannerActive: boolean('scannerActive').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const suggestion = pgTable('suggestion', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  adminId: text('adminId'),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isRead: boolean('isRead').notNull().default(false),
  readAt: timestamp('readAt'),
  profitPercent: real('profitPercent'),
  profitMessage: text('profitMessage'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const ticket = pgTable('ticket', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  subject: text('subject').notNull(),
  status: text('status').notNull().default('open'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const ticketMessage = pgTable('ticket_message', {
  id: text('id').primaryKey(),
  ticketId: text('ticketId').notNull(),
  userId: text('userId').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const asset = pgTable('asset', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  type: text('type').notNull(),
  symbol: text('symbol').notNull(),
  label: text('label').notNull(),
  quantity: real('quantity').notNull().default(0),
  purchasePrice: real('purchasePrice'),
  purchaseDate: timestamp('purchaseDate'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const iranStock = pgTable('iran_stock', {
  id: text('id').primaryKey(),
  symbol: text('symbol').notNull().unique(),
  name: text('name').notNull(),
  sector: text('sector'),
  tsetmcCode: text('tsetmcCode'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const assetPrice = pgTable('asset_price', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  symbol: text('symbol').notNull(),
  price: bigint('price', { mode: 'number' }).notNull(),
  currency: text('currency').notNull().default('IRR'),
  source: text('source'),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
