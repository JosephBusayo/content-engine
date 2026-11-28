# Acag — week of Mon 30 Nov – Sun 6 Dec 2026

21 single tweets. Every one under 280 characters, verified.
Copy the block, paste, post. Nothing here needs a thread.

**Rules:** no hashtags. Links in a reply, never in the tweet. 🧵 unused — these
aren't threads. No results claimed anywhere, because there are none.

---

# MONDAY — struggle → shift → insight

### Theme · shot: `mon-01`
```text
I built an AI sales agent for social media sellers.

Then I deleted most of it.

"Anybody selling anything" means you can't build anything specific. Every feature turns into a setting.

Niched it down to hair stylists. 99 files changed.

Now the features write themselves.
```

### Just the thing · shot: `mon-02`
```text
This whole app only exists because I stopped trying to build it for everybody.
```

### Quick value
```text
Niche isn't a marketing word. It's an engineering one.

"Sellers" can't have price-per-inch.
"Hair stylists" can.

Who it's for decides what you're able to build.
```

---

# TUESDAY — what I'm building

### Theme · shot: `tue-02` (or the recording, `tue-01`)
```text
A client sends a screenshot of a hairstyle she saw on Instagram.

15 seconds later the assistant has matched it to the stylist's own portfolio, priced it from her own price list, and asked the one question that style actually needs.

Small, medium or large?
```

### Just the thing · shot: `tue-03`
```text
"How much for this?" is the most answered question in a stylist's DMs.

This answers it from her own price list.
```

### Quick value
```text
Agent just means the model can do things, not only say things.

Mine can search a portfolio, price a style, check a diary and open a checkout.

A chatbot talks. An agent acts.
```

---

# WEDNESDAY — teach one part of the process

### Theme · shot: `wed-01` (manual)
```text
The AI in my app is never told the lowest price it's allowed to accept.

Three reasons:

It shouldn't be deciding what someone pays.
Anything in a prompt can be pulled back out.
Code does maths right every time. A model mostly does.

Mostly isn't good enough for money.
```

### Just the thing · shot: `wed-02`
```text
The model talks to the customer.

The server decides what the customer pays.

Two different jobs.
```

### Quick value
```text
System prompt = the instructions a model gets before the conversation starts.

People treat it like a vault.

Assume anything in it can be read by the person you're chatting with.
```

---

# THURSDAY — trending topic + take

### Theme · shot: `thu-01`
```text
Most AI agent demos have the same hole in them.

The model is making the decision. Not fetching the data, not writing the reply. Deciding.

What to charge. What to approve.

It'll be right most of the time.

That's exactly what makes it dangerous.
```

### Just the thing · shot: `thu-02`
```text
Two people can't book the same slot.

Not because I asked the model nicely. Because Postgres won't allow it.
```

### Quick value
```text
Tool calling = the model can't actually do anything itself. It asks your code to.

It says "check if 2pm is free."
Your code checks. Your code answers.

The model never touches your database.
```

---

# FRIDAY — something that didn't work

### Theme · shot: `fri-01` (manual)
```text
I built the whole thing for a hackathon and never submitted it.

Deadline was the 12th. I had the 15th in my head.

Found out on the 16th.

My last commit was the 6th. I finished six days early and still missed it.

I never actually checked the date.
```

### Just the thing · shot: `fri-02` (manual)
```text
Finished six days before the deadline.

Missed it anyway.
```

### Quick value
```text
Put the deadline in your calendar the day you decide to enter. Not the day you start building.

I'm not telling you this as a tip.

I'm telling you because I didn't.
```

---

# SATURDAY — one real day

### Theme
> ⚠️ **[NEEDS JOSEPH]** Not written. This slot is "one real day" and needs
> something true about *this* week — where you worked, what time you started,
> what broke, the power situation, what you were doing when you found out about
> the deadline. Send me 3–4 lines.

### Just the thing
> **[NEEDS JOSEPH]** — depends on the day above.

### Quick value
```text
Context window = everything the model can see at once. Your prompt, the whole conversation, all of it.

It's not memory. It's a desk.

When it fills up, things fall off the edge.
```

---

# SUNDAY — recap

### Theme · shot: `sun-01` (re-seed the DB first)
```text
This week I rebuilt an AI sales agent into something much smaller and it got better.

Going from "social media sellers" to "hair stylists" is what made the features possible.

Before that I was building settings.

After it I was building a product.
```

### Just the thing · shot: `sun-02` (manual)
```text
Five commits. One of them deleted a third of the app.

That was the good one.
```

### Quick value
```text
Model fallback = a second model you switch to when the first one fails.

Mine hit a free tier limit mid-build and the chat just went silent.

If your app dies when one API says no, it isn't finished.
```

---

# SPARES

You said you might post 5–7 times in a day. That burns a week fast, so here's
extra supply. Same rules, all verified under 280.

```text
A failed AI reply left an empty message saved in the conversation.

Every prompt after that carried it.

One failure, quietly poisoning everything downstream. Those are the bugs that take longest to find.
```

```text
My free model quota ran out halfway through building.

The assistant didn't error. It just stopped answering.

Now it says "wait a minute and send that again" and switches to a backup model.

Silence is the worst failure state.
```

```text
Retries wrap the original error.

So the status code you're checking isn't there. It's one level down, in the last attempt.

Spent longer on that than I'd like to admit.
```

```text
The stylist sets a private discount limit.

Lowball it and you're told you're way too low.
Get close and it meets you.
Keep pushing and you get "this is the lowest I can go."

The server decides all of it. The model never sees the floor.
```

```text
Free tier Postgres pauses after a week of no traffic.

Came back to my own live demo returning 500 on every page that touched the database.

The landing page still loaded fine. That's what made it confusing.
```

```text
Render's free tier sleeps.

First visit to my demo takes 40 seconds.

If you're sharing a free-tier link, open it yourself first.
```

```text
It only offers you a time if the whole appointment fits before closing.

Sounds obvious. It's the kind of thing a model will happily get wrong, and a few lines of code will always get right.
```
