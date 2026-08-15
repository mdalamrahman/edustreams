import sqlite3
import json
import os

db_path = os.path.join(os.path.dirname(__file__), "edustream_artifacts.db")
json_path = os.path.join(os.path.dirname(__file__), "ai_cache.json")

os.makedirs(os.path.dirname(db_path), exist_ok=True)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("""
    CREATE TABLE IF NOT EXISTS lecture_artifacts (
        cache_key TEXT PRIMARY KEY,
        chat_id TEXT,
        msg_id INTEGER,
        title TEXT,
        transcript TEXT,
        provider TEXT,
        notes TEXT,
        mcqs_json TEXT,
        coding_problem_json TEXT,
        simulation_steps_json TEXT,
        status TEXT,
        progress_percent REAL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
""")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_title ON lecture_artifacts(title)")
cursor.execute("CREATE INDEX IF NOT EXISTS idx_msg_id ON lecture_artifacts(msg_id)")
conn.commit()

# --- OCP ARTIFACTS ---
ocp_transcript = """[00:00:00]
Welcome back everyone. In this session, we are diving deep into the second principle of SOLID design: the Open-Closed Principle, commonly known as OCP.

[00:01:45]
The formal definition introduced by Bertrand Meyer states: Software entities—including classes, modules, and functions—should be open for extension, but closed for modification. What does this mean in practical software engineering? It means that when requirements change or when you need to add a new feature, you should be able to extend the behavior of the system without modifying existing, tested, and deployed source code.

[00:04:10]
Let us look at a classic anti-pattern that violates OCP. Suppose you have an Invoice or Payment processing class. Inside that class, you have a method calculateDiscount or processPayment that takes a string paymentType and executes a massive switch-case or series of if-else ladders: if type is CreditCard do X, else if type is UPI do Y, else if type is PayPal do Z.

[00:07:30]
Why is this dangerous in production? Every single time your business decides to accept a new payment method, say Apple Pay or Crypto, a developer must open that exact same existing file, add another else-if branch, and re-test all previous payment paths. If you introduce a typo or logical bug, you risk breaking existing, working credit card payments!

[00:10:50]
How do we refactor this to strictly satisfy OCP? We introduce polymorphism and abstraction. We define an abstract interface or base class, for instance IPaymentStrategy or IDiscountCalculator, with a pure virtual method executePayment or calculateDiscount. Each specific payment method becomes its own independent concrete class: CreditCardPayment, UPIPayment, PayPalPayment.

[00:13:40]
Now, the core PaymentProcessor only holds a pointer or reference to IPaymentStrategy. When a new payment method like ApplePay is introduced tomorrow, you write a brand new class ApplePayPayment implementing IPaymentStrategy without touching a single line of PaymentProcessor! The system was extended without modifying existing code. That is the essence of the Open-Closed Principle."""

