---
layout: post
title: AI Is Just Another User
date: 2025-08-06
categories: blog
---
<br>
> This blog post is full of problems and ideas. It is not meant as a puff piece to point out that "look this stupid model cannot count R's in rigurgitating". Its about pointing out practical problems I face on a day to day basis that inhibit these models/tools from permanently replacing me at my job. I would be the happiest person ever if I can stop programming professionally and just start a bar where I can flirt with cute girls and throw crazy parties. But sadly current age tools are no where that I can just outsource it to some AI and buy myself time and bandwith to start my bar while the thing programs for me in the backgound. 


GPT 5 has just come out and there is so much conversation on the interwebs about how its better/worse at coding. 2025 has seen a massive capital boom in things like agents. A shit ton of startups are getting funded for **any idea** they can pull out of thier ass.  Some fucker goes viral on twitter telling people to [cheat on everything gets funded serious](https://x.com/im_roy_lee/status/1936138361011585190) `$`. But no matter how much `$` YC and A16Z puts in these numb nuts, most of them have never built software with others to understand that an arbitrary product cannot be trivially integrated with humans to just replace the human software engineer. 

All these rablings on twitter leave me thinking that most of these people who talk about AI taking over software engineering haven't operated software that they built over a long period of time. Don't get me wrong, many of these people are really intelligent and talented but it seems that they haven't actully **built and operated** software that is used everyday, downloaded millions of times and is consumed by engineers outside their own organization. If they had done these things before then would realize that most of software engineering is not a technical endeavor. Its rather a socio-technical endaevor. There is a very strong human element (I would say 70%) to building software communally. This blog article tries to shine light on many such socia-technical facets of S/W engineering that 

<!-- This includes fascets like: (1) operations , (2) management of source code , (3) communication/context-sharing, (4) debugging problems with partial visibility at scale.   -->


## Biggest Blockers to replace me

### Software Operations 

Software operations is the most communal part of sofware development. While most of programming happens in a persons head, the operation of that piece of code happens out in public with many other people in picture. Operating code involves so many facets, few of them being like: 

- version control 
- Release cycles 
- QA / Testing and Verifications
- Patching hot fixes and figuring out what breaks the current systems. 

No matter how capable AI's become, eventually they have to interact and talk to other humans since ALL of the software running in the world today is not opearted (or even fully built) by AI. Its operated and built by humans for other humans (internally and externally). This means all the esotric build system, release patterns and even the processes that follow the operationalization of that software. 

#### Debugging under partial visibility 

Not all bugs are exposed in a controlled environment. Users run software in the most esoteric ways and especially on infrastructure/settings that you have no control of. 

#### Distributed Systems

When you work on large enough systems that have and insane number of moving parts, it starts becoming more and more complicated for arbitrary autonomous systems to start debugging what went wrong. TODO: Explain why? 

#### Monitoring and Tail Events 

What happens when your monitoring solution goes down? Even if AI's figured out things for me the "who's watching the watcher problem" just never ceases to go away. TODO: Explain why?

> There is a world where I see that we have **AI programmers** but I yet dont see a world in the next decade where we have **AI Software Engineer**. Core distinction between an AI programmer and Software engineer is that the programmer is that just **writes and tests some code** but the software engineer operates the code they write. They make "mangement" decisions about shipping, identifying what to build and talking to people to understand why something needs to be built. 


### Version Control 

Writing software that is used by a lot of people is an artistic endaevor. Especially when other people are "using" your software for further building new things. As the software ages and gets used more, the ripple effect of each change is a loooot more. Its like constructing a building where each brick has been intentionally placed. Each brick has an explaination of why it's present for future workers to know what they should do in case the building starts becoming shaky because of it.

I am a stickler for version control. Its my biggest pet peeve when people are not intentional about their commits. A commit message like `updated buggy_file.py` or things like `fix: bug in foo module` gets me really triggered. Secretly I am fucking judging them thinking "Motherfucker, 1 year later when i blame that line of code, it will have absolutely no understanding of **WHY** someone made a certain change". Now don't get me wrong. I dont care if the context is not in the message but in the PRs related to it. All such things are fine but when there is a commit with no proper context, I get really riled up. 

Now imagine having a coworker who gives no fucks about the preservation of history. Who shamelessly moves files around all the time making history really hard to keep track of. A coworker, who on a whim starts refactoring the code base. A coworkers who writes code in a way where a "addition" only diff becomes a diff with mixed additions and removals. 

This is the current state of AI "Agents" who type code. Many people have told me that you need to just add these things to the prompt but its not enough. And trust me I have tried. They write really pretty code! They write like a decently smart programmer when prompted concisely and accurately (with enough context) but they don't have the foresight of someone who writes code like art (I hate equating such things to titles like "Staff Engineer" 🤮). 

### Dependency Hell

Every API exposed and used by piece of software are [fare game for all users.](https://xkcd.com/1172/)  
