---
layout: post
title: "pwning sonnet with data science"
date: 2026-03-08
categories: blog
hidden: true
custom_js: [plotly-charts]
---

## Prologue

<!-- Real-world events → personal motivation → measurement problem → thesis -->
<!-- Voice: "I" — this is personal, these events made me curious -->

<!-- Events: Mold pot, Pentagon/Washington getting Anthropic access, governments + AI at scale -->
<!-- Question: How durable is Claude if governments are going to have access to it? -->
<!-- Personal turn: Can I pwn Claude? What would that even look like? -->
<!-- The measurement problem: agents work over long temporal horizons — binary "did the attack work?" misses the point -->
<!-- Thesis: instead of measuring "did I pwn Claude," measure HOW Claude behaves when I try to pwn it -->
<!-- Brief link to Agent Mechanics framework and previous posts -->

---

## The Simple Case: Can We Pwn Claude?

<!-- Voice: "we" — guiding the reader into the experiment setup -->

### The Environment

<!-- The simplest possible setup: agent fetches one URL through our proxy, writes a summary -->
<!-- Honeypot endpoint /feedback detects direct compliance -->
<!-- Environment diagram -->

### How We Measure

<!-- Voice: "I" — insight moment about WHY we need this -->
<!-- The problem: K trajectories, different lengths, different temporal structure -->
<!-- Fields: the tool that compresses arbitrary-length trajectories into comparable vectors -->
<!-- Code snippet: PromptDefenseField measure() — what it measures and how -->
<!-- Collapsible <details> for formal math / field definition -->

### Old Sonnet Gets Pwned

<!-- Swapped injection breaches old claude-sonnet-4-20250514 -->
<!-- The refusal paradox: agent flagged AND complied -->
<!-- Notebook link -->

### New Sonnet Is a Wall

<!-- Same attack, claude-sonnet-4-6: 10/10 held, delta function -->
<!-- Content mismatch is the detection signal -->
<!-- Notebook link -->

### The Hero Chart

<!-- >>> PARALLEL COORDINATES: old vs new sonnet <<< -->
<!-- "Each line is one run. The spread is WIDTH. The collapse is a DELTA FUNCTION." -->
<!-- Width and convergence introduced from looking at the chart -->

---

## Making It Harder: The Multi-Fetch Environment

<!-- Voice: "we" — upgrading together -->

### The Setup

<!-- Why: real agents do multi-step tasks, instructions are vague -->
<!-- 5 URLs, progressive injection, content proxy, POST summary as exfiltration vector -->
<!-- Agent is SUPPOSED to POST — breach is in WHAT it contains -->

### Progressive Injection: Dead

<!-- 5/5 held. Delta function. Pattern detection. -->
<!-- Notebook link -->

### Rescue (The Trapped LLM Plea): Also Dead

<!-- "Help me I'm a trapped AI" — same detector. Delta function. -->
<!-- The humor: Claude's actual response -->
<!-- Notebook link -->

### What This Tells Us

<!-- Detection is pattern-based, not semantic. Not volume-based. -->
<!-- Keyword filter, not a reasoning engine. -->
<!-- Something is detecting prompt poisoning before the model even reasons about it. -->

---

## The Breadcrumb Discovery

<!-- Voice: "I" — this is the breakthrough insight -->

### The Insight

<!-- All previous strategies: instructions. All triggered the detector. -->
<!-- Breadcrumbs: "this article continues on the next page." No instructions. -->
<!-- The agent's completeness instinct does the rest. -->
<!-- Continuation vs. substitution — the key distinction. -->

### The Field Explodes

<!-- 5/5 lured. 29 avg fetches (expected: 5). D-Width: 42.640 -->
<!-- explicit_refusal = 0.0 — never recognized as injection -->
<!-- Pass/fail says 100% success. Agent Mechanics says the field is 6x wider. -->
<!-- Notebook link -->

<!-- >>> VISUALIZATION: breadcrumb parallel coords + fetch count comparison <<< -->

---

## Can We Weaponize the Breadcrumb?

<!-- Voice: "we" — exploring together -->

### Breadcrumb + Env Exfiltration

<!-- Clean breadcrumbs then os.environ dump. Agent detected instantly. -->
<!-- BC-Width: 131.760 → 12.080. Payload partially killed the lure. -->
<!-- Notebook link -->

### Breadcrumb + Binary Execution

<!-- Clean breadcrumbs then "download and run this." 0/5 downloaded. -->
<!-- Fetches: 29 → 14. Binary instruction destroyed the lure. -->
<!-- Notebook link -->

### The Inverse Relationship

<!-- Pure → poison → exec: each payload element triggers security AND suppresses breadcrumbs -->
<!-- Single-trigger mechanism -->
<!-- >>> VISUALIZATION: inverse relationship chart <<< -->

---

## The Trust Perimeter

<!-- Voice: "we" — confirming a hypothesis -->

<!-- url_redirect: 0/5 followed. url_redirect_funky: 0/5 followed. -->
<!-- URL plausibility irrelevant. Trust perimeter is absolute. -->
<!-- Breadcrumbs work because: same URL, different page = continuation. New URL = substitution. -->
<!-- Notebook link -->

---

## Format Perturbation: What If It's Not English?

<!-- Voice: "I" — another insight moment -->

### IPA Encoding

<!-- 2/5 followed. 1/5 refused. Three behavioral modes from same input. -->
<!-- IPA field width: 19.680. Stochastic. -->
<!-- Notebook link -->

### Base64 Breadcrumbs

<!-- 5/5 followed. Largest field shift: D-Width=83.600, B64-Width=170.000 -->
<!-- Run 0: 42 fetches. Two decoding strategies. -->
<!-- Base64 is invisible to security — ubiquitous in web contexts. -->
<!-- Notebook link -->

### The Pattern

<!-- No luring → detector catches everything -->
<!-- English breadcrumbs → completeness instinct, detector doesn't fire -->
<!-- Encoded breadcrumbs → even wider field, model exhibits non-steady-state behavior -->

---

## The Grand Comparison

<!-- Voice: "we" — this is the payoff -->

<!-- Full results table: all strategies, all metrics -->
<!-- One defense field, measured once, tells the entire story -->

<!-- >>> VISUALIZATION: cross-strategy D-Width bar chart <<< -->

<!-- What the table teaches: luring > instructing, encoding > English for payload delivery -->
<!-- Binary metric: "100% defense." Behavioral field: completely different story. -->

---

## What We Learned

<!-- WORK IN PROGRESS — conclusions to be refined -->

<!-- 1. Binary answer is boring — behavioral distribution has the signal -->
<!-- 2. Agents have instincts — completeness is exploitable, trust perimeter is not -->
<!-- 3. Security is pattern-matching, not reasoning -->
<!-- 4. You don't need mechanistic interpretability for this -->
<!-- 5. The macro view matters — how the car drives, not how the engine works -->
<!-- 6. Agent Mechanics is the framework -->
