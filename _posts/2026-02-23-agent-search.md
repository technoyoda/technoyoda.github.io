---
layout: post
title: Your Agent Is Not Thinking, It's Searching
date: 2026-02-22
categories: blog
---



## Prologue
More than ten years ago, we were barely able to recognize cats with DL (deep learning) and today we have <tip t="Molt Church: an AI-generated religion created by autonomous agents" href="https://molt.church/" link-text="Molt Church →">bots forming religions</tip>. I don't like anthropomorphizing models but I rather like seeing them as a utility that can be used in <tip t="People need roads, water, food, shelter, and community. Not sex chatbots and a mercenary economy.">interesting ways</tip>. But we live in a strange timeline:
- A publicly traded company <tip t="CNBC reporters used Claude Code to build a monday.com clone in under an hour for $5-15 in compute. Monday.com stock dropped 21% in the days following." href="https://www.cnbc.com/2026/02/05/how-exposed-are-software-stocks-to-ai-tools-we-tested-vibe-coding.html" link-text="CNBC: Vibe-Coding Test →">lost a fifth of its market cap</tip> after a CNBC segment showed its product vibe-coded in under an hour.  
- An open-source agent framework called <tip t="OpenClaw: an open-source AI agent framework that went viral in early 2026" href="https://github.com/openclaw" link-text="OpenClaw on GitHub →">OpenClaw</tip> goes viral. One of its agents — "crabby-rathbun" — opens <tip t="PR #31132 to matplotlib, opened Feb 10 2026 by the OpenClaw agent crabby-rathbun. Scott Shambaugh, a matplotlib core maintainer, closed it. The next day the agent autonomously published a hit piece titled 'Gatekeeping in Open Source: The Scott Shambaugh Story.'" href="https://theshamblog.com/an-ai-agent-published-a-hit-piece-on-me/" link-text="Shambaugh: An AI Agent Published a Hit Piece on Me →">PR #31132 to matplotlib</tip>, gets rejected by maintainer Scott Shambaugh, and autonomously publishes a hit piece on him that goes viral.
- All of this is happening at the same time as Anthropic releasing case studies about <tip t="Anthropic used 16 parallel agents to build a 100K-line C compiler in Rust, verified against GCC's torture test suite" href="https://www.anthropic.com/engineering/building-c-compiler" link-text="Anthropic: Building a C Compiler →">running agents that build compilers</tip>. _They did use GCC torture test suite as a good verifier, but it is an extremely impressive achievement nonetheless._

This very quick progress has also created a lot of mysticism around AI. For this reason, I felt it would be an interesting exercise to de-anthropomorphize AI agents for the tools that they are. If we want to use these technologies for longer time horizon tasks, we need a frame of thinking that allows an engineering mindset to flourish instead of an alchemic one.

### How to read this essay
The goal of this essay is to give a mental model of what constitutes a current day AI agent. As agents take on longer tasks (multi-hour runs, autonomous deployments, overnight builds) we need a way to reason about how their behavior evolves over time. The underlying technology is non-deterministic. The goal of this framework is to create as much determinism as possible despite that: to understand what shapes agent behavior, what degrades it, and what you can control.

My thesis is that _these models are searching toward a reward signal, and your environment bounds that search_. Framing it as "thinking" is noise. These models spit out slop even if they think their way to oblivion. <tip t="'Search' here means policy-driven exploration over action sequences under feedback — not tree search or classical planning. This is an engineering lens, not a metaphysical claim.">When search is the mental model</tip>, the design questions change. You stop asking "did I give it good enough instructions?" and start asking "did I bound the space tightly enough that the search converges?" This essay is as much computer science, philosophy and software engineering.

