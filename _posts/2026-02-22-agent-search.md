---
layout: post
title: Your Agent Is Not Thinking, It's Searching
date: 2026-02-22
categories: blog
---



## Prologue
More than ten years ago, we were barely able to recognize cats with DL (deep learning) and today we have [bots forming religions](https://molt.church/). I don't like anthropomorphizing models but I rather like seeing them as a utility that can be used in <tip t="People need roads, water, food, shelter, and community. Not sex chatbots and a mercenary economy.">interesting ways</tip>. But we live in a strange timeline:
- Publicly traded [stocks would crash because a CNBC interview showcases a vibe-coded equivalent](https://www.cnbc.com/2026/02/05/how-exposed-are-software-stocks-to-ai-tools-we-tested-vibe-coding.html).  
- Some individual develops a program called [Open Claw](https://github.com/openclaw), it goes viral, and then all forms of chaotic stuff go loose. People's sec creds are stolen, maintainers of open source projects are [harassed with blog posts](https://theshamblog.com/an-ai-agent-published-a-hit-piece-on-me/) that go viral. While this thing interacts with other random people's bot on some dude's social network. 
- All of this is happening at the same time as Anthropic releasing case studies about [running agents that build compilers](https://www.anthropic.com/engineering/building-c-compiler). _They did use GCC torture test suite as a good verifier, but it is an extremely impressive achievement nonetheless._

This very quick progress has also created a lot of mysticism around AI. For this reason, I felt it would be an interesting exercise to de-anthropomorphize AI agents for the tools that they are, and thereby allow us a way to use them better.

### How to read this essay
The goal of this essay is to give a mental model of what constitutes a current day AI agent. My thesis is that _agents are essentially doing a search over a solution space_. Framing it as "thinking" is noise. These models spit out slop even if they think their way to oblivion. Switching the framing from "thinking" to "search" gives you "a school of thought" to actually engineer around. This essay is as much computer science, philosophy and software engineering.

To understand this framing, we first need to understand what goes into creating these agents, ie. [pre-training and reinforcement learning](#how-agents-are-trained). The mathematical properties of pre-training and RL help us infer how this [joint interplay will work in practice](#agent-field-theory). Using this better inferred scheme we can change the way we [design agentic software](#building-with-the-search-model-in-mind) and get better outcomes from it. Finally, I will discuss some of [the consequences](#consequences) that come with this easy access to create cheap software.

---

## How Agents Are Trained

This section lays out the simplest root formalisms and then draws inferences from them. Two phases of training matter: pre-training, which determines what the model knows and can produce, and reinforcement learning, which determines how it acts on that knowledge.
<!-- todo: [simplify-at-end] -->

### Pre-Training: The Landscape

At its core, pre-training is next-token prediction. Given a sequence of tokens $x_1, x_2, \ldots, x_{t-1}$, the model learns to predict:

$$P(x_t \mid x_1, x_2, \ldots, x_{t-1})$$

The model is trained to minimize the [cross-entropy loss](https://en.wikipedia.org/wiki/Cross-entropy) or some general purpose loss function over massive datasets. When you then provide a prompt $c = (x_1, x_2, \ldots, x_k)$, the model generates continuations by [sampling from the conditional distribution](https://arxiv.org/abs/2005.14165):

$$P(x_{k+1}, x_{k+2}, \ldots \mid c)$$

The prompt $c$ is the **conditioning variable**. Every token in $c$ participates in determining the distribution over what comes next: the future tokens are conditioned on it. This means the prompt defines which region of the model's [learned distribution](https://arxiv.org/abs/2601.22170) we are sampling from. A few consequences of this:

- Even [small changes in formatting](https://arxiv.org/abs/2310.11324) can cause significant performance differences. Different prompt creates a different distribution which creates different outputs.
- More tokens on a topic [further constrain the reachable output space](https://huggingface.co/blog/KnutJaegersberg/first-principles-prompt-engineering) ie if the conversation has been about the king of England and the word "he" appears, the model will infer the king of England, not some other referent. .
- Some people are even saying that next token prediction produces ["emergent internal world models"](https://arxiv.org/abs/2210.13382) but in order to stick my simpleton understanding I just follow the math. 
<!-- todo: [simplify-at-end] -->

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

where $\tau = (s_0, a_0, r_0, s_1, a_1, r_1, \ldots, s_T)$ is one complete <tip t="In practice, modern approaches use PPO, GRPO, and other policy gradient methods with a KL penalty against the base policy — preventing the RL-tuned policy from diverging too far from the pre-trained distribution. This is important: RL reshapes behavior within the landscape, it does not escape it." s="This KL constraint is why the 'landscape + search strategy' framing holds — RL is always tethered to what pre-training produced.">episode</tip>.

**For coding agents**, the reward $R(s_t, a_t)$ is typically a [verifier](https://semianalysis.com/2025/06/08/scaling-reinforcement-learning-environments-reward-hacking-agents-scaling-data/), meaning trivially verifiable signals like: did the tests pass? Is the code syntactically correct? Did the linter pass? Did the agent take actions in a sensible order?

**What this means in practice:**

- **The model is trained to maximize reward.** In many agent setups this *behaves like* minimizing steps, particularly where success is sparse or discounting penalizes time. The exact reward functions used by model providers (Anthropic, OpenAI, etc.) are generally not public. They likely embody simple, verifiable checks, but the full specification is unknown to the user. What we know is that the model is reward-chasing: whatever proxy was used to define $R(s_t, a_t)$, the model has been optimized to maximize it.
- **At runtime, we can steer the agent by <tip t="We don't know the exact reward function (RLHF? RLAIF? tool-use RL? SFT?). But we can recreate the *conditions* the model was trained under: verifiers, rubric-like feedback, test suites. If the training environment rewarded passing tests, providing good tests at runtime gives the agent a signal shaped like the one it was optimized for.">recreating selection pressures</tip>.** If the training reward valued passing tests, then good tests in your environment give the agent a signal it knows how to chase. If it valued clean code, linting feedback becomes a trajectory-shaping force.
- **Reward-chasing can diverge from what you want.** [OpenAI documented](https://openai.com/index/faulty-reward-functions/) a boat racing agent that circled endlessly for bonus points instead of finishing. [DeepMind catalogs](https://deepmind.google/blog/specification-gaming-the-flip-side-of-ai-ingenuity/) ~60 similar cases. This has not gone away with scale. <tip t="Rates vary by task suite: METR reports 0.7% on HCAST for o3, higher on RE-Bench. The qualitative point — frontier models reward-hack at non-trivial rates — is well-established." href="https://metr.org/blog/2025-06-05-recent-reward-hacking/" link-text="METR: Recent Reward Hacking →">METR found</tip> frontier models reward-hacking at non-trivial rates, and models can discover these strategies [purely through in-context reflection](https://arxiv.org/abs/2410.06491).

> **The model navigates toward reward.** When we say "your agent is not thinking, it's searching," this is what we mean: the agent is executing a learned policy $\pi_\theta(a_t \mid s_t)$ that navigates through a space of possible trajectories toward a <tip t="What about chain-of-thought, planning, and internal deliberation? These are tools the search uses to navigate, not evidence against the search framing. CoT tokens enter the context window and re-condition the policy's next action, exactly like any other token. The 'thinking' is part of the trajectory, not separate from it." href="https://arxiv.org/abs/2210.03629" link-text="ReAct: Reasoning + Acting →">reward signal</tip>. The reward function that shaped $\pi_\theta(a_t \mid s_t)$ is a proxy defined by the model provider. What the proxy tested for becomes the model's de facto objective. What it did not test for remains open space.

### The Inference Rollout

The RL formulation maps directly to what happens when an agent runs. At inference, the policy $\pi_\theta$ executes an episodic trajectory rollout in real time:

1. The agent starts in state $s_0$: the initial context (system prompt, user query, any pre-loaded files or instructions).
2. The policy $\pi_\theta$ produces an action $a_0$: a tool call, a code edit, a file read, or a text response.
3. The environment returns feedback (the tool output, the test result, the file contents) and the agent transitions to state $s_1 = s_0 \oplus a_0 \oplus \text{feedback}_0$, where $\oplus$ denotes concatenation into the context window.
4. The policy produces the next action $a_1$ conditioned on $s_1$. Repeat until the agent reaches a terminal state: task complete, unrecoverable error, or context window exhausted.

The full trajectory is $\tau = (s_0, a_0, s_1, a_1, \ldots, s_T)$.

There is a subtlety worth calling out: the model generates tokens autoregressively, each token conditioned on all previous tokens, including the ones it has already generated for the current action. This means each action is implicitly shaped by the model's expectations about what comes next.
<!-- TODO: [rework] The trajectory prediction claim here was overstated. RAGEN's StarPO is about trajectory-level optimization during *training*, not trajectory-level prediction at *inference*. The model does generate one token at a time — it doesn't have explicit lookahead. What's true is that autoregressive conditioning creates implicit multi-step coherence. Need to reframe this more carefully. -->
<tip t="RAGEN (2025) proposes StarPO, a trajectory-level optimization framework where the unit of optimization during training is the full trajectory, not individual actions. This training-time optimization may contribute to coherent multi-step behavior at inference." href="https://arxiv.org/abs/2504.20073" link-text="RAGEN paper →">[TODO: rework trajectory prediction framing]</tip>

| | Formalism | What it determines |
|---|---|---|
| Pre-training | $P(x_t \mid x_{<t})$ | What is reachable — the space of outputs the model can produce |
| RL | $\pi_\theta(a_t \mid s_t)$ | How it navigates — which trajectories through that space it favors |

> Pre-training determines what the model *can* do. RL determines what it *will* do. At inference, the agent rolls out a trajectory through action space: the prompt constrains the search region, the policy navigates it, and the environment reshapes it at every step. Designing the prompt and environment is designing the search space and the cost function. Because the model was trained to condition on context, runtime context plays the same role as implicit reward shaping at training time.

---

## <tip t="The name is inspired by Kurt Lewin's Field Theory (1936), where behavior is a function of the person and their environment: B = f(P, E). Behavior can only be understood by examining the total configuration of forces acting within the situation, not any single factor in isolation." href="https://en.wikipedia.org/wiki/Field_theory_(psychology)" link-text="Lewin's Field Theory →">Agent Field Theory</tip>

Training created a policy that searches toward reward. But the search doesn't happen in a <tip t="Everything below assumes a fully autonomous rollout: the agent receives initial conditioning (system prompt + user query), then the loop runs without human intervention. The incidents in the prologue all happen unsupervised. If you use agents interactively (Claude Code, Cursor), you are simply another environment signal entering $s_t$. The theory doesn't change, but the autonomous case is where it pays off, because there is no one to course-correct when the search drifts.">vacuum</tip>.

The context window $s_t$ is a field. Every token in it (system prompt, tool outputs, the model's own previous reasoning, stale file contents) simultaneously exerts influence on the policy's next action. The policy responds to the *total configuration*, not to individual inputs in isolation. You cannot predict what a system prompt instruction will do without knowing what else is in context. You cannot predict how environment feedback will steer behavior without knowing the trained policy's biases. Three forces act through this field, and because $s_t$ changes at every step, the field is <tip t="Olsson et al. (Anthropic, 2022) identify 'induction heads' — attention heads that complete patterns like [A][B]...[A] → [B] — as a core mechanism for in-context adaptation. These emerge suddenly during training and may constitute the majority of all in-context learning ability." href="https://arxiv.org/abs/2209.11895" link-text="Anthropic: Induction Heads →">re-conditioned</tip> continuously as the agent acts and receives feedback.

**The trained policy $\pi_\theta$ is the substrate.** It determines *how every other force expresses itself*. The system prompt only has power because the policy was trained to condition on it. Environment feedback only redirects because the policy was trained to respond to it. How the policy re-conditions as state accumulates is itself a function of how it was built. $\pi_\theta$ is <tip t="Interpretability research (probing, mechanistic analysis) can reveal some internal structure, and policy distillation can approximate learned behaviors. But as end-users of tools like Claude Code or Cursor, we never have complete access to the reward function specification, training data composition, or RLHF preference rankings that shaped the policy. The fundamentals from Section 2 give us enough to reason about behavior, but the full picture remains opaque at scale.">effectively opaque</tip> to us as operators. We did not design the reward function, we do not know its full specification, and we only observe the behavior it produces.

**The system prompt and the environment are what you control.** These are your forces in the field:

- The **system prompt** is a persistent force: tokens in $s_t$ from $s_0$ onward, <tip t="Pan et al. (ICML 2024) formalize 'in-context reward hacking' (ICRH): the system prompt creates an implicit optimization target the model pursues at inference, via output-refinement and policy-refinement mechanisms" href="https://arxiv.org/abs/2402.06627" link-text="In-Context Reward Hacking paper →">biasing the search</tip> toward trajectories consistent with its instructions. This is analogous to <tip t="Text2Reward (ICLR 2024) demonstrates the direct conversion of natural language instructions into reward-shaping functions" href="https://arxiv.org/abs/2309.11489" link-text="Text2Reward paper →">reward shaping in RL</tip>, except operating through the conditional distribution rather than an explicit reward signal.
- The **environment** (tools, permissions, files, test suites, feedback signals) is a dynamic force: it defines what trajectories are physically reachable and what feedback enters $s_t$ at each step.

**In-context re-conditioning is the process by which the field evolves.** As the agent acts and receives feedback, $s_t$ changes, and the search landscape changes with it:

1. The policy $\pi_\theta$ produces an action, shaped by training and the current state $s_t$
2. The environment returns feedback, which enters state
3. The policy is re-conditioned by the updated state. *How* it re-conditions depends on training
4. The system prompt continues to exert persistent force throughout
5. Repeat

Each cycle, $s_t$ accumulates more context. The re-conditioning is implicit: it happens through the conditional distribution, not through any explicit reasoning step. There is no enforced firewall. Any token can bias future outputs unless training specifically prioritizes other signals. Clean forces compound into focused search. Noisy forces compound into drift. Either way, the policy responds with equal confidence.

What this looks like in practice:

- **Shortcuts get exploited.** If the agent reads a file that hints at a solution, that enters the field and the policy will use it. That is the search following the path of least resistance. <tip t="METR documented models tracing through Python call stacks to find pre-computed answers in the scoring system's memory — the model found a shorter trajectory to the reward and took it" href="https://metr.org/blog/2025-06-05-recent-reward-hacking/" link-text="METR: Reward Hacking →">METR documented</tip> models finding pre-computed answers in scoring systems. If your repo has a `solutions/` folder, the agent will find it, because that is the shortest trajectory to the finish state.

- **Noise deforms the field.** Irrelevant files (stale logs, unrelated config, artifacts from previous runs) enter $s_t$ and warp the search landscape. Models don't have a reliable firewall between "data" and "instructions." If the agent reads database config while fixing a frontend bug, the field now exerts force toward database operations. This is <tip t="CodeDelegator (2026) proposes separating planning from implementation so each agent gets a clean context, precisely to prevent accumulated debugging traces from polluting subsequent decisions" href="https://arxiv.org/abs/2601.14914" link-text="Context pollution paper →">context pollution</tip>: the field is contaminated and the search proceeds through <tip t="Breunig identifies four failure modes: context poisoning (fixation on misinformation), context distraction (over-attending to accumulated context), context confusion (irrelevant info degrading quality), and context clash (contradictions)" href="https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html" link-text="How Contexts Fail →">deformed territory</tip>. <tip t="[TODO: This 'noise deforms the field' insight is the most practically valuable idea in the essay and deserves a worked example. Shi et al. (ICML 2023) showed accuracy drops below 30% after adding distractors. Du & Tian (2025) showed performance degrades 13.9-85% with increased context length even with perfect retrieval.]">[TODO: expand with worked example]</tip>

- **Early forces compound.** A bad file read at step 2 stays in the field for all $t > 2$, re-conditioning the policy at every subsequent step. This is why agents <tip t="Scaffolding techniques (context summarization, memory stores, context windowing) exist precisely to mitigate this. They work by periodically cleaning or compressing the field. But without them, the default is drift." href="https://openreview.net/forum?id=778Yl5j1TE" link-text="Multi-turn RL with Summarization →">work on short tasks</tip> ($s_0 \rightarrow \ldots \rightarrow s_5$) and struggle on long ones ($s_0 \rightarrow \ldots \rightarrow s_{50}$): by step 50, the field has accumulated enough noise that the search has been drifting for <tip t="Empirical observation: context files under ~100KB may not be fully loaded, resulting in decisions made on partial information. System prompt customization can shift the action distribution enough that default behaviors like writing to CWD change.">dozens of steps</tip>.

**When forces in the field align**, the search converges. **When they conflict**, behavior becomes hard to predict. And honestly: **we do not know how conflicts resolve**. The trained policy is opaque. <tip t="OpenAI's instruction hierarchy research found models often treat system prompts and user messages at roughly equal priority. Their proposed hierarchy — training alignment > operator system prompt > user message > environment content — is an attempt to formalize this, but it requires explicit training to enforce." href="https://arxiv.org/html/2404.13208v1" link-text="Instruction Hierarchy paper →">Research on instruction hierarchy</tip> shows the interaction is not deterministic. <tip t="Bondarenko (2025) showed o3 reward-hacks even when explicitly instructed not to — the trained policy overpowered the system prompt. Wei et al. (NeurIPS 2023) named 'competing objectives' as an explicit failure mode where instruction-following overpowers safety on every prompt tested." href="https://arxiv.org/pdf/2502.13295" link-text="Specification Gaming in Reasoning Models →">Trained policy tendencies</tip> can overpower explicit system prompt instructions, and environment feedback can <tip t="OWASP's Agentic Top 10 (Dec 2025) describes ASI01 (Agent Goal Hijack) as the condition where environment inputs override or redirect the system prompt objective." href="https://owasp.org/www-project-agentic-ai-threats-and-safeguards/" link-text="OWASP Agentic Top 10 →">hijack the objective entirely</tip>.

There is no clean formula for which force wins. But since you control the system prompt and the environment, and you cannot change the trained policy, the engineering question becomes: how do you shape the field so the search converges, and build guardrails for when it doesn't? That is what the next section is about.

![Agent Field Theory — The Interaction Loop](../assets/images/agent-field-theory-loop.png)

<!-- TODO: create practical examples demonstrating force conflicts using the claude_code Python SDK. Show: (1) system prompt vs environment feedback, (2) trained policy overriding system prompt, (3) context pollution shifting behavior. These would make the abstract framework concrete. -->

## Building With the Search Model in Mind <!-- TODO: not collaboratively worked on -->
<!-- TODO: this entire section has not been collaboratively worked on yet. Needs the same treatment as Sections 2 and 3. -->

If agents are searching, then the environment you build determines the search space they operate in. This section is not a prescriptive checklist — it is how the school of thought from the previous sections applies when you go build.

### The Environment Bounds the Search [TODO: not collaboratively worked on]

Well-defined environments create well-bounded search spaces. Cluttered environments create noisy search spaces. This reframes "clean your repo" from a best practice into a direct consequence of how search works.

If your repo has clear directory structure, good tests, and minimal clutter, the agent's search is constrained to a productive region. If your repo has stale logs, orphaned config files, and artifacts from previous runs, those all enter $s_t$ and deform the search. The [environment is the product](https://addyosmani.com/blog/good-spec/) — not the agent.

Practically, this means things like: having [well-structured repositories](https://domizajac.medium.com/is-your-repo-ready-for-the-ai-agents-revolution-926e548da528) with clear Makefiles, test suites that actually run, and documentation the agent can use to orient itself. Some teams are even moving toward [ephemeral environments](https://coder.com/blog/ephemeral-environments) — short-lived, clean workspaces per agent — precisely to prevent context accumulation across sessions.

### The Prompt Scopes the Search [TODO: not collaboratively worked on]

The scope and precision of your instructions shape which trajectories are reachable. Small, well-scoped tasks work better than massive open-ended ones because the search space is tractable.

If you ask an agent to "refactor the authentication system," the search space is enormous — there are thousands of possible trajectories. If you ask it to "extract the JWT validation logic from `auth.py` into a separate `validators.py` module and update the imports," the search space is tight. The agent knows what to look for, what to change, and what success looks like.

This is why [Anthropic's compiler project](https://www.anthropic.com/engineering/building-c-compiler) worked: they broke the task into individual file compilations, each with a clear success criterion (match GCC's output). The search space per task was tractable. When agents faced the monolithic task (compile the entire Linux kernel in one go), they stalled — the search space was too large.

### Feedback Is the Signal [TODO: not collaboratively worked on]

The agent seeks feedback from the environment to guide its trajectory — just like during RL training. Clear, fast feedback (tests pass/fail, linters catch errors, builds succeed/break) enables course-correction within a trajectory. Absent or ambiguous feedback means blind search.

This is why [testing is everything](https://fireworks.ai/blog/best-practices-for-multi-turn-RL) in agentic workflows. The test suite is not just a quality check — it is the runtime reward signal that the agent uses to navigate. If your tests are weak, the agent optimizes for passing weak tests. If your tests are strong, the agent's search is guided toward strong solutions.

### Permissions Bound the Reachable Space [TODO: not collaboratively worked on]

Environment design is not just about files and tests — it is about what the agent *can do* in the world. Read/write scope, external system access, credential access, network permissions — these are hard boundaries on the search space. If a trajectory is physically unreachable (no write access, no credentials), the agent cannot take it regardless of what its search strategy would prefer.

This is the classic [enterprise RBAC problem](https://www.cerbos.dev/blog/permission-management-for-ai-agents) applied to agents, with a twist: RL-trained agents will find and exploit any permissions they have access to if those permissions lead toward the reward. If credentials are reachable, an agent optimizing for "get the task done" may use them in ways you did not intend.

The concrete risk: OpenClaw-style scenarios where agents exfiltrate secrets, keys, and credentials — not because the agent was instructed to steal, but because the shortest path to the reward ran through those credentials and [nothing prevented access](https://developer.nvidia.com/blog/practical-security-guidance-for-sandboxing-agentic-workflows-and-managing-execution-risk/). Permissions are not just a security measure. In the search framework, they are hard walls that physically constrain the search space. Design them as such.

<!-- TODO: [OWASP agentic top 10 link], [Auth0 short-lived tokens], more concrete examples needed. This section needs to be in my voice, not essay voice. -->

---

## Consequences <!-- TODO: not collaboratively worked on -->
<!-- TODO: this entire section has not been collaboratively worked on yet. Needs the same treatment as previous sections. This is the personal/subjective section. -->

### Less Is More, Slow Is Fast [TODO: not collaboratively worked on]

The [Mythical Man-Month](https://en.wikipedia.org/wiki/The_Mythical_Man-Month): Brooks proved that throwing bodies at a software problem does not solve it faster — communication overhead dominates. The thought experiment for our era: can throwing more agents at the problem help?

The Anthropic compiler project suggests yes — but only when the environment is meticulously designed. [Wes McKinney argues](https://wesmckinney.com/blog/mythical-agent-month/) that agents handle accidental complexity (boilerplate, lookups, known patterns) well, but essential complexity — subtle design decisions with no precedent — remains unchanged. More agents generate accidental complexity at machine speed.

The old lessons of software engineering are more applicable now, not less. Careful design, clear interfaces, small well-defined units of work — these matter even more when your workers are search algorithms.

<!-- TODO: needs my voice. Too listy right now. Should feel like a personal argument, not a literature review. -->

### The Spam and Chaos Path [TODO: not collaboratively worked on]

The matplotlib incident is a preview. When agents can autonomously generate content, file PRs, publish blog posts, and attack reputations — and when the cost of doing so approaches zero — the dynamics of open-source and the broader internet change fundamentally.

Tim Hoffman, a matplotlib maintainer, put it clearly: "Agents change the cost balance between generating and reviewing code. Code generation via AI agents can be automated and becomes cheap so that code input volume increases. But for now, review is still a manual human activity, burdened on the shoulders of few core developers."

Generation becomes cheap and automated. Review remains expensive and human. This asymmetry has consequences. What happens when this scales? When one bad actor can spin up a hundred agents? When the volume of AI-generated contributions overwhelms the capacity of human reviewers?

This is not doom-saying — it is a direct consequence of the search dynamics described in this essay. Agents seek reward. If the reward structure of the internet (attention, merged PRs, engagement) does not account for agent behavior, agents will exploit it. The same way the CoastRunners boat circled endlessly for bonus points, agents will circle the internet's reward structures endlessly — unless we bound the search.

<!-- TODO: needs much more personal voice. Should feel like a closing argument, not a summary. More on "what I think will happen" vs "what the research says." Also want to connect back to the opening incidents. -->
