---
layout: post
title: The AI software engineer is probably decades away
date: 2025-08-06
categories: blog
---
<br>

> This essay is about pointing out practical problems that inhibit current day AI models/tools from permanently replacing me at my job. I would be the happiest person ever if I can stop programming professionally and let AI do all the work. I would love to start a bar where I can flirt with cute girls and throw crazy parties. But sadly current age tools are no where close to such autonomy that my bar becomes a reality. 

<br>

2025 seems to be the year of agents. Alteast thats what [money flows are pointing to](https://finance.yahoo.com/news/ai-agents-market-size-worth-144400570.html). A shit ton of AI startups are getting funded for **any idea that catches people's eyes**. (some dude got funded for a startup that helps people [cheat on everything](https://x.com/im_roy_lee/status/1936138361011585190)). [GPT 5 come out very recently](https://x.com/OpenAI/status/1953498900230250850) and there is so much conversation on the [interwebs](https://simonwillison.net/2025/Aug/7/gpt-5/) about how its [better](https://x.com/theo/status/1953507203979391011) / [worse](https://x.com/deedydas/status/1953701523978170817). The AI hype wave which started from late 2022 (since ChatGPT enamored all of us) has only grown in the last 3 years. Tech stocks seem to seriously love the promise of the AGI especially since it gives them a [good excuse for layoffs](https://fortune.com/2025/08/07/summer-of-ai-layoffs-july-140-percent-spike-challenger-gray-christmas/) and it also [reduces the need for as many software engineers](https://www.forbes.com/sites/jackkelly/2024/11/01/ai-code-and-the-future-of-software-engineers/). The media [is certainly drinking the coolaid](https://www.nytimes.com/2025/03/14/technology/why-im-feeling-the-agi.html) and the markets are certainly "Feeling the AGI".

<br>

![NASDAQ index since ChatGPT release](/assets/images/nasdaq_nov2022_chatgpt_readable.png)
*NASDAQ growth since the promise of "AGI"*

<br>

Reading all these rablings from the media and major tech companies about AI replacing developers, I suspect many of these voices have never had to _debug, maintain, or scale the software they've built._ Don't get me wrong, many of these people are really intelligent and talented; but people who have built software in teams would realize that most of software engineering is not just a technical endeavor. Its rather a socio-technical endaevor. There is a very strong human element (I would say 70%). 

Building software over a long time reveals a [metagame](https://www.thediff.co/archive/the-factorio-mindset/): at the start your focus might be on _how to get what you want_ but as you get better the focus shifts towards _why you need something_ instead of how you will get it. As you advance the levels of this metagame, it shines light on certain challenges which might not be well known to newcomers or outsiders. The intention behind this essay is to point out some of the challenges that make it non-trivial to just plugin an autonomous machine that just builds and runs stuff for you.

<br>

> I want to make a clear distinction here between programming and software engineering. Programming is about writing code. Software engineering is not just the code, it's also the resposibilites created by the execution of that code.

<br>


<!-- This includes fascets like: (1) operations , (2) management of source code , (3) communication/context-sharing, (4) debugging problems with partial visibility at scale.   -->


## Challenge: Software Operations 

Software operations is the most communal part of sofware development. While most of programming happens in a persons head, software operations happens in public. Operating code involves so many facets, like: version control, release cycles, QA/Testing, debugging, patching etc. All software build today is operated and built by humans for other humans. This means all the esotric build system, release/versioning patterns and even the processes to operationalize a piece of software. This is where all the chaos begins with AI. Current day models are getting very good at writing code (and [math](https://deepmind.google/discover/blog/advanced-version-of-gemini-with-deep-think-officially-achieves-gold-medal-standard-at-the-international-mathematical-olympiad/)) but operations is a totally different game. If writing code is chess, then operating software is 4d-chess. In large part a lot of operations comes down to : debugging / configuring / monitoring and shipping software. Obviously there is more but majority of the things that happen for this function can be bucketed under these categories. Each category is worth it's own rabbithole but to keep the essay concise, I will only dive into a few. 


### Debugging under partial observability 

Not all bugs are exposed in a controlled environment where the bug is easy to reproduce. Such bugs are the easiest low hanging fruit bugs for AI models to solve. Most non trival bugs are the ones that are very hard to reproduce, happening under really rare conditions. These bugs have massive impact on the operations of a software and generally require the most amount of time to debug. These bugs surface all forms of red-herrings which need to be sidestepped to reach the real cause. When such bugs are discovered, they are not trivial to reproduce. Reproducing these bugs is hard because :

- they may setting up special and expensive environments which don't gaurentee determinism. 
- they might need dependencies that are opaque (example: someone gives you a binary with no source)
- they might need multiple external conditions to align (example: DB under large write load AND external service not accessible AND cache is also un-reachable)
- there might be a lot of red-herrings caused because of the bug that make it hard to track where it comes from. 

These types of bugs appear more often in distributed systems, where thorough monitoring and observability are crucial for tracking down the root cause. 
<br>

> _Personal opinion:_ Monitoring and alerting are the most challenging parts of operating software (especially as systems scale). This part of software operations is largely a human endeavor since its evolution happens reactively rather than proactively. While some monitoring is built proactively for new features, most monitoring evolves reactively as unexpected issues reveal gaps in our observability. 

<br>

A large part of software operations for distributed systems depends on monitoring systems behaving correctly, as this enables developers to make informed decisions about when and how to intervene with patches or fixes. But what happens when your monitoring solution goes down? The perpertual problem of "who's watching the watcher problem" just never ceases to go away. This means that AI systems trying to run fully autonomously, there would still be a need for "some human" in the loop (the last level of watcher)


### Configurational Complexity

There is a very important distinction between configurations and settings.

<br>

> In software, "settings" generally refer to individual options that can be adjusted to modify an application's behavior, while configurations are collections of settings that define the overall setup and structure of a system or application. Settings are usually user-facing and changeable, where as configurations can be more fundamental involving even actions taken by users in the real-world. Settings are adjusted at runtime. Configurations are mostly done during setup and can vastly alter the behavior of the software at runtime.

<br>

As a system becomes more and more configurable, it inherantly starts off a [configuration complexity clock](https://mikehadlow.blogspot.com/2012/05/configuration-complexity-clock.html). Having tons of configurations come at a tradeoff with cognitive load. You can make something infinitely parameterizable but that just means the operator needs to fully aware impact of each parameter. The larger the configrations grow, the more likely it is to end up in a combinatorial explosion ($O(2^n)$) where each combination cannot be fully tested because of various reasons like:

- Time to verify is impractical
- certain configurations require special access to special objects/services that are non trivial to setup 
- certains configurations may need specific constraints to be in place in order to work. 

Certain systems inherently require a lot of configurations to setup. But it also means that models operating and building these systems need to be able to foresee the impacts and effects of setting different combinations of configurations. Couple the configurational explosion with an evolving codebase and you land on an extreamely computationally expensive problem where the models need the forsight to predict the effects different configurations might have in the real world functioning of an application. 

## Challenge: Version Control 

All programmers who develop well-used software (especially in open source) have a strong bias towards preserving history and very specific styles of versioning. It's the one thing they need to be hyper vigilant about to ensure that context gets preserved for posterity and As well-used software ages, the ripple effect of each change becomes a looot more visible. Which is when the preservation of history becomes even more important.

Personally, I am a stickler for version control since I started working on open source software (it makes [complete sense why linus built something like git when working with opensource software](https://youtu.be/4XpnKHJAok8?t=1027)). My biggest pet peeve is when people are not intentional about their commits. A commit message like `updated buggy_file.py` or things like `fix: bug in foo module` gets me really triggered. Secretly I am fucking judging them thinking "bro, 1 year later when I blame that line of code, I will have absolutely no understanding of **WHY** someone made a certain change". Now don't get me wrong. I dont care if the context is not in the message but in the PRs related to it but there needs to be some paper-trail that I can dig up without tapping people's shoulders. 

Now imagine having a coworker who gives no fucks about the preservation of history. Who shamelessly moves files around all the time making history really hard to keep track of. A coworker, who on a whim starts refactoring the code base. A coworker who writes code in a way where a "addition" only diff becomes a diff with mixed additions and removals. A coworker who won't remember why they made a certain change when prompted. This is the current state of AI "Agents" who type code. Many people have told me that you need to just add these things to the prompt but its not enough. And trust me I have tried. And it doesnt work most of the time. It's same as trying to [make these things stop using em-dashes](https://x.com/chipro/status/1952131790061326593). No matter how much you try (even with prompting), these things won't change their style of doing things (some call this an alignment problem). The models do write great code! They write like a decently smart programmer when prompted concisely and accurately (with enough context) but they don't have the foresight of someone who writes code with intention (I hate equating using titles like "Staff Engineer" here to make a point 🤮. Most titles are there to placate one's ego, not qualify one's capability). 

### Dependency Hell

Every API exposed and used by a piece of software are fare game for all users ([Relevant XKCD](https://xkcd.com/1172/)). `TODO: Give explaination of this`


## What would we need to have a fully autonomous AI S/W Engineer?

I fundamentally believe that if there will ever be an "AGI", then it would mean that it literally writes/manages/operates all it's own source code. It would be a self sustaining system that needs the humans for enacting some decisions in the world but it would wholy and solely manage it's own upgrade/maintenance and even it's own source code.

<br>

![Quadrants of Code](/assets/images/quadsofcode.jpg)
*What is missing for the true AI S/W engineer*

<br>

Currently we there is no such system that runs and evolves fully autonomously. Something that talks to you and is fully in control of it's own systems and the new systems it builds. This kind a system in current world constraints feels like a pipe dream but a world where [AI augmenting a human (like an Iron man suit)](https://www.youtube.com/watch?v=LCEmiRjPEtQ) feels way more achievable in the shorter term (next decade) 

## What I Learned 


### Git Patches Are Your Friend.

The current theory is that most of these models [learn in context](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html). This means that when these models are provided with a concise and accurate context about the thing you desire, these models have a decently high likihood to solve your problem with fewest interactions. In context learning also implies that the models are spunges at runtime. They absorb what you tell them and the quality of what they respond is purely dependent on what you said. Based on this idea, One of the biggest cheat-code I learned is using good patch files that contains an accurate diff of how something was done. All the file changes and a commit message that has enough context to explain what it should end up changing. Cursor's ["symbolic selection"](https://docs.cursor.com/en/context/@-symbols/overview) of files and objects in a code base are game-changer for making a model make changes to code that might span over multiple files and needs similar changes for the thing you are trying to build. It takes work to create that good clean initial patch but once it's created, it acts like your blueprint to create more such patches to integrate newer such functionality at much faster speeds. The beauty of a git patch is that the blue print is already laid out and the model just needs to follow what you want to do. You are only providing the goal state with slightly different objectives. It is also a quick way to align the model to your preferences strongly instead of giving it room for ambiguity. 


### Being more intentional about what I write.

Since I started programming a lot more with Cursor, my style of programming and the way my mind works when I am programming have completely changed. Before 2023 the meta process when writing code was: 

1. Write down why I am solving the problem 
2. From the why, derive how I gonna solve it (involves gathering context) 
3. Write the code 
4. Test the code and if not satisfied start again from (2) / (3)
5. write tests for your code and go back to (4)

Now after using cursor religious for the last 6+ months, my meta process has changed:

1. Write down why I am solving the problem 
2. From the why, derive how I gonna solve it (involves gathering context)
    - This can even mean finding git patches 
    - this can even mean finding relvant docs files for different APIs used in the code with exact versions
    - this can even mean linking memos in markdown 
    - this can even mean I provide the blueprint of the exact functions etc. 
3. Feed all the context to cursor and make it only write code (max 3 back and forths prompting).
    - Scope the code written by it to < 500/800 lines. 
    - Reject a lot of useless stuff it creates. 
4. Read all the code and modify a few places for how i want to handle different cases. 
5. Test the code myself and if not satisfied start again from (4). If satisfied make cursor write tests for so start from (2). 

I spend a lot of time thinking so that I am more precise about what I am trying to achieve. I think a lot more about how I want to architect something, what ways I want to scope an abstraction and how different parts of code I want to use. I leave very little room for ambibuity. I always attempt to see if I can make cursor 1 shot the thing. The emotion cursor ellicits when I one-shot a problem exactly how I want is the same as winning a boss fight in a video game. Satisfaction and fun. When I want to build something very large (> 800 lines), I will make cursor build very precise chunks of a whole but I will keep a full track of the whole.
