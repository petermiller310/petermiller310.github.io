+++
date = "2025-03-02T12:10:36-08:00"
draft = false
title = "agentic workflows with langgraph and browser-use: building an ai-powered apartment search tool"
+++

# agentic workflows with langgraph and browser use: building an ai-powered apartment search tool

the rapid advancement of multimodal models with powerful vision capabilities has opened exciting new possibilities for ai applications, particularly in the realm of autonomous web agents. with openai's operator and deep research showcasing what's possible, there's growing industry momentum toward building agentic systems that can perceive, reason about, and interact with web interfaces. in this project, i implemented a simple web agent that navigates craigslist housing listings using `browser-use` for web navigation, `langgraph` for workflow/prompt orchestration, and `remix` for the frontend. this combination of technologies enables an end-to-end solution that accepts natural language queries, autonomously searches apartment listings, and presents structured results—showcasing how these emerging tools can be combined to create powerful applications with minimal development effort.


<video width="100%" controls>
  <source src="/videos/cl-agentic-workflow-1.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

code: https://github.com/petermiller310/craigslist-agent

## webvoyager: a vision-enabled web-browsing agent

[webvoyager](https://arxiv.org/abs/2401.13919) marked a significant advancement in autonomous web agents by integrating several key techniques:

1. **visual perception of web elements**: using screenshots to understand page layout and content
2. **set-of-marks annotations**: highlighting interactive elements with bounding boxes
3. **action space definition**: providing a set of primitive actions (click, type, scroll)
4. **function calling**: utilizing structured function calls to execute actions reliably
5. **[ReAct](https://arxiv.org/abs/2210.03629) loop implementation**: continuous observation, reasoning, and action

these techniques enabled ai agents to navigate websites with unprecedented autonomy, but implementing them required specialized knowledge and significant engineering effort. the academic research was powerful, but the prompt orchestration needed to make it work was a technical challenge for most developers.

## browser-use: a clean interface for complex web navigation

`browser-use` is an open-source library that abstracts away the complexities of connecting LLMs to web browsers. it provides a clean, straightforward interface for developers to build web automation tools without dealing with the intricate details of browser control, visual processing, and prompt orchestration.

with just a few lines of code, developers can create agents capable of complex web navigation tasks that previously required specialized expertise. `browser-use` handles:

1. **browser initialization and management**: launching and controlling browser instances
2. **visual perception**: capturing screenshots and processing visual information
3. **element identification**: detecting interactive elements on the page
4. **action execution**: clicking, typing, scrolling, and other interactions

### the ReAct pattern: reasoning + acting

what makes `browser-use` particularly powerful is its implementation of the ReAct pattern (reasoning + acting), which enables agents to alternate between reasoning about the current state and taking actions in the environment. this approach allows agents to:

1. **reason about observations**: analyze what they see on the page
2. **plan next steps**: determine the most appropriate action
3. **execute actions**: interact with the web interface
4. **observe results**: process feedback from the environment
5. **adjust strategy**: modify plans based on new information

this tight loop of reasoning and acting creates more robust agents capable of handling complex, multi-step tasks that require adaptation to changing environments.

### visual affordances and bounding boxes

the set-of-marks technique from webvoyager is implemented through `browser-use`'s built-in capabilities:

`browser-use` automatically:
1. takes screenshots of the current page
2. identifies interactive elements
3. annotates them with bounding boxes
4. provides this visual context to the llm

this approach allows the agent to "see" the page as a human would, identifying buttons, forms, and other interactive elements through their visual appearance and position.

### action space and reasoning

`browser-use` implements a "computer-use" action space for web navigation, which includes several core primitives:

1. **click**: interacting with buttons, links, and other clickable elements
2. **type**: entering text into form fields
3. **scroll**: navigating through content that doesn't fit on screen

these represent just a few of the core actions available; the full action space is more comprehensive. beyond these built-in actions, `browser-use` allows developers to extend the action space with custom functions that the model can choose from when navigating the web, enabling specialized behaviors tailored to specific use cases.

the library sequences these primitive actions to accomplish complex tasks, using the ReAct loop to continuously observe, reason, and act.

### function calling and structured outputs

function calling is the critical capability that enables LLMs to reliably interact with external tools and apis. it allows models to:

1. **recognize when a tool is needed**: identify when a task requires external functionality
2. **structure the appropriate call**: format arguments correctly for the target function
3. **interpret and use results**: process the returned data to continue the task

after the agent navigates through the website and achieves its task, extracting structured data is surprisingly simple. all you need to do is provide the LLM with a `pydantic` model, and it will automatically extract and organize the information. for example, this `pydantic` model captures all the essential details from a craigslist apartment listing:

```python
class ListingDetails(BaseModel):
    title: str = Field(description="title of the listing")
    price: str= Field(description="a dollar string for the price of the apartment for example $3,000 or $3000")
    location: str = Field(description="location of the apartment")
    address: Optional[str] = Field(
        None, description="approximate address of the apartment"
    )
    url: str = Field(description="url of the listing")
    bedrooms: int = Field(description="number of bedrooms")
    bathrooms: Optional[float] = Field(None, description="number of bathrooms")
    description: str = Field(description="description of the apartment")
    images: List[str] = Field(
        default_factory=list, description="urls of listing images"
    )
```

this approach forces the model to return data in a consistent format, making downstream processing more reliable and reducing the need for error handling. the field descriptions also help guide the model to extract the right information from the webpage.

## building agentic workflows with langgraph

`langgraph`'s state management capabilities complement `browser-use`'s react pattern perfectly. while browser-use handles the reasoning-action loop for web navigation, `langgraph` orchestrates the overall workflow, managing transitions between different states and ensuring that the agent follows a coherent process from start to finish.

this graph-based approach provides several advantages:

1. **clear separation of concerns**: each node handles a specific task
2. **explicit state management**: all data is passed through a well-defined state object
3. **error handling and recovery**: the system can retry specific nodes or take alternative paths
4. **maintainability**: components can be tested and updated independently

### the agency-orchestration spectrum

my journey with this project revealed a critical insight about balancing agency and structure:

initially, i gave `gpt-4o` a single broad instruction: "search craigslist for apartments matching these criteria." it could handle the entire workflow—navigating menus, applying filters, and extracting listings—but with significant drawbacks:
- the cost was prohibitively high (those tokens add up quickly!)
- reliability varied, especially when dealing with many types of filters
- debugging was cumbersome when things went wrong

by shifting to a more structured approach with `langgraph`, i broke the process into smaller, discrete steps. this allowed me to:
- use `gpt-4o-mini` for most tasks, dramatically reducing costs
- create more predictable behavior with explicit transitions
- test and debug each component independently

the key insight wasn't choosing one approach over another, but understanding their tradeoffs. full agency works for novel, complex tasks where flexibility matters most. structured orchestration excels when reliability, cost, and maintainability are priorities.

### key learnings: model specialization, reflection loops, and future directions

building this tool reinforced a practical insight about ai system design—the power of specialized model roles. using `gpt-4o` as a "planner" while delegating execution to `gpt-4o-mini` created a sweet spot for cost/performance. this approach slashed costs dramatically without meaningful quality degradation, proving that we don't always need our most powerful models handling every workflow step.

as openai moves toward custom-tuned models specifically designed for "computer use" tasks, this specialization strategy will become even more effective. purpose-built models optimized for web navigation could further reduce costs while improving reliability in these domain-specific tasks.

future iterations should leverage a reflection-style multi agent architecture. my current linear graph works but lacks robustness against common failures—hallucinated urls, incomplete filter application, and geocoding errors. implementing critique agents to evaluate and improve the main agent's output would create self-correcting loops that increase reliability without constant human babysitting.

a few practical enhancements that would transform this from proof-of-concept to production-ready:
- semantic reranking of results using cohere's reranker
- reflection-based verification for geocoding queries
- failure recovery mechanisms for retry loops

what i've learned from this project is that current models can already handle most practical tasks—success often comes down to how you structure the problem rather than waiting for more powerful ai. thoughtful orchestration, strategic model selection, and well-designed workflows can create systems that are both capable and cost-effective today.

## resources

- [browser-use](https://github.com/browser-use/browser-use)
- [langgraph](https://langchain-ai.github.io/langgraph/)
- [anthropic: building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [webvoyager](https://arxiv.org/abs/2401.13919)
- [react](https://arxiv.org/abs/2210.03629)

