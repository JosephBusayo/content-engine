# Acag — week of Mon 30 Nov – Sun 6 Dec 2026

21 posts. Every factual claim traces to `projects/acag/facts.md`.

**Standing rules:** no hashtags. Links in a reply, never the main tweet. 🧵 is the
only emoji. Shot goes on tweet 1 or 2.

**No results exist.** No users, no judging, no placement. Nothing below implies any.

---

# MONDAY — struggle → shift → insight

## Thread (6 tweets) · shot: `mon-01`

**1/**
I built an AI sales agent for social media sellers.

Then I deleted most of it.

**2/**
The idea was fine. Seller gets a DM, the agent answers, drops a payment link.

Works for anybody selling anything.

That was the problem.

**3/**
"Anybody selling anything" means you can't build anything specific.

What's the price? Depends. What questions should it ask? Depends.

Every feature turns into a setting.

**4/**
So I niched it down to one job: hair stylists.

Suddenly the features write themselves.

Price per inch. Braid size. A portfolio to match a screenshot against. Opening
hours per weekday.

**5/**
None of that is buildable for "sellers."

All of it is obvious for stylists.

99 files changed. 3,260 lines added, 1,684 deleted.

**6/**
Narrowing it down didn't make the product smaller.

It made it possible.

If you're stuck adding settings instead of features, you probably haven't picked
who it's for yet.

---

## Just the thing · shot: `mon-02`
The whole app only exists because I stopped trying to build it for everybody.

---

## Quick value
**Niche** isn't a marketing word. It's an engineering one.

"Sellers" can't have price-per-inch.
"Hair stylists" can.

Who it's for decides what you can build.

---

# TUESDAY — what I'm building

## Thread (6 tweets) · shots: `tue-01`, `tue-02`

**1/**
A client sends a screenshot of a hairstyle from Instagram.

Thirty seconds later she's paid a deposit and she's in the diary.

Here's what happens in between 🧵

**2/**
First it has to work out what she's even asking for.

The screenshot gets compared against the stylist's own portfolio photos. It comes
back with up to three matching styles from that stylist's actual price list.

Not a generic haircut database. Her styles.

**3/**
Then it asks the questions that style actually needs.

Length in inches. Braid size. Hair included or not.

A stylist asks these a hundred times a week in her DMs. That's the part that's
eating her day.

**4/**
Then it prices it.

$10 an inch means 3 inches is $30 and 7 inches is $70, plus or minus the options.

Every one of those numbers is worked out by the server. More on that tomorrow.

**5/**
Then it offers times. Real ones.

It only offers a start time if the whole appointment fits before closing and
doesn't collide with an existing booking.

Picking one puts a 15 minute hold on it.

**6/**
Then she pays. 30% deposit or the full thing.

The booking only lands in the diary after the payment actually clears.

An unpaid hold expires and the stylist never sees it.

No-shows stop costing her an afternoon.

---

## Just the thing · shot: `tue-03`
"How much for this?" is the single most answered question in a stylist's DMs.

This answers it from her own price list.

---

## Quick value
**Agent** just means the model can do things, not only say things.

Mine can search a portfolio, price a style, check a diary and open a checkout.

A chatbot talks. An agent acts.

---

# WEDNESDAY — teach one part of the process

## Thread (7 tweets) · shot: `wed-01`

**1/**
The AI in my app is never told the lowest price it's allowed to accept.

That's deliberate, and it's the most important decision in the build 🧵

**2/**
The app haggles. A stylist sets a private limit — say 15%, so a $70 style can
come down to $60 and no further.

Obvious way to build that: put the limit in the system prompt and tell the model
to respect it.

Don't do that.

**3/**
Three reasons.

One: I don't want a language model deciding what somebody pays. That's money.
It shouldn't be a judgement call.

**4/**
Two: it leaks.

Anything you put in the prompt or send to the browser can be pulled back out by
the person chatting with it.

The stylist's lowest acceptable price is the exact thing that must never leak.

**5/**
Three: cost and reliability.

Doing arithmetic in code is free and correct every time. Doing it with a model
costs tokens and is right most of the time.

Most of the time isn't good enough for a price.

**6/**
So the server owns all of it.

Every price, every counter-offer. Lowball gets told it's way too low. A close
offer gets met. Keep pushing and you get "this is the lowest I can go."

The floor never reaches the model or the browser.

**7/**
The model runs the conversation. The server makes the decisions.

If a mistake in your app costs somebody money, that logic doesn't belong in a
prompt.

Building something like this? DMs open.

---

## Just the thing · shot: `wed-02`
The model talks to the customer.

The server decides what the customer pays.

Those are two different jobs.

---

## Quick value
**System prompt** = the instructions the model gets before the conversation starts.

People treat it like a vault. It isn't.

Assume everything in it can be read by the person you're chatting with.

---

# THURSDAY — trending topic + take

## Thread (6 tweets) · shot: `thu-01`

**1/**
Everybody is shipping AI agents right now.

Most of the demos have the same hole in them.

**2/**
The model is making the decision.

Not fetching the data. Not writing the reply. Deciding.

What to charge. What to approve. What to refund.

**3/**
It'll be right most of the time. That's what makes it dangerous.

You don't notice the problem in a demo. You notice it in production, on
somebody's actual money.

**4/**
In my app the model never calculates a price and never picks a discount.

It talks to the customer. That's its whole job, and it's good at it.

**5/**
Double bookings aren't prevented by asking the model nicely either.

They're prevented by a database lock. Two people cannot hold the same slot. Not
because the prompt says so, because Postgres won't allow it.

**6/**
Use the model for the part that's genuinely hard: understanding what somebody
means.

Use code for the part that has to be right.

Most "AI agent" bugs are just logic in the wrong place.

---

## Just the thing · shot: `thu-02`
Two people can't book the same slot.

Not because I asked the model not to let them. Because the database won't allow it.

---

## Quick value
**Tool calling** = the model can't actually do anything by itself. It asks your
code to.

It says "check if 2pm is free." Your code checks. Your code answers.

The model never touches the database. It just asks.

---

# FRIDAY — something that didn't work

## Thread (7 tweets) · shot: `fri-01`

**1/**
I built the whole thing for a hackathon and never submitted it.

I got the deadline wrong 🧵

**2/**
PayPal AI hackathon. I'd been building for days.

Last commit was the 6th of November. Working product. Live. Payments going
through.

**3/**
I had the 15th in my head as the submission date.

It was the 12th.

**4/**
I found out on the 16th.

Four days after it closed. Six days after I'd already finished building the
thing.

**5/**
The annoying part isn't that I ran out of time. I didn't run out of time.

I had the product ready almost a week early and still missed it.

**6/**
I never actually checked the date. I just carried it in my head from the first
time I read it, and I read it wrong.

Everything else I verified. Payments, bookings, prices. Not that.

**7/**
Now the deadline goes in the calendar the same day I decide to enter something.
Before I write any code.

The app still works. It's live. It just never got judged.

---

## Just the thing · shot: `fri-02`
Finished six days before the deadline.

Missed it anyway.

---

## Quick value
Put the deadline in your calendar the day you decide to enter, not the day you
start building.

I'm not telling you this as a tip. I'm telling you because I didn't.

---

# SATURDAY — one real day

> ⚠️ **[NEEDS JOSEPH]** This post is not written.
>
> Saturday's slot is "one real day" and it needs something true about *this
> week* — where you worked, what time you started, what broke, the power
> situation, what you were doing when you found out something. Small and true
> beats big and vague.
>
> I will not invent a day. Give me 3–4 lines and I'll write the thread and add
> the shot.

## Just the thing · shot: `sat-01`
> **[NEEDS JOSEPH]** — depends on the day above.

## Quick value
**Context window** = everything the model can see at once. Your prompt, the
whole conversation, the lot.

It's not memory. It's a desk. When it's full, things fall off the edge.

---

# SUNDAY — recap

## Thread (6 tweets) · shot: `sun-01`

**1/**
This week I rebuilt an AI sales agent into something much smaller, and it got
better.

What I actually learned 🧵

**2/**
Narrowing from "social media sellers" to "hair stylists" is what made the
features possible.

Before that I was building settings. After it I was building a product.

**3/**
Keeping the pricing logic out of the model wasn't a performance decision.

It's that prompts leak, and a model being right most of the time is not good
enough for money.

**4/**
The thing that broke wasn't the code.

My free model quota ran out mid-build and the assistant just stopped answering.
Had to add a backup model and tell the user what happened instead of showing them
a dead chat.

**5/**
And a failed reply left an empty message in the saved conversation, which then
quietly sat in every prompt after it.

One failure, polluting everything downstream. Those are the bugs that take the
longest to find.

**6/**
Next: the app is live and working, it just never got submitted anywhere.

Figuring out whether to put it in front of actual stylists.

Full build in the replies.

---

## Just the thing · shot: `sun-02`
Five commits. One of them deleted a third of the app.

That was the good one.

---

## Quick value
**Model fallback** = a second model you switch to when the first one fails.

Mine hit a free tier limit mid-build and the chat went silent.

If your app dies when one API says no, it isn't finished.
