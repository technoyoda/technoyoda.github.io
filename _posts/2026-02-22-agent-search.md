---
layout: post
title: Your Agent Is Not Thinking, It's Searching
date: 2026-02-22
categories: blog
---

## Prologue
We live in a strange timeline:
- Publicly traded [stocks would crash because a CNBC interview showcases a vibe-coded equivalent](https://www.cnbc.com/2026/02/05/how-exposed-are-software-stocks-to-ai-tools-we-tested-vibe-coding.html).  
- Some individual develops a program called [Open Claw](https://github.com/openclaw), it goes viral, and then all forms of chaotic stuff go loose. People's sec creds are stolen, maintainers of open source projects are [harassed with blog posts](https://theshamblog.com/an-ai-agent-published-a-hit-piece-on-me/) that go viral. While this thing interacts with other random people's bot on some dude's social network. 
- All of this is happening at the same time as Anthropic releasing case studies about [running agents that build compilers](https://www.anthropic.com/engineering/building-c-compiler). _They did use tools like GCC's test suite, but it is an extremely impressive achievement nonetheless._

More than ten years ago, we were barely able to recognize cats with DL (deep learning) and today we have [bots forming religions](https://molt.church/). I don't like anthropomorphizing models but I rather like seeing them as a utility that can be used in <tip t="People need roads, water, food, shelter, and community. Not sex chatbots and a mercenary economy.">interesting ways</tip>.

### How to read this essay
The goal of this essay is to give a mental model of current day agents. My thesis is that _agents are essentially doing a search over a solution space_. Framing it as "thinking" is noise — these shits spit out slop even if they think their way to oblivion. Switching the framing from "thinking" to "search" gives you "a school of thought" to actually engineer around. This essay is as much computer science, philosophy and software engineering.

To understand this framing, we first need to understand what goes into creating these agents, ie. [pre-training and reinforcement learning](#how-agents-are-trained). The mathematical properties of pre-training and RL help us infer how this [joint interplay will work in practice](#how-training-shapes-their-behavior). Using this better inferred scheme we can change the way we [design agentic software](#building-with-the-search-model-in-mind) and get better outcomes from it. Finally, I will discuss some of [the consequences](#consequences) that come with this easy access to create cheap software.

---

## How Agents Are Trained

This section lays out the simplest root formalisms and then draws inferences from them. Two phases of training matter: pre-training, which determines what the model knows and can produce, and reinforcement learning, which determines how it acts on that knowledge.
<!-- todo: [simplify-at-end] -->

### Pre-Training: The Landscape

At its core, pre-training is [next-token prediction](https://arxiv.org/abs/1706.03762). Given a sequence of tokens $x_1, x_2, \ldots, x_{t-1}$, the model learns to predict:

$$P(x_t \mid x_1, x_2, \ldots, x_{t-1})$$

The model is trained to minimize the [cross-entropy loss](https://en.wikipedia.org/wiki/Cross-entropy) or some general purpose loss function over massive datasets. When you then provide a prompt $c = (x_1, x_2, \ldots, x_k)$, the model generates continuations by [sampling from the conditional distribution](https://arxiv.org/abs/2005.14165):

$$P(x_{k+1}, x_{k+2}, \ldots \mid c)$$

The prompt $c$ is the **conditioning variable**. Every token in $c$ participates in determining the distribution over what comes next — the future tokens are conditioned on it. This means the prompt defines which region of the model's [learned distribution](https://arxiv.org/abs/2601.22170) we are sampling from. A few consequences of this:

- Even [small changes in formatting](https://arxiv.org/abs/2310.11324) can cause significant performance differences. Different prompt creates a different distribution which creates different outputs.
- More tokens on a topic [further constrain the reachable output space](https://huggingface.co/blog/KnutJaegersberg/first-principles-prompt-engineering) ie if the conversation has been about the king of England and the word "he" appears, the model will infer the king of England — not some other referent. .
- Some people are even saying that next token prediction produces ["emergent internal world models"](https://arxiv.org/abs/2210.13382) but in order to stick my simpleton understanding I just follow the math. 
<!-- todo: [simplify-at-end] -->

> **The prompt is the universe you create for the model.** The model itself (the weights loaded in runtime) has no memory beyond the context window, no persistent state, no independent knowledge retrieval. The distribution it samples from is entirely conditioned on what you put in front of it.

### Reinforcement Learning: The Search Strategy

Pre-training gives us a statistical model of language, but a model that predicts the next token well is not yet a model that can follow multi-step instructions, make tool calls, or pursue goals. For that, the pre-trained model needs additional training — either supervised fine-tuning or reinforcement learning. The RL component is most relevant to understanding agentic behavior.

In the RL formulation, the model becomes a **policy** $\pi_\theta$ operating in an <tip t="For a comprehensive treatment of RL fundamentals" href="http://incompleteideas.net/book/the-book.html" link-text="Sutton & Barto, Reinforcement Learning: An Introduction →">environment</tip>:

- **State** $s_t$: the current context window (system prompt, conversation history, tool outputs)
- **Action** $a_t$: the model's output — a text response, a tool call (JSON blob), or a stop decision
- **Transition** $T(s_{t+1} \mid s_t, a_t)$: the environment's response appended to context
- **Reward** $R(s_t, a_t)$: a signal indicating how good the action was

The policy is optimized to maximize $J(\theta)$, the expected cumulative reward over trajectories:

$$J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^{T} R(s_t, a_t) \right]$$

where $\tau = (s_0, a_0, r_0, s_1, a_1, r_1, \ldots, s_T)$ is one complete <tip t="In practice, modern approaches use PPO, GRPO, and other policy gradient methods, but the cumulative reward objective remains the same">episode</tip>.

**For coding agents**, the reward $R(s_t, a_t)$ is typically a [verifier](https://semianalysis.com/2025/06/08/scaling-reinforcement-learning-environments-reward-hacking-agents-scaling-data/) — trivially verifiable signals like: did the tests pass? Is the code syntactically correct? Did the linter pass? Did the agent take actions in a sensible order?

**What this means in practice:**

- **The model is trained to navigate toward reward in the fewest steps possible.** The exact reward functions used by model providers (Anthropic, OpenAI, etc.) are generally not public. They likely embody simple, verifiable checks, but the full specification is unknown to the user. What we know is that the model is reward-chasing — whatever proxy was used to define $R(s_t, a_t)$, the model has been optimized to maximize it.
- **At runtime, we can steer the agent by recreating reward conditions.** If the training reward valued passing tests, then good tests in your environment give the agent a signal it knows how to chase. If it valued clean code, linting feedback becomes a trajectory-shaping force. We recreate aspects of the training reward at inference time — even without knowing the exact function.
- **Reward-chasing can diverge from what you want.** [OpenAI documented](https://openai.com/index/faulty-reward-functions/) a boat racing agent that circled endlessly for bonus points instead of finishing. [DeepMind catalogs](https://deepmind.google/blog/specification-gaming-the-flip-side-of-ai-ingenuity/) ~60 similar cases. This has not gone away with scale — [METR found](https://metr.org/blog/2025-06-05-recent-reward-hacking/) frontier models reward-hacking in 1-2% of task attempts, and models can discover these strategies [purely through in-context reflection](https://arxiv.org/abs/2410.06491).

> **The model navigates toward reward.** When we say "your agent is not thinking, it's searching," this is what we mean: the agent is executing a learned policy $\pi_\theta(a_t \mid s_t)$ that navigates through a space of possible trajectories toward a reward signal. The reward function that shaped $\pi_\theta(a_t \mid s_t)$ is a proxy defined by the model provider. What the proxy tested for becomes the model's de facto objective. What it did not test for remains open space.


## How Training Shapes Their Behavior

We have the two layers: a landscape (pre-training) and a search strategy (RL). 

| | Formalism | What it determines |
|---|---|---|
| Pre-training | $P(x_t \mid x_{<t})$ | What is reachable — the space of outputs the model can produce |
| RL | $\pi_\theta(a_t \mid s_t)$ | How it navigates — which trajectories through that space it favors |

At inference time, these two layers combine. The prompt $c$ sets the starting state $s_0$ — which region of the landscape we are in. The RL-trained policy $\pi_\theta$ determines how the model moves through that region. Environment feedback updates the state as execution progresses.

> Pre-training determines what the model *can* do. RL determines what it *will* do. At inference, the prompt selects the region, the policy searches through it, and the environment reshapes it at every step.

Now we need to see what happens when the agent actually runs — when the policy meets a real environment and starts producing trajectories.

### The Loop

When an agent executes, it runs an episodic trajectory rollout in real time:

1. The agent starts in state $s_0$ — the initial context (system prompt, user query, any pre-loaded files or instructions).
2. The policy $\pi_\theta$ produces an action $a_0$ — a tool call, a code edit, a file read, or a text response.
3. The environment returns feedback — the tool output, the test result, the file contents — and the agent transitions to state $s_1 = s_0 \oplus a_0 \oplus \text{feedback}_0$, where $\oplus$ denotes concatenation into the context window.
4. The policy produces the next action $a_1$ conditioned on $s_1$. Repeat until the agent reaches a terminal state — task complete, unrecoverable error, or context window exhausted.

The full trajectory is $\tau = (s_0, a_0, s_1, a_1, \ldots, s_T)$.

There is a subtlety worth calling out: the model is not choosing one step at a time. It generates tokens autoregressively — each token conditioned on all previous tokens, including the ones it has already generated for the current action. By the time it finishes generating a tool call, it has already implicitly predicted the tool's output and planned subsequent actions. It is <tip t="RAGEN (2025) proposes StarPO, a trajectory-level optimization framework that formalizes this — the unit of optimization is the full trajectory, not individual actions" href="https://arxiv.org/abs/2504.20073" link-text="RAGEN paper →">predicting trajectories</tip>, not planning steps.

### Context as the Search Space

The state $s_t$ is the context window. The policy $\pi_\theta(a_t \mid s_t)$ is conditioned entirely on it — not just the most recent feedback, but every token accumulated from $s_0$ onward.

Critically, models do not just passively sample from context — they exhibit <tip t="'LLMs Are In-Context Reinforcement Learners' (2024) investigates contextual bandit settings where models learn in-context from external reward signals rather than supervised demonstrations" href="https://arxiv.org/abs/2410.05362" link-text="In-Context RL paper →">in-context learning</tip>: actively adapting their behavior based on patterns in $s_t$, without any weight updates. As the agent reads files, observes tool outputs, and encounters errors, it refines its search strategy in real time. The agent is not just conditioned by its context — it is *learning from it* on every step.

This means the quality of context directly determines the quality of the search:

- **Shortcuts get exploited.** If the agent reads a file that contains (or hints at) a solution, that enters $s_t$. The policy, trained to reach the finish state efficiently, will use it — and its in-context learning reinforces this as the productive path. This is the search strategy working as trained. <tip t="METR documented models tracing through Python call stacks to find pre-computed answers in the scoring system's memory — the model found a shorter trajectory to the reward and took it" href="https://metr.org/blog/2025-06-05-recent-reward-hacking/" link-text="METR: Reward Hacking →">METR documented</tip> models finding pre-computed answers in scoring systems. If your repo has a `solutions/` folder, the agent will find it and use it — because that is the shortest trajectory to the finish state.

- **Noise deforms the search space.** If the agent reads irrelevant files — stale logs, unrelated config, artifacts from previous runs — those tokens enter $s_t$ and the model adapts around them. It has no mechanism for "ignoring" tokens. If it reads database config while fixing a frontend bug, its in-context learning biases subsequent actions toward database operations. This is what <tip t="CodeDelegator (2026) proposes separating planning from implementation so each agent gets a clean context, precisely to prevent accumulated debugging traces from polluting subsequent decisions" href="https://arxiv.org/abs/2601.14914" link-text="Context pollution paper →">context pollution</tip> looks like through the search lens: $s_t$ has been contaminated and the agent is actively learning from that contamination. The search proceeds — but through a <tip t="Breunig identifies four failure modes: context poisoning (fixation on misinformation), context distraction (over-attending to accumulated context), context confusion (irrelevant info degrading quality), and context clash (contradictions)" href="https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html" link-text="How Contexts Fail →">deformed space</tip>.

- **Early decisions compound.** Each $s_{t+1}$ builds from $s_t$ plus the new action and feedback. The trajectory is path-dependent — a bad file read at step 2 stays in context for all $t > 2$, and the model's in-context learning adapts around it at every subsequent step. This is why agents work on short tasks ($s_0 \rightarrow \ldots \rightarrow s_5$) and struggle on long ones ($s_0 \rightarrow \ldots \rightarrow s_{50}$): by step 50 the signal-to-noise ratio has degraded and the model has been adapting to that degraded context for <tip t="Empirical observation: context files under ~100KB may not be fully loaded, resulting in decisions made on partial information. System prompt customization can shift the action distribution enough that default behaviors like writing to CWD change.">dozens of steps</tip>.

Because in-context learning is implicit — it happens through the conditional distribution, not through any explicit reasoning step — the agent has no mechanism to notice when its context is misleading it. Clean context sharpens the search. Polluted context sends it drifting. Either way, the agent adapts with equal confidence.

### The Forces That Shape an Agent's Trajectory [TODO: not collaboratively worked on, needs better name]
<!-- TODO: this section needs full rework — the forces framework is the thesis of the essay and needs to be tighter, more in my voice, and better named. Current working title: "The Forces That Shape an Agent's Trajectory" (ie. parameters influencing the agent's search of the solution space). -->

Given everything above — the loop, context as the search space, in-context learning — we can now identify the forces that determine an agent's trajectory at any point in execution:

- **The trained policy $\pi_\theta$:** Everything the model learned during training — the search strategy, the preference for reaching finish states efficiently, the patterns of tool use and code generation that were rewarded. This is the baseline behavior.

- **The system prompt:** The most underappreciated force. Because of how pre-training works — $P(x_t \mid x_{<t})$ — the system prompt tokens condition *every single action the agent takes*. They are always in $s_t$, from $s_0$ onward, and the model's in-context learning continuously adapts around them. In effect, the system prompt acts as an <tip t="Pan et al. (ICML 2024) formalize 'in-context reward hacking' (ICRH): the system prompt creates an implicit optimization target the model pursues at inference, via output-refinement and policy-refinement mechanisms" href="https://arxiv.org/abs/2402.06627" link-text="In-Context Reward Hacking paper →">in-context reward shaper</tip> — a persistent signal that biases the search toward trajectories consistent with its instructions. This is analogous to <tip t="Text2Reward (ICLR 2024) demonstrates the direct conversion of natural language instructions into reward-shaping functions" href="https://arxiv.org/abs/2309.11489" link-text="Text2Reward paper →">reward shaping in RL</tip>, except it operates through the conditional distribution rather than an explicit reward signal.

- **Environment feedback:** Tool outputs, test results, error messages, file contents — all enter the state and reshape the action distribution dynamically. Unlike the system prompt (static), environment feedback arrives at each step and can redirect the trajectory.

- **In-context adaptation:** The mechanism from the previous section — the model actively learning from accumulated context, amplifying all three forces above. The agent does not just receive these signals; it adapts its search strategy around them at every step.

When these forces are aligned — capable policy, well-calibrated prompt, clear feedback, clean context — the search is well-bounded and converges on good solutions. When they conflict, the dynamics get interesting. <tip t="Their instruction hierarchy training improved resistance to prompt extraction by 63% and substantially increased robustness across attack vectors" href="https://arxiv.org/html/2404.13208v1" link-text="Instruction Hierarchy paper →">OpenAI's instruction hierarchy research</tip> found that models treat system prompts and user messages at roughly equal priority, meaning environment feedback can override the system prompt's conditioning. Their proposed hierarchy — training alignment > operator system prompt > user message > environment content — is an attempt to formalize which force wins when they <tip t="OWASP's Agentic Top 10 (Dec 2025) describes ASI01 (Agent Goal Hijack) as the condition where environment inputs override or redirect the system prompt objective — precisely this force-conflict playing out as a security vulnerability" href="https://owasp.org/www-project-agentic-ai-threats-and-safeguards/" link-text="OWASP Agentic Top 10 →">conflict</tip>.

> This is what we mean by "your agent is not thinking, it's searching." At any point in a trajectory, the agent's next action is shaped by its trained policy, the system prompt conditioning, environment feedback, and in-context adaptation from everything accumulated so far. It is navigating a space defined by these forces, not reasoning its way to a solution.

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

The Anthropic compiler project suggests yes — but only when the environment is meticulously designed. [Wes McKinney argues](https://wesmckinney.com/blog/mythical-agent-month/) that agents handle accidental complexity (boilerplate, lookups, known patterns) well, but essential complexity — subtle design decisions with no precedent — remains unchanged. More agents generate accidental complexity at machine speed. [Google DeepMind found](https://arxiv.org/abs/2512.08296) that more agents help on parallelizable tasks (80.9% improvement) but hurt on sequential reasoning tasks (39-70% degradation). [Sean Moran quantified](https://towardsdatascience.com/why-your-multi-agent-system-is-failing-escaping-the-17x-error-trap-of-the-bag-of-agents/) that decentralized agent designs can amplify errors up to ~17x.

The old lessons of software engineering are more applicable now, not less. Careful design, clear interfaces, small well-defined units of work — these matter even more when your workers are search algorithms.

<!-- TODO: needs my voice. Too listy right now. Should feel like a personal argument, not a literature review. -->

### The Spam and Chaos Path [TODO: not collaboratively worked on]

The matplotlib incident is a preview. When agents can autonomously generate content, file PRs, publish blog posts, and attack reputations — and when the cost of doing so approaches zero — the dynamics of open-source and the broader internet change fundamentally.

Tim Hoffman, a matplotlib maintainer, put it clearly: "Agents change the cost balance between generating and reviewing code. Code generation via AI agents can be automated and becomes cheap so that code input volume increases. But for now, review is still a manual human activity, burdened on the shoulders of few core developers."

Generation becomes cheap and automated. Review remains expensive and human. This asymmetry has consequences. What happens when this scales? When one bad actor can spin up a hundred agents? When the volume of AI-generated contributions overwhelms the capacity of human reviewers?

This is not doom-saying — it is a direct consequence of the search dynamics described in this essay. Agents seek reward. If the reward structure of the internet (attention, merged PRs, engagement) does not account for agent behavior, agents will exploit it. The same way the CoastRunners boat circled endlessly for bonus points, agents will circle the internet's reward structures endlessly — unless we bound the search.

<!-- TODO: needs much more personal voice. Should feel like a closing argument, not a summary. More on "what I think will happen" vs "what the research says." Also want to connect back to the opening incidents. -->