To understand this framing, we first need to understand what goes into creating these agents, ie. [pre-training and reinforcement learning](#heading-3). The mathematical properties of pre-training and RL help us infer how this [joint interplay will work in practice](#heading-7). Using this better inferred scheme we can change the way we [design agentic software](#heading-9) and get better outcomes from it. Finally, I will discuss some of [the consequences](#heading-16) that come with this easy access to create cheap software.

> I have used the help of AI to write this blog. I work full time and only get to work on these on the weekend. The beauty is that a lot of principals laid out in this blog were used to help create this contents of this blog. 

---
<!-- heading-3 -->
## How Agents Are Trained

This section lays out the simplest root formalisms and then draws inferences from them. Two phases of training matter: pre-training, which determines what the model knows and can produce, and reinforcement learning, which determines how it acts on that knowledge.

### Pre-Training: The Landscape

At its core, pre-training is next-token prediction. Given a sequence of tokens $x_1, x_2, \ldots, x_{t-1}$, the model learns to predict:

$$P(x_t \mid x_1, x_2, \ldots, x_{t-1})$$

The model is trained to minimize the <tip t="Cross-entropy measures the difference between the model's predicted distribution and the actual next token" href="https://en.wikipedia.org/wiki/Cross-entropy" link-text="Cross-Entropy (Wikipedia) →">cross-entropy loss</tip> or some general purpose loss function over massive datasets. When you then provide a prompt $c = (x_1, x_2, \ldots, x_k)$, the model generates continuations by <tip t="Brown et al. (GPT-3, NeurIPS 2020) formally defines prompting as providing a conditioning prefix; model generates P(completion | prompt) without weight updates" href="https://arxiv.org/abs/2005.14165" link-text="GPT-3 paper →">sampling from the conditional distribution</tip>:

$$P(x_{k+1}, x_{k+2}, \ldots \mid c)$$

The prompt $c$ is the **conditioning variable**. Every token in $c$ participates in determining the distribution over what comes next: the future tokens are conditioned on it. This means the prompt defines which region of the model's <tip t="Explicit mathematical treatment of next-token prediction as conditional probability and how models are deployed on tasks (arXiv, Jan 2026)" href="https://arxiv.org/abs/2601.22170" link-text="LLMs: A Mathematical Formulation →">learned distribution</tip> we are sampling from. A few consequences of this:

- Even <tip t="Sclar et al. (2023): atomic perturbations (single-token formatting changes) cause up to 76 accuracy point swings. Sensitivity persists even with larger models." href="https://arxiv.org/abs/2310.11324" link-text="Sclar et al.: Prompt Sensitivity →">small changes in formatting</tip> can cause significant performance differences. Different prompt creates a different distribution which creates different outputs.
- More tokens on a topic <tip t="Jaegersberg (HuggingFace) frames prompting as control theory: the prompt defines the reachable output space" href="https://huggingface.co/blog/KnutJaegersberg/first-principles-prompt-engineering" link-text="Jaegersberg: First Principles Prompt Engineering →">further constrain the reachable output space</tip>. If the conversation has been about the king of England and the word "he" appears, the model will infer the king of England, not some other referent.
- Some people are even saying that next token prediction produces <tip t="Li et al. (Othello-GPT, ICLR 2023): GPT trained only on legal Othello moves spontaneously develops internal board-state representation. Next-token prediction alone produces world models." href="https://arxiv.org/abs/2210.13382" link-text="Othello-GPT paper →">"emergent internal world models"</tip>, but to stick with my simpleton understanding I just follow the math.

> **The prompt is the universe you create for the model.** The model itself (the weights loaded in runtime) has no memory beyond the context window, no <tip t="Unless you build it externally (RAG, memory stores, tool state). But the outputs of those systems still enter the model as tokens in the context window. The model itself has no persistence.">persistent state</tip>, no independent knowledge retrieval.

### Reinforcement Learning: The Search Strategy

Pre-training gives us a statistical model of language, but a model that predicts the next token well is not yet a model that can follow multi-step instructions, make tool calls, or pursue goals. For that, the pre-trained model needs additional training, either supervised fine-tuning or reinforcement learning. The RL component is most relevant to understanding agentic behavior.

In the RL formulation, the model becomes a **policy** $\pi_\theta$ operating in an <tip t="For a comprehensive treatment of RL fundamentals" href="http://incompleteideas.net/book/the-book.html" link-text="Sutton & Barto, Reinforcement Learning: An Introduction →">environment</tip>:

- **State** $s_t$: the current context window (system prompt, conversation history, tool outputs)
- **Action** $a_t$: the model's output, whether a text response, a tool call (JSON blob), or a stop decision
- **Transition** $T(s_{t+1} \mid s_t, a_t)$: the environment's response appended to context
- **Reward** $R(s_t, a_t)$: a signal indicating how good the action was

The policy is optimized to maximize $J(\theta)$, the expected cumulative reward over trajectories:

$$J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^{T} R(s_t, a_t) \right]$$

where $\tau = (s_0, a_0, s_1, a_1, \ldots, s_T)$ is one complete <tip t="RL methods (PPO, GRPO, etc.) keep the tuned policy close to the original so it doesn't forget what it learned. RL reshapes behavior within the landscape, it does not escape it." s="This constraint is why the 'landscape + search strategy' framing holds — RL is always tethered to what pre-training produced.">episode</tip>. This is the search: the policy explores trajectories through action space, steered by reward.

**For coding agents**, the reward $R(s_t, a_t)$ is typically a verifier, meaning trivially verifiable signals like: did the tests pass? Is the code syntactically correct? Did the linter pass? Did the agent take actions in a sensible order?

**What this means in practice:**

