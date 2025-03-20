---
title: Implement Envelope Budget in ledger-cli
pubDate: 2025-03-23
categories: ['Articles', 'ledger-cli', 'pta', 'personal-finance']
description: 'Use virtual accounts and automated transactions to implement a envelope budget system within ledger-cli.'
slug: 'implement-envelope-budget-in-ledger-cli'
---

I've been using `ledger-cli` to track my personal finance since 2019, there has been some breaks in-between but overall I'm quite happy with the flexibility brought by the plain-text-accounting tool.
For me, the three major advantages of plain-text-accounting are:

1. You own all your data, no privacy concern especially for sensitive information in finance ledger.
2. Your data is in plain text, you can always view/edit your data with no dependency on any properitary software.
3. Thanks to the great community, you can fine tune exactly how you want to review your finance report.

However, with these features, it also means you need to make some customization to generate some advanced functionality like budgeting. Over the years I have developed a budgeting system under `ledger-cli`, in this post I will share my setup.

## Envelope Budget

Before we discuss the exact implementation, I would like to first introduce the concept of envelope budget.

It's a really simple but time-tested method to manage your money, the idea is to split your money into different envelopes, each envelope for one spending category. Whenever you need to make an purchase, you spend money from that specific envelope.

To put it into an example, imagine you have a monthly income of 2,000 USD, based on your spending history, you might split the income into below envelopes:

| Envelope | Amount |
| -------- | ------ |
| Rent | 700 |
| Food | 500 |
| Entertainment | 200 |
| Purchase | 100 |
| Bill | 100 |
| Saving | 400 | 

By assigning moneys into different envelope, you are essentially controlling the spending you can make in each category. 
By month end, you can review the remaining balance in each envelope and re-allocate them properly, some envelope like `Saving` and `Purchase` can have their balance carry-over to next month. For example, at month end:

| Envelope | Month end balance | Reallocation | Final balance |
| -------- | ------ | ----- | ------ |
| Rent | 0 | Move to saving | 0 |
| Food | 50 | Move to saving | 0 |
| Entertainment | 100 | Move to saving | 0 |
| Purchase | 150 | Carry-over | 150 |
| Bill | 10 | Move to saving | 0 |
| Saving | 400 | Carry-over | 560 |

In the examples above, `Food` envelope has 50 USD balance at month end, by moving it to `Saving` envelope, you are gradually accumulating your saving by planning and controlling your spending with envelope budget.

## Envelope Budget with Ledger Cli

The example above is quite solid in 1980s when people use cash all the time, and the physcial actions of putting your money into different envelopes actually make sense. 
But it's year 2025, your assets is most likely distributed across different banks and services like PayPal/AliPay. You will not actually put your money into different accounts and spend from those envelopes. So how do we implement the envelope budget method under modern day scenario?

### Virtual Transaction

Luckily, in `ledger-cli` there is a very useful features called virtual transactions which can help us implement an envelope budget system. Let's walk through an simple example to see how virtual transactions can be very helpful. In this example, we will simulate the process of receiving income and allocate it into multiple budget envelops.

#### 1. Assigning Budget

In normal ledger transcations, above example will be recorded like below:

```ledger
; main.ledger

2025-03-20 * Income
    Income:Salary:CompanyA    -2,000 USD
    Asset:Cash:Bank            2,000 USD

2025-03-20 * Assign Budget Envelope
    Asset:Cash:Bank           -2,000 USD
    Budget:Rent                  700 USD
    Budget:Food                  500 USD
    Budget:Entertainment         200 USD
    Budget:Purchase              100 USD
    Budget:Bill                  100 USD
    Budget:Saving                400 USD
```

With this setup, we can easily check the budget balance using `bal` report.

```sh
ledger -f main.ledger bal ^Budget ^Asset
```

However, this create a problem, that we cannot easily tell the actual balance in our bank account, cause we already moved all of them into the budget envelope. This is where virtual transactions comes in, to mark an entry as part of a virtual transactions, you just need to wrap the account name with either `()` or `[]`. The difference between `()`and `[]` is that `()` does not require virtual transaction to be balanced, where `[]` will throw an error if virtual transactions are not balanced.

A virtual transactions represent something that happened virtually, in this example, we didn't actually move the money from our bank account into the budget envelops, we are only doing this virtually to better plan our finance. Therefore we will change the second transactions into a virtual one, like below:

```ledger
; main.ledger

2025-03-20 * Income
    Income:Salary:CompanyA    -2,000 USD
    Asset:Cash:Bank            2,000 USD

2025-03-20 * Assign Budget Envelope
    [Asset:Cash:Bank]         -2,000 USD
    [Budget:Rent]                700 USD
    [Budget:Food]                500 USD
    [Budget:Entertainment]       200 USD
    [Budget:Purchase]            100 USD
    [Budget:Bill]                100 USD
    [Budget:Saving]              400 USD
```

