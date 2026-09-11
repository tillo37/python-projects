import { PrismaClient, Prisma } from "@prisma/client";
import {
  CATEGORICAL_PALETTE,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "../src/lib/categories";
import { toMinorUnits } from "../src/lib/money";
import { DEMO_USER_EMAIL } from "../src/lib/auth";

const prisma = new PrismaClient();

// Deterministic PRNG so re-seeding produces the same "realistic" demo data every time.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const randAmount = (min: number, max: number) => Math.round((rand() * (max - min) + min) * 100) / 100;
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

const MERCHANTS: Record<string, string[]> = {
  Groceries: ["Trader Joe's", "Whole Foods", "Safeway", "Costco", "Local Farmers Market"],
  Dining: ["Blue Bottle Coffee", "Chipotle", "Sushi Den", "Corner Bistro", "Thai Basil", "Starbucks"],
  Transportation: ["Uber", "Lyft", "Shell Gas Station", "City Metro Card", "Parking Garage"],
  Shopping: ["Amazon", "Target", "Best Buy", "IKEA", "Etsy"],
  Clothing: ["Zara", "Uniqlo", "Nike", "Everlane"],
  Housing: ["Parkview Apartments", "Riverside Rentals"],
  Utilities: ["Pacific Power & Light", "CityWater Co.", "Comcast Internet", "Metro Gas"],
  Entertainment: ["AMC Theatres", "Steam", "Spotify Concerts", "Local Bowling Alley"],
  Health: ["CVS Pharmacy", "City Dental", "FitLife Gym", "Urgent Care Clinic"],
  Education: ["Coursera", "O'Reilly Learning", "State University Extension"],
  Travel: ["Delta Airlines", "Airbnb", "Marriott Hotels", "National Rail"],
  Subscriptions: ["Netflix", "Spotify", "iCloud+", "The New York Times", "Adobe Creative Cloud"],
  Other: ["Venmo Transfer", "ATM Withdrawal", "Local Charity"],
};

const PAYMENT_METHODS = ["CASH", "CREDIT_CARD", "DEBIT_CARD", "BANK_TRANSFER", "OTHER"] as const;

async function main() {
  console.log("Seeding demo data...");

  await prisma.user.deleteMany({ where: { email: DEMO_USER_EMAIL } });

  const user = await prisma.user.create({
    data: { name: "Jordan Avery", email: DEMO_USER_EMAIL, currency: "USD" },
  });

  const expenseCategories = await Promise.all(
    DEFAULT_EXPENSE_CATEGORIES.map((c, i) =>
      prisma.category.create({
        data: {
          userId: user.id,
          name: c.name,
          icon: c.icon,
          type: c.type,
          color: CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length],
          isDefault: true,
        },
      })
    )
  );

  const incomeCategories = await Promise.all(
    DEFAULT_INCOME_CATEGORIES.map((c, i) =>
      prisma.category.create({
        data: {
          userId: user.id,
          name: c.name,
          icon: c.icon,
          type: c.type,
          color: CATEGORICAL_PALETTE[i % CATEGORICAL_PALETTE.length],
          isDefault: true,
        },
      })
    )
  );

  const catByName = new Map([...expenseCategories, ...incomeCategories].map((c) => [c.name, c]));

  const rows: Prisma.TransactionCreateManyInput[] = [];

  const today = new Date();
  const MONTHS_OF_HISTORY = 13;

  for (let m = MONTHS_OF_HISTORY - 1; m >= 0; m--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const isCurrentMonth = m === 0;
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const lastDayToUse = isCurrentMonth ? today.getDate() : daysInMonth;

    const dayInMonth = (day: number) => new Date(monthDate.getFullYear(), monthDate.getMonth(), day, randInt(8, 20), randInt(0, 59));

    // --- Income ---
    const salaryDay = Math.min(1, lastDayToUse);
    if (lastDayToUse >= salaryDay) {
      const salaryVariance = randAmount(-60, 90);
      rows.push({
        userId: user.id,
        type: "INCOME",
        amountMinor: toMinorUnits(4200 + salaryVariance, "USD"),
        currency: "USD",
        categoryId: catByName.get("Salary")!.id,
        description: "Monthly salary",
        merchant: "Acme Corp",
        date: dayInMonth(salaryDay),
        paymentMethod: "BANK_TRANSFER",
        isRecurring: true,
        recurrenceFrequency: "MONTHLY",
      });
    }

    if (rand() < 0.35 && lastDayToUse >= 10) {
      rows.push({
        userId: user.id,
        type: "INCOME",
        amountMinor: toMinorUnits(randAmount(150, 900), "USD"),
        currency: "USD",
        categoryId: catByName.get("Freelance")!.id,
        description: "Freelance project",
        merchant: "Contract Client",
        date: dayInMonth(randInt(5, Math.min(lastDayToUse, daysInMonth))),
        paymentMethod: "BANK_TRANSFER",
      });
    }

    if (rand() < 0.15 && lastDayToUse >= 15) {
      rows.push({
        userId: user.id,
        type: "INCOME",
        amountMinor: toMinorUnits(randAmount(200, 600), "USD"),
        currency: "USD",
        categoryId: catByName.get("Bonus")!.id,
        description: "Performance bonus",
        merchant: "Acme Corp",
        date: dayInMonth(randInt(15, Math.min(lastDayToUse, daysInMonth))),
        paymentMethod: "BANK_TRANSFER",
      });
    }

    if (rand() < 0.4) {
      rows.push({
        userId: user.id,
        type: "INCOME",
        amountMinor: toMinorUnits(randAmount(20, 180), "USD"),
        currency: "USD",
        categoryId: catByName.get("Investment")!.id,
        description: "Dividend payout",
        merchant: "Vanguard",
        date: dayInMonth(randInt(1, Math.min(lastDayToUse, daysInMonth))),
        paymentMethod: "BANK_TRANSFER",
      });
    }

    // --- Expenses ---
    const expensePlan: { category: string; count: [number, number]; amount: [number, number] }[] = [
      { category: "Groceries", count: [4, 8], amount: [15, 95] },
      { category: "Dining", count: [6, 14], amount: [5, 45] },
      { category: "Transportation", count: [3, 7], amount: [8, 60] },
      { category: "Shopping", count: [1, 4], amount: [20, 150] },
      { category: "Clothing", count: [0, 2], amount: [25, 140] },
      { category: "Utilities", count: [1, 2], amount: [60, 180] },
      { category: "Entertainment", count: [1, 4], amount: [8, 60] },
      { category: "Health", count: [0, 2], amount: [20, 150] },
      { category: "Other", count: [0, 2], amount: [10, 60] },
    ];

    for (const plan of expensePlan) {
      const count = randInt(plan.count[0], plan.count[1]);
      for (let i = 0; i < count; i++) {
        const day = randInt(1, Math.max(1, Math.min(lastDayToUse, daysInMonth)));
        const merchants = MERCHANTS[plan.category];
        rows.push({
          userId: user.id,
          type: "EXPENSE",
          amountMinor: toMinorUnits(randAmount(plan.amount[0], plan.amount[1]), "USD"),
          currency: "USD",
          categoryId: catByName.get(plan.category)!.id,
          merchant: pick(merchants),
          description: null,
          date: dayInMonth(day),
          paymentMethod: pick(PAYMENT_METHODS),
        });
      }
    }

    // Housing: one rent payment near the 1st.
    if (lastDayToUse >= 1) {
      rows.push({
        userId: user.id,
        type: "EXPENSE",
        amountMinor: toMinorUnits(1150 + randInt(-20, 20), "USD"),
        currency: "USD",
        categoryId: catByName.get("Housing")!.id,
        merchant: pick(MERCHANTS.Housing),
        description: "Monthly rent",
        date: dayInMonth(Math.min(2, lastDayToUse)),
        paymentMethod: "BANK_TRANSFER",
        isRecurring: true,
        recurrenceFrequency: "MONTHLY",
      });
    }

    // Subscriptions: fixed set, charged monthly.
    const subs: [string, number][] = [
      ["Netflix", 15.49],
      ["Spotify", 11.99],
      ["iCloud+", 2.99],
      ["The New York Times", 4],
      ["Adobe Creative Cloud", 20.99],
    ];
    for (const [name, price] of subs) {
      const day = Math.min(randInt(1, 5), lastDayToUse);
      if (day < 1) continue;
      rows.push({
        userId: user.id,
        type: "EXPENSE",
        amountMinor: toMinorUnits(price, "USD"),
        currency: "USD",
        categoryId: catByName.get("Subscriptions")!.id,
        merchant: name,
        description: "Monthly subscription",
        date: dayInMonth(day),
        paymentMethod: "CREDIT_CARD",
        isRecurring: true,
        recurrenceFrequency: "MONTHLY",
      });
    }

    // Occasional education / travel.
    if (rand() < 0.2 && lastDayToUse >= 10) {
      rows.push({
        userId: user.id,
        type: "EXPENSE",
        amountMinor: toMinorUnits(randAmount(50, 300), "USD"),
        currency: "USD",
        categoryId: catByName.get("Education")!.id,
        merchant: pick(MERCHANTS.Education),
        date: dayInMonth(randInt(1, Math.min(lastDayToUse, daysInMonth))),
        paymentMethod: "CREDIT_CARD",
      });
    }
    if (rand() < 0.18 && lastDayToUse >= 10) {
      rows.push({
        userId: user.id,
        type: "EXPENSE",
        amountMinor: toMinorUnits(randAmount(180, 950), "USD"),
        currency: "USD",
        categoryId: catByName.get("Travel")!.id,
        merchant: pick(MERCHANTS.Travel),
        date: dayInMonth(randInt(1, Math.min(lastDayToUse, daysInMonth))),
        paymentMethod: "CREDIT_CARD",
      });
    }
  }

  await prisma.transaction.createMany({ data: rows });

  console.log(`Seeded 1 user, ${expenseCategories.length + incomeCategories.length} categories, ${rows.length} transactions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