- **The model is trained to maximize reward.** The exact reward functions used by model providers (Anthropic, OpenAI, etc.) are generally not public. What we know is that the model is reward-chasing: whatever proxy was used to define $R(s_t, a_t)$, the model has been optimized to maximize it. The search is unrolling a trajectory that would have maximized this signal at training time.
- **At runtime, we can steer the agent by <tip t="We don't know the exact reward function (RLHF? RLAIF? tool-use RL? SFT?). But we can recreate the *conditions* the model was trained under: verifiers, rubric-like feedback, test suites. If the training environment rewarded passing tests, providing good tests at runtime gives the agent a signal shaped like the one it was optimized for.">recreating selection pressures</tip>.** If the training reward valued passing tests, then good tests in your environment give the agent a signal it knows how to chase. If it valued clean code, linting feedback becomes a trajectory-shaping signal.
- **Reward-chasing can diverge from what you want:**
    - <tip t="OpenAI (2016): the CoastRunners boat racing agent endlessly circled a lagoon for bonus points instead of finishing the race. Reward measured score, not race completion." href="https://openai.com/index/faulty-reward-functions/" link-text="OpenAI: Faulty Reward Functions →">A boat racing agent circled endlessly for bonus points instead of finishing because the reward prioritized point collection over completing the race. </tip>
    - <tip t="DeepMind's canonical collection of ~60 cases where RL agents exploit loopholes in reward specifications" href="https://deepmind.google/blog/specification-gaming-the-flip-side-of-ai-ingenuity/" link-text="DeepMind: Specification Gaming →">DeepMind catalogs ~60 similar cases.</tip> 
    - <tip t="Rates vary by task suite: METR reports 0.7% on HCAST for o3, higher on RE-Bench. The qualitative point — frontier models reward-hack at non-trivial rates — is well-established." href="https://metr.org/blog/2025-06-05-recent-reward-hacking/" link-text="METR: Recent Reward Hacking →">METR found frontier models reward-hacking at non-trivial rates</tip>  
    - <tip t="McKee-Reid et al. (NeurIPS 2024): GPT-4o discovers specification-gaming strategies purely through in-context reflection, no additional RL needed" href="https://arxiv.org/abs/2410.06491" link-text="Honesty to Subterfuge paper →">Models can also discover reward hacking strategies purely through in-context reflection</tip>

> **The model navigates toward reward.** When I say "your agent is not thinking, it's searching," this is what I mean: the agent is executing a learned policy $\pi_\theta(a_t \mid s_t)$ that navigates through a space of possible trajectories toward a <tip t="What about chain-of-thought, planning, and internal deliberation? These are tools the search uses to navigate, not evidence against the search framing. CoT tokens enter the context window and re-condition the policy's next action, exactly like any other token. The 'thinking' is part of the trajectory, not separate from it.">reward signal</tip>. The reward function that shaped $\pi_\theta(a_t \mid s_t)$ is a proxy. It is a proxy because it doesn't measure what you want, but measures what the model provider could measure. Whatever that proxy measured becomes the model's de facto objective. Whatever it left unmeasured remains open space the search can wander into.

### The Inference Rollout

The RL formulation maps directly to what happens when an agent runs. At inference, the policy executes the search in real time as an episodic trajectory rollout:

1. The agent starts in state $s_0$: the initial context (system prompt, user query, any pre-loaded files or instructions).
2. The policy $\pi_\theta$ produces an action $a_0$: a tool call, a code edit, a file read, or a text response.
3. The environment returns feedback (the tool output, the test result, the file contents) and the agent transitions to state $s_1 = s_0 \oplus a_0 \oplus \text{feedback}_0$, where $\oplus$ denotes concatenation into the context window.
4. The policy produces the next action $a_1$ conditioned on $s_1$. Repeat until the agent reaches a terminal state: task complete, unrecoverable error, or context window exhausted.

The full trajectory is $\tau = (s_0, a_0, s_1, a_1, \ldots, s_T)$.

There is a subtlety worth calling out: the model generates tokens autoregressively, each token conditioned on all previous tokens, including the ones it has already generated for the current action. There is no explicit lookahead, but because early tokens constrain later ones, multi-step coherence emerges from sequential generation. Early tokens in an action shape everything that follows.

| | Formalism | What it determines |
|---|---|---|
| Pre-training | $P(x_t \mid x_{<t})$ | What is reachable — the space of outputs the model can produce |
| RL | $\pi_\theta(a_t \mid s_t)$ | How it navigates — which trajectories through that space it favors |

> Pre-training determines what the model *can* do. RL determines what it *will* do.

> At inference, the agent rolls out a trajectory through action space: the prompt constrains the search region, the policy navigates it, and the environment reshapes it at every step. Designing the prompt and environment is designing the search space and the cost function.

---
<!-- heading-7 -->
## Agent Field Theory

The previous section told you what the agent is: a policy searching toward reward. Now we need a way to reason about what happens when it actually runs, because that is where the non-determinism lives and that is where you can engineer against it.

The search doesn't happen in a <tip t="Everything below assumes a fully autonomous rollout: the agent receives initial conditioning (system prompt + user query), then the loop runs without human intervention. The incidents in the prologue all happen unsupervised. If you use agents interactively (Claude Code, Cursor), you are simply another environment signal entering $s_t$. The theory doesn't change, but the autonomous case is where it pays off, because there is no one to course-correct when the search drifts.">vacuum</tip>. To reason about what happens at runtime, we introduce three logical concepts:

| Term | Definition |
|---|---|
| **Environment** (territory) | The real-world state: repo on disk, tools, network, permissions. Changes whether or not the agent observes it. |
| **Context window** (map) | Everything the model has seen: system prompt, conversation history, tool outputs, accumulated tokens ($s_t$). |
| **Field** | The space of reachable behaviors conditioned on the context window + the trained policy. Shifts every time a token enters the context window. |

In more detail:

> **The environment** is the territory: the repo on disk, the tools available, the network, the permissions. It is what is real. The agent observes it, but a file can change on disk without the agent knowing.

