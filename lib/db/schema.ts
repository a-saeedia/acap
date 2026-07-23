import { pgTable, text, boolean, timestamp, integer, bigint, jsonb, doublePrecision, real, uuid } from 'drizzle-orm/pg-core'

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
  userId: text('userId').notNull().unique(),
  phone: text('phone').notNull(),
  age: integer('age'),
  investmentCapital: bigint('investmentCapital', { mode: 'number' }),
  role: text('role').notNull().default('user'),
  referralCode: text('referralCode').unique(),
  referredBy: text('referredBy'),
  totalRewards: real('totalRewards').default(0),
  referralLevel: integer('referralLevel').default(1),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const referral = pgTable('referral', {
  id: text('id').primaryKey(),
  referrerId: text('referrerId').notNull(),
  referredId: text('referredId').notNull(),
  email: text('email'),
  name: text('name'),
  phone: text('phone'),
  status: text('status').notNull().default('active'),
  rewardMilestone: text('rewardMilestone'),
  rewardAmount: real('rewardAmount'),
  convertedAt: timestamp('convertedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
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
  trialEndsAt: timestamp('trialEndsAt'),
  requestedAt: timestamp('requestedAt'),
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
  profitPercent: real('profit_percent'),
  profitMessage: text('profit_message'),
  imageUrl: text('imageUrl'),
  audioUrl: text('audioUrl'),
  expiresAt: timestamp('expiresAt'),
  actualProfit: real('actual_profit'),
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
  tsetmcCode: text('tsetmc_code'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const assetPrice = pgTable('asset_price', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  symbol: text('symbol').notNull(),
  price: real('price').notNull(),
  currency: text('currency').notNull().default('IRR'),
  source: text('source'),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const userEvent = pgTable('user_event', {
  id: text('id').primaryKey(),
  userId: text('userId'),
  event: text('event').notNull(),
  path: text('path'),
  metadata: jsonb('metadata'),
  ip: text('ip'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const signal = pgTable('signal', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  symbol: text('symbol').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  action: text('action').notNull(),
  investorType: text('investorType'),
  expectedProfit: doublePrecision('expectedProfit'),
  actualReturn: doublePrecision('actualReturn'),
  priceAtPublish: doublePrecision('priceAtPublish').notNull(),
  priceNow: doublePrecision('priceNow'),
  imageUrl: text('imageUrl'),
  audioUrl: text('audioUrl'),
  visibility: text('visibility').notNull().default('public'),
  targetUserIds: jsonb('targetUserIds'),
  expiresAt: timestamp('expiresAt'),
  publishedAt: timestamp('publishedAt').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const acapRevenue = pgTable('acap_revenue', {
  id: text('id').primaryKey(),
  amount: real('amount').notNull(),
  description: text('description'),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const mlAnomaly = pgTable('ml_anomaly', {
  id: text('id').primaryKey(),
  symbol: text('symbol').notNull(),
  zScore: real('zScore').notNull(),
  currentPrice: real('currentPrice').notNull(),
  meanPrice: real('meanPrice').notNull(),
  stdPrice: real('stdPrice').notNull(),
  direction: text('direction').notNull(),
  detectedAt: timestamp('detectedAt').notNull().defaultNow(),
})

// Academy / Course system
export const course = pgTable('course', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  longDescription: text('longDescription'),
  category: text('category').notNull(), // 'ict' | 'ai' | 'stock' | 'forex' | 'crypto' | 'blockchain' | 'trading' | 'psychology'
  instructor: text('instructor').notNull(), // 'ali-borhan' | 'arman-saeedi'
  instructorName: text('instructorName').notNull(),
  price: bigint('price', { mode: 'number' }).notNull().default(0),
  originalPrice: bigint('originalPrice', { mode: 'number' }),
  duration: text('duration'), // e.g. '6 هفته'
  level: text('level').notNull().default('beginner'), // 'beginner' | 'intermediate' | 'advanced'
  lessons: integer('lessons').notNull().default(0),
  videoHours: real('videoHours').default(0),
  thumbnail: text('thumbnail'),
  color: text('color').notNull().default('#3B82F6'),
  icon: text('icon').notNull().default('BookOpen'),
  isPopular: boolean('isPopular').notNull().default(false),
  isNew: boolean('isNew').notNull().default(false),
  isBestseller: boolean('isBestseller').notNull().default(false),
  rating: real('rating').default(0),
  studentsCount: integer('studentsCount').default(0),
  prerequisites: text('prerequisites'),
  whatYouLearn: jsonb('whatYouLearn'),
  syllabus: jsonb('syllabus'), // Array of modules with lessons
  publishedAt: timestamp('publishedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const enrollment = pgTable('enrollment', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  courseId: text('courseId').notNull(),
  progress: real('progress').notNull().default(0),
  completedLessons: integer('completedLessons').notNull().default(0),
  startedAt: timestamp('startedAt').notNull().defaultNow(),
  completedAt: timestamp('completedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})


// Admin / Site Settings
export const siteSetting = pgTable('site_setting', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  label: text('label').notNull(),
  description: text('description'),
  type: text('type').notNull().default('text'), // 'text' | 'textarea' | 'boolean' | 'number' | 'image'
  group: text('group').notNull().default('general'), // 'general' | 'landing' | 'pricing' | 'contact' | 'social'
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  updatedBy: text('updatedBy'),
})

// Inline Site Comments (visual annotations on pages)
export const siteComment = pgTable('site_comment', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  path: text('path').notNull(), // e.g. '/', '/acap-plus', '/app/assets'
  selector: text('selector'), // CSS selector for the target element (optional)
  section: text('section'), // named section key (alternative to selector)
  content: text('content').notNull(),
  status: text('status').notNull().default('open'), // 'open' | 'resolved' | 'wontfix'
  resolvedAt: timestamp('resolvedAt'),
  resolvedBy: text('resolvedBy'),
  parentId: text('parentId'), // for threaded replies
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Task Management (Trello-like)
export const task = pgTable('task', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('todo'), // 'todo' | 'in_progress' | 'review' | 'done'
  priority: text('priority').notNull().default('medium'), // 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: text('assignedTo'),
  createdBy: text('createdBy').notNull(),
  order: integer('order').notNull().default(0),
  tags: jsonb('tags'), // string[]
  dueDate: timestamp('dueDate'),
  completedAt: timestamp('completedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const taskComment = pgTable('task_comment', {
  id: text('id').primaryKey(),
  taskId: text('taskId').notNull(),
  userId: text('userId').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Blog / Article system
export const articleCategory = pgTable('article_category', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color').default('#3B82F6'),
  icon: text('icon').default('BookOpen'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const article = pgTable('article', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  categoryId: text('categoryId'),
  author: text('author').notNull().default('تیم A|CAP'),
  authorRole: text('authorRole').default('تحلیلگر بازارهای مالی'),
  image: text('image'),
  tags: jsonb('tags'),
  readingTime: integer('readingTime').notNull().default(5),
  isFeatured: boolean('isFeatured').notNull().default(false),
  views: integer('views').notNull().default(0),
  publishedAt: timestamp('publishedAt').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
