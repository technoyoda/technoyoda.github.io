---
layout: post
title: The AI software engineer is probably decades away
date: 2025-08-06
categories: blog
---
<!-- <br> -->

<!-- > This blog post is full of problems and ideas. It is not meant as a puff piece to point out that "look this stupid model cannot count R's in rigurgitating". Its about pointing out practical problems I face on a day to day basis that inhibit these models/tools from permanently replacing me at my job. I would be the happiest person ever if I can stop programming professionally and just start a bar where I can flirt with cute girls and throw crazy parties. But sadly current age tools are no where that I can just outsource it to some AI and buy myself time and bandwith to start my bar while the thing programs for me in the backgound.  -->

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

Software operations is the most communal part of sofware development. While most of programming happens in a persons head, software operations happens in public. Operating code involves so many facets, like: version control, release cycles, QA/Testing, debugging, patching etc. All software build today is operated and built by humans for other humans. This means all the esotric build system, release/versioning patterns and even the processes to operationalize a piece of software. This is where all the chaos begins with AI. Even if the model could currently fit everything in it's context,  


`TODO: Add connective tissue? `


### Debugging under partial visibility 

Not all bugs are exposed in a controlled environment. Users run software in the most esoteric ways and especially on infrastructure/settings that you have no control of. 
`TODO: Explain why? `


### Distributed Systems

When you work on large enough systems that have and insane number of moving parts, it starts becoming more and more complicated for arbitrary autonomous systems to start debugging what went wrong. `TODO: Explain why? `

### Monitoring and Tail Events 

What happens when your monitoring solution goes down? Even if AI's figured out things for me the "who's watching the watcher problem" just never ceases to go away. `TODO: Explain why?`

### Configurational Complexity

There is a very important distinction between configurations and settings.

> In software, "settings" generally refer to individual options that can be adjusted to modify an application's behavior, while configurations are collections of settings that define the overall setup and structure of a system or application. Settings are usually user-facing and changeable, while configurations can be more fundamental and might involve system-level setups. Settings are adjusted at runtime. Configurations are done during setup and vastly alter the behavior of the software at runtime.

As a system becomes more and more configurable, it inherantly starts off a [configuration complexity clock](https://mikehadlow.blogspot.com/2012/05/configuration-complexity-clock.html). Having tons of configurations come at a tradeoff with cognitive load. Your can make something infinitely parameterizable but that just means the operator needs to fully aware impact of each parameter. The larger the configrations grow, the more likely it is to end up in a combinatorial explosion where each combination cannot be fully tested because of various reasons like:

- Time to test is super high
- certain configurations require special access to special objects/services that are non trivial to setup 
- certains configurations may need a 


## Challenge: Version Control 

All programmers who develop well-used software (especially in open source) have a strong bias towards preserving history and very specific styles of versioning. It's the one thing they need to be very vigilant about 

Writing software that is used by a lot of people is an artistic endaevor. Especially when other people are "using" your software for further building new things. As well-used software ages, the ripple effect of each change is a loooot more. Its like constructing a building where each brick has been intentionally placed. Each brick has an explaination of why it's present for future workers to know what they should do in case the building starts becoming shaky because of it.

I am a stickler for version control. Its my biggest pet peeve when people are not intentional about their commits. A commit message like `updated buggy_file.py` or things like `fix: bug in foo module` gets me really triggered. Secretly I am fucking judging them thinking "bro, 1 year later when i blame that line of code, it will have absolutely no understanding of **WHY** someone made a certain change". Now don't get me wrong. I dont care if the context is not in the message but in the PRs related to it. All such things are fine but when there is a commit with no proper context, I get really riled up. 


Now imagine having a coworker who gives no fucks about the preservation of history. Who shamelessly moves files around all the time making history really hard to keep track of. A coworker, who on a whim starts refactoring the code base. A coworkers who writes code in a way where a "addition" only diff becomes a diff with mixed additions and removals. 

This is the current state of AI "Agents" who type code. Many people have told me that you need to just add these things to the prompt but its not enough. And trust me I have tried. And it doesnt work most of the time. It's same as trying to [make these things stop using em-dashes](https://x.com/chipro/status/1952131790061326593). No matter how much you try (even with prompting), these things don't budge on how they want to do things (some call this an alignment problem but as a user I don't care what problem it's called. I want it to do my thing in the fewest possible steps). The models do write great code! They write like a decently smart programmer when prompted concisely and accurately (with enough context) but they don't have the foresight of someone who writes code like art (I hate equating using titles like "Staff Engineer" to make a point 🤮. Most titles are there to placate one's ego, not qualify one's capability). 

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

The current theory is that most of these models [learn in context](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html). This means that when these models are provided with a concise and accurate context about the thing you desire, these models have a decently high likihood to solve your problem with fewest interactions. In context learning also implies that the models are spunges at runtime. They absorb what you tell them and the quality of what they respond is purely dependent on what you said. Based on this idea, I learnt a few tricks that make my life soooo much easier. 

### Git Patches Are Your Friend. 

One of the biggest cheat-code I learned when trying to make language models write software to my whim is to provide it with a good patch file that contains the diff of how something was done. All the file changes and a commit message that has enough context to explain what it should end up changing. Cursor's symbolic linking of files and objects in a code base are game-changer for making a model make changes to code that might span over multiple files and needs similar changes for the thing you are trying to build. It takes work to create that good clean initial patch but once it's created, it acts like your blueprint to create more such patches to integrate newer such functionality at much faster speeds. The beauty of a git patch is that the blue print is already laid out and the model just needs to follow what you want to do. 