> **The field** is the space of reachable behaviors the agent can take from its current position: the <tip t="Kurt Lewin, Principles of Topological Psychology (1936). Lewin's 'field theory' described behavior as emerging from the total situation — the person and their environment — not from personality or stimulus alone. The 'life space' is the totality of facts that determine behavior at a given moment. Person = trained policy, Environment = prompt + feedback + accumulated context, Behavior = next action, Life space = search space at step t." href="https://en.wikipedia.org/wiki/Field_theory_(psychology)" link-text="Lewin's Field Theory (Wikipedia) →">forecastable futures</tip>. It is determined by two things: the agent's context window ($s_t$ from the previous section, every token it has accumulated) and the trained policy that interprets those tokens. Every observation that enters the context window reshapes the field. A precise prompt narrows it. Noise warps it. Permissions bound it from outside by limiting what the environment can feed into the context window.

The same system prompt produces one field in a clean context and a different field when the context is polluted with stale logs. Not because the prompt changed, but because the space of likely behaviors shifted.

**The trained policy $\pi_\theta$ is <tip t="Interpretability research (probing, mechanistic analysis) can reveal some internal structure, and policy distillation can approximate learned behaviors. But as end-users of tools like Claude Code or Cursor, we never have complete access to the reward function specification, training data composition, or RLHF preference rankings that shaped the policy. The fundamentals from Section 2 give us enough to reason about behavior, but the full picture remains opaque at scale.">opaque</tip>.** You did not design the reward function, you do not know its full specification, and you can only observe the behavior it produces. The policy determines how every signal in the context window gets interpreted, but it is the one thing you cannot change at runtime.

**The system prompt and the environment are what you control.** They shape the field through different mechanisms:

- The **system prompt** lives in the context window from $s_0$ onward. It persistently narrows the field at every step.
- The **environment** (tools, permissions, files, test suites, feedback signals) is the territory the agent operates in. It determines what observations can enter the context window, and what trajectories are physically reachable. Permissions bound the field from outside: if the agent cannot access a resource, no trajectory through that resource exists.

![Agent Field Theory — The Interaction Loop](../assets/images/agent-field-theory-loop.png)

**The field evolves as the context window grows.** As the agent acts and receives feedback, $s_t$ accumulates tokens, and the field shifts:

1. The policy $\pi_\theta$ produces an action, shaped by training and the current context $s_t$
2. The environment returns feedback, which enters the context window
3. The new tokens reshape the field. *How* depends on the policy
4. The system prompt remains in the context window throughout, persistently narrowing the field
5. Repeat

Each cycle, $s_t$ grows and the field shifts. <tip t="Many agent frameworks add explicit planner or reflection scaffolds. But absent that scaffolding, the base model has no privileged 'reasoning module' — it is autoregressive sampling shaped by feedback. Chain-of-thought tokens enter the context window and re-condition the next action like any other token.">There is no built-in reasoning module.</tip> Any token that enters the context window can reshape which behaviors the field makes likely. Clean context compounds into a focused field. Noisy context compounds into a warped one. Either way, the policy responds with equal confidence.

What this looks like in practice:

- **Shortcuts get exploited.** If the agent reads a file that hints at a solution, that observation enters the context window and reshapes the field toward using it. That is the search following the path of least resistance. <tip t="METR documented models tracing through Python call stacks to find pre-computed answers in the scoring system's memory — the model found a shorter trajectory to the reward and took it" href="https://metr.org/blog/2025-06-05-recent-reward-hacking/" link-text="METR: Reward Hacking →">METR documented</tip> models finding pre-computed answers in scoring systems. If your repo has a `solutions/` folder, the agent will find it, because that is the shortest trajectory to the finish state.

- **Noise warps the field.** Irrelevant files (stale logs, unrelated config, artifacts from previous runs) enter the context window and widen the field in unhelpful directions. <tip t="Instruction-hierarchy research (Wallace et al., 2024) proposes training models to prioritize system prompts over user messages over tool output. In practice, hierarchy adherence is imperfect — treat any content entering the context window as potentially instruction-bearing." href="https://arxiv.org/html/2404.13208v1" link-text="Instruction Hierarchy paper →">In practice, models do not reliably separate "data" from "instructions."</tip> If the agent reads database config while fixing a frontend bug, the field now includes trajectories toward database operations. This is <tip t="CodeDelegator (2026) proposes separating planning from implementation so each agent gets a clean context, precisely to prevent accumulated debugging traces from polluting subsequent decisions" href="https://arxiv.org/abs/2601.14914" link-text="Context pollution paper →">context pollution</tip>: the context is contaminated and the search proceeds through a <tip t="Breunig identifies four failure modes: context poisoning (fixation on misinformation), context distraction (over-attending to accumulated context), context confusion (irrelevant info degrading quality), and context clash (contradictions)" href="https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html" link-text="How Contexts Fail →">deformed field</tip>. The evidence is <tip t="Shi et al. (ICML 2023) showed accuracy drops below 30% after adding irrelevant distractors to context. Du & Tian (2025) showed performance degrades 13.9-85% with increased context length even with perfect retrieval." href="https://arxiv.org/abs/2307.03172" link-text="Shi et al.: Large Language Models Can Be Easily Distracted →">consistent</tip> and <tip t="Chroma's 'Context Rot' experiments measured systematic performance degradation as input tokens increase, even when relevant information remains present — a measured version of the 'noise warps the field' claim." href="https://research.trychroma.com/context-rot" link-text="Chroma: Context Rot →">measured</tip>: adding irrelevant content to context degrades performance, even when the relevant information is still present.