ocp_notes = """# 📘 2.2 Open-Closed Principle (OCP) — SDE Mastery Guide

---

## 1. Core Mental Model & Definition
The **Open-Closed Principle (OCP)** states:
> **"Software entities (classes, modules, functions) should be open for extension, but closed for modification."**

- **Open for Extension**: The behavior of the module can be extended to satisfy new business requirements.
- **Closed for Modification**: Extending behavior does not require modifying existing, verified, and unit-tested source code.

```
       ❌ VIOLATION (If-Else Ladder)            ✅ OCP COMPLIANT (Polymorphic Interface)
  ┌──────────────────────────────┐              ┌──────────────────────────────┐
  │      PaymentProcessor        │              │       PaymentProcessor       │
  ├──────────────────────────────┤              ├──────────────────────────────┤
  │ if (type == "UPI") ...       │              │ IPaymentStrategy* strategy   │
  │ else if (type == "Card") ... │──▶ Modifies  │ strategy->process(amount)    │
  │ else if (type == "Crypto")...│    Existing  └──────────────┬───────────────┘
  └──────────────────────────────┘      Code                   │
                                                               ▼ (Interface)
                                                ┌──────────────────────────────┐
                                                │     <<IPaymentStrategy>>     │
                                                ├──────────────────────────────┤
                                                │ + processPayment(amount)     │
                                                └──────┬───────┬───────┬───────┘
                                                       │       │       │
                                          ┌────────────┘       │       └────────────┐
                                          ▼                    ▼                    ▼
                                    ┌───────────┐        ┌───────────┐        ┌───────────┐
                                    │ UPIPay    │        │ CardPay   │        │ CryptoPay │
                                    └───────────┘        └───────────┘        └───────────┘
```

---

## 2. Code Implementation & Anti-Pattern Refactoring

### ❌ Anti-Pattern (Violates OCP)
```cpp
// Every new invoice type requires modifying this function!
class InvoicePersistence {
public:
    void save(const Invoice& invoice, string target) {
        if (target == "DB") {
            // Save to MySQL DB
        } else if (target == "FILE") {
            // Save to Local File
        } else if (target == "S3") {
            // Save to AWS S3 Bucket
        }
    }
};
```

### ✅ Production-Grade OCP Design
```cpp
#include <iostream>
#include <memory>
using namespace std;

// 1. Abstract Interface (Closed for Modification)
class IInvoiceDao {
public:
    virtual void save(const Invoice& invoice) = 0;
    virtual ~IInvoiceDao() = default;
};

// 2. Concrete Extensions (Open for Extension)
class DatabaseInvoiceDao : public IInvoiceDao {
public:
    void save(const Invoice& invoice) override {
        cout << "[DB] Invoice successfully persisted to PostgreSQL." << endl;
    }
};

class S3InvoiceDao : public IInvoiceDao {
public:
    void save(const Invoice& invoice) override {
        cout << "[S3] Invoice uploaded to AWS S3 storage." << endl;
    }
};

// 3. High-Level Consumer (Never Modified)
class InvoiceService {
private:
    unique_ptr<IInvoiceDao> dao;
public:
    InvoiceService(unique_ptr<IInvoiceDao> daoInstance) : dao(move(daoInstance)) {}
    void persist(const Invoice& invoice) {
        dao->save(invoice);
    }
};
```

---

## 3. Trade-off Matrix & Engineering Analysis

| Dimension | Monolithic If-Else Ladder | OCP Polymorphic Abstraction |
| :--- | :--- | :--- |
| **Code Modifiability** | High Risk of Breaking Existing Logic | Zero Risk (Purely Additive Code) |
| **Unit Testability** | Requires Regression Testing All Paths | Only New Extension Class Needs Tests |
| **Complexity Overhead** | Simple initially, Unmaintainable later | Requires Interface Design & Factories |
| **Design Patterns Used** | Anti-Pattern | Strategy, Factory, Decorator Pattern |

---

## 4. FAANG Interview Traps & Key Takeaways
1. **Abstraction Overhead Trap**: Do not create interfaces for things that will never change. Apply OCP where requirements are volatile or expanding.
2. **Strategy Pattern Synergy**: OCP is most commonly implemented using the **Strategy Pattern** combined with **Dependency Injection**.
"""

ocp_mcqs = [
    {
        "id": "ocp-mcq-1",
        "type": "MCQ",
        "question": "What is the primary objective of the Open-Closed Principle (OCP)?",
        "options": [
            "Allow systems to extend behavior without modifying existing tested source code",
            "Make all class variables public for open access",
            "Ensure classes have only one method",
            "Prevent any new features from being added to existing classes"
        ],
        "correct_answer": 0,
        "explanation": "OCP ensures that software modules are open for extension (adding new behaviors) but closed for modification (not editing existing, working code)."
    },
    {
        "id": "ocp-mcq-2",
        "type": "MCQ",
        "question": "Which design pattern is most commonly used to adhere to the Open-Closed Principle?",
        "options": [
            "Singleton Pattern",
            "Strategy Pattern with Polymorphic Interfaces",
            "Monostate Pattern",
            "God Object Pattern"
        ],
        "correct_answer": 1,
        "explanation": "The Strategy Pattern enables dynamic substitution of algorithms via interfaces without changing the consumer class, directly fulfilling OCP."
    },
    {
        "id": "ocp-mcq-3",
        "type": "MCQ",
        "question": "Why is an if-else ladder based on type codes considered a violation of OCP?",
        "options": [
            "It executes slower on CPU branch predictors",
            "Adding a new type requires modifying and re-testing the existing conditional logic",
            "It cannot compile in modern C++",
            "If-else statements are deprecated in object-oriented programming"
        ],
        "correct_answer": 1,
        "explanation": "Every new variant forces developers to edit the existing conditional file, risking regressions in previously working branches."
    },
    {
        "id": "ocp-mcq-4",
        "type": "MCQ",
        "question": "In C++, how is 'Closed for Modification' achieved while remaining 'Open for Extension'?",
        "options": [
            "Using pure virtual abstract base classes and inheritance",
            "Declaring all methods static and private",
            "Disabling compiler warnings with pragma directives",
            "Using inline global functions"
        ],
        "correct_answer": 0,
        "explanation": "Abstract base classes establish an unmodifiable contract while subclasses implement new behaviors polymorphically."
    },
    {
        "id": "ocp-mcq-5",
        "type": "MCQ",
        "question": "When should you NOT aggressively apply OCP?",
        "options": [
            "When requirements are completely stable and no future variations are anticipated",
            "In high-concurrency distributed systems",
            "When building enterprise financial software",
            "When writing unit test assertions"
        ],
        "correct_answer": 0,
        "explanation": "Over-engineering with premature abstractions for components that never change adds unnecessary indirection without benefit."
    }
]

