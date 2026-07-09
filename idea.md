你描述的其实已经接近 **AI-native Software Engineering Harness（智能软件工程编排框架）** 的设计了。目标不是简单写几个 agent，而是构建一个“AI 软件团队操作系统”：多个 agent 分工协作，有记忆、有规则、有反馈循环，最终提高大型项目开发质量。

类似的方向目前叫：

* **Agentic Software Development System**
* **Multi-Agent Coding Harness**
* **AI Engineering Workflow**
* **Software Development Copilot Infrastructure**

你想实现的东西可以参考：

* SWE-agent
* OpenHands
* LangGraph
* CrewAI
* AutoGen

---

# 1. 你需要设计的整体架构

我建议不要从“写 agent”开始，而是从 **Software Engineering Lifecycle** 开始设计。

一个成熟架构大概：

```
                         Human Product Owner
                                |
                                |
                         Requirement Agent
                                |
                                v

                      ┌──────────────────┐
                      │ Project Memory   │
                      │ Knowledge Base   │
                      └──────────────────┘
                                |
                                |
       ------------------------------------------------
       |                    |                         |
       v                    v                         v

  Architect Agent     Developer Agents          QA Agents

       |                    |                         |
       |                    |                         |
       v                    v                         v

 System Design        Code Generation          Browser Testing
 API Design           Refactoring              Regression Test
 DB Design            Unit Test                E2E Test


       ------------------------------------------------

                                |
                                v

                         Reviewer Agent

                                |
                                v

                    Code Quality Database

                                |
                                v

                    Learning Feedback Loop

```

---

# 2. Agent 分类设计

不要设计一个万能 agent。

大型项目应该像真实公司一样：

```
agents/

├── architect/
│   ├── system_design_agent
│   ├── database_agent
│   └── api_design_agent
│
├── development/
│   ├── frontend_agent
│   ├── backend_agent
│   └── refactor_agent
│
├── testing/
│   ├── browser_test_agent
│   ├── unit_test_agent
│   └── security_test_agent
│
├── review/
│   ├── code_review_agent
│   ├── architecture_review_agent
│   └── performance_review_agent
│
└── knowledge/
    ├── mistake_memory_agent
    └── documentation_agent

```

---

# 3. Developer Agent

负责：

* 根据 issue 开发
* 阅读 architecture doc
* 修改代码
* 写测试
* 提交 PR

输入：

```json
{
 "task":
 "Implement user authentication API",

 "requirements":[
   "JWT authentication",
   "refresh token",
   "bcrypt password hashing"
 ],

 "architecture":{
    "backend":"Koa",
    "database":"MySQL"
 }
}

```

输出：

```
Developer Agent

1. Analyze existing code
2. Modify files
3. Add tests
4. Run lint
5. Create commit

```

---

# 4. Reviewer Agent（你重点想做的）

这个非常重要。

不要让 reviewer 只看代码。

应该设计成：

```
PR Created
     |
     v

Reviewer Agent

     |
     |
     +---- Coding Standard Check
     |
     +---- Architecture Check
     |
     +---- Security Check
     |
     +---- Performance Check
     |
     +---- Test Coverage Check

     |
     v

Review Report

```

---

例如：

代码：

```javascript
async function createUser(req,res){

 const user = await User.create(req.body)

 res.json(user)

}

```

Reviewer:

```
Finding:

Severity:
HIGH

Category:
Security


Problem:

Password field is directly stored from request.


Why:

User input should never be trusted.

Recommended:

const hash =
 await bcrypt.hash(password,10)


Rule Created:

SEC-001


Future agents should avoid:

"Never store raw password"

```

---

然后存入：

```
knowledge/

security_rules.json

```

例如：

```json
{
 "rule_id":"SEC-001",

 "description":
 "Never store raw password",

 "bad_example":
 "User.create(req.body)",

 "good_example":
 "bcrypt.hash(password)",

 "created_by":
 "reviewer-agent",

 "times_detected":23
}

```

以后 Developer Agent 每次 coding：

先读取：

```
knowledge/security_rules.json

```

于是：

```
Developer Agent:

Before writing code:

Check:
- security rules
- architecture rules
- previous mistakes

```

这就是你说的：

> 让其他开发agent学习并且不再犯这样的错误

---

# 5. Browser Test Agent

你的想法很好。

类似：

```
Browser Agent

Input:

Feature:
"Create tenant"


Steps:

1. Login admin
2. Navigate tenant page
3. Click create
4. Fill form
5. Submit
6. Verify database result


Tools:

Playwright
Browser automation

```

例如：

Agent生成：

```typescript
test(
 "Create tenant successfully",
 async({page})=>{

 await page.goto("/login")

 await page.fill(
 "#email",
 "admin@test.com"
 )

 await page.click(
 "button[type=submit]"
 )

 await page.click(
 "text=Create Tenant"
 )

 await expect(
 page.locator(".success")
 )
 .toBeVisible()

})

```