Now that the second transaction is virtual, we can still use the `bal` report to check the remaining budget in each envelope.

```sh
ledger -f main.ledger bal ^Budget ^Asset
```

Since second transaction is virtual, we can now exclude it from the `bal` report with the `--real` or `-R` flag, giving us the actual balance that we have:

```sh
ledger -f main.ledger bal ^Budget ^Asset -R
```

Virtual transaction is giving us the flexibility to easily switch between our remaining budget (virtual view) or our actual balance (real view).

#### 2. Spending

The only purpose to plan a budget is to spend accordingly, so while we make some spending we also need to track it in our budget system. While tracking expenses with a budget system, we always want to answer two questions:

1. How many money do I actually own across different account?
2. How many balance do I have in each budget?

Let's look at below simple example where we pay 50 USD for dinner.

```ledger
; main.ledger

2025-03-21 * Dinner @Steakhouse
    Expense:Food:Dinner     50 USD
    Asset:Cash:Bank        -50 USD
```

Since this is a food expense, while realisticaly we are spending from our bank account, virtually we are spending from our food budget envelope. Therefore we will record is as below.

```ledger
; main.ledger

2025-03-21 * Dinner @Steakhouse
    Expense:Food:Dinner    50 USD   
    Asset:Cash:Bank       -50 USD
    [Asset:Cash:Bank]      50 USD
    [Budget:Food]         -50 USD
```

The `[Budget:Food]` entry is very straightforward as we are making a food expense, naturally it need to come from the food budget.
But the `[Asset:Cash:Bank]` line can be a bit unintuitive at first, but it's actually really simple once you get it, this is how I view the whole transaction:

1. Realistically, my money is still in the bank account.
1. Virtually, all my money is distributed across different budget envelope.
3. Whenever I make a spending, I need to first *virtually* put the money back from budget envelope to my back account
4. Then I can make the real spending from my bank account.

My real spending (No. 4) is represented by the normal ledger record below.

```ledger
; main.ledger

2025-03-21 * Dinner @Steakhouse
    Expense:Food:Dinner     50 USD
    Asset:Cash:Bank        -50 USD
```

The virtual process of putting money back to back account (No. 3) is represented by the two virtual lines below.

```ledger
; main.ledger

2025-03-21 * Dinner @Steakhouse
    [Asset:Cash:Bank]      50 USD
    [Budget:Food]         -50 USD
```

Now that we can check both our actual balance and remaining budget using the `bal` report and the `-R` flag.

```sh
ledger -f main.ledger bal ^Asset ^Budget -R
```

```sh
ledger -f main.ledger bal ^Asset ^Budget 
```

Without `-R`, `ledger` will include the virtual entries and show that my food budget has been deducted by 50 USD, with `-R`, `ledger` will exclude virtual entries and show that my bank balance has been deducted by 50 USD. Target achieved.

#### 3. Automated transactions

Now we know how to properly setup and track our budget and expenses, the budget system is almost implemented, but essentially we're doubling our entries, this could be tedious especially if you have a lots of transactions. To help with this, we will use the automated transaction from `ledger-cli` to simplify the process.

With automated transactions, you can generate entries based on expression and rules, in our cases for example, we can set up a rule like this.

Whenever there is a entry for `Expense:Food` account, `ledger` should generate a corresponding entry with `Budget:Food` account. This can be written as:

```ledger
= Expense:Food
    [Budget:Food]       (-1.0)
```

The `(-1.0)` is called the amount multiplier, in our cases it means take whatever amount of the original line and multiply it by -1, essentially adding a corresponding line to deduct the budget balance.

Just similar as whenever we spend money in certain expense, we need to virtaully deduct the budget account; Whenever we spend money from our asset account, we also need virtually put our money back into the asset account, therefore we also need to add the automated transactions like below:

```ledger
= Asset:Cash:Bank
    [Asset:Cash:Bank]   (-1.0)
```

While automated transation reduces a lots of the manual input, sometimes the transcation can be too complex where I actually want to manually do the budgeting, or it doesn't apply with the rules. I use tag to solve this. 
Specifically, for each transaction that I want to manually configure the budget, I add a `MANUAL` tag, and I modify may automated transactions like below:

```ledger
= /Expense:Food/ and not %MANUAL
    [Budget:Food]    (-1.0)

= /Asset:Cash:Bank/ and not %MANUAL
    [Asset:Cash:Bank]    (-1.0)

2025-03-20 * Lunch
    Expense:Food:Lunch    30 USD
    Asset:Cash:Bank      -30 USD

2025-03-20 * Dinner
    ; :MANUAL:
    ; Here the spending is split half half among the food and dating envelope
    Expense:Food:Dinner   50 USD
    Asset:Cash:Bank      -50 USD
    [Asset:Cash:Bank]     50 USD
    [Budget:Food]        -25 USD
    [Budget:Dating]      -25 USD
```

With this setup, one can easily track finance using envelope budget method.