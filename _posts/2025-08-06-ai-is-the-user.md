---
layout: post
title: The AI software engineer is probably decades away
date: 2025-08-06
categories: blog
---
<!-- <br> -->

<!-- > This blog post is full of problems and ideas. It is not meant as a puff piece to point out that "look this stupid model cannot count R's in rigurgitating". Its about pointing out practical problems I face on a day to day basis that inhibit these models/tools from permanently replacing me at my job. I would be the happiest person ever if I can stop programming professionally and just start a bar where I can flirt with cute girls and throw crazy parties. But sadly current age tools are no where that I can just outsource it to some AI and buy myself time and bandwith to start my bar while the thing programs for me in the backgound.  -->

<br>

2025 has seen a [massive capital influx](https://finance.yahoo.com/news/ai-agents-market-size-worth-144400570.html) in things like agents. A shit ton of AI startups are getting funded for **any idea that catches people's eyes**. (some dude got funded for a startup that helps people [cheat on everything](https://x.com/im_roy_lee/status/1936138361011585190)). GPT 5 come out very recently and there is so much conversation on the [interwebs](https://simonwillison.net/2025/Aug/7/gpt-5/) about how its [better](https://x.com/theo/status/1953507203979391011) / [worse](https://x.com/deedydas/status/1953701523978170817). The AI hype wave which started from early 2022 since ChatGPT enamored all of us has only grown in the last 3 years. Tech stocks seem to seriously love the promise of the AGI especially since it allows them [good excuses to layoffs](https://fortune.com/2025/08/07/summer-of-ai-layoffs-july-140-percent-spike-challenger-gray-christmas/) and it also [reduces the need for as many software engineers](https://www.forbes.com/sites/jackkelly/2024/11/01/ai-code-and-the-future-of-software-engineers/). The media [is certainly drinking the coolaid](https://www.nytimes.com/2025/03/14/technology/why-im-feeling-the-agi.html).

<br>

![NASDAQ index since ChatGPT release](/assets/images/nasdaq_nov2022_chatgpt_readable.png)
*NASDAQ growth since the promise of "AGI"*

<br>

All these rablings on twitter/media and from major tech companies have left me thinking that many of these people who talk about AI taking over software engineering haven't operated software that __people built over a long period of time__. Don't get me wrong, many of these people are really intelligent and talented. People who have built software before would realize that most of software engineering is not a technical endeavor. Its rather a socio-technical endaevor. There is a very strong human element (I would say 70%) to building software. 

<br>

> I am not talking about writing code (ie. just programming). I am talking about building something which is shipped to users and needs to be manged and maintained. This thing is not just the code, it's also the resposibilites and effects created by the execution of that code (software engineering).

<br>
This blog article tries to shine light on many such socia-technical facets of S/W engineering that are not trivially "AI-replacable". 

<!-- This includes fascets like: (1) operations , (2) management of source code , (3) communication/context-sharing, (4) debugging problems with partial visibility at scale.   -->


## Software Operations 

Software operations is the most communal part of sofware development. While most of programming happens in a persons head, the operation of that piece of code happens out in public with many other people in picture. Operating code involves so many facets, few of them being like: 

- version control 
- Release cycles 
- QA / Testing and Verifications
- Patching hot fixes and figuring out what breaks the current systems. 

No matter how capable AI's become, eventually they have to interact and talk to other humans since ALL of the software running in the world today is not opearted (or even fully built) by AI. Its operated and built by humans for other humans (internally and externally). This means all the esotric build system, release patterns and even the processes that follow the operationalization of that software. 

### Debugging under partial visibility 

Not all bugs are exposed in a controlled environment. Users run software in the most esoteric ways and especially on infrastructure/settings that you have no control of. 

### Distributed Systems

When you work on large enough systems that have and insane number of moving parts, it starts becoming more and more complicated for arbitrary autonomous systems to start debugging what went wrong. `TODO: Explain why? `

### Monitoring and Tail Events 

What happens when your monitoring solution goes down? Even if AI's figured out things for me the "who's watching the watcher problem" just never ceases to go away. `TODO: Explain why?`

<br>
> There is a world where I see that we have **AI programmers** but I yet dont see a world in the next decade where we have **AI Software Engineer**. Core distinction between an AI programmer and Software engineer is that the programmer is that just **writes and tests some code** but the software engineer operates the code they write. They make "mangement" decisions about shipping, identifying what to build and talking to people to understand why something needs to be built. 
<br>

## Version Control 

Writing software that is used by a lot of people is an artistic endaevor. Especially when other people are "using" your software for further building new things. As the software ages and gets used more, the ripple effect of each change is a loooot more. Its like constructing a building where each brick has been intentionally placed. Each brick has an explaination of why it's present for future workers to know what they should do in case the building starts becoming shaky because of it.

I am a stickler for version control. Its my biggest pet peeve when people are not intentional about their commits. A commit message like `updated buggy_file.py` or things like `fix: bug in foo module` gets me really triggered. Secretly I am fucking judging them thinking "Motherfucker, 1 year later when i blame that line of code, it will have absolutely no understanding of **WHY** someone made a certain change". Now don't get me wrong. I dont care if the context is not in the message but in the PRs related to it. All such things are fine but when there is a commit with no proper context, I get really riled up. 

Now imagine having a coworker who gives no fucks about the preservation of history. Who shamelessly moves files around all the time making history really hard to keep track of. A coworker, who on a whim starts refactoring the code base. A coworkers who writes code in a way where a "addition" only diff becomes a diff with mixed additions and removals. 

This is the current state of AI "Agents" who type code. Many people have told me that you need to just add these things to the prompt but its not enough. And trust me I have tried. And it doesnt work most of the time. It's same as trying to [make these things stop using em-dashes](https://x.com/chipro/status/1952131790061326593). No matter how much you try (even with prompting), these things don't budge on how they want to do things (some call this an alignment problem but as a user I don't care what problem it's called. I want it to do X in the fewest steps possible). They write really pretty code! They write like a decently smart programmer when prompted concisely and accurately (with enough context) but they don't have the foresight of someone who writes code like art (I hate equating using titles like "Staff Engineer" to make a point 🤮. Most titles are there to placate one's ego, not qualify one's capability). 

## Dependency Hell

Every API exposed and used by a piece of software are fare game for all users ([Relevant XKCD](https://xkcd.com/1172/)). `TODO: Give explaination of this`


## What are is the Alternative?

`TODO:` Give qualitative ideas about what might be missing and where are the key gaps in the  


## What I Learned 

The current theory is that most of these models [learn in context](https://transformer-circuits.pub/2022/in-context-learning-and-induction-heads/index.html). This means that when these models are provided with a concise and accurate context about the thing you desire, these models have a decently high likihood to solve your problem with fewest interactions. In context learning also implies that the models are spunges at runtime. They absorb what you tell them and the quality of what they respond is purely dependent on what you said. Based on this idea, I learnt a few tricks that make my life soooo much easier. 

### Git Patches Are Your Friend. 

One of the biggest cheat-code I learned when trying to make language models write software to my whim is to provide it with a good patch file that contains the diff of how something was done. All the file changes and a commit message that has enough context to explain what it should end up changing. Cursor's symbolic linking of files and objects in a code base are game-changer for making a model make changes to code that might span over multiple files and needs similar changes for the thing you are trying to build. It takes work to create that good clean initial patch but once it's created, it acts like your blueprint to create more such patches to integrate newer such functionality at much faster speeds. The beauty of a git patch is that the blue print is already laid out and the model just needs to follow what you want to do. 