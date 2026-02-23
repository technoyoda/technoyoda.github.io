---
layout: post
title: "Tooltip Annotations Demo"
date: 2026-02-22
categories: blog
---

This is a reference page showing how to use **tooltip annotations** in posts. Hover over any <tip t="Words with a dotted underline are annotated with tooltips">dotted-underline text</tip> to see it in action.

## Basic Tooltip

Just provide main text with `t="..."`:

```html
<tip t="Graphics Processing Unit">GPU</tip>
```

Result: Modern AI training requires thousands of <tip t="Graphics Processing Unit">GPUs</tip> working in parallel.

## Tooltip with Subtext

Add context or attribution with `s="..."`:

```html
<tip t="A mechanism that lets the model weigh different parts of the input" s="Introduced in Vaswani et al. 2017">attention</tip>
```

Result: Transformers rely on <tip t="A mechanism that lets the model weigh different parts of the input" s="Introduced in Vaswani et al. 2017, 'Attention Is All You Need'">attention</tip> to process sequences without recurrence.

## Tooltip with Link

Add a clickable reference with `href="..."`:

```html
<tip t="Reinforcement Learning from Human Feedback" href="https://arxiv.org/abs/2203.02155">RLHF</tip>
```

Result: Most frontier models are fine-tuned with <tip t="Reinforcement Learning from Human Feedback — a technique where human preferences guide the reward model" href="https://arxiv.org/abs/2203.02155">RLHF</tip> after pre-training.

## Tooltip with Link + Custom Link Text

Override the default "Read more" with `link-text="..."`:

```html
<tip t="A sparse mixture-of-experts architecture" href="https://arxiv.org/abs/2401.04088" link-text="View paper on arXiv →">MoE</tip>
```

Result: Some models use a <tip t="A sparse mixture-of-experts architecture where only a subset of parameters are activated per token" href="https://arxiv.org/abs/2401.04088" link-text="View paper on arXiv →">MoE</tip> design to scale efficiently.

## Tips Inside <tip t="Yes, tooltips work in headings too — the TOC stays clean because popups are injected after it reads the text">Headings</tip>

You can annotate words directly in heading titles. The Table of Contents will display the heading text normally without the tooltip content leaking in.

```html
## How <tip t="Transformer-based large language models">LLMs</tip> Work
```

## All Options Combined

```html
<tip t="Main explanation" s="Additional context" href="https://example.com" link-text="Source →">word</tip>
```

Result: The <tip t="Key-Value cache stores previously computed attention keys and values so they don't need to be recomputed at each generation step" s="Critical optimization for autoregressive decoding" href="https://arxiv.org/abs/1911.02150" link-text="Multi-Query Attention paper →">KV cache</tip> is essential for fast inference.

## Quick Reference

| Attribute | Required | Description |
|-----------|----------|-------------|
| `t` | Yes | Main tooltip text |
| `s` | No | Subtext (smaller, below a separator) |
| `href` | No | URL — adds a clickable link in the tooltip |
| `link-text` | No | Custom link label (default: "Read more →") |