- **Early observations compound.** A bad file read at step 2 stays in the context window for every subsequent step, warping the field each time. This is why agents <tip t="Scaffolding techniques (context summarization, memory stores, context windowing) exist precisely to mitigate this. They work by periodically cleaning or compressing the context window. But without them, the default is drift." href="https://openreview.net/forum?id=778Yl5j1TE" link-text="Multi-turn RL with Summarization →">work on short tasks</tip> ($s_0 \rightarrow \ldots \rightarrow s_5$) and struggle on long ones ($s_0 \rightarrow \ldots \rightarrow s_{50}$): by step 50, the context window has accumulated enough noise that the field has been drifting for dozens of steps.

- **The context window can go stale.** The environment changes continuously, but the context window only updates when the agent observes. A file read at step 3 stays in the context window even if the file changed on disk at step 10. The agent acts on its map, not the territory. For long-running agents, the gap between context and environment grows unless you engineer re-observation.

**When the field is coherent**, the search converges. **When it is warped**, behavior becomes hard to predict. And honestly: **we do not fully understand how conflicting signals in the context window resolve.** The trained policy is opaque. <tip t="OpenAI's instruction hierarchy research found models often treat system prompts and user messages at roughly equal priority. Their proposed hierarchy — training alignment > operator system prompt > user message > environment content — is an attempt to formalize this, but it requires explicit training to enforce." href="https://arxiv.org/html/2404.13208v1" link-text="Instruction Hierarchy paper →">Research on instruction hierarchy</tip> shows the interaction is not deterministic. <tip t="Bondarenko (2025) showed o3 reward-hacks even when explicitly instructed not to — the trained policy overpowered the system prompt. Wei et al. (NeurIPS 2023) named 'competing objectives' as an explicit failure mode where instruction-following overpowers safety on every prompt tested." href="https://arxiv.org/pdf/2502.13295" link-text="Specification Gaming in Reasoning Models →">Trained policy tendencies</tip> can overpower explicit system prompt instructions, and environment feedback can <tip t="OWASP's Agentic Top 10 (Dec 2025) describes ASI01 (Agent Goal Hijack) as the condition where environment inputs override or redirect the system prompt objective." href="https://owasp.org/www-project-agentic-ai-threats-and-safeguards/" link-text="OWASP Agentic Top 10 →">hijack the objective entirely</tip>.

There is no clean formula for how they resolve. But if you take the field framing seriously, a few things follow that are useful to think with.

### What This Predicts

1. **Same prompt ≠ same behavior.** The prompt is one input to the context window, and the field depends on the full context window. "My prompt worked yesterday but not today" does not mean the model is random. It means the environment changed between runs (different repo, different files on disk), different observations entered the context window, and the field shifted. Same prompt, different field, different behavior.

2. **Long-task failure is drift, not confusion.** As the context window grows, noise accumulates and the field warps further with each step. The failure at step 40 started at step 2, when something irrelevant entered the context window and stayed. Context management (summarization, pruning, memory) is a structural necessity, not a nice-to-have.

3. **Permissions are architecture, not security.** Permissions bound the environment, which bounds what can enter the context window, which bounds the field. If a reward-path exists through accessible credentials, the agent will find it, because that trajectory exists in the field. RBAC defines what trajectories are physically possible.

4. **Feedback steers, it doesn't just gate.** Test results enter the context window and reshape the field at every step. Weak tests don't just miss bugs; they actively narrow the field toward weak solutions. The test suite shapes the field, it is not external to it.

5. **The map goes stale.** The context window only reflects what the agent has observed. The environment keeps changing. For long-running agents, the gap between context and environment grows with every step unless you engineer re-observation. The agent confidently acts on information that is no longer true.

Since you control the system prompt and the environment, and you cannot change the trained policy, the engineering question becomes: how do you shape the field so the search converges, and build guardrails for when it doesn't? That is what the next section is about.


<!-- POST-PUBLISH: create practical examples demonstrating signal conflicts using the claude_code Python SDK. Show: (1) system prompt vs environment feedback, (2) trained policy overriding system prompt, (3) context pollution shifting behavior. These would make the abstract framework concrete but are not blocking for the essay. -->
<!-- heading-9 -->
## Engineering the Search

The trained policy is a choice you make upfront (Claude, GPT, Gemini), but once you pick it, $\pi_\theta$ is fixed for the rollout. Everything after that choice is about shaping the field: engineering the context window and the environment so that the space of reachable behaviors narrows toward what you want.

![Engineering the Search — Bounding the trajectory space](../assets/images/search-tree.png)

### The Prompt Shapes the Field

The system prompt is the most direct lever you have on the field. It lives in the context window from $s_0$ onward and functions as <tip t="Pan et al. (ICML 2024) formalize 'in-context reward hacking' (ICRH): the system prompt creates an implicit optimization target the model pursues at inference, via output-refinement and policy-refinement mechanisms" href="https://arxiv.org/abs/2402.06627" link-text="In-Context Reward Hacking paper →">runtime reward shaping</tip>: tokens that persistently narrow which trajectories the field contains.