ocp_coding = {
    "title": "Design an Extensible Notification Engine (OCP Compliance)",
    "difficulty": "Medium",
    "problem_statement": "Design an extensible notification service that can dispatch messages across multiple channels (Email, SMS, Slack, Discord). The system MUST adhere to OCP: adding a new notification channel must NOT modify existing dispatch logic.",
    "starter_code_cpp": """#include <iostream>
#include <vector>
#include <memory>
#include <string>
using namespace std;

// 1. Base Notification Strategy Interface
class INotificationStrategy {
public:
    virtual void sendNotification(const string& recipient, const string& message) = 0;
    virtual ~INotificationStrategy() = default;
};

// 2. Concrete Implementation for Email
class EmailNotification : public INotificationStrategy {
public:
    void sendNotification(const string& recipient, const string& message) override {
        cout << "[Email] Sent to " << recipient << ": " << message << endl;
    }
};

// 3. Concrete Implementation for SMS
class SMSNotification : public INotificationStrategy {
public:
    void sendNotification(const string& recipient, const string& message) override {
        cout << "[SMS] Sent to " << recipient << ": " << message << endl;
    }
};

// 4. Extensible Notification Dispatcher (Never Modified)
class NotificationService {
private:
    vector<shared_ptr<INotificationStrategy>> strategies;
public:
    void addChannel(shared_ptr<INotificationStrategy> channel) {
        strategies.push_back(channel);
    }
    
    void broadcast(const string& recipient, const string& message) {
        for (auto& channel : strategies) {
            channel->sendNotification(recipient, message);
        }
    }
};

int main() {
    NotificationService service;
    service.addChannel(make_shared<EmailNotification>());
    service.addChannel(make_shared<SMSNotification>());
    
    service.broadcast("user@edustream.com", "System Alert: CPU load > 90%");
    return 0;
}""",
    "starter_code_python": """class INotificationStrategy:
    def send(self, recipient: str, message: str):
        raise NotImplementedError

class EmailNotification(INotificationStrategy):
    def send(self, recipient: str, message: str):
        print(f"[Email] Sent to {recipient}: {message}")

class SMSNotification(INotificationStrategy):
    def send(self, recipient: str, message: str):
        print(f"[SMS] Sent to {recipient}: {message}")

class NotificationService:
    def __init__(self):
        self.channels = []
        
    def add_channel(self, channel: INotificationStrategy):
        self.channels.append(channel)
        
    def broadcast(self, recipient: str, message: str):
        for ch in self.channels:
            ch.send(recipient, message)

if __name__ == '__main__':
    service = NotificationService()
    service.add_channel(EmailNotification())
    service.add_channel(SMSNotification())
    service.broadcast('user@edustream.com', 'System Alert: OCP Compliant')"""
}