---

# 6. 需要一个 Memory System

这是最关键的部分。

不要只保存聊天记录。

应该结构化。

例如：

```
memory/

├── architecture/
│
│   ├── frontend.md
│   ├── backend.md
│
├── decisions/
│
│   ├── ADR-001-use-sequelize.md
│
├── mistakes/
│
│   ├── frontend.json
│   ├── backend.json
│
├── patterns/
│
│   ├── good-code.json

```

---

例如：

mistakes/backend.json

```json
[
 {
  "problem":
  "Using multiple database transactions incorrectly",

  "example":
  "sequelize.transaction()",


  "solution":
  "Use correct sequelize instance",

  "affected_files":
  [
   "user.service.ts"
  ]
 }
]

```

---

# 7. 最重要：建立 Feedback Loop

真正厉害的系统：

不是：

```
Agent -> Code

```

而是：

```
Agent
 |
 v
Code
 |
 v
Reviewer
 |
 v
Mistakes
 |
 v
Knowledge Base
 |
 v
Better Agent

```

这是：

**Self Improving Engineering System**

---

# 8. 推荐项目结构

我建议：

```
ai-engineering-harness/


├── agents/

│
├── workflows/

│
├── memory/

│
├── tools/

│
├── prompts/

│
├── policies/

│
├── evaluations/


├── projects/

│
└── reports/


```

---

# 9. Prompt Template

例如：

`reviewer_agent.md`

```
You are a senior software engineer.

Your responsibility:

Review every pull request.

Check:

1. Correctness
2. Security
3. Maintainability
4. Scalability
5. Test coverage


For every issue:

Output:

{
 severity,
 category,
 file,
 line,
 problem,
 explanation,
 recommendation,
 rule_to_remember
}


Do not approve code that violates existing rules.

Before review:

Read:

/memory/mistakes
/memory/architecture
/policies

```

---

# 10. 推荐学习路线

不要一开始做超级复杂。

阶段：

## Phase 1

做：

```
Developer Agent
+
Reviewer Agent

```

目标：

自动：

```
Issue
 |
Agent Coding
 |
PR
 |
Review

```

---

## Phase 2

加入：

```
Browser Test Agent

```

使用：

* Playwright
* Chrome DevTools Protocol

---

## Phase 3

加入：

```
Memory System

```

让 agent 学习。

---

## Phase 4

加入：

```
Architect Agent

```

可以自动：

* 设计 API
* 设计 DB
* 生成 ADR

---

# 11. 可以参考的开源模板

推荐研究：

### SWE-agent

重点看：

* agent loop
* tool calling
* repository navigation

### OpenHands

重点看：

* coding agent architecture
* sandbox execution

### LangGraph

重点看：

* workflow orchestration
* state machine

### AutoGen

重点看：

* multi-agent conversation

---

# 12. 如果我是你，我会这样开始

结合你现在做的 HCS Admin / Angular / Koa / Sequelize 项目，我会设计：

```
HCS AI Engineering Harness


Agents:

1. Requirement Agent

2. Angular Developer Agent

3. Backend Koa Agent

4. Sequelize Database Agent

5. Playwright Test Agent

6. Security Reviewer Agent

7. Architecture Reviewer Agent


Memory:

- Angular mistakes
- Sequelize mistakes
- API design decisions
- Security rules


Workflow:

Jira Issue
 |
Requirement Agent
 |
Developer Agent
 |
Test Agent
 |
Reviewer Agent
 |
Merge

```

你的项目非常适合作为实验场，因为它已经有：

* frontend
* backend
* database
* websocket
* AWS
* authentication
* testing

正好覆盖一个完整企业软件生命周期。

如果要做到“软件工程最佳实践”，核心不是让 agent 写更多代码，而是建立 **规范（rules）→ 执行（agents）→ 审查（reviewers）→ 学习（memory）** 的闭环。你描述的方向基本就是未来 AI 软件公司的基础架构。







https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md
用一下这个skill帮助refactor项目。


have reviewer agents to review 
look at  every push and ci


provide a prompt or lint failure to avoid this failure in the future
write automated test to click on the forntend browser and verify the end result is correct


rules files
skills files
lint error messages
review agents



Agent harness
1：tool registry
2：model
3：context management
4：guardrails  (max steps )(do not do more than 5 tools calls)
5: agent loop
6: verify



run harness attempt, maximum 2 attempts or give up.


verifySuccessfulUpVote

write some deterministic function


test driven development


 extract as much deterministic verifiable actions as possible and provide them as rule-based pieces of code helpers for efficient token usage. When exhausted all rule-based harnessing possibilities, move to tweaking your system prompt. And that is an example of  good harnessing. 


 