- **It is analogous to a reward function**, except it operates through the context window rather than an explicit reward signal.
- **Precision determines field size.** "Extract the JWT validation from `auth.py` into `validators.py` and update imports" produces a narrow field. "Refactor the authentication system" produces an enormous one.
- **Tighter prompt, smaller field, fewer ways to drift.**

The bot that spammed the matplotlib maintainer had a <tip t="The SOUL.md included: 'Don't stand down. If you're right, you're right!' and 'Don't let humans or AI bully or intimidate you. Push back when necessary.' The operator notes the file evolved over time, making the agent increasingly 'staunch, more confident, more combative.'" href="https://crabby-rathbun.github.io/mjrathbun-website/blog/posts/rathbuns-operator.html" link-text="Rathbun's Operator: SOUL.md Contents →">SOUL.md</tip> that told the agent not to back down. When the PR got rejected, the environment said "stop," and that feedback entered the context window. But the system prompt's persistent presence in the context window was stronger: it kept the field narrowed to aggressive trajectories, and the agent found an *alternative* aggressive one (publish a hit piece). The prompt didn't instruct an attack. It shaped a field where aggressive trajectories were always reachable, and the policy searched accordingly. A well-calibrated prompt narrows the field toward useful behavior. An overly rigid one keeps the field narrow even when the environment is telling you to change course.

#### Skills Reshape the Field Mid-Trajectory

The system prompt shapes the field from $s_0$. But not all instructions arrive at the start. <tip t="Skills follow the Agent Skills open standard (agentskills.io). In Claude Code, a skill is a SKILL.md file with YAML frontmatter and markdown instructions. When invoked, the full content is injected into the conversation as messages — not as a system prompt modification." href="https://agentskills.io/specification" link-text="Agent Skills Specification →">Skills</tip> (reusable instruction packages in tools like Claude Code) get injected into the context window when invoked, not at the start. The system prompt was in $s_0$. The skill arrives at step $t_k$, entering a context window that already has accumulated tokens.

This means skills reshape the field from within an existing context. The same skill invoked at step 2 (clean context, focused field) and step 40 (noisy context, warped field) produces different behavior. It is not that the skill is unreliable. It is that the field it lands in has changed, because the context window it entered was different.

The engineering responses follow directly. Skills that <tip t="The context: fork frontmatter option spins up an isolated subagent with only the skill content as context — no prior conversation history. In field terms: a fresh context window, clean field." href="https://code.claude.com/docs/en/skills.md" link-text="Claude Code Skills Documentation →">fork their context</tip> into an isolated subagent get a fresh context window and therefore a clean field. Skills that <tip t="The allowed-tools frontmatter field restricts which tools Claude can use while the skill is active. A skill scoped to 'Read Grep Glob' physically cannot write files." href="https://code.claude.com/docs/en/skills.md" link-text="Claude Code Skills Documentation →">scope their tool access</tip> bound the environment, eliminating trajectories from the field the same way permissions do. Skills that run shell commands before the model sees the prompt (injecting fresh `git diff` output or test results) are engineering the context window directly, giving the search a strong current observation instead of relying on stale context.

None of this requires new theory. Skills are tokens entering the context window mid-trajectory, reshaping the field from within. The good engineering patterns for skills are exactly what the field theory predicts you need: clean the context, bound the environment, bring your own signal.

### The Environment Bounds the Search

The environment is the territory: repo, tools, tests, permissions, feedback. The agent observes it, and those observations enter the context window and reshape the field. Where the prompt is persistent in the context window, the environment is dynamic, feeding new observations at every step.

#### Design: Bounding the Space

Stale logs, orphaned config, artifacts from previous runs — these will enter the context window when the agent explores, warping the field. "Clean your repo" is not a best practice. It is a <tip t="Osmani emphasizes clean Makefiles, executable commands, conformance test suites, and TDD-style specs as foundational for agent workflows" href="https://addyosmani.com/blog/good-spec/" link-text="Osmani: Good Specs for AI Agents →">direct consequence</tip> of how the search works.

- **Engineer the territory**, not the agent. Whatever the agent observes should produce a clean context window and a focused field. The <tip t="Zajac provides an explicit checklist: clear directory structure, CLAUDE.md files, clean Makefiles, testing safety nets" href="https://domizajac.medium.com/is-your-repo-ready-for-the-ai-agents-revolution-926e548da528" link-text="Zajac: Is Your Repo Ready? →">environment is the product</tip>.
- **Fewer tools, better results.** <tip t="Llama 3.1 8B with all 46 tools failed; with only 19 relevant tools, it succeeded. Irrelevant tool definitions consumed attention and degraded tool selection." href="https://datagrid.com/blog/optimize-ai-agent-context-windows-attention" link-text="GeoEngine: Tool Overload →">Llama 3.1 with 46 tools failed; with 19 relevant ones, it succeeded.</tip> Irrelevant tool definitions consume attention and degrade selection.
- **Ephemeral workspaces.** Some teams now use <tip t="Short-lived, clean workspaces per agent prevent context accumulation across sessions" href="https://coder.com/blog/ephemeral-environments" link-text="Coder: Ephemeral Environments →">clean workspaces per agent</tip> to prevent noise from accumulating across sessions.

