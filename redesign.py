import sys

file_path = r'C:\Users\arman\Downloads\duge\components\portfolio-dashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line 533 (0-indexed) is after toast ends (line 530), skip blanks
# Line 1111 (0-indexed) is AISupport
start_replace = 533  # after toast closing and blanks
end_replace = 1110   # line before AISupport

print(f"Replacing lines {start_replace+1} to {end_replace}")

new_content = """      {/* Main Dashboard - Minimal Cards */}
      <div className="space-y-2.5">
        {/* Value Card */}
        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
          <div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">ارزش کل سبد</div>
            <div className="text-2xl font-bold text-foreground mt-0.5">
              <AnimatedNumber value={totalValue} /> <span className="text-xs font-normal text-muted-foreground">تومان</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={fetchPrices} disabled={priceLoading}
              className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${priceLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={openAdd} className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-white">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats - 2x2 grid */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'دارایی‌ها', value: String(assets.length) },
            { label: 'دسته‌ها', value: String(Object.keys(byType).length) },
            { label: 'سود/زیان', value: totalCost > 0 ? `${(((totalValue - totalCost) / totalCost) * 100).toFixed(1)}%` : '—' },
            { label: 'دلار', value: formatCurrency(Math.round((prices['USD-IRR']?.price ?? 0) / 10)) },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-3">
              <div className="text-[10px] text-muted-foreground font-medium">{stat.label}</div>
              <div className="text-sm font-bold text-foreground mt-0.5">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Category Distribution */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-xs font-bold text-foreground mb-3">توزیع سرمایه</h3>
          {Object.keys(byType).length === 0 ? (
            <p className="text-muted-foreground text-xs text-center py-4">هنوز دارایی ثبت نشده</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(byType).sort((a, b) => b[1].value - a[1].value).map(([type, data]) => {
                const pct = totalValue > 0 ? (data.value / totalValue) * 100 : 0
                const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.other
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{cfg.icon}</span>
                        <span className="text-xs font-semibold text-foreground">{cfg.label}</span>
                        <span className="text-[10px] text-muted-foreground">{data.count} مورد</span>
                      </div>
                      <div className="text-xs font-bold text-foreground">{pct.toFixed(1)}%</div>
                    </div>
                    <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Management + Last Update */}
        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">مدیریت سبد</div>
              {lastUpdate ? (
                <div className="text-[10px] text-muted-foreground">آخرین به‌روزرسانی: {new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(lastUpdate)}</div>
              ) : (
                <div className="text-[10px] text-muted-foreground">دریافت قیمت...</div>
              )}
            </div>
          </div>
          <button onClick={openAdd} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold">+ افزودن</button>
        </div>

        {/* Info */}
        <div className="bg-card border border-border rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span>💡</span>
            <span>قیمت‌ها از tgju.org و tsetmc.com - به‌روزرسانی لحظه‌ای</span>
          </div>
        </div>

        {/* Assets List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-foreground">دارایی‌ها</h3>
            <span className="text-[10px] text-muted-foreground">{assets.length} مورد</span>
          </div>

          {assets.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-muted-foreground text-xs mb-3">سبد شما خالی است</p>
              <button onClick={openAdd} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold">+ افزودن دارایی</button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {[...assets]
                .sort((a, b) => {
                  const valA = getCurrentValue(a, prices, stockPrices)
                  const valB = getCurrentValue(b, prices, stockPrices)
                  return valB - valA
                })
                .map((a) => {
                  const price = getAssetPriceIr(a.symbol, prices, stockPrices)
                  const value = getCurrentValue(a, prices, stockPrices)
                  const cost = getTotalCost(a)
                  const pnl = cost > 0 ? ((value - cost) / cost) * 100 : 0
                  const cfg = TYPE_CONFIG[a.type] ?? TYPE_CONFIG.other
                  const diff = value - cost
                  return (
                    <div key={a.id} className="bg-card border border-border rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-sm shrink-0">
                            {cfg.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground truncate">{a.label}</div>
                            <div className="text-[10px] text-muted-foreground">{formatQuantity(a.quantity, a.symbol)} واحد</div>
                          </div>
                        </div>
                        <div className="text-left flex items-center gap-1.5">
                          <div>
                            <div className="text-sm font-bold text-foreground" dir="ltr">{value > 0 ? formatCurrency(value) : '—'}</div>
                            {cost > 0 && (
                              <div className={`text-[10px] font-semibold ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {diff >= 0 ? '+' : ''}{pnl.toFixed(1)}%
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <button onClick={(e) => { e.stopPropagation(); openEdit(a); }}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-accent"
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
"""

# Replace from main_content_start to end_replace
new_lines = lines[:start_replace] + [new_content] + lines[end_replace:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Done! New line count: {len(new_lines)}")