ocp_sim = [
    {
        "step_number": 1,
        "title": "Step 1: Identifying Anti-Pattern (If-Else Ladder)",
        "desc": "Single monolithic function handles Email, SMS, and WhatsApp using conditional branches. Adding Slack requires modifying existing code.",
        "array": ["EmailBranch", "SMSBranch", "WhatsAppBranch", "MonolithicService"],
        "activeIndices": [0, 1, 2],
        "status": "Tight Coupling Detected (OCP Violation)",
        "variables": {"Coupling": "High", "Extensibility": "Rigid", "Regression Risk": "Severe"}
    },
    {
        "step_number": 2,
        "title": "Step 2: Defining Abstract INotification Interface",
        "desc": "Extracting abstract contract INotificationStrategy with virtual send() method. Establishing boundary closed for modification.",
        "array": ["<<INotificationStrategy>>", "EmailHandler", "SMSHandler", "WhatsAppHandler"],
        "activeIndices": [0],
        "status": "Abstract Contract Established",
        "variables": {"Contract": "send()", "Polymorphism": "Enabled", "Indirection": "Clean"}
    },
    {
        "step_number": 3,
        "title": "Step 3: Creating Independent Concrete Channels",
        "desc": "EmailNotification and SMSNotification become isolated classes implementing INotificationStrategy without cross-dependencies.",
        "array": ["EmailStrategy", "SMSStrategy", "SlackStrategy (NEW)"],
        "activeIndices": [0, 1, 2],
        "status": "Decoupled Strategy Classes",
        "variables": {"Unit Testable": "100%", "Side Effects": "Zero", "OCP Status": "Satisfied"}
    },
    {
        "step_number": 4,
        "title": "Step 4: Extension Without Modification",
        "desc": "Adding new SlackNotification class requires ZERO changes to NotificationService or existing Email/SMS handlers.",
        "array": ["NotificationDispatcher", "EmailStrategy", "SMSStrategy", "SlackStrategy"],
        "activeIndices": [0, 3],
        "status": "Pure Additive Extension Verified",
        "variables": {"Extension": "Seamless", "Existing Code Touched": "0 Lines", "OCP Compliance": "100%"}
    }
]

ocp_record = {
    "chat_id": "ch-sd-02",
    "msg_id": 5999,
    "title": "2.2 Open Closed Principle (OCP) (Solid Principles)",
    "transcript": ocp_transcript,
    "provider": "EduStream AI Speech Engine",
    "notes": ocp_notes,
    "mcqs": ocp_mcqs,
    "coding_problem": ocp_coding,
    "simulation_steps": ocp_sim,
    "status": "completed",
    "progress_percent": 100.0,
    "current_part": 30,
    "total_parts": 30,
    "stage": "Completed",
    "has_artifacts": True,
    "estimated_seconds_left": 0
}

# Insert into SQLite for all key formats
keys_to_seed = [
    "ch-sd-02_5999",
    "-1004329144420_5999",
    "5999",
    "tg-ch-sd-02-5999",
    "tg--1004329144420-5999",
    "2.2 Open Closed Principle (OCP) (Solid Principles)",
    "2.2 Open Closed Principle",
    "Open Closed Principle",
    "2.2 Open Closed Principle (OCP) (Solid Principles).mp4"
]

for key in keys_to_seed:
    cursor.execute("""
        INSERT INTO lecture_artifacts 
        (cache_key, chat_id, msg_id, title, transcript, provider, notes, mcqs_json, coding_problem_json, simulation_steps_json, status, progress_percent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(cache_key) DO UPDATE SET
            title=excluded.title,
            transcript=excluded.transcript,
            provider=excluded.provider,
            notes=excluded.notes,
            mcqs_json=excluded.mcqs_json,
            coding_problem_json=excluded.coding_problem_json,
            simulation_steps_json=excluded.simulation_steps_json,
            status=excluded.status,
            progress_percent=excluded.progress_percent
    """, (
        key,
        "ch-sd-02",
        5999,
        "2.2 Open Closed Principle (OCP) (Solid Principles)",
        ocp_transcript,
        "EduStream AI Speech Engine",
        ocp_notes,
        json.dumps(ocp_mcqs),
        json.dumps(ocp_coding),
        json.dumps(ocp_sim),
        "completed",
        100.0
    ))

conn.commit()
conn.close()

# Also write to ai_cache.json
cache_data = {}
if os.path.exists(json_path):
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            cache_data = json.load(f)
    except:
        pass

for k in keys_to_seed:
    cache_data[k] = ocp_record

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(cache_data, f, indent=2)

print("SUCCESS: Populated SQLite DB and ai_cache.json with OCP artifacts!")