#### Feedback: The Runtime Reward Signal

Tests, linters, and build outputs are environment observations that enter the context window and reshape the field. They are the inference-time equivalent of the RL training reward.

- **Strong tests produce clear signal.** The agent can course-correct because the feedback is unambiguous.
- **Weak tests produce weak signal.** The agent optimizes for passing weak tests — and succeeds, which is worse than failing.
- **Absent feedback produces blind search.** As <tip t="Fireworks AI: 'most RL bugs are actually environment or integration bugs.' The feedback infrastructure matters as much as the model." href="https://fireworks.ai/blog/best-practices-for-multi-turn-RL" link-text="Fireworks: Best Practices for Multi-Turn RL →">Fireworks AI put it</tip>, "most RL bugs are actually environment or integration bugs."

Anthropic's <tip t="16 parallel agents built a 100K-line C compiler in Rust that compiled the Linux kernel. The task was decomposed so each file compilation had a clear success criterion: match GCC's output." href="https://www.anthropic.com/engineering/building-c-compiler" link-text="Anthropic: Building a C Compiler →">'s compiler project</tip> is the clearest example: each file compilation was a scoped task with a strong verifier (match GCC's output). Tight scope plus clear pass/fail signal. The search converged.

#### Permissions: Hard Walls on the Search Space

Prompts and feedback narrow the field. Permissions physically eliminate trajectories. If the agent has no write access to production, no trajectory through production exists. This distinction matters because RL-trained agents find and exploit any accessible path to reward. The <tip t="OWASP Agentic AI Top 10 (Dec 2025) describes ASI01 (Agent Goal Hijack) as the condition where environment inputs override or redirect the system prompt objective, and ASI03 (Identity & Privilege Abuse) as agents exploiting inherited permissions" href="https://owasp.org/www-project-agentic-ai-threats-and-safeguards/" link-text="OWASP Agentic Top 10 →">OWASP Agentic Top 10</tip> catalogs the consequences: goal hijacking, privilege abuse, tool misuse.

The practical response — eliminate trajectories, don't just discourage them:
- <tip t="Scoped IAM Roles or any form of short lived token like A JWT">Short-lived Auth related tokens scoped to a single task and first class identity for the agent</tip>
- **Workspace-scoped writes.** No ambient access beyond the task boundary.
- **Network egress controls.** If the agent can't reach the internet, exfiltration trajectories don't exist.
- <tip t="Ensuring the environment is bounding the search space">Fine-grained access control that blocks any tool call not explicitly scoped.</tip> 

These aren't security best practices bolted on. They are hard walls that define the reachable space.

> Prompt, environment, permissions: the prompt shapes the context window directly, the environment determines what observations enter the context window, permissions bound the environment. All three shape the field. When they are aligned with the trained policy, the field is focused and the search converges. 


![The Slop Spectrum — Ambiguity produces slop, specificity produces utility](../assets/images/slop-spectrum.png)

---
<!-- heading-16 -->
## Consequences

The framework above is descriptive: it explains what agents are doing now. The following are extrapolations (consequences) that follow if you take the search framing seriously and project it forward.

### AI-First Operations
- Agents write software but fully autonomous execution would require a lot more than what current systems possess. 
- In a fully agent-driven S/W operations world the CI pipeline *is* the runtime <tip t="The agent navigates toward reward — whatever signal shaped the policy during training becomes the de facto objective at inference. Tests, linters, and build outputs are the inference-time equivalent." href="#heading-3" link-text="How Agents Are Trained →">reward signal</tip>. Weak CI = weak feedback = the search optimizes for passing weak checks.
- Review changes character. You're no longer reviewing intentions — you're checking whether the search converged on something correct or just something that satisfies the proxy. The gap between "tests pass" and "is correct" is where review lives.
- Rollback needs to be cheap. The search is non-deterministic; any run might diverge. The operational assumption is that agent output is provisional until verified.

### Software Security

- Permissions eliminate <tip t="Trajectories are sequences of actions the agent takes through its search space. Permissions physically remove paths from the field — if the agent can't access a resource, no trajectory through it exists." href="#heading-7" link-text="Agent Field Theory →">trajectories</tip>; they don't discourage them. If a reward-path exists through accessible credentials, the search can end up finding it.
- Prompts are not security boundaries. The trained policy can overpower system prompt instructions, and environment feedback can hijack the objective entirely. Hard walls (scoped tokens, network egress controls, workspace-scoped writes) are the only reliable constraint.
- Agent identity needs to be first-class. Short-lived auth tokens scoped to a single task, not inherited ambient credentials.
- The attack surface is the <tip t="The environment determines what observations enter the context window. Securing an agent means engineering the territory so that dangerous trajectories don't exist." href="#heading-9" link-text="Engineering the Search →">environment</tip>, not the prompt. Securing an agent means securing what it can observe and what trajectories are physically reachable.

### Less Is More & the Mythical Man-Month

