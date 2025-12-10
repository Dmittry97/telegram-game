"use client";

import { useMemo, useState } from "react";

type HistoryRow = {
  id: string;
  user: string;
  number: number;
  target: string;
  amount: number;
  chance: number;
  win: number;
};

const MAX_ROLL = 999999;

const initialHistory: HistoryRow[] = [
  {
    id: "1",
    user: "Alyona...",
    number: 266845,
    target: "945000 - 999999",
    amount: 30,
    chance: 5.5,
    win: 0,
  },
  {
    id: "2",
    user: "89968849...",
    number: 638815,
    target: "0 - 9999",
    amount: 5,
    chance: 1,
    win: 0,
  },
  {
    id: "3",
    user: "Inna260...",
    number: 788380,
    target: "0 - 22499",
    amount: 1,
    chance: 2.25,
    win: 0,
  },
  {
    id: "4",
    user: "060...",
    number: 431551,
    target: "990000 - 999999",
    amount: 8,
    chance: 1,
    win: 0,
  },
  {
    id: "5",
    user: "Aidaad...",
    number: 648053,
    target: "0 - 289999",
    amount: 32,
    chance: 29,
    win: 0,
  },
];

const randomHash = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export default function Home() {
  const [betSize, setBetSize] = useState(1);
  const [betPercent, setBetPercent] = useState(90);
  const [balance, setBalance] = useState(250);
  const [hash, setHash] = useState(randomHash());
  const [history, setHistory] = useState<HistoryRow[]>(initialHistory);
  const [isBetting, setIsBetting] = useState(false);
  const [lastResult, setLastResult] = useState<
    | { state: "idle" }
    | { state: "error"; message: string }
    | { state: "win"; profit: number; number: number }
    | { state: "lose"; number: number }
  >({ state: "idle" });

  const profit = useMemo(
    () => Number(((100 / betPercent) * betSize).toFixed(2)),
    [betPercent, betSize]
  );

  const minRange = useMemo(
    () => Math.floor((betPercent / 100) * MAX_ROLL),
    [betPercent]
  );
  const maxRange = useMemo(() => MAX_ROLL - minRange, [minRange]);

  const clampPercent = (value: number) => Math.min(Math.max(value, 1), 95);

  const updateBetSize = (value: number) => {
    if (Number.isNaN(value)) return;
    setBetSize(Number(Math.max(value, 0.01).toFixed(2)));
  };

  const updateBetPercent = (value: number) => {
    if (Number.isNaN(value)) return;
    setBetPercent(Number(clampPercent(value).toFixed(2)));
  };

  const formatMoney = (value: number) =>
    value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const placeBet = (side: "min" | "max") => {
    if (isBetting) return;

    if (betSize <= 0) {
      setLastResult({ state: "error", message: "Введите сумму ставки" });
      return;
    }

    if (betSize > balance) {
      setLastResult({ state: "error", message: "Недостаточно средств" });
      return;
    }

    setIsBetting(true);
    setLastResult({ state: "idle" });

    setTimeout(() => {
      const roll = Math.floor(Math.random() * (MAX_ROLL + 1));
      const isWin =
        side === "min" ? roll <= minRange : roll >= maxRange;

      const newBalance = Number(
        (balance - betSize + (isWin ? profit : 0)).toFixed(2)
      );
      setBalance(newBalance);
      setHash(randomHash());

      const newRow: HistoryRow = {
        id: crypto.randomUUID(),
        user: "Вы",
        number: roll,
        target: side === "min" ? `0 - ${minRange}` : `${maxRange} - 999999`,
        amount: betSize,
        chance: betPercent,
        win: isWin ? profit : 0,
      };

      setHistory((prev) => [newRow, ...prev].slice(0, 20));

      if (isWin) {
        setLastResult({ state: "win", profit, number: roll });
      } else {
        setLastResult({ state: "lose", number: roll });
      }

      setIsBetting(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0c10] via-[#0e1016] to-[#0b0c10] text-white px-4 py-6 font-sans">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <section className="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-white/60">Режим игры</p>
              <h1 className="text-xl font-semibold">Main game</h1>
            </div>
            <div className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-400">
              Баланс: {formatMoney(balance)}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-white/5 bg-black/20 p-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <p className="text-xs uppercase tracking-[0.08em] text-white/50">
                Возможный выигрыш
              </p>
              <p className="mt-2 text-4xl font-semibold text-emerald-300">
                {formatMoney(profit)}
              </p>
            </div>
            <div className="flex flex-col gap-3 md:col-span-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-white/70">Сумма</label>
                <div className="flex items-center gap-2">
                  <input
                    inputMode="decimal"
                    value={betSize}
                    onChange={(e) => updateBetSize(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg outline-none transition focus:border-emerald-400/60"
                  />
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => updateBetSize(betSize * 2)}
                      className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15"
                    >
                      Удвоить
                    </button>
                    <button
                      onClick={() => updateBetSize(Math.max(betSize / 2, 1))}
                      className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15"
                    >
                      Половина
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateBetSize(balance)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:border-emerald-400/50"
                  >
                    Макс
                  </button>
                  <button
                    onClick={() => updateBetSize(1)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:border-emerald-400/50"
                  >
                    Мин
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-white/70">Процент</label>
                <div className="flex items-center gap-2">
                  <input
                    inputMode="decimal"
                    value={betPercent}
                    onChange={(e) => updateBetPercent(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg outline-none transition focus:border-emerald-400/60"
                  />
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => updateBetPercent(betPercent * 2)}
                      className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15"
                    >
                      Удвоить
                    </button>
                    <button
                      onClick={() => updateBetPercent(betPercent / 2)}
                      className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/15"
                    >
                      Половина
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateBetPercent(95)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:border-emerald-400/50"
                  >
                    Макс
                  </button>
                  <button
                    onClick={() => updateBetPercent(1)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:border-emerald-400/50"
                  >
                    Мин
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-white/5 bg-black/30 p-4 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.08em] text-white/50">
                Текущий хеш игры
              </p>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80 break-words">
                {hash}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
                <span className="rounded-full bg-white/10 px-3 py-1">
                  0 - {minRange}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1">
                  {maxRange} - 999999
                </span>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">
                  {betPercent}% шанс
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={isBetting}
                  onClick={() => placeBet("min")}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition disabled:opacity-60"
                >
                  {isBetting ? "Ставка..." : "Меньше"}
                </button>
                <button
                  disabled={isBetting}
                  onClick={() => placeBet("max")}
                  className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition disabled:opacity-60"
                >
                  {isBetting ? "Ставка..." : "Больше"}
                </button>
              </div>

              {lastResult.state === "error" && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {lastResult.message}
                </div>
              )}
              {lastResult.state === "win" && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  Выиграли {formatMoney(lastResult.profit)} · выпало {lastResult.number}
                </div>
              )}
              {lastResult.state === "lose" && (
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                  Выпало {lastResult.number}. Попробуйте ещё раз!
                </div>
              )}

              <p className="text-xs text-white/60">
                Баланс обновляется локально и рассчитан только для предпросмотра мини-приложения.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Последние игры</h2>
              <p className="text-xs text-white/60">Реальные данные сервера пока заглушены</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
              Онлайн 2 174
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {history.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-xl border border-white/5 bg-black/25 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/5 text-center text-xs font-semibold leading-10">
                    🎲
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{row.user}</p>
                    <p className="text-xs text-white/60">
                      Число:{" "}
                      <span className={row.win > 0 ? "text-emerald-300" : "text-red-300"}>
                        {row.number}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                  <span className="rounded-full bg-white/5 px-3 py-1">Цель: {row.target}</span>
                  <span className="rounded-full bg-white/5 px-3 py-1">Сумма: {formatMoney(row.amount)}</span>
                  <span className="rounded-full bg-white/5 px-3 py-1">
                    Шанс: {row.chance.toFixed(2)}%
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 font-semibold ${
                      row.win > 0
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-red-500/10 text-red-200"
                    }`}
                  >
                    Выигрыш: {formatMoney(row.win)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