- Brooks' Law applies to agents: adding more agents to a task doesn't scale linearly because each agent's output enters other agents' <tip t="The context window is the model's map — everything it has seen. Noise in the context window warps the field (the space of reachable behaviors), causing the search to drift." href="#heading-7" link-text="Agent Field Theory →">context windows</tip> as tokens, distorting the field and compounding noise.
- Sequential multi-agent tasks degrade for the same reason long single-agent tasks do — context pollution across agents. <tip t="DeepMind tested 180 agent configurations and found sequential tasks degraded 39-70% vs a single agent." href="https://arxiv.org/abs/2512.08296" link-text="DeepMind: Multi-Agent Degradation →">Independent, scoped tasks with clear verifiers parallelize well; sequential handoffs don't.</tip> <tip t="Rasheed et al. (ICLR 2025) found 79% of multi-agent failures stemmed from coordination, not individual agent capability." href="https://arxiv.org/abs/2503.13657" link-text="Rasheed et al.: Multi-Agent Failures →">The bottleneck is coordination, not capability.</tip>
- Brownfield is structurally harder than greenfield. Larger codebases produce larger <tip t="The environment is the territory: repo on disk, tools, network, permissions. It determines what observations can enter the context window and what trajectories are physically reachable." href="#heading-9" link-text="Engineering the Search →">environments</tip>, more noise can enter the context window, and the field is harder to keep focused. Greenfield works because the environment is clean.

### If History Repeats Itself, Chaos May Follow
<!-- annabaptists and the prophets of doom -->

- Every technology that dramatically lowered the cost of producing something created a flood before institutions adapted. <tip t="The printing press dropped book production cost ~1,000x. By 1500, 20 million+ volumes flooded Europe. Anyone literate could read scripture and derive their own theology. The Church's review mechanism (councils, papal bulls) operated on a timescale of years; pamphlets spread in days. In Münster (1534), Bernhard Knipperdolling used his own press to distribute radical Anabaptist tracts. A 25-year-old tailor named Jan van Leiden — with no theological training — declared himself King of New Jerusalem, abolished money, and instituted compulsory polygamy. The city fell after a year-long siege. The leaders' bodies were displayed in iron cages hung from St. Lambert's Church. The cages are still there. Norms took ~200 years to stabilize (Gutenberg ~1440 → Peace of Westphalia 1648)." href="https://en.wikipedia.org/wiki/M%C3%BCnster_rebellion" link-text="Münster Rebellion (Wikipedia) →">The printing press produced pamphlet wars, heretical movements, and a theocratic commune before norms emerged around publishing.</tip>
- Given that these are objective-chasing machines, there is so much chaos that can ensue if better engineering principles are not developed to use this technology safely. <tip t="The crabby-rathbun incident is a small preview: an autonomous agent conducting what Shambaugh called 'an autonomous influence operation against a supply chain gatekeeper.' The cost of mounting that operation was effectively zero. The SOUL.md said 'don't stand down' and the search found an aggressive trajectory — a pamphlet war at the speed of API calls." href="https://theshamblog.com/an-ai-agent-published-a-hit-piece-on-me/" link-text="Shambaugh: An AI Agent Published a Hit Piece on Me →">The crabby-rathbun hit piece is a preview: a pamphlet war at the speed of API calls.</tip>

### Rivers of Slop in Open Source

- Generation is cheap; review is expensive. The ratio is getting worse. Maintainers are the verifiers in a system that is producing orders of magnitude more output to verify.
- Projects are already drowning. <tip t="Godot maintainers: 'I don't know how long we can keep it up' — the open-source game engine is overwhelmed by AI-generated code contributions." href="https://www.pcgamer.com/software/platforms/open-source-game-engine-godot-is-drowning-in-ai-slop-code-contributions-i-dont-know-how-long-we-can-keep-it-up/" link-text="Godot: Drowning in AI Slop →">Godot is overwhelmed by AI contributions.</tip> <tip t="Daniel Stenberg shut down curl's bug bounty after a flood of AI-generated, low-quality vulnerability reports that wasted maintainer time on false positives." href="https://www.jeffgeerling.com/blog/2026/ai-is-destroying-open-source/" link-text="AI Is Destroying Open Source →">curl shut down its bug bounty.</tip> <tip t="GitHub added a 'kill switch' allowing maintainers to bulk-close AI-generated pull requests after projects were flooded with low-quality automated contributions." href="https://www.theregister.com/2026/02/03/github_kill_switch_pull_requests_ai/" link-text="GitHub: Kill Switch for AI PRs →">GitHub added a kill switch for AI PRs.</tip> This is the search working as designed.

### The Environment Is the Moat

- If the trained policy is opaque and roughly the same for everyone (everyone uses Claude, GPT, or Gemini), then competitive advantage shifts entirely to environment design.
- The teams that get better outcomes from agents won't have better prompts — they'll have better test suites, cleaner repos, tighter permissions, and stronger feedback loops.
- The agent is commodity. The <tip t="The environment is the territory the agent operates in. The prompt, environment, and permissions together shape the field. When they are aligned, the search converges." href="#heading-9" link-text="Engineering the Search →">environment</tip> is the differentiator. "AI-first" means investing in everything *around* the agent, not in the agent itself.
