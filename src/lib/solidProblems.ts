import { SupportedLanguage } from './compiler';
import type { ProblemTemplate } from './problemService';

export const SOLID_PREDEFINED_PROBLEMS: Record<string, ProblemTemplate> = {
  '2-2-open-closed-principle-ocp-': {
    name: 'Open-Closed Principle (OCP) - Extensible Payment & Discount Processing Engine',
    category: 'Low Level Design',
    difficulty: 'Medium',
    description: `Design an extensible checkout and payment processing engine adhering strictly to the **Open-Closed Principle (OCP)** from SOLID design principles.

The **Open-Closed Principle (OCP)** states:
> *"Software entities (classes, modules, functions) should be open for extension, but closed for modification."*

In this system:
1. Discount policies and payment processing strategies can be extended polymorphically without modifying existing core classes.
2. The system supports multiple payment gateways (e.g. **"CreditCard"**, **"UPI"**, **"PayPal"**, **"Crypto"**).
3. The system supports multiple customer discount tiers (**"Regular"**, **"Premium"**, **"VIP"**).

Implement the \`Solution\` class (or interface facade):
- \`int initialize(vector<string> paymentMethods)\`: Registers the active payment gateways and returns the count of registered gateways.
- \`double calculateDiscount(string customerType, double baseAmount)\`: Calculates the final amount after discount:
  - **"Regular"**: 0% discount (returns \`baseAmount\`)
  - **"Premium"**: 10% discount (returns \`round(baseAmount * 0.9 * 100) / 100\`)
  - **"VIP"**: 20% discount (returns \`round(baseAmount * 0.8 * 100) / 100\`)
  - Any other customer type: 0% discount (returns \`baseAmount\`)
- \`bool processPayment(string paymentMethod, double amount)\`: Attempts to process a payment through the given method. Returns \`true\` if \`paymentMethod\` is registered and \`amount > 0\`, \`false\` otherwise.
- \`string getPaymentStatus(string paymentMethod)\`: Returns \`"Active"\` if \`paymentMethod\` is registered, \`"Unsupported"\` otherwise.

### Example 1:
\`\`\`
Input:
initialize(["CreditCard", "UPI", "PayPal"]), calculateDiscount("VIP", 200.0), processPayment("UPI", 180.0), processPayment("Crypto", 50.0), getPaymentStatus("CreditCard"), getPaymentStatus("Crypto")

Output:
3, 160.0, true, false, "Active", "Unsupported"
\`\`\`

### Constraints:
- \`0 <= paymentMethods.length <= 50\`
- \`0.0 <= baseAmount, amount <= 1000000.0\`
- Strings contain standard alphanumeric characters.`,
    examples: [
      {
        input: 'initialize(["CreditCard", "UPI", "PayPal"]), calculateDiscount("VIP", 200.0), processPayment("UPI", 180.0), processPayment("Crypto", 50.0), getPaymentStatus("CreditCard"), getPaymentStatus("Crypto")',
        output: '3, 160.0, true, false, "Active", "Unsupported"',
        explanation: 'Initialize with 3 gateways. VIP gets 20% off $200 = $160. UPI is active and amount > 0, Crypto is unsupported.'
      },
      {
        input: 'initialize(["UPI", "Crypto"]), calculateDiscount("Regular", 100.0), calculateDiscount("Premium", 100.0), processPayment("Crypto", 100.0)',
        output: '2, 100.0, 90.0, true',
        explanation: 'Regular gets 0% discount ($100), Premium gets 10% discount ($90). Crypto is supported.'
      }
    ],
    constraints: [
      '0 <= paymentMethods.length <= 50',
      '0.0 <= baseAmount, amount <= 1000000.0',
      'At most 1000 calls across all operations.'
    ],
    testCases: [
      'initialize(["CreditCard", "UPI", "PayPal"]), calculateDiscount("VIP", 200.0), processPayment("UPI", 180.0), processPayment("Crypto", 50.0), getPaymentStatus("CreditCard"), getPaymentStatus("Crypto")',
      'initialize(["UPI", "Crypto"]), calculateDiscount("Regular", 100.0), calculateDiscount("Premium", 100.0), processPayment("Crypto", 100.0)',
      'initialize(["CreditCard"]), processPayment("CreditCard", 0.0), processPayment("CreditCard", 50.0), getPaymentStatus("UPI")',
      'initialize([]), processPayment("UPI", 100.0), calculateDiscount("VIP", 500.0)',
      'initialize(["ApplePay", "GooglePay", "UPI"]), calculateDiscount("Premium", 250.0), processPayment("ApplePay", 225.0), getPaymentStatus("GooglePay")',
      'initialize(["Card", "NetBanking"]), calculateDiscount("VIP", 1000.0), processPayment("Card", 800.0), processPayment("PayPal", 800.0)',
      'initialize(["CreditCard", "DebitCard"]), processPayment("DebitCard", 120.5), calculateDiscount("Regular", 120.5)',
      'initialize(["UPI"]), getPaymentStatus("UPI"), getPaymentStatus("Cash")',
      'initialize(["Crypto", "Stripe"]), calculateDiscount("VIP", 50.0), calculateDiscount("Premium", 50.0), processPayment("Stripe", 45.0)',
      'initialize(["Wallet", "UPI", "Card", "BNPL"]), calculateDiscount("Regular", 300.0), processPayment("BNPL", 300.0), getPaymentStatus("BNPL")',
      'initialize(["Razorpay", "Stripe"]), calculateDiscount("Guest", 150.0), processPayment("Razorpay", 150.0)',
      'initialize(["PayPal"]), calculateDiscount("VIP", 100.0), calculateDiscount("Premium", 100.0), calculateDiscount("Regular", 100.0)'
    ],
    expectedOutputs: [
      '3, 160.0, true, false, "Active", "Unsupported"',
      '2, 100.0, 90.0, true',
      '1, false, true, "Unsupported"',
      '0, false, 400.0',
      '3, 225.0, true, "Active"',
      '2, 800.0, true, false',
      '2, true, 120.5',
      '1, "Active", "Unsupported"',
      '2, 40.0, 45.0, true',
      '4, 300.0, true, "Active"',
      '2, 150.0, true',
      '1, 80.0, 90.0, 100.0'
    ],
    hints: [
      'The Open-Closed Principle states classes should be open for extension but closed for modification.',
      'Use the Strategy Pattern for discounts: define an interface and separate strategy classes for Regular, Premium, and VIP.',
      'Manage payment gateways via dynamic registration in a collection (e.g. Set or Map) rather than hardcoded if-else statements.'
    ],
    starters: {
      cpp: `class Solution {
public:
    int initialize(vector<string> paymentMethods) {
        // Initialize supported payment methods (e.g. "CreditCard", "UPI", "PayPal", "Crypto")
        return paymentMethods.size();
    }
    
    double calculateDiscount(string customerType, double baseAmount) {
        // Calculate discount adhering to Open-Closed Principle
        // Regular: 0% discount, Premium: 10% discount, VIP: 20% discount
        return baseAmount;
    }
    
    bool processPayment(string paymentMethod, double amount) {
        // Process payment through extensible gateway strategy
        return false;
    }
    
    string getPaymentStatus(string paymentMethod) {
        // Return "Active" if method is supported, "Unsupported" otherwise
        return "Unsupported";
    }
};`,
      python: `class Solution:
    def __init__(self):
        pass

    def initialize(self, paymentMethods: List[str]) -> int:
        return len(paymentMethods)

    def calculateDiscount(self, customerType: str, baseAmount: float) -> float:
        return baseAmount

    def processPayment(self, paymentMethod: str, amount: float) -> bool:
        return False

    def getPaymentStatus(self, paymentMethod: str) -> str:
        return "Unsupported"`,
      java: `import java.util.*;

class Solution {
    public int initialize(List<String> paymentMethods) {
        return paymentMethods.size();
    }

    public double calculateDiscount(String customerType, double baseAmount) {
        return baseAmount;
    }

    public boolean processPayment(String paymentMethod, double amount) {
        return false;
    }

    public String getPaymentStatus(String paymentMethod) {
        return "Unsupported";
    }
}`,
      javascript: `var Solution = function() {
    
};

Solution.prototype.initialize = function(paymentMethods) {
    return paymentMethods.length;
};

Solution.prototype.calculateDiscount = function(customerType, baseAmount) {
    return baseAmount;
};

Solution.prototype.processPayment = function(paymentMethod, amount) {
    return false;
};

Solution.prototype.getPaymentStatus = function(paymentMethod) {
    return "Unsupported";
};`,
      go: `type Solution struct {

}

func Constructor() Solution {
    return Solution{}
}

func (this *Solution) Initialize(paymentMethods []string) int {
    return len(paymentMethods)
}

func (this *Solution) CalculateDiscount(customerType string, baseAmount float64) float64 {
    return baseAmount
}

func (this *Solution) ProcessPayment(paymentMethod string, amount float64) bool {
    return false
}

func (this *Solution) GetPaymentStatus(paymentMethod string) string {
    return "Unsupported"
}`,
      rust: `struct Solution {

}

impl Solution {
    fn new() -> Self {
        Solution {}
    }

    fn initialize(&mut self, payment_methods: Vec<String>) -> i32 {
        payment_methods.len() as i32
    }

    fn calculate_discount(&self, customer_type: String, base_amount: f64) -> f64 {
        base_amount
    }

    fn process_payment(&mut self, payment_method: String, amount: f64) -> bool {
        false
    }

    fn get_payment_status(&self, payment_method: String) -> String {
        "Unsupported".to_string()
    }
}`,
      sql: `-- Not applicable for LLD problems`
    },
    solutions: {
      cpp: `// Open-Closed Principle (OCP) Architecture
#include <string>
#include <vector>
#include <unordered_set>
#include <cmath>

using namespace std;

class Solution {
private:
    unordered_set<string> activeGateways;
public:
    int initialize(vector<string> paymentMethods) {
        activeGateways.clear();
        for (const auto& m : paymentMethods) {
            activeGateways.insert(m);
        }
        return (int)activeGateways.size();
    }

    double calculateDiscount(string customerType, double baseAmount) {
        if (customerType == "VIP") {
            return round(baseAmount * 0.8 * 100.0) / 100.0;
        } else if (customerType == "Premium") {
            return round(baseAmount * 0.9 * 100.0) / 100.0;
        }
        return baseAmount;
    }

    bool processPayment(string paymentMethod, double amount) {
        if (amount <= 0) return false;
        return activeGateways.count(paymentMethod) > 0;
    }

    string getPaymentStatus(string paymentMethod) {
        return activeGateways.count(paymentMethod) ? "Active" : "Unsupported";
    }
};`,
      python: `# Open-Closed Principle (OCP)
from typing import List

class Solution:
    def __init__(self):
        self.gateways = set()

    def initialize(self, paymentMethods: List[str]) -> int:
        self.gateways = set(paymentMethods)
        return len(self.gateways)

    def calculateDiscount(self, customerType: str, baseAmount: float) -> float:
        if customerType == "VIP":
            return round(baseAmount * 0.8, 2)
        elif customerType == "Premium":
            return round(baseAmount * 0.9, 2)
        return float(baseAmount)

    def processPayment(self, paymentMethod: str, amount: float) -> bool:
        if amount <= 0:
            return False
        return paymentMethod in self.gateways

    def getPaymentStatus(self, paymentMethod: str) -> str:
        return "Active" if paymentMethod in self.gateways else "Unsupported"`,
      java: `// Open-Closed Principle (OCP)
import java.util.*;

class Solution {
    private Set<String> gateways = new HashSet<>();

    public int initialize(List<String> paymentMethods) {
        gateways.clear();
        gateways.addAll(paymentMethods);
        return gateways.size();
    }

    public double calculateDiscount(String customerType, double baseAmount) {
        if ("VIP".equals(customerType)) {
            return Math.round(baseAmount * 0.8 * 100.0) / 100.0;
        } else if ("Premium".equals(customerType)) {
            return Math.round(baseAmount * 0.9 * 100.0) / 100.0;
        }
        return baseAmount;
    }

    public boolean processPayment(String paymentMethod, double amount) {
        if (amount <= 0) return false;
        return gateways.contains(paymentMethod);
    }

    public String getPaymentStatus(String paymentMethod) {
        return gateways.contains(paymentMethod) ? "Active" : "Unsupported";
    }
}`,
      javascript: `// Open-Closed Principle (OCP)
var Solution = function() {
    this.gateways = new Set();
};

Solution.prototype.initialize = function(paymentMethods) {
    this.gateways = new Set(paymentMethods);
    return this.gateways.size;
};

Solution.prototype.calculateDiscount = function(customerType, baseAmount) {
    if (customerType === 'VIP') {
        return Math.round(baseAmount * 0.8 * 100) / 100;
    } else if (customerType === 'Premium') {
        return Math.round(baseAmount * 0.9 * 100) / 100;
    }
    return baseAmount;
};

Solution.prototype.processPayment = function(paymentMethod, amount) {
    if (amount <= 0) return false;
    return this.gateways.has(paymentMethod);
};

Solution.prototype.getPaymentStatus = function(paymentMethod) {
    return this.gateways.has(paymentMethod) ? 'Active' : 'Unsupported';
};`,
      go: `type Solution struct {
    gateways map[string]bool
}

func Constructor() Solution {
    return Solution{gateways: make(map[string]bool)}
}

func (this *Solution) Initialize(paymentMethods []string) int {
    this.gateways = make(map[string]bool)
    for _, m := range paymentMethods {
        this.gateways[m] = true
    }
    return len(this.gateways)
}

func (this *Solution) CalculateDiscount(customerType string, baseAmount float64) float64 {
    if customerType == "VIP" {
        return baseAmount * 0.8
    } else if customerType == "Premium" {
        return baseAmount * 0.9
    }
    return baseAmount
}

func (this *Solution) ProcessPayment(paymentMethod string, amount float64) bool {
    if amount <= 0 { return false }
    return this.gateways[paymentMethod]
}

func (this *Solution) GetPaymentStatus(paymentMethod string) string {
    if this.gateways[paymentMethod] { return "Active" }
    return "Unsupported"
}`,
      rust: `use std::collections::HashSet;

struct Solution {
    gateways: HashSet<String>,
}

impl Solution {
    fn new() -> Self {
        Solution { gateways: HashSet::new() }
    }

    fn initialize(&mut self, payment_methods: Vec<String>) -> i32 {
        self.gateways.clear();
        for m in payment_methods {
            self.gateways.insert(m);
        }
        self.gateways.len() as i32
    }

    fn calculate_discount(&self, customer_type: String, base_amount: f64) -> f64 {
        if customer_type == "VIP" {
            (base_amount * 0.8 * 100.0).round() / 100.0
        } else if customer_type == "Premium" {
            (base_amount * 0.9 * 100.0).round() / 100.0
        } else {
            base_amount
        }
    }

    fn process_payment(&mut self, payment_method: String, amount: f64) -> bool {
        if amount <= 0.0 { return false; }
        self.gateways.contains(&payment_method)
    }

    fn get_payment_status(&self, payment_method: String) -> String {
        if self.gateways.contains(&payment_method) {
            "Active".to_string()
        } else {
            "Unsupported".to_string()
        }
    }
}`,
      sql: `-- Not applicable for LLD problems`
    }
  },

  '2-3-liskov-substitution-principle-lsp-': {
    name: 'Liskov Substitution Principle (LSP) - Banking Account Hierarchy & Withdrawal System',
    category: 'Low Level Design',
    difficulty: 'Medium',
    description: `Design a banking account hierarchy adhering strictly to the **Liskov Substitution Principle (LSP)** from SOLID design principles.

The **Liskov Substitution Principle (LSP)** states:
> *"Objects of a superclass should be replaceable with objects of its subclasses without breaking application correctness or violating behavioral contracts."*

In this system:
1. All accounts support depositing funds and querying balances.
2. Accounts behave consistently according to their declared contracts:
   - **"Savings"**: Standard account. Allowed to withdraw if balance >= amount. Minimum balance is 0.0.
   - **"Current"**: Business account. Allowed to withdraw with overdraft down to -500.0.
   - **"FixedDeposit"**: Term deposit account. Does NOT allow premature withdrawals without breaking term contract; calling withdraw on a FixedDeposit account returns \`false\` polymorphically without corrupting balance.

Implement the \`Solution\` class:
- \`bool createAccount(string accountType, string accountId, double initialBalance)\`: Creates a new account. Returns \`true\` on success, \`false\` if accountId already exists or initialBalance < 0.
- \`bool deposit(string accountId, double amount)\`: Adds \`amount\` to the account balance if \`amount > 0\` and account exists. Returns \`true\` on success, \`false\` otherwise.
- \`bool withdraw(string accountId, double amount)\`: Attempts to withdraw \`amount\` adhering to LSP:
  - Savings: requires \`balance >= amount\` and \`amount > 0\`.
  - Current: requires \`balance - amount >= -500.0\` and \`amount > 0\`.
  - FixedDeposit: withdrawal is disallowed. Returns \`false\`.
  Returns \`false\` if account not found or amount <= 0.
- \`double getBalance(string accountId)\`: Returns current balance, or \`-1.0\` if account does not exist.

### Example 1:
\`\`\`
Input:
createAccount("Savings", "ACC1", 1000.0), deposit("ACC1", 500.0), withdraw("ACC1", 1200.0), getBalance("ACC1")

Output:
true, true, true, 300.0
\`\`\`

### Example 2:
\`\`\`
Input:
createAccount("FixedDeposit", "FD1", 5000.0), withdraw("FD1", 1000.0), getBalance("FD1")

Output:
true, false, 5000.0
\`\`\``,
    examples: [
      {
        input: 'createAccount("Savings", "ACC1", 1000.0), deposit("ACC1", 500.0), withdraw("ACC1", 1200.0), getBalance("ACC1")',
        output: 'true, true, true, 300.0',
        explanation: 'Savings account initialized with $1000, deposited $500 ($1500), withdrew $1200, remaining $300.'
      },
      {
        input: 'createAccount("FixedDeposit", "FD1", 5000.0), withdraw("FD1", 1000.0), getBalance("FD1")',
        output: 'true, false, 5000.0',
        explanation: 'FixedDeposit cannot be withdrawn polymorphically; returns false and preserves balance.'
      }
    ],
    constraints: [
      'accountType is one of "Savings", "Current", or "FixedDeposit".',
      '0.0 <= initialBalance, amount <= 10000000.0',
      'At most 1000 operations.'
    ],
    testCases: [
      'createAccount("Savings", "ACC1", 1000.0), deposit("ACC1", 500.0), withdraw("ACC1", 1200.0), getBalance("ACC1")',
      'createAccount("FixedDeposit", "FD1", 5000.0), withdraw("FD1", 1000.0), getBalance("FD1")',
      'createAccount("Current", "CUR1", 100.0), withdraw("CUR1", 400.0), getBalance("CUR1")',
      'createAccount("Savings", "SAV2", 200.0), withdraw("SAV2", 300.0), getBalance("SAV2")',
      'createAccount("Current", "CUR2", 0.0), withdraw("CUR2", 600.0), getBalance("CUR2")',
      'createAccount("FixedDeposit", "FD2", 2000.0), deposit("FD2", 500.0), getBalance("FD2")',
      'deposit("UNKNOWN", 100.0), withdraw("UNKNOWN", 50.0), getBalance("UNKNOWN")',
      'createAccount("Savings", "ACC1", 500.0), createAccount("Savings", "ACC1", 1000.0)',
      'createAccount("Current", "CUR3", 500.0), deposit("CUR3", 200.0), withdraw("CUR3", 1000.0), getBalance("CUR3")',
      'createAccount("Savings", "S1", 100.0), deposit("S1", 0.0), withdraw("S1", 0.0), getBalance("S1")',
      'createAccount("FixedDeposit", "FD3", 10000.0), withdraw("FD3", 500.0), deposit("FD3", 1000.0), getBalance("FD3")',
      'createAccount("Current", "C4", 50.0), withdraw("C4", 550.0), getBalance("C4")'
    ],
    expectedOutputs: [
      'true, true, true, 300.0',
      'true, false, 5000.0',
      'true, true, -300.0',
      'true, false, 200.0',
      'true, false, 0.0',
      'true, true, 2500.0',
      'false, false, -1.0',
      'true, false',
      'true, true, true, -300.0',
      'true, false, false, 100.0',
      'true, false, true, 11000.0',
      'true, true, -500.0'
    ],
    hints: [
      'Subclasses should never throw unexpected exceptions or break preconditions established by base classes.',
      'Separate withdrawable accounts from non-withdrawable accounts (or maintain explicit contract boundaries).',
      'Current account allows overdraft down to -500.0, whereas Savings cannot go below 0.0.'
    ],
    starters: {
      cpp: `class Solution {
public:
    bool createAccount(string accountType, string accountId, double initialBalance) {
        return false;
    }

    bool deposit(string accountId, double amount) {
        return false;
    }

    bool withdraw(string accountId, double amount) {
        return false;
    }

    double getBalance(string accountId) {
        return -1.0;
    }
};`,
      python: `class Solution:
    def __init__(self):
        pass

    def createAccount(self, accountType: str, accountId: str, initialBalance: float) -> bool:
        return False

    def deposit(self, accountId: str, amount: float) -> bool:
        return False

    def withdraw(self, accountId: str, amount: float) -> bool:
        return False

    def getBalance(self, accountId: str) -> float:
        return -1.0`,
      java: `class Solution {
    public boolean createAccount(String accountType, String accountId, double initialBalance) {
        return false;
    }

    public boolean deposit(String accountId, double amount) {
        return false;
    }

    public boolean withdraw(String accountId, double amount) {
        return false;
    }

    public double getBalance(String accountId) {
        return -1.0;
    }
}`,
      javascript: `var Solution = function() {

};

Solution.prototype.createAccount = function(accountType, accountId, initialBalance) {
    return false;
};

Solution.prototype.deposit = function(accountId, amount) {
    return false;
};

Solution.prototype.withdraw = function(accountId, amount) {
    return false;
};

Solution.prototype.getBalance = function(accountId) {
    return -1.0;
};`,
      go: `type Solution struct {
    accounts map[string]float64
    accTypes map[string]string
}

func Constructor() Solution {
    return Solution{
        accounts: make(map[string]float64),
        accTypes: make(map[string]string),
    }
}

func (this *Solution) CreateAccount(accountType string, accountId string, initialBalance float64) bool {
    return false
}

func (this *Solution) Deposit(accountId string, amount float64) bool {
    return false
}

func (this *Solution) Withdraw(accountId string, amount float64) bool {
    return false
}

func (this *Solution) GetBalance(accountId string) float64 {
    return -1.0
}`,
      rust: `struct Solution {
}

impl Solution {
    fn new() -> Self {
        Solution {}
    }
    
    fn create_account(&mut self, account_type: String, account_id: String, initial_balance: f64) -> bool {
        false
    }
    
    fn deposit(&mut self, account_id: String, amount: f64) -> bool {
        false
    }
    
    fn withdraw(&mut self, account_id: String, amount: f64) -> bool {
        false
    }
    
    fn get_balance(&self, account_id: String) -> f64 {
        -1.0
    }
}`
    },
    solutions: {
      cpp: `#include <string>
#include <unordered_map>

using namespace std;

struct AccountInfo {
    string type;
    double balance;
};

class Solution {
private:
    unordered_map<string, AccountInfo> accounts;
public:
    bool createAccount(string accountType, string accountId, double initialBalance) {
        if (accounts.count(accountId) || initialBalance < 0.0) return false;
        accounts[accountId] = { accountType, initialBalance };
        return true;
    }

    bool deposit(string accountId, double amount) {
        if (amount <= 0.0 || !accounts.count(accountId)) return false;
        accounts[accountId].balance += amount;
        return true;
    }

    bool withdraw(string accountId, double amount) {
        if (amount <= 0.0 || !accounts.count(accountId)) return false;
        auto& acc = accounts[accountId];
        if (acc.type == "FixedDeposit") {
            return false;
        } else if (acc.type == "Current") {
            if (acc.balance - amount >= -500.0) {
                acc.balance -= amount;
                return true;
            }
            return false;
        } else {
            if (acc.balance >= amount) {
                acc.balance -= amount;
                return true;
            }
            return false;
        }
    }

    double getBalance(string accountId) {
        if (!accounts.count(accountId)) return -1.0;
        return accounts[accountId].balance;
    }
};`,
      python: `class Solution:
    def __init__(self):
        self.accounts = {}

    def createAccount(self, accountType: str, accountId: str, initialBalance: float) -> bool:
        if accountId in self.accounts or initialBalance < 0.0:
            return False
        self.accounts[accountId] = {"type": accountType, "balance": float(initialBalance)}
        return True

    def deposit(self, accountId: str, amount: float) -> bool:
        if amount <= 0.0 or accountId not in self.accounts:
            return False
        self.accounts[accountId]["balance"] += float(amount)
        return True

    def withdraw(self, accountId: str, amount: float) -> bool:
        if amount <= 0.0 or accountId not in self.accounts:
            return False
        acc = self.accounts[accountId]
        if acc["type"] == "FixedDeposit":
            return False
        elif acc["type"] == "Current":
            if acc["balance"] - amount >= -500.0:
                acc["balance"] -= amount
                return True
            return False
        else:
            if acc["balance"] >= amount:
                acc["balance"] -= amount
                return True
            return False

    def getBalance(self, accountId: str) -> float:
        if accountId not in self.accounts:
            return -1.0
        return float(self.accounts[accountId]["balance"])`,
      java: `import java.util.*;

class Solution {
    static class Acc {
        String type;
        double balance;
        Acc(String t, double b) { type = t; balance = b; }
    }
    private Map<String, Acc> accounts = new HashMap<>();

    public boolean createAccount(String accountType, String accountId, double initialBalance) {
        if (accounts.containsKey(accountId) || initialBalance < 0.0) return false;
        accounts.put(accountId, new Acc(accountType, initialBalance));
        return true;
    }

    public boolean deposit(String accountId, double amount) {
        if (amount <= 0.0 || !accounts.containsKey(accountId)) return false;
        accounts.get(accountId).balance += amount;
        return true;
    }

    public boolean withdraw(String accountId, double amount) {
        if (amount <= 0.0 || !accounts.containsKey(accountId)) return false;
        Acc acc = accounts.get(accountId);
        if ("FixedDeposit".equals(acc.type)) {
            return false;
        } else if ("Current".equals(acc.type)) {
            if (acc.balance - amount >= -500.0) {
                acc.balance -= amount;
                return true;
            }
            return false;
        } else {
            if (acc.balance >= amount) {
                acc.balance -= amount;
                return true;
            }
            return false;
        }
    }

    public double getBalance(String accountId) {
        if (!accounts.containsKey(accountId)) return -1.0;
        return accounts.get(accountId).balance;
    }
}`,
      javascript: `var Solution = function() {
    this.accounts = new Map();
};

Solution.prototype.createAccount = function(accountType, accountId, initialBalance) {
    if (this.accounts.has(accountId) || initialBalance < 0) return false;
    this.accounts.set(accountId, { type: accountType, balance: Number(initialBalance) });
    return true;
};

Solution.prototype.deposit = function(accountId, amount) {
    if (amount <= 0 || !this.accounts.has(accountId)) return false;
    const acc = this.accounts.get(accountId);
    acc.balance += Number(amount);
    return true;
};

Solution.prototype.withdraw = function(accountId, amount) {
    if (amount <= 0 || !this.accounts.has(accountId)) return false;
    const acc = this.accounts.get(accountId);
    if (acc.type === 'FixedDeposit') {
        return false;
    } else if (acc.type === 'Current') {
        if (acc.balance - amount >= -500.0) {
            acc.balance -= amount;
            return true;
        }
        return false;
    } else {
        if (acc.balance >= amount) {
            acc.balance -= amount;
            return true;
        }
        return false;
    }
};

Solution.prototype.getBalance = function(accountId) {
    if (!this.accounts.has(accountId)) return -1.0;
    return this.accounts.get(accountId).balance;
};`
    }
  },

  '2-4-interface-segregation-principle-isp-': {
    name: 'Interface Segregation Principle (ISP) - Multi-Function Device Workstation',
    category: 'Low Level Design',
    difficulty: 'Medium',
    description: `Design an office workstation management system adhering strictly to the **Interface Segregation Principle (ISP)** from SOLID design principles.

The **Interface Segregation Principle (ISP)** states:
> *"Clients should not be forced to depend upon interfaces or methods they do not use."*

In this system:
1. Fat device interfaces are segregated into lean, role-specific capabilities: \`IPrinter\`, \`IScanner\`, and \`IFax\`.
2. Devices support specific combinations of capabilities:
   - **"BasicPrinter"**: Supports printing only.
   - **"Photocopier"**: Supports printing and scanning.
   - **"AllInOne"**: Supports printing, scanning, and faxing.

Implement the \`Solution\` class:
- \`bool registerDevice(string deviceId, string deviceType)\`: Registers a device. Returns \`true\` on success, \`false\` if deviceId already exists or deviceType is unrecognized.
- \`bool printDocument(string deviceId, string docName)\`: Executes a print task if supported by the device and docName is non-empty. Increments device op count and returns \`true\`. Returns \`false\` otherwise.
- \`bool scanDocument(string deviceId, string docName)\`: Executes a scan task if supported by the device and docName is non-empty. Increments device op count and returns \`true\`. Returns \`false\` otherwise.
- \`bool faxDocument(string deviceId, string docName, string targetNumber)\`: Executes a fax transmission if supported by the device and parameters are non-empty. Increments device op count and returns \`true\`. Returns \`false\` otherwise.
- \`int getOperationCount(string deviceId)\`: Returns total successful operations on this device, or \`0\` if device does not exist.

### Example 1:
\`\`\`
Input:
registerDevice("DEV1", "BasicPrinter"), printDocument("DEV1", "report.pdf"), scanDocument("DEV1", "report.pdf"), getOperationCount("DEV1")

Output:
true, true, false, 1
\`\`\`

### Example 2:
\`\`\`
Input:
registerDevice("DEV2", "Photocopier"), printDocument("DEV2", "invoice.pdf"), scanDocument("DEV2", "invoice.pdf"), faxDocument("DEV2", "invoice.pdf", "12345"), getOperationCount("DEV2")

Output:
true, true, true, false, 2
\`\`\``,
    examples: [
      {
        input: 'registerDevice("DEV1", "BasicPrinter"), printDocument("DEV1", "report.pdf"), scanDocument("DEV1", "report.pdf"), getOperationCount("DEV1")',
        output: 'true, true, false, 1',
        explanation: 'BasicPrinter supports print but not scan. Operation count is 1.'
      },
      {
        input: 'registerDevice("DEV2", "Photocopier"), printDocument("DEV2", "invoice.pdf"), scanDocument("DEV2", "invoice.pdf"), faxDocument("DEV2", "invoice.pdf", "12345"), getOperationCount("DEV2")',
        output: 'true, true, true, false, 2',
        explanation: 'Photocopier supports print and scan, but not fax. Operation count is 2.'
      }
    ],
    constraints: [
      'deviceType is one of "BasicPrinter", "Photocopier", or "AllInOne".',
      'At most 1000 operations.'
    ],
    testCases: [
      'registerDevice("DEV1", "BasicPrinter"), printDocument("DEV1", "report.pdf"), scanDocument("DEV1", "report.pdf"), getOperationCount("DEV1")',
      'registerDevice("DEV2", "Photocopier"), printDocument("DEV2", "invoice.pdf"), scanDocument("DEV2", "invoice.pdf"), faxDocument("DEV2", "invoice.pdf", "12345"), getOperationCount("DEV2")',
      'registerDevice("DEV3", "AllInOne"), printDocument("DEV3", "doc.txt"), scanDocument("DEV3", "doc.txt"), faxDocument("DEV3", "doc.txt", "99999"), getOperationCount("DEV3")',
      'printDocument("UNKNOWN", "file.pdf"), getOperationCount("UNKNOWN")',
      'registerDevice("DEV1", "BasicPrinter"), registerDevice("DEV1", "AllInOne")',
      'registerDevice("DEV4", "BasicPrinter"), faxDocument("DEV4", "notes.txt", "111"), getOperationCount("DEV4")',
      'registerDevice("DEV5", "Photocopier"), printDocument("DEV5", "slide.pptx"), scanDocument("DEV5", "id.png"), getOperationCount("DEV5")',
      'registerDevice("DEV6", "InvalidType")',
      'registerDevice("DEV7", "AllInOne"), faxDocument("DEV7", "memo.pdf", "555"), getOperationCount("DEV7")',
      'registerDevice("DEV8", "BasicPrinter"), printDocument("DEV8", "a.txt"), printDocument("DEV8", "b.txt"), getOperationCount("DEV8")',
      'registerDevice("DEV9", "AllInOne"), printDocument("DEV9", ""), getOperationCount("DEV9")',
      'registerDevice("DEV10", "Photocopier"), scanDocument("DEV10", "contract.pdf"), getOperationCount("DEV10")'
    ],
    expectedOutputs: [
      'true, true, false, 1',
      'true, true, true, false, 2',
      'true, true, true, true, 3',
      'false, 0',
      'true, false',
      'true, false, 0',
      'true, true, true, 2',
      'false',
      'true, true, 1',
      'true, true, true, 2',
      'true, false, 0',
      'true, true, 1'
    ],
    hints: [
      'Decompose fat device interfaces into small, cohesive interfaces.',
      'Check device capability support before executing actions.',
      'Maintain an operation counter per device incremented only on successful tasks.'
    ],
    starters: {
      cpp: `class Solution {
public:
    bool registerDevice(string deviceId, string deviceType) {
        return false;
    }

    bool printDocument(string deviceId, string docName) {
        return false;
    }

    bool scanDocument(string deviceId, string docName) {
        return false;
    }

    bool faxDocument(string deviceId, string docName, string targetNumber) {
        return false;
    }

    int getOperationCount(string deviceId) {
        return 0;
    }
};`,
      python: `class Solution:
    def __init__(self):
        pass

    def registerDevice(self, deviceId: str, deviceType: str) -> bool:
        return False

    def printDocument(self, deviceId: str, docName: str) -> bool:
        return False

    def scanDocument(self, deviceId: str, docName: str) -> bool:
        return False

    def faxDocument(self, deviceId: str, docName: str, targetNumber: str) -> bool:
        return False

    def getOperationCount(self, deviceId: str) -> int:
        return 0`,
      java: `class Solution {
    public boolean registerDevice(String deviceId, String deviceType) {
        return false;
    }

    public boolean printDocument(String deviceId, String docName) {
        return false;
    }

    public boolean scanDocument(String deviceId, String docName) {
        return false;
    }

    public boolean faxDocument(String deviceId, String docName, String targetNumber) {
        return false;
    }

    public int getOperationCount(String deviceId) {
        return 0;
    }
}`,
      javascript: `var Solution = function() {

};

Solution.prototype.registerDevice = function(deviceId, deviceType) {
    return false;
};

Solution.prototype.printDocument = function(deviceId, docName) {
    return false;
};

Solution.prototype.scanDocument = function(deviceId, docName) {
    return false;
};

Solution.prototype.faxDocument = function(deviceId, docName, targetNumber) {
    return false;
};

Solution.prototype.getOperationCount = function(deviceId) {
    return 0;
};`,
      go: `type Solution struct {
}

func Constructor() Solution {
    return Solution{}
}

func (this *Solution) RegisterDevice(deviceId string, deviceType string) bool {
    return false
}

func (this *Solution) PrintDocument(deviceId string, docName string) bool {
    return false
}

func (this *Solution) ScanDocument(deviceId string, docName string) bool {
    return false
}

func (this *Solution) FaxDocument(deviceId string, docName string, targetNumber string) bool {
    return false
}

func (this *Solution) GetOperationCount(deviceId string) int {
    return 0
}`,
      rust: `struct Solution {
}

impl Solution {
    fn new() -> Self {
        Solution {}
    }

    fn register_device(&mut self, device_id: String, device_type: String) -> bool {
        false
    }

    fn print_document(&mut self, device_id: String, doc_name: String) -> bool {
        false
    }

    fn scan_document(&mut self, device_id: String, doc_name: String) -> bool {
        false
    }

    fn fax_document(&mut self, device_id: String, doc_name: String, target_number: String) -> bool {
        false
    }

    fn get_operation_count(&self, device_id: String) -> i32 {
        0
    }
}`
    },
    solutions: {
      cpp: `#include <string>
#include <unordered_map>

using namespace std;

struct DeviceMeta {
    string type;
    int ops = 0;
};

class Solution {
private:
    unordered_map<string, DeviceMeta> devices;
public:
    bool registerDevice(string deviceId, string deviceType) {
        if (devices.count(deviceId)) return false;
        if (deviceType != "BasicPrinter" && deviceType != "Photocopier" && deviceType != "AllInOne") return false;
        devices[deviceId] = { deviceType, 0 };
        return true;
    }

    bool printDocument(string deviceId, string docName) {
        if (docName.empty() || !devices.count(deviceId)) return false;
        devices[deviceId].ops++;
        return true;
    }

    bool scanDocument(string deviceId, string docName) {
        if (docName.empty() || !devices.count(deviceId)) return false;
        const string& type = devices[deviceId].type;
        if (type == "Photocopier" || type == "AllInOne") {
            devices[deviceId].ops++;
            return true;
        }
        return false;
    }

    bool faxDocument(string deviceId, string docName, string targetNumber) {
        if (docName.empty() || targetNumber.empty() || !devices.count(deviceId)) return false;
        if (devices[deviceId].type == "AllInOne") {
            devices[deviceId].ops++;
            return true;
        }
        return false;
    }

    int getOperationCount(string deviceId) {
        if (!devices.count(deviceId)) return 0;
        return devices[deviceId].ops;
    }
};`,
      python: `class Solution:
    def __init__(self):
        self.devices = {}

    def registerDevice(self, deviceId: str, deviceType: str) -> bool:
        if deviceId in self.devices:
            return False
        if deviceType not in ("BasicPrinter", "Photocopier", "AllInOne"):
            return False
        self.devices[deviceId] = {"type": deviceType, "ops": 0}
        return True

    def printDocument(self, deviceId: str, docName: str) -> bool:
        if not docName or deviceId not in self.devices:
            return False
        self.devices[deviceId]["ops"] += 1
        return True

    def scanDocument(self, deviceId: str, docName: str) -> bool:
        if not docName or deviceId not in self.devices:
            return False
        t = self.devices[deviceId]["type"]
        if t in ("Photocopier", "AllInOne"):
            self.devices[deviceId]["ops"] += 1
            return True
        return False

    def faxDocument(self, deviceId: str, docName: str, targetNumber: str) -> bool:
        if not docName or not targetNumber or deviceId not in self.devices:
            return False
        if self.devices[deviceId]["type"] == "AllInOne":
            self.devices[deviceId]["ops"] += 1
            return True
        return False

    def getOperationCount(self, deviceId: str) -> int:
        if deviceId not in self.devices:
            return 0
        return self.devices[deviceId]["ops"]`,
      java: `import java.util.*;

class Solution {
    static class Dev {
        String type;
        int ops = 0;
        Dev(String t) { type = t; }
    }
    private Map<String, Dev> devices = new HashMap<>();

    public boolean registerDevice(String deviceId, String deviceType) {
        if (devices.containsKey(deviceId)) return false;
        if (!"BasicPrinter".equals(deviceType) && !"Photocopier".equals(deviceType) && !"AllInOne".equals(deviceType)) return false;
        devices.put(deviceId, new Dev(deviceType));
        return true;
    }

    public boolean printDocument(String deviceId, String docName) {
        if (docName == null || docName.isEmpty() || !devices.containsKey(deviceId)) return false;
        devices.get(deviceId).ops++;
        return true;
    }

    public boolean scanDocument(String deviceId, String docName) {
        if (docName == null || docName.isEmpty() || !devices.containsKey(deviceId)) return false;
        String t = devices.get(deviceId).type;
        if ("Photocopier".equals(t) || "AllInOne".equals(t)) {
            devices.get(deviceId).ops++;
            return true;
        }
        return false;
    }

    public boolean faxDocument(String deviceId, String docName, String targetNumber) {
        if (docName == null || docName.isEmpty() || targetNumber == null || targetNumber.isEmpty() || !devices.containsKey(deviceId)) return false;
        if ("AllInOne".equals(devices.get(deviceId).type)) {
            devices.get(deviceId).ops++;
            return true;
        }
        return false;
    }

    public int getOperationCount(String deviceId) {
        if (!devices.containsKey(deviceId)) return 0;
        return devices.get(deviceId).ops;
    }
}`,
      javascript: `var Solution = function() {
    this.devices = new Map();
};

Solution.prototype.registerDevice = function(deviceId, deviceType) {
    if (this.devices.has(deviceId)) return false;
    if (!['BasicPrinter', 'Photocopier', 'AllInOne'].includes(deviceType)) return false;
    this.devices.set(deviceId, { type: deviceType, ops: 0 });
    return true;
};

Solution.prototype.printDocument = function(deviceId, docName) {
    if (!docName || !this.devices.has(deviceId)) return false;
    this.devices.get(deviceId).ops++;
    return true;
};

Solution.prototype.scanDocument = function(deviceId, docName) {
    if (!docName || !this.devices.has(deviceId)) return false;
    const t = this.devices.get(deviceId).type;
    if (t === 'Photocopier' || t === 'AllInOne') {
        this.devices.get(deviceId).ops++;
        return true;
    }
    return false;
};

Solution.prototype.faxDocument = function(deviceId, docName, targetNumber) {
    if (!docName || !targetNumber || !this.devices.has(deviceId)) return false;
    if (this.devices.get(deviceId).type === 'AllInOne') {
        this.devices.get(deviceId).ops++;
        return true;
    }
    return false;
};

Solution.prototype.getOperationCount = function(deviceId) {
    if (!this.devices.has(deviceId)) return 0;
    return this.devices.get(deviceId).ops;
};`
    }
  },

  '2-5-dependency-inversion-principle-dip-': {
    name: 'Dependency Inversion Principle (DIP) - Decoupled Notification Engine',
    category: 'Low Level Design',
    difficulty: 'Medium',
    description: `Design an enterprise notification dispatch engine adhering strictly to the **Dependency Inversion Principle (DIP)** from SOLID design principles.

The **Dependency Inversion Principle (DIP)** states:
> *"High-level modules should not depend upon low-level modules; both should depend upon abstractions. Abstractions should not depend upon details; details should depend upon abstractions."*

In this system:
1. High-level notification routing depends upon a clean message sender abstraction rather than direct concrete vendor SDKs.
2. Low-level channel providers (e.g. **"SendGrid"**, **"Twilio"**, **"Firebase"**, **"AWS_SES"**) implement delivery contracts independently.
3. Supported channels are **"Email"**, **"SMS"**, and **"Push"**.

Implement the \`Solution\` class:
- \`bool configureChannel(string channel, string provider)\`: Binds or updates the delivery provider abstraction for a channel. Supported channels: \`"Email"\`, \`"SMS"\`, \`"Push"\`. Returns \`true\` if channel is valid and provider non-empty, \`false\` otherwise.
- \`bool sendNotification(string channel, string recipient, string message)\`: Dispatches message via the injected channel abstraction. Returns \`true\` if channel is configured and recipient and message are non-empty. Increments channel delivery count. Returns \`false\` otherwise.
- \`int getNotificationCount(string channel)\`: Returns total count of notifications dispatched through \`channel\`. Returns \`0\` if unconfigured.
- \`string getChannelProvider(string channel)\`: Returns the currently active provider name for \`channel\`, or \`"None"\` if not configured.

### Example 1:
\`\`\`
Input:
configureChannel("Email", "SendGrid"), configureChannel("SMS", "Twilio"), sendNotification("Email", "alice@test.com", "Welcome!"), sendNotification("SMS", "+123456", "Code: 4421"), getNotificationCount("Email"), getChannelProvider("Email")

Output:
true, true, true, true, 1, "SendGrid"
\`\`\`

### Example 2:
\`\`\`
Input:
sendNotification("Push", "device_token_99", "Alert"), getNotificationCount("Push"), getChannelProvider("Push")

Output:
false, 0, "None"
\`\`\``,
    examples: [
      {
        input: 'configureChannel("Email", "SendGrid"), configureChannel("SMS", "Twilio"), sendNotification("Email", "alice@test.com", "Welcome!"), sendNotification("SMS", "+123456", "Code: 4421"), getNotificationCount("Email"), getChannelProvider("Email")',
        output: 'true, true, true, true, 1, "SendGrid"',
        explanation: 'Email configured with SendGrid, SMS with Twilio. Sent 1 email successfully.'
      },
      {
        input: 'sendNotification("Push", "device_token_99", "Alert"), getNotificationCount("Push"), getChannelProvider("Push")',
        output: 'false, 0, "None"',
        explanation: 'Push channel is not configured, send fails, count is 0, provider is None.'
      }
    ],
    constraints: [
      'channel is one of "Email", "SMS", or "Push".',
      'At most 1000 operations.'
    ],
    testCases: [
      'configureChannel("Email", "SendGrid"), configureChannel("SMS", "Twilio"), sendNotification("Email", "alice@test.com", "Welcome!"), sendNotification("SMS", "+123456", "Code: 4421"), getNotificationCount("Email"), getChannelProvider("Email")',
      'sendNotification("Push", "device_token_99", "Alert"), getNotificationCount("Push"), getChannelProvider("Push")',
      'configureChannel("Push", "Firebase"), sendNotification("Push", "token_1", "Ping"), getNotificationCount("Push"), getChannelProvider("Push")',
      'configureChannel("Email", "SendGrid"), configureChannel("Email", "AWS_SES"), getChannelProvider("Email")',
      'configureChannel("InvalidChannel", "ProviderX")',
      'configureChannel("SMS", "Twilio"), sendNotification("SMS", "", "Empty Recipient"), getNotificationCount("SMS")',
      'configureChannel("SMS", "Twilio"), sendNotification("SMS", "+999", ""), getNotificationCount("SMS")',
      'configureChannel("Email", "Mailgun"), sendNotification("Email", "bob@work.com", "Hello"), sendNotification("Email", "carol@work.com", "Meeting"), getNotificationCount("Email")',
      'getChannelProvider("SMS"), getNotificationCount("SMS")',
      'configureChannel("Email", "SendGrid"), configureChannel("SMS", "Twilio"), configureChannel("Push", "OneSignal"), getChannelProvider("Push")',
      'configureChannel("Email", "Postmark"), sendNotification("Email", "dev@sd.com", "Deploy OK"), getNotificationCount("Email")',
      'configureChannel("Push", "APNs"), sendNotification("Push", "ios_token", "Hi"), getChannelProvider("Push")'
    ],
    expectedOutputs: [
      'true, true, true, true, 1, "SendGrid"',
      'false, 0, "None"',
      'true, true, 1, "Firebase"',
      'true, true, "AWS_SES"',
      'false',
      'true, false, 0',
      'true, false, 0',
      'true, true, true, 2',
      '"None", 0',
      'true, true, true, "OneSignal"',
      'true, true, 1',
      'true, true, "APNs"'
    ],
    hints: [
      'The NotificationService facade should decouple high-level routing from concrete low-level sender providers.',
      'Allow runtime dependency injection or rebinding of providers to channels.',
      'Track sent message counts per channel upon successful delivery.'
    ],
    starters: {
      cpp: `class Solution {
public:
    bool configureChannel(string channel, string provider) {
        return false;
    }

    bool sendNotification(string channel, string recipient, string message) {
        return false;
    }

    int getNotificationCount(string channel) {
        return 0;
    }

    string getChannelProvider(string channel) {
        return "None";
    }
};`,
      python: `class Solution:
    def __init__(self):
        pass

    def configureChannel(self, channel: str, provider: str) -> bool:
        return False

    def sendNotification(self, channel: str, recipient: str, message: str) -> bool:
        return False

    def getNotificationCount(self, channel: str) -> int:
        return 0

    def getChannelProvider(self, channel: str) -> str:
        return "None"`,
      java: `class Solution {
    public boolean configureChannel(String channel, String provider) {
        return false;
    }

    public boolean sendNotification(String channel, String recipient, String message) {
        return false;
    }

    public int getNotificationCount(String channel) {
        return 0;
    }

    public String getChannelProvider(String channel) {
        return "None";
    }
}`,
      javascript: `var Solution = function() {

};

Solution.prototype.configureChannel = function(channel, provider) {
    return false;
};

Solution.prototype.sendNotification = function(channel, recipient, message) {
    return false;
};

Solution.prototype.getNotificationCount = function(channel) {
    return 0;
};

Solution.prototype.getChannelProvider = function(channel) {
    return "None";
};`,
      go: `type Solution struct {
}

func Constructor() Solution {
    return Solution{}
}

func (this *Solution) ConfigureChannel(channel string, provider string) bool {
    return false
}

func (this *Solution) SendNotification(channel string, recipient string, message string) bool {
    return false
}

func (this *Solution) GetNotificationCount(channel string) int {
    return 0
}

func (this *Solution) GetChannelProvider(channel string) string {
    return "None"
}`,
      rust: `struct Solution {
}

impl Solution {
    fn new() -> Self {
        Solution {}
    }

    fn configure_channel(&mut self, channel: String, provider: String) -> bool {
        false
    }

    fn send_notification(&mut self, channel: String, recipient: String, message: String) -> bool {
        false
    }

    fn get_notification_count(&self, channel: String) -> i32 {
        0
    }

    fn get_channel_provider(&self, channel: String) -> String {
        "None".to_string()
    }
}`
    },
    solutions: {
      cpp: `#include <string>
#include <unordered_map>

using namespace std;

struct ChannelMeta {
    string provider;
    int sentCount = 0;
};

class Solution {
private:
    unordered_map<string, ChannelMeta> channels;
public:
    bool configureChannel(string channel, string provider) {
        if (provider.empty()) return false;
        if (channel != "Email" && channel != "SMS" && channel != "Push") return false;
        channels[channel].provider = provider;
        return true;
    }

    bool sendNotification(string channel, string recipient, string message) {
        if (recipient.empty() || message.empty() || !channels.count(channel) || channels[channel].provider.empty()) {
            return false;
        }
        channels[channel].sentCount++;
        return true;
    }

    int getNotificationCount(string channel) {
        if (!channels.count(channel)) return 0;
        return channels[channel].sentCount;
    }

    string getChannelProvider(string channel) {
        if (!channels.count(channel) || channels[channel].provider.empty()) {
            return "None";
        }
        return channels[channel].provider;
    }
};`,
      python: `class Solution:
    def __init__(self):
        self.channels = {}

    def configureChannel(self, channel: str, provider: str) -> bool:
        if not provider or channel not in ("Email", "SMS", "Push"):
            return False
        if channel not in self.channels:
            self.channels[channel] = {"provider": provider, "count": 0}
        else:
            self.channels[channel]["provider"] = provider
        return True

    def sendNotification(self, channel: str, recipient: str, message: str) -> bool:
        if not recipient or not message or channel not in self.channels or not self.channels[channel]["provider"]:
            return False
        self.channels[channel]["count"] += 1
        return True

    def getNotificationCount(self, channel: str) -> int:
        if channel not in self.channels:
            return 0
        return self.channels[channel]["count"]

    def getChannelProvider(self, channel: str) -> str:
        if channel not in self.channels or not self.channels[channel]["provider"]:
            return "None"
        return self.channels[channel]["provider"]`,
      java: `import java.util.*;

class Solution {
    static class Ch {
        String provider;
        int count = 0;
        Ch(String p) { provider = p; }
    }
    private Map<String, Ch> channels = new HashMap<>();

    public boolean configureChannel(String channel, String provider) {
        if (provider == null || provider.isEmpty()) return false;
        if (!"Email".equals(channel) && !"SMS".equals(channel) && !"Push".equals(channel)) return false;
        if (!channels.containsKey(channel)) {
            channels.put(channel, new Ch(provider));
        } else {
            channels.get(channel).provider = provider;
        }
        return true;
    }

    public boolean sendNotification(String channel, String recipient, String message) {
        if (recipient == null || recipient.isEmpty() || message == null || message.isEmpty() || !channels.containsKey(channel) || channels.get(channel).provider.isEmpty()) {
            return false;
        }
        channels.get(channel).count++;
        return true;
    }

    public int getNotificationCount(String channel) {
        if (!channels.containsKey(channel)) return 0;
        return channels.get(channel).count;
    }

    public String getChannelProvider(String channel) {
        if (!channels.containsKey(channel) || channels.get(channel).provider.isEmpty()) {
            return "None";
        }
        return channels.get(channel).provider;
    }
}`,
      javascript: `var Solution = function() {
    this.channels = new Map();
};

Solution.prototype.configureChannel = function(channel, provider) {
    if (!provider || !['Email', 'SMS', 'Push'].includes(channel)) return false;
    if (!this.channels.has(channel)) {
        this.channels.set(channel, { provider: provider, count: 0 });
    } else {
        this.channels.get(channel).provider = provider;
    }
    return true;
};

Solution.prototype.sendNotification = function(channel, recipient, message) {
    if (!recipient || !message || !this.channels.has(channel) || !this.channels.get(channel).provider) {
        return false;
    }
    this.channels.get(channel).count++;
    return true;
};

Solution.prototype.getNotificationCount = function(channel) {
    if (!this.channels.has(channel)) return 0;
    return this.channels.get(channel).count;
};

Solution.prototype.getChannelProvider = function(channel) {
    if (!this.channels.has(channel) || !this.channels.get(channel).provider) {
        return 'None';
    }
    return this.channels.get(channel).provider;
};`
    }
  }
};

/**
 * Generates custom hidden driver code for SOLID principle LLD coding problems.
 */
export function getSolidDriver(slug: string, language: SupportedLanguage): string | null {
  const isOCP = slug === '2-2-open-closed-principle-ocp-' ||
    slug === '2-2-open-closed-principle-ocp' ||
    slug.includes('open-closed-principle') ||
    slug.includes('openclosedprinciple') ||
    slug.includes('22openclosed') ||
    slug.includes('shape-area-calculator-open-closed');

  const isLSP = slug === '2-3-liskov-substitution-principle-lsp-' ||
    slug === '2-3-liskov-substitution-principle-lsp' ||
    slug.includes('liskov-substitution-principle') ||
    slug.includes('liskovsubstitutionprinciple') ||
    slug.includes('23liskov');

  const isISP = slug === '2-4-interface-segregation-principle-isp-' ||
    slug === '2-4-interface-segregation-principle-isp' ||
    slug.includes('interface-segregation-principle') ||
    slug.includes('interfacesegregationprinciple') ||
    slug.includes('24interfacesegregation');

  const isDIP = slug === '2-5-dependency-inversion-principle-dip-' ||
    slug === '2-5-dependency-inversion-principle-dip' ||
    slug.includes('dependency-inversion-principle') ||
    slug.includes('dependencyinversionprinciple') ||
    slug.includes('25dependencyinversion');

  const lang = (language || 'cpp').toLowerCase() as SupportedLanguage;

  if (isOCP) {
    if (lang === 'cpp') {
      return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <iomanip>
#include <cmath>

using namespace std;

// === USER SOLUTION ===

// === HIDDEN DRIVER ===
static inline string trim(const string& s) {
    size_t start = s.find_first_not_of(" \\t\\n\\r");
    if (start == string::npos) return "";
    size_t end = s.find_last_not_of(" \\t\\n\\r");
    return s.substr(start, end - start + 1);
}

static inline string stripQuotes(const string& s) {
    string t = trim(s);
    if (t.size() >= 2 && ((t.front() == '"' && t.back() == '"') || (t.front() == 39 && t.back() == 39))) {
        return t.substr(1, t.size() - 2);
    }
    return t;
}

static vector<string> splitCalls(const string& input) {
    vector<string> calls;
    string cur = "";
    int pDepth = 0, bDepth = 0;
    bool inQuotes = false;
    char qChar = 0;

    for (size_t i = 0; i < input.size(); ++i) {
        char c = input[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i == 0 || input[i - 1] != '\\\\')) inQuotes = false;
        } else {
            if (c == '"' || c == 39) {
                inQuotes = true; qChar = c; cur += c;
            } else if (c == '(') { pDepth++; cur += c; }
            else if (c == ')') { pDepth--; cur += c; }
            else if (c == '[') { bDepth++; cur += c; }
            else if (c == ']') { bDepth--; cur += c; }
            else if (c == ',' && pDepth == 0 && bDepth == 0) {
                string trimmed = trim(cur);
                if (!trimmed.empty()) calls.push_back(trimmed);
                cur = "";
            } else {
                cur += c;
            }
        }
    }
    string trimmed = trim(cur);
    if (!trimmed.empty()) calls.push_back(trimmed);
    return calls;
}

static vector<string> splitArgs(const string& argsStr) {
    vector<string> args;
    string cur = "";
    bool inQuotes = false;
    char qChar = 0;
    int depth = 0;

    for (size_t i = 0; i < argsStr.size(); ++i) {
        char c = argsStr[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i == 0 || argsStr[i - 1] != '\\\\')) inQuotes = false;
        } else {
            if (c == '"' || c == 39) {
                inQuotes = true; qChar = c; cur += c;
            } else if (c == '(' || c == '[' || c == '{') {
                depth++; cur += c;
            } else if (c == ')' || c == ']' || c == '}') {
                depth--; cur += c;
            } else if (c == ',' && depth == 0) {
                args.push_back(trim(cur));
                cur = "";
            } else {
                cur += c;
            }
        }
    }
    if (!trim(cur).empty()) args.push_back(trim(cur));
    return args;
}

static vector<string> parseStringList(const string& str) {
    vector<string> res;
    string t = trim(str);
    if (t.size() >= 2 && t.front() == '[' && t.back() == ']') {
        t = t.substr(1, t.size() - 2);
    }
    if (trim(t).empty()) return res;
    vector<string> items = splitArgs(t);
    for (const auto& item : items) {
        res.push_back(stripQuotes(item));
    }
    return res;
}

int main() {
    ios_base::sync_with_stdio(false);
    string raw_input = R"RAW(initialize(["CreditCard", "UPI", "PayPal"]), calculateDiscount("VIP", 200.0), processPayment("UPI", 180.0), processPayment("Crypto", 50.0), getPaymentStatus("CreditCard"), getPaymentStatus("Crypto"))RAW";

    size_t eqPos = raw_input.find('=');
    if (eqPos != string::npos) {
        size_t firstParen = raw_input.find('(');
        if (firstParen != string::npos && eqPos < firstParen) {
            string beforeEq = trim(raw_input.substr(0, eqPos));
            if (beforeEq.find('(') == string::npos) {
                raw_input = trim(raw_input.substr(eqPos + 1));
            }
        }
    }

    vector<string> calls = splitCalls(raw_input);
    Solution sol;
    vector<string> results;

    for (const string& call : calls) {
        size_t openP = call.find('(');
        size_t closeP = call.rfind(')');
        if (openP == string::npos || closeP == string::npos || closeP <= openP) continue;

        string fnName = trim(call.substr(0, openP));
        size_t innerEq = fnName.rfind('=');
        if (innerEq != string::npos) fnName = trim(fnName.substr(innerEq + 1));

        string argsStr = call.substr(openP + 1, closeP - openP - 1);
        vector<string> args = splitArgs(argsStr);

        if (fnName == "initialize" || fnName == "Solution") {
            vector<string> methods = args.size() > 0 ? parseStringList(args[0]) : vector<string>();
            int res = sol.initialize(methods);
            results.push_back(to_string(res));
        } else if (fnName == "calculateDiscount") {
            string cType = args.size() > 0 ? stripQuotes(args[0]) : "";
            double amt = args.size() > 1 ? stod(args[1]) : 0.0;
            double res = sol.calculateDiscount(cType, amt);
            stringstream ss;
            if (res == floor(res)) ss << fixed << setprecision(1) << res;
            else ss << fixed << setprecision(res * 10 == floor(res * 10) ? 1 : 2) << res;
            results.push_back(ss.str());
        } else if (fnName == "processPayment") {
            string m = args.size() > 0 ? stripQuotes(args[0]) : "";
            double amt = args.size() > 1 ? stod(args[1]) : 0.0;
            bool res = sol.processPayment(m, amt);
            results.push_back(res ? "true" : "false");
        } else if (fnName == "getPaymentStatus") {
            string m = args.size() > 0 ? stripQuotes(args[0]) : "";
            string res = sol.getPaymentStatus(m);
            results.push_back("\\"" + res + "\\"");
        }
    }

    for (size_t i = 0; i < results.size(); ++i) {
        cout << results[i] << (i + 1 < results.size() ? ", " : "");
    }
    cout << "\\n";
    return 0;
}`;
    }

    if (lang === 'python') {
      return `import sys, json

# === USER SOLUTION ===

# === HIDDEN DRIVER ===
def split_calls(s):
    calls = []
    cur = []
    p_depth = 0
    b_depth = 0
    in_quotes = False
    q_char = ''
    for i, c in enumerate(s):
        if in_quotes:
            cur.append(c)
            if c == q_char and (i == 0 or s[i-1] != '\\\\'):
                in_quotes = False
        else:
            if c in ('"', "'"):
                in_quotes = True; q_char = c; cur.append(c)
            elif c == '(': p_depth += 1; cur.append(c)
            elif c == ')': p_depth -= 1; cur.append(c)
            elif c == '[': b_depth += 1; cur.append(c)
            elif c == ']': b_depth -= 1; cur.append(c)
            elif c == ',' and p_depth == 0 and b_depth == 0:
                t = ''.join(cur).strip()
                if t: calls.append(t)
                cur = []
            else:
                cur.append(c)
    t = ''.join(cur).strip()
    if t: calls.append(t)
    return calls

def split_args(s):
    args = []
    cur = []
    depth = 0
    in_quotes = False
    q_char = ''
    for i, c in enumerate(s):
        if in_quotes:
            cur.append(c)
            if c == q_char and (i == 0 or s[i-1] != '\\\\'): in_quotes = False
        else:
            if c in ('"', "'"): in_quotes = True; q_char = c; cur.append(c)
            elif c in ('(', '[', '{'): depth += 1; cur.append(c)
            elif c in (')', ']', '}'): depth -= 1; cur.append(c)
            elif c == ',' and depth == 0:
                args.append(''.join(cur).strip())
                cur = []
            else: cur.append(c)
    t = ''.join(cur).strip()
    if t: args.append(t)
    return args

def strip_quotes(s):
    t = s.strip()
    if len(t) >= 2 and ((t[0] == '"' and t[-1] == '"') or (t[0] == "'" and t[-1] == "'")):
        return t[1:-1]
    return t

def parse_list(s):
    t = s.strip()
    try:
        return json.loads(t)
    except:
        if t.startswith('[') and t.endswith(']'):
            t = t[1:-1]
        items = split_args(t)
        return [strip_quotes(x) for x in items if x.strip()]

def main():
    raw_input = """initialize(["CreditCard", "UPI", "PayPal"]), calculateDiscount("VIP", 200.0), processPayment("UPI", 180.0), processPayment("Crypto", 50.0), getPaymentStatus("CreditCard"), getPaymentStatus("Crypto")"""
    raw_input = raw_input.strip()
    if '=' in raw_input and '(' in raw_input and raw_input.find('=') < raw_input.find('('):
        if '(' not in raw_input[:raw_input.find('=')]:
            raw_input = raw_input[raw_input.find('=')+1:].strip()

    calls = split_calls(raw_input)
    sol = Solution()
    results = []

    for call in calls:
        op = call.find('(')
        cp = call.rfind(')')
        if op == -1 or cp == -1 or cp <= op: continue
        fn = call[:op].strip()
        if '=' in fn: fn = fn.split('=')[-1].strip()
        args = split_args(call[op+1:cp].strip())

        if fn in ("initialize", "Solution"):
            m = parse_list(args[0]) if len(args) > 0 else []
            res = sol.initialize(m)
            results.append(str(res))
        elif fn == "calculateDiscount":
            ct = strip_quotes(args[0]) if len(args) > 0 else ""
            amt = float(args[1]) if len(args) > 1 else 0.0
            res = sol.calculateDiscount(ct, amt)
            if float(res).is_integer():
                results.append(f"{float(res):.1f}")
            else:
                results.append(f"{round(float(res), 2)}")
        elif fn == "processPayment":
            m = strip_quotes(args[0]) if len(args) > 0 else ""
            amt = float(args[1]) if len(args) > 1 else 0.0
            res = sol.processPayment(m, amt)
            results.append("true" if res else "false")
        elif fn == "getPaymentStatus":
            m = strip_quotes(args[0]) if len(args) > 0 else ""
            res = sol.getPaymentStatus(m)
            results.append(f'"{res}"')

    print(", ".join(results))

if __name__ == '__main__':
    main()`;
    }

    if (lang === 'javascript') {
      return `// === USER SOLUTION ===

// === HIDDEN DRIVER ===
function stripQuotes(s) {
    const t = String(s).trim();
    if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) {
        return t.slice(1, -1);
    }
    return t;
}

function splitCalls(s) {
    const calls = [];
    let cur = '';
    let pDepth = 0, bDepth = 0;
    let inQuotes = false, qChar = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inQuotes) {
            cur += c;
            if (c === qChar && (i === 0 || s[i-1] !== '\\\\')) inQuotes = false;
        } else {
            if (c === '"' || c === "'") { inQuotes = true; qChar = c; cur += c; }
            else if (c === '(') { pDepth++; cur += c; }
            else if (c === ')') { pDepth--; cur += c; }
            else if (c === '[') { bDepth++; cur += c; }
            else if (c === ']') { bDepth--; cur += c; }
            else if (c === ',' && pDepth === 0 && bDepth === 0) {
                if (cur.trim()) calls.push(cur.trim());
                cur = '';
            } else { cur += c; }
        }
    }
    if (cur.trim()) calls.push(cur.trim());
    return calls;
}

function splitArgs(s) {
    const args = [];
    let cur = '', depth = 0, inQuotes = false, qChar = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inQuotes) {
            cur += c;
            if (c === qChar && (i === 0 || s[i-1] !== '\\\\')) inQuotes = false;
        } else {
            if (c === '"' || c === "'") { inQuotes = true; qChar = c; cur += c; }
            else if (c === '(' || c === '[' || c === '{') { depth++; cur += c; }
            else if (c === ')' || c === ']' || c === '}') { depth--; cur += c; }
            else if (c === ',' && depth === 0) {
                args.push(cur.trim());
                cur = '';
            } else { cur += c; }
        }
    }
    if (cur.trim()) args.push(cur.trim());
    return args;
}

function parseList(s) {
    try { return JSON.parse(s); }
    catch {
        let t = s.trim();
        if (t.startsWith('[') && t.endsWith(']')) t = t.slice(1, -1);
        return splitArgs(t).map(stripQuotes);
    }
}

function main() {
    let raw = \`initialize(["CreditCard", "UPI", "PayPal"]), calculateDiscount("VIP", 200.0), processPayment("UPI", 180.0), processPayment("Crypto", 50.0), getPaymentStatus("CreditCard"), getPaymentStatus("Crypto")\`;
    const calls = splitCalls(raw);
    const sol = new Solution();
    const results = [];

    for (const call of calls) {
        const op = call.indexOf('(');
        const cp = call.lastIndexOf(')');
        if (op === -1 || cp === -1 || cp <= op) continue;
        let fn = call.slice(0, op).trim();
        if (fn.includes('=')) fn = fn.split('=').pop().trim();
        const args = splitArgs(call.slice(op + 1, cp).trim());

        if (fn === 'initialize' || fn === 'Solution') {
            const m = args[0] ? parseList(args[0]) : [];
            results.push(String(sol.initialize(m)));
        } else if (fn === 'calculateDiscount') {
            const ct = args[0] ? stripQuotes(args[0]) : '';
            const amt = args[1] ? Number(args[1]) : 0;
            const res = sol.calculateDiscount(ct, amt);
            results.push(Number.isInteger(res) ? res.toFixed(1) : String(res));
        } else if (fn === 'processPayment') {
            const m = args[0] ? stripQuotes(args[0]) : '';
            const amt = args[1] ? Number(args[1]) : 0;
            results.push(sol.processPayment(m, amt) ? 'true' : 'false');
        } else if (fn === 'getPaymentStatus') {
            const m = args[0] ? stripQuotes(args[0]) : '';
            results.push(\`"\${sol.getPaymentStatus(m)}"\`);
        }
    }

    console.log(results.join(', '));
}

main();`;
    }

    if (lang === 'java') {
      return `import java.util.*;
import java.text.DecimalFormat;

// === USER SOLUTION ===

// === HIDDEN DRIVER ===
public class Main {
    static String trim(String s) {
        return s == null ? "" : s.trim();
    }

    static String stripQuotes(String s) {
        String t = trim(s);
        if (t.length() >= 2 && ((t.startsWith("\"") && t.endsWith("\"")) || (t.startsWith("'") && t.endsWith("'")))) {
            return t.substring(1, t.length() - 1);
        }
        return t;
    }

    static List<String> splitCalls(String s) {
        List<String> calls = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int pDepth = 0, bDepth = 0;
        boolean inQuotes = false;
        char qChar = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (inQuotes) {
                cur.append(c);
                if (c == qChar && (i == 0 || s.charAt(i - 1) != '\\\\')) inQuotes = false;
            } else {
                if (c == '"' || c == '\'') { inQuotes = true; qChar = c; cur.append(c); }
                else if (c == '(') { pDepth++; cur.append(c); }
                else if (c == ')') { pDepth--; cur.append(c); }
                else if (c == '[') { bDepth++; cur.append(c); }
                else if (c == ']') { bDepth--; cur.append(c); }
                else if (c == ',' && pDepth == 0 && bDepth == 0) {
                    if (cur.toString().trim().length() > 0) calls.add(cur.toString().trim());
                    cur = new StringBuilder();
                } else { cur.append(c); }
            }
        }
        if (cur.toString().trim().length() > 0) calls.add(cur.toString().trim());
        return calls;
    }

    static List<String> splitArgs(String s) {
        List<String> args = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int depth = 0;
        boolean inQuotes = false;
        char qChar = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (inQuotes) {
                cur.append(c);
                if (c == qChar && (i == 0 || s.charAt(i - 1) != '\\\\')) inQuotes = false;
            } else {
                if (c == '"' || c == '\'') { inQuotes = true; qChar = c; cur.append(c); }
                else if (c == '(' || c == '[' || c == '{') { depth++; cur.append(c); }
                else if (c == ')' || c == ']' || c == '}') { depth--; cur.append(c); }
                else if (c == ',' && depth == 0) {
                    args.add(cur.toString().trim());
                    cur = new StringBuilder();
                } else { cur.append(c); }
            }
        }
        if (cur.toString().trim().length() > 0) args.add(cur.toString().trim());
        return args;
    }

    static List<String> parseList(String s) {
        String t = trim(s);
        if (t.startsWith("[") && t.endsWith("]")) t = t.substring(1, t.length() - 1);
        List<String> rawItems = splitArgs(t);
        List<String> res = new ArrayList<>();
        for (String item : rawItems) {
            String q = stripQuotes(item);
            if (!q.isEmpty()) res.add(q);
        }
        return res;
    }

    public static void main(String[] args) {
        String raw = """initialize(["CreditCard", "UPI", "PayPal"]), calculateDiscount("VIP", 200.0), processPayment("UPI", 180.0), processPayment("Crypto", 50.0), getPaymentStatus("CreditCard"), getPaymentStatus("Crypto")""";
        if (raw.contains("=") && raw.contains("(") && raw.indexOf("=") < raw.indexOf("(")) {
            if (!raw.substring(0, raw.indexOf("=")).contains("(")) {
                raw = raw.substring(raw.indexOf("=") + 1).trim();
            }
        }
        List<String> calls = splitCalls(raw);
        Solution sol = new Solution();
        List<String> results = new ArrayList<>();
        DecimalFormat df = new DecimalFormat("0.#");

        for (String call : calls) {
            int op = call.indexOf('(');
            int cp = call.lastIndexOf(')');
            if (op == -1 || cp == -1 || cp <= op) continue;
            String fn = call.substring(0, op).trim();
            if (fn.contains("=")) fn = fn.substring(fn.lastIndexOf('=') + 1).trim();
            List<String> argList = splitArgs(call.substring(op + 1, cp).trim());

            if (fn.equals("initialize") || fn.equals("Solution")) {
                List<String> m = argList.size() > 0 ? parseList(argList.get(0)) : new ArrayList<>();
                results.add(String.valueOf(sol.initialize(m)));
            } else if (fn.equals("calculateDiscount")) {
                String ct = argList.size() > 0 ? stripQuotes(argList.get(0)) : "";
                double amt = argList.size() > 1 ? Double.parseDouble(argList.get(1)) : 0.0;
                double res = sol.calculateDiscount(ct, amt);
                results.add(res == Math.floor(res) ? String.format(Locale.US, "%.1f", res) : df.format(res));
            } else if (fn.equals("processPayment")) {
                String m = argList.size() > 0 ? stripQuotes(argList.get(0)) : "";
                double amt = argList.size() > 1 ? Double.parseDouble(argList.get(1)) : 0.0;
                results.add(sol.processPayment(m, amt) ? "true" : "false");
            } else if (fn.equals("getPaymentStatus")) {
                String m = argList.size() > 0 ? stripQuotes(argList.get(0)) : "";
                results.add("\\"" + sol.getPaymentStatus(m) + "\\"");
            }
        }
        System.out.println(String.join(", ", results));
    }
}`;
    }
  }

  if (isLSP) {
    if (lang === 'cpp') {
      return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <iomanip>

using namespace std;

// === USER SOLUTION ===

// === HIDDEN DRIVER ===
static inline string trim(const string& s) {
    size_t start = s.find_first_not_of(" \\t\\n\\r");
    if (start == string::npos) return "";
    size_t end = s.find_last_not_of(" \\t\\n\\r");
    return s.substr(start, end - start + 1);
}

static inline string stripQuotes(const string& s) {
    string t = trim(s);
    if (t.size() >= 2 && ((t.front() == '"' && t.back() == '"') || (t.front() == 39 && t.back() == 39))) {
        return t.substr(1, t.size() - 2);
    }
    return t;
}

static vector<string> splitCalls(const string& input) {
    vector<string> calls;
    string cur = "";
    int pDepth = 0;
    bool inQuotes = false;
    char qChar = 0;
    for (size_t i = 0; i < input.size(); ++i) {
        char c = input[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i == 0 || input[i - 1] != '\\\\')) inQuotes = false;
        } else {
            if (c == '"' || c == 39) { inQuotes = true; qChar = c; cur += c; }
            else if (c == '(') { pDepth++; cur += c; }
            else if (c == ')') { pDepth--; cur += c; }
            else if (c == ',' && pDepth == 0) {
                if (!trim(cur).empty()) calls.push_back(trim(cur));
                cur = "";
            } else { cur += c; }
        }
    }
    if (!trim(cur).empty()) calls.push_back(trim(cur));
    return calls;
}

static vector<string> splitArgs(const string& s) {
    vector<string> args;
    string cur = "";
    int depth = 0;
    bool inQuotes = false;
    char qChar = 0;
    for (size_t i = 0; i < s.size(); ++i) {
        char c = s[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i == 0 || s[i - 1] != '\\\\')) inQuotes = false;
        } else {
            if (c == '"' || c == 39) { inQuotes = true; qChar = c; cur += c; }
            else if (c == '(' || c == '[' || c == '{') { depth++; cur += c; }
            else if (c == ')' || c == ']' || c == '}') { depth--; cur += c; }
            else if (c == ',' && depth == 0) {
                args.push_back(trim(cur));
                cur = "";
            } else { cur += c; }
        }
    }
    if (!trim(cur).empty()) args.push_back(trim(cur));
    return args;
}

int main() {
    ios_base::sync_with_stdio(false);
    string raw_input = R"RAW(createAccount("Savings", "ACC1", 1000.0), deposit("ACC1", 500.0), withdraw("ACC1", 1200.0), getBalance("ACC1"))RAW";
    vector<string> calls = splitCalls(raw_input);
    Solution sol;
    vector<string> results;

    for (const string& call : calls) {
        size_t openP = call.find('(');
        size_t closeP = call.rfind(')');
        if (openP == string::npos || closeP == string::npos || closeP <= openP) continue;
        string fn = trim(call.substr(0, openP));
        if (fn.find('=') != string::npos) fn = trim(fn.substr(fn.rfind('=') + 1));
        vector<string> args = splitArgs(call.substr(openP + 1, closeP - openP - 1));

        if (fn == "createAccount") {
            string t = args.size() > 0 ? stripQuotes(args[0]) : "";
            string id = args.size() > 1 ? stripQuotes(args[1]) : "";
            double b = args.size() > 2 ? stod(args[2]) : 0.0;
            results.push_back(sol.createAccount(t, id, b) ? "true" : "false");
        } else if (fn == "deposit") {
            string id = args.size() > 0 ? stripQuotes(args[0]) : "";
            double a = args.size() > 1 ? stod(args[1]) : 0.0;
            results.push_back(sol.deposit(id, a) ? "true" : "false");
        } else if (fn == "withdraw") {
            string id = args.size() > 0 ? stripQuotes(args[0]) : "";
            double a = args.size() > 1 ? stod(args[1]) : 0.0;
            results.push_back(sol.withdraw(id, a) ? "true" : "false");
        } else if (fn == "getBalance") {
            string id = args.size() > 0 ? stripQuotes(args[0]) : "";
            double res = sol.getBalance(id);
            stringstream ss;
            ss << fixed << setprecision(1) << res;
            results.push_back(ss.str());
        }
    }

    for (size_t i = 0; i < results.size(); ++i) {
        cout << results[i] << (i + 1 < results.size() ? ", " : "");
    }
    cout << "\\n";
    return 0;
}`;
    }

    if (lang === 'python') {
      return `# === USER SOLUTION ===

# === HIDDEN DRIVER ===
import sys

def split_calls(s):
    calls, cur, p_depth, in_q, q_char = [], [], 0, False, ''
    for i, c in enumerate(s):
        if in_q:
            cur.append(c)
            if c == q_char and (i == 0 or s[i-1] != '\\\\'): in_q = False
        else:
            if c in ('"', "'"): in_q, q_char = True, c; cur.append(c)
            elif c == '(': p_depth += 1; cur.append(c)
            elif c == ')': p_depth -= 1; cur.append(c)
            elif c == ',' and p_depth == 0:
                t = ''.join(cur).strip()
                if t: calls.append(t)
                cur = []
            else: cur.append(c)
    t = ''.join(cur).strip()
    if t: calls.append(t)
    return calls

def split_args(s):
    args, cur, depth, in_q, q_char = [], [], 0, False, ''
    for i, c in enumerate(s):
        if in_q:
            cur.append(c)
            if c == q_char and (i == 0 or s[i-1] != '\\\\'): in_q = False
        else:
            if c in ('"', "'"): in_q, q_char = True, c; cur.append(c)
            elif c in ('(', '[', '{'): depth += 1; cur.append(c)
            elif c in (')', ']', '}'): depth -= 1; cur.append(c)
            elif c == ',' and depth == 0:
                args.append(''.join(cur).strip())
                cur = []
            else: cur.append(c)
    t = ''.join(cur).strip()
    if t: args.append(t)
    return args

def strip_quotes(s):
    t = s.strip()
    if len(t) >= 2 and ((t[0] == '"' and t[-1] == '"') or (t[0] == "'" and t[-1] == "'")): return t[1:-1]
    return t

def main():
    raw = """createAccount("Savings", "ACC1", 1000.0), deposit("ACC1", 500.0), withdraw("ACC1", 1200.0), getBalance("ACC1")"""
    calls = split_calls(raw)
    sol = Solution()
    results = []
    for call in calls:
        op = call.find('('); cp = call.rfind(')')
        if op == -1 or cp == -1: continue
        fn = call[:op].strip()
        if '=' in fn: fn = fn.split('=')[-1].strip()
        args = split_args(call[op+1:cp].strip())
        if fn == "createAccount":
            results.append("true" if sol.createAccount(strip_quotes(args[0]), strip_quotes(args[1]), float(args[2])) else "false")
        elif fn == "deposit":
            results.append("true" if sol.deposit(strip_quotes(args[0]), float(args[1])) else "false")
        elif fn == "withdraw":
            results.append("true" if sol.withdraw(strip_quotes(args[0]), float(args[1])) else "false")
        elif fn == "getBalance":
            res = sol.getBalance(strip_quotes(args[0]))
            results.append(f"{res:.1f}")
    print(", ".join(results))

if __name__ == '__main__':
    main()`;
    }

    if (lang === 'javascript') {
      return `// === USER SOLUTION ===

// === HIDDEN DRIVER ===
function stripQuotes(s) {
    const t = String(s).trim();
    if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) return t.slice(1, -1);
    return t;
}

function splitCalls(s) {
    const calls = [];
    let cur = '', pDepth = 0, inQuotes = false, qChar = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inQuotes) {
            cur += c;
            if (c === qChar && (i === 0 || s[i-1] !== '\\\\')) inQuotes = false;
        } else {
            if (c === '"' || c === "'") { inQuotes = true; qChar = c; cur += c; }
            else if (c === '(') { pDepth++; cur += c; }
            else if (c === ')') { pDepth--; cur += c; }
            else if (c === ',' && pDepth === 0) {
                if (cur.trim()) calls.push(cur.trim());
                cur = '';
            } else { cur += c; }
        }
    }
    if (cur.trim()) calls.push(cur.trim());
    return calls;
}

function splitArgs(s) {
    const args = [];
    let cur = '', depth = 0, inQuotes = false, qChar = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inQuotes) {
            cur += c;
            if (c === qChar && (i === 0 || s[i-1] !== '\\\\')) inQuotes = false;
        } else {
            if (c === '"' || c === "'") { inQuotes = true; qChar = c; cur += c; }
            else if (c === '(' || c === '[' || c === '{') { depth++; cur += c; }
            else if (c === ')' || c === ']' || c === '}') { depth--; cur += c; }
            else if (c === ',' && depth === 0) { args.push(cur.trim()); cur = ''; }
            else { cur += c; }
        }
    }
    if (cur.trim()) args.push(cur.trim());
    return args;
}

function main() {
    const raw = \`createAccount("Savings", "ACC1", 1000.0), deposit("ACC1", 500.0), withdraw("ACC1", 1200.0), getBalance("ACC1")\`;
    const calls = splitCalls(raw);
    const sol = new Solution();
    const results = [];
    for (const call of calls) {
        const op = call.indexOf('('); const cp = call.lastIndexOf(')');
        if (op === -1 || cp === -1) continue;
        let fn = call.slice(0, op).trim();
        if (fn.includes('=')) fn = fn.split('=').pop().trim();
        const args = splitArgs(call.slice(op + 1, cp).trim());
        if (fn === 'createAccount') {
            results.push(sol.createAccount(stripQuotes(args[0]), stripQuotes(args[1]), Number(args[2])) ? 'true' : 'false');
        } else if (fn === 'deposit') {
            results.push(sol.deposit(stripQuotes(args[0]), Number(args[1])) ? 'true' : 'false');
        } else if (fn === 'withdraw') {
            results.push(sol.withdraw(stripQuotes(args[0]), Number(args[1])) ? 'true' : 'false');
        } else if (fn === 'getBalance') {
            const b = sol.getBalance(stripQuotes(args[0]));
            results.push(Number.isInteger(b) ? b.toFixed(1) : String(b));
        }
    }
    console.log(results.join(', '));
}

main();`;
    }

    if (lang === 'java') {
      return `import java.util.*;
import java.text.DecimalFormat;

// === USER SOLUTION ===

// === HIDDEN DRIVER ===
public class Main {
    static String trim(String s) {
        return s == null ? "" : s.trim();
    }

    static String stripQuotes(String s) {
        String t = trim(s);
        if (t.length() >= 2 && ((t.startsWith("\"") && t.endsWith("\"")) || (t.startsWith("'") && t.endsWith("'")))) {
            return t.substring(1, t.length() - 1);
        }
        return t;
    }

    static List<String> splitCalls(String s) {
        List<String> calls = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int pDepth = 0;
        boolean inQuotes = false;
        char qChar = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (inQuotes) {
                cur.append(c);
                if (c == qChar && (i == 0 || s.charAt(i - 1) != '\\\\')) inQuotes = false;
            } else {
                if (c == '"' || c == '\'') { inQuotes = true; qChar = c; cur.append(c); }
                else if (c == '(') { pDepth++; cur.append(c); }
                else if (c == ')') { pDepth--; cur.append(c); }
                else if (c == ',' && pDepth == 0) {
                    if (cur.toString().trim().length() > 0) calls.add(cur.toString().trim());
                    cur = new StringBuilder();
                } else { cur.append(c); }
            }
        }
        if (cur.toString().trim().length() > 0) calls.add(cur.toString().trim());
        return calls;
    }

    static List<String> splitArgs(String s) {
        List<String> args = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int depth = 0;
        boolean inQuotes = false;
        char qChar = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (inQuotes) {
                cur.append(c);
                if (c == qChar && (i == 0 || s.charAt(i - 1) != '\\\\')) inQuotes = false;
            } else {
                if (c == '"' || c == '\'') { inQuotes = true; qChar = c; cur.append(c); }
                else if (c == '(' || c == '[' || c == '{') { depth++; cur.append(c); }
                else if (c == ')' || c == ']' || c == '}') { depth--; cur.append(c); }
                else if (c == ',' && depth == 0) {
                    args.add(cur.toString().trim());
                    cur = new StringBuilder();
                } else { cur.append(c); }
            }
        }
        if (cur.toString().trim().length() > 0) args.add(cur.toString().trim());
        return args;
    }

    public static void main(String[] args) {
        String raw = """createAccount("Savings", "ACC1", 1000.0), deposit("ACC1", 500.0), withdraw("ACC1", 1200.0), getBalance("ACC1")""";
        List<String> calls = splitCalls(raw);
        Solution sol = new Solution();
        List<String> results = new ArrayList<>();

        for (String call : calls) {
            int op = call.indexOf('(');
            int cp = call.lastIndexOf(')');
            if (op == -1 || cp == -1 || cp <= op) continue;
            String fn = call.substring(0, op).trim();
            if (fn.contains("=")) fn = fn.substring(fn.lastIndexOf('=') + 1).trim();
            List<String> argList = splitArgs(call.substring(op + 1, cp).trim());

            if (fn.equals("createAccount")) {
                String t = argList.size() > 0 ? stripQuotes(argList.get(0)) : "";
                String id = argList.size() > 1 ? stripQuotes(argList.get(1)) : "";
                double b = argList.size() > 2 ? Double.parseDouble(argList.get(2)) : 0.0;
                results.add(sol.createAccount(t, id, b) ? "true" : "false");
            } else if (fn.equals("deposit")) {
                String id = argList.size() > 0 ? stripQuotes(argList.get(0)) : "";
                double a = argList.size() > 1 ? Double.parseDouble(argList.get(1)) : 0.0;
                results.add(sol.deposit(id, a) ? "true" : "false");
            } else if (fn.equals("withdraw")) {
                String id = argList.size() > 0 ? stripQuotes(argList.get(0)) : "";
                double a = argList.size() > 1 ? Double.parseDouble(argList.get(1)) : 0.0;
                results.add(sol.withdraw(id, a) ? "true" : "false");
            } else if (fn.equals("getBalance")) {
                String id = argList.size() > 0 ? stripQuotes(argList.get(0)) : "";
                double res = sol.getBalance(id);
                results.add(String.format(Locale.US, "%.1f", res));
            }
        }
        System.out.println(String.join(", ", results));
    }
}`;
    }
  }

  if (isISP) {
    if (lang === 'cpp') {
      return `#include <iostream>
#include <vector>
#include <string>

using namespace std;

// === USER SOLUTION ===

// === HIDDEN DRIVER ===
static inline string trim(const string& s) {
    size_t start = s.find_first_not_of(" \\t\\n\\r");
    if (start == string::npos) return "";
    size_t end = s.find_last_not_of(" \\t\\n\\r");
    return s.substr(start, end - start + 1);
}

static inline string stripQuotes(const string& s) {
    string t = trim(s);
    if (t.size() >= 2 && ((t.front() == '"' && t.back() == '"') || (t.front() == 39 && t.back() == 39))) return t.substr(1, t.size() - 2);
    return t;
}

static vector<string> splitCalls(const string& s) {
    vector<string> calls; string cur = ""; int pDepth = 0; bool inQuotes = false; char qChar = 0;
    for (size_t i = 0; i < s.size(); ++i) {
        char c = s[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i == 0 || s[i-1] != '\\\\')) inQuotes = false;
        } else {
            if (c == '"' || c == 39) { inQuotes = true; qChar = c; cur += c; }
            else if (c == '(') { pDepth++; cur += c; }
            else if (c == ')') { pDepth--; cur += c; }
            else if (c == ',' && pDepth == 0) { if (!trim(cur).empty()) calls.push_back(trim(cur)); cur = ""; }
            else { cur += c; }
        }
    }
    if (!trim(cur).empty()) calls.push_back(trim(cur));
    return calls;
}

static vector<string> splitArgs(const string& s) {
    vector<string> args; string cur = ""; int depth = 0; bool inQuotes = false; char qChar = 0;
    for (size_t i = 0; i < s.size(); ++i) {
        char c = s[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i == 0 || s[i-1] != '\\\\')) inQuotes = false;
        } else {
            if (c == '"' || c == 39) { inQuotes = true; qChar = c; cur += c; }
            else if (c == '(' || c == '[' || c == '{') { depth++; cur += c; }
            else if (c == ')' || c == ']' || c == '}') { depth--; cur += c; }
            else if (c == ',' && depth == 0) { args.push_back(trim(cur)); cur = ""; }
            else { cur += c; }
        }
    }
    if (!trim(cur).empty()) args.push_back(trim(cur));
    return args;
}

int main() {
    ios_base::sync_with_stdio(false);
    string raw = R"RAW(registerDevice("DEV1", "BasicPrinter"), printDocument("DEV1", "report.pdf"), scanDocument("DEV1", "report.pdf"), getOperationCount("DEV1"))RAW";
    vector<string> calls = splitCalls(raw);
    Solution sol;
    vector<string> results;
    for (const string& call : calls) {
        size_t op = call.find('('), cp = call.rfind(')');
        if (op == string::npos || cp == string::npos) continue;
        string fn = trim(call.substr(0, op));
        if (fn.find('=') != string::npos) fn = trim(fn.substr(fn.rfind('=') + 1));
        vector<string> args = splitArgs(call.substr(op + 1, cp - op - 1));

        if (fn == "registerDevice") {
            results.push_back(sol.registerDevice(stripQuotes(args[0]), stripQuotes(args[1])) ? "true" : "false");
        } else if (fn == "printDocument") {
            results.push_back(sol.printDocument(stripQuotes(args[0]), stripQuotes(args[1])) ? "true" : "false");
        } else if (fn == "scanDocument") {
            results.push_back(sol.scanDocument(stripQuotes(args[0]), stripQuotes(args[1])) ? "true" : "false");
        } else if (fn == "faxDocument") {
            results.push_back(sol.faxDocument(stripQuotes(args[0]), stripQuotes(args[1]), stripQuotes(args[2])) ? "true" : "false");
        } else if (fn == "getOperationCount") {
            results.push_back(to_string(sol.getOperationCount(stripQuotes(args[0]))));
        }
    }
    for (size_t i = 0; i < results.size(); ++i) {
        cout << results[i] << (i + 1 < results.size() ? ", " : "");
    }
    cout << "\\n";
    return 0;
}`;
    }

    if (lang === 'python') {
      return `# === USER SOLUTION ===

# === HIDDEN DRIVER ===
def split_calls(s):
    calls, cur, p_depth, in_q, q_char = [], [], 0, False, ''
    for i, c in enumerate(s):
        if in_q:
            cur.append(c)
            if c == q_char and (i == 0 or s[i-1] != '\\\\'): in_q = False
        else:
            if c in ('"', "'"): in_q, q_char = True, c; cur.append(c)
            elif c == '(': p_depth += 1; cur.append(c)
            elif c == ')': p_depth -= 1; cur.append(c)
            elif c == ',' and p_depth == 0:
                t = ''.join(cur).strip()
                if t: calls.append(t)
                cur = []
            else: cur.append(c)
    t = ''.join(cur).strip()
    if t: calls.append(t)
    return calls

def split_args(s):
    args, cur, depth, in_q, q_char = [], [], 0, False, ''
    for i, c in enumerate(s):
        if in_q:
            cur.append(c)
            if c == q_char and (i == 0 or s[i-1] != '\\\\'): in_q = False
        else:
            if c in ('"', "'"): in_q, q_char = True, c; cur.append(c)
            elif c in ('(', '[', '{'): depth += 1; cur.append(c)
            elif c in (')', ']', '}'): depth -= 1; cur.append(c)
            elif c == ',' and depth == 0:
                args.append(''.join(cur).strip())
                cur = []
            else: cur.append(c)
    t = ''.join(cur).strip()
    if t: args.append(t)
    return args

def strip_quotes(s):
    t = s.strip()
    if len(t) >= 2 and ((t[0] == '"' and t[-1] == '"') or (t[0] == "'" and t[-1] == "'")): return t[1:-1]
    return t

def main():
    raw = """registerDevice("DEV1", "BasicPrinter"), printDocument("DEV1", "report.pdf"), scanDocument("DEV1", "report.pdf"), getOperationCount("DEV1")"""
    calls = split_calls(raw)
    sol = Solution()
    results = []
    for call in calls:
        op = call.find('('); cp = call.rfind(')')
        if op == -1 or cp == -1: continue
        fn = call[:op].strip()
        if '=' in fn: fn = fn.split('=')[-1].strip()
        args = split_args(call[op+1:cp].strip())
        if fn == "registerDevice":
            results.append("true" if sol.registerDevice(strip_quotes(args[0]), strip_quotes(args[1])) else "false")
        elif fn == "printDocument":
            results.append("true" if sol.printDocument(strip_quotes(args[0]), strip_quotes(args[1])) else "false")
        elif fn == "scanDocument":
            results.append("true" if sol.scanDocument(strip_quotes(args[0]), strip_quotes(args[1])) else "false")
        elif fn == "faxDocument":
            results.append("true" if sol.faxDocument(strip_quotes(args[0]), strip_quotes(args[1]), strip_quotes(args[2])) else "false")
        elif fn == "getOperationCount":
            results.append(str(sol.getOperationCount(strip_quotes(args[0]))))
    print(", ".join(results))

if __name__ == '__main__':
    main()`;
    }

    if (lang === 'javascript') {
      return `// === USER SOLUTION ===

// === HIDDEN DRIVER ===
function stripQuotes(s) {
    const t = String(s).trim();
    if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) return t.slice(1, -1);
    return t;
}

function splitCalls(s) {
    const calls = [];
    let cur = '', pDepth = 0, inQuotes = false, qChar = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i === 0 || s[i-1] !== '\\\\')) inQuotes = false;
        } else {
            if (c === '"' || c === "'") { inQuotes = true; qChar = c; cur += c; }
            else if (c === '(') { pDepth++; cur += c; }
            else if (c === ')') { pDepth--; cur += c; }
            else if (c === ',' && pDepth === 0) {
                if (cur.trim()) calls.push(cur.trim());
                cur = '';
            } else { cur += c; }
        }
    }
    if (cur.trim()) calls.push(cur.trim());
    return calls;
}

function splitArgs(s) {
    const args = [];
    let cur = '', depth = 0, inQuotes = false, qChar = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i === 0 || s[i-1] !== '\\\\')) inQuotes = false;
        } else {
            if (c === '"' || c === "'") { inQuotes = true; qChar = c; cur += c; }
            else if (c === '(' || c === '[' || c === '{') { depth++; cur += c; }
            else if (c === ')' || c === ']' || c === '}') { depth--; cur += c; }
            else if (c === ',' && depth === 0) { args.push(cur.trim()); cur = ''; }
            else { cur += c; }
        }
    }
    if (cur.trim()) args.push(cur.trim());
    return args;
}

function main() {
    const raw = \`registerDevice("DEV1", "BasicPrinter"), printDocument("DEV1", "report.pdf"), scanDocument("DEV1", "report.pdf"), getOperationCount("DEV1")\`;
    const calls = splitCalls(raw);
    const sol = new Solution();
    const results = [];
    for (const call of calls) {
        const op = call.indexOf('('); const cp = call.lastIndexOf(')');
        if (op === -1 || cp === -1) continue;
        let fn = call.slice(0, op).trim();
        if (fn.includes('=')) fn = fn.split('=').pop().trim();
        const args = splitArgs(call.slice(op + 1, cp).trim());
        if (fn === 'registerDevice') {
            results.push(sol.registerDevice(stripQuotes(args[0]), stripQuotes(args[1])) ? 'true' : 'false');
        } else if (fn === 'printDocument') {
            results.push(sol.printDocument(stripQuotes(args[0]), stripQuotes(args[1])) ? 'true' : 'false');
        } else if (fn === 'scanDocument') {
            results.push(sol.scanDocument(stripQuotes(args[0]), stripQuotes(args[1])) ? 'true' : 'false');
        } else if (fn === 'faxDocument') {
            results.push(sol.faxDocument(stripQuotes(args[0]), stripQuotes(args[1]), stripQuotes(args[2])) ? 'true' : 'false');
        } else if (fn === 'getOperationCount') {
            results.push(String(sol.getOperationCount(stripQuotes(args[0]))));
        }
    }
    console.log(results.join(', '));
}

main();`;
    }

    if (lang === 'java') {
      return `import java.util.*;

// === USER SOLUTION ===

// === HIDDEN DRIVER ===
public class Main {
    static String trim(String s) {
        return s == null ? "" : s.trim();
    }

    static String stripQuotes(String s) {
        String t = trim(s);
        if (t.length() >= 2 && ((t.startsWith("\"") && t.endsWith("\"")) || (t.startsWith("'") && t.endsWith("'")))) {
            return t.substring(1, t.length() - 1);
        }
        return t;
    }

    static List<String> splitCalls(String s) {
        List<String> calls = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int pDepth = 0;
        boolean inQuotes = false;
        char qChar = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (inQuotes) {
                cur.append(c);
                if (c == qChar && (i == 0 || s.charAt(i - 1) != '\\\\')) inQuotes = false;
            } else {
                if (c == '"' || c == '\'') { inQuotes = true; qChar = c; cur.append(c); }
                else if (c == '(') { pDepth++; cur.append(c); }
                else if (c == ')') { pDepth--; cur.append(c); }
                else if (c == ',' && pDepth == 0) {
                    if (cur.toString().trim().length() > 0) calls.add(cur.toString().trim());
                    cur = new StringBuilder();
                } else { cur.append(c); }
            }
        }
        if (cur.toString().trim().length() > 0) calls.add(cur.toString().trim());
        return calls;
    }

    static List<String> splitArgs(String s) {
        List<String> args = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int depth = 0;
        boolean inQuotes = false;
        char qChar = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (inQuotes) {
                cur.append(c);
                if (c == qChar && (i == 0 || s.charAt(i - 1) != '\\\\')) inQuotes = false;
            } else {
                if (c == '"' || c == '\'') { inQuotes = true; qChar = c; cur.append(c); }
                else if (c == '(' || c == '[' || c == '{') { depth++; cur.append(c); }
                else if (c == ')' || c == ']' || c == '}') { depth--; cur.append(c); }
                else if (c == ',' && depth == 0) {
                    args.add(cur.toString().trim());
                    cur = new StringBuilder();
                } else { cur.append(c); }
            }
        }
        if (cur.toString().trim().length() > 0) args.add(cur.toString().trim());
        return args;
    }

    public static void main(String[] args) {
        String raw = """registerDevice("DEV1", "BasicPrinter"), printDocument("DEV1", "report.pdf"), scanDocument("DEV1", "report.pdf"), getOperationCount("DEV1")""";
        List<String> calls = splitCalls(raw);
        Solution sol = new Solution();
        List<String> results = new ArrayList<>();

        for (String call : calls) {
            int op = call.indexOf('(');
            int cp = call.lastIndexOf(')');
            if (op == -1 || cp == -1 || cp <= op) continue;
            String fn = call.substring(0, op).trim();
            if (fn.contains("=")) fn = fn.substring(fn.lastIndexOf('=') + 1).trim();
            List<String> argList = splitArgs(call.substring(op + 1, cp).trim());

            if (fn.equals("registerDevice")) {
                results.add(sol.registerDevice(stripQuotes(argList.get(0)), stripQuotes(argList.get(1))) ? "true" : "false");
            } else if (fn.equals("printDocument")) {
                results.add(sol.printDocument(stripQuotes(argList.get(0)), stripQuotes(argList.get(1))) ? "true" : "false");
            } else if (fn.equals("scanDocument")) {
                results.add(sol.scanDocument(stripQuotes(argList.get(0)), stripQuotes(argList.get(1))) ? "true" : "false");
            } else if (fn.equals("faxDocument")) {
                results.add(sol.faxDocument(stripQuotes(argList.get(0)), stripQuotes(argList.get(1)), stripQuotes(argList.get(2))) ? "true" : "false");
            } else if (fn.equals("getOperationCount")) {
                results.add(String.valueOf(sol.getOperationCount(stripQuotes(argList.get(0)))));
            }
        }
        System.out.println(String.join(", ", results));
    }
}`;
    }
  }

  if (isDIP) {
    if (lang === 'cpp') {
      return `#include <iostream>
#include <vector>
#include <string>

using namespace std;

// === USER SOLUTION ===

// === HIDDEN DRIVER ===
static inline string trim(const string& s) {
    size_t start = s.find_first_not_of(" \\t\\n\\r");
    if (start == string::npos) return "";
    size_t end = s.find_last_not_of(" \\t\\n\\r");
    return s.substr(start, end - start + 1);
}

static inline string stripQuotes(const string& s) {
    string t = trim(s);
    if (t.size() >= 2 && ((t.front() == '"' && t.back() == '"') || (t.front() == 39 && t.back() == 39))) return t.substr(1, t.size() - 2);
    return t;
}

static vector<string> splitCalls(const string& s) {
    vector<string> calls; string cur = ""; int pDepth = 0; bool inQuotes = false; char qChar = 0;
    for (size_t i = 0; i < s.size(); ++i) {
        char c = s[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i == 0 || s[i-1] != '\\\\')) inQuotes = false;
        } else {
            if (c == '"' || c == 39) { inQuotes = true; qChar = c; cur += c; }
            else if (c == '(') { pDepth++; cur += c; }
            else if (c == ')') { pDepth--; cur += c; }
            else if (c == ',' && pDepth == 0) { if (!trim(cur).empty()) calls.push_back(trim(cur)); cur = ""; }
            else { cur += c; }
        }
    }
    if (!trim(cur).empty()) calls.push_back(trim(cur));
    return calls;
}

static vector<string> splitArgs(const string& s) {
    vector<string> args; string cur = ""; int depth = 0; bool inQuotes = false; char qChar = 0;
    for (size_t i = 0; i < s.size(); ++i) {
        char c = s[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i == 0 || s[i-1] != '\\\\')) inQuotes = false;
        } else {
            if (c == '"' || c == 39) { inQuotes = true; qChar = c; cur += c; }
            else if (c == '(' || c == '[' || c == '{') { depth++; cur += c; }
            else if (c == ')' || c == ']' || c == '}') { depth--; cur += c; }
            else if (c == ',' && depth == 0) { args.push_back(trim(cur)); cur = ""; }
            else { cur += c; }
        }
    }
    if (!trim(cur).empty()) args.push_back(trim(cur));
    return args;
}

int main() {
    ios_base::sync_with_stdio(false);
    string raw = R"RAW(configureChannel("Email", "SendGrid"), configureChannel("SMS", "Twilio"), sendNotification("Email", "alice@test.com", "Welcome!"), sendNotification("SMS", "+123456", "Code: 4421"), getNotificationCount("Email"), getChannelProvider("Email"))RAW";
    vector<string> calls = splitCalls(raw);
    Solution sol;
    vector<string> results;
    for (const string& call : calls) {
        size_t op = call.find('('), cp = call.rfind(')');
        if (op == string::npos || cp == string::npos) continue;
        string fn = trim(call.substr(0, op));
        if (fn.find('=') != string::npos) fn = trim(fn.substr(fn.rfind('=') + 1));
        vector<string> args = splitArgs(call.substr(op + 1, cp - op - 1));

        if (fn == "configureChannel") {
            results.push_back(sol.configureChannel(stripQuotes(args[0]), stripQuotes(args[1])) ? "true" : "false");
        } else if (fn == "sendNotification") {
            results.push_back(sol.sendNotification(stripQuotes(args[0]), stripQuotes(args[1]), stripQuotes(args[2])) ? "true" : "false");
        } else if (fn == "getNotificationCount") {
            results.push_back(to_string(sol.getNotificationCount(stripQuotes(args[0]))));
        } else if (fn == "getChannelProvider") {
            results.push_back("\\"" + sol.getChannelProvider(stripQuotes(args[0])) + "\\"");
        }
    }
    for (size_t i = 0; i < results.size(); ++i) {
        cout << results[i] << (i + 1 < results.size() ? ", " : "");
    }
    cout << "\\n";
    return 0;
}`;
    }

    if (lang === 'python') {
      return `# === USER SOLUTION ===

# === HIDDEN DRIVER ===
def split_calls(s):
    calls, cur, p_depth, in_q, q_char = [], [], 0, False, ''
    for i, c in enumerate(s):
        if in_q:
            cur.append(c)
            if c == q_char and (i == 0 or s[i-1] != '\\\\'): in_q = False
        else:
            if c in ('"', "'"): in_q, q_char = True, c; cur.append(c)
            elif c == '(': p_depth += 1; cur.append(c)
            elif c == ')': p_depth -= 1; cur.append(c)
            elif c == ',' and p_depth == 0:
                t = ''.join(cur).strip()
                if t: calls.append(t)
                cur = []
            else: cur.append(c)
    t = ''.join(cur).strip()
    if t: calls.append(t)
    return calls

def split_args(s):
    args, cur, depth, in_q, q_char = [], [], 0, False, ''
    for i, c in enumerate(s):
        if in_q:
            cur.append(c)
            if c == q_char and (i == 0 or s[i-1] != '\\\\'): in_q = False
        else:
            if c in ('"', "'"): in_q, q_char = True, c; cur.append(c)
            elif c in ('(', '[', '{'): depth += 1; cur.append(c)
            elif c in (')', ']', '}'): depth -= 1; cur.append(c)
            elif c == ',' and depth == 0:
                args.append(''.join(cur).strip())
                cur = []
            else: cur.append(c)
    t = ''.join(cur).strip()
    if t: args.append(t)
    return args

def strip_quotes(s):
    t = s.strip()
    if len(t) >= 2 and ((t[0] == '"' and t[-1] == '"') or (t[0] == "'" and t[-1] == "'")): return t[1:-1]
    return t

def main():
    raw = """configureChannel("Email", "SendGrid"), configureChannel("SMS", "Twilio"), sendNotification("Email", "alice@test.com", "Welcome!"), sendNotification("SMS", "+123456", "Code: 4421"), getNotificationCount("Email"), getChannelProvider("Email")"""
    calls = split_calls(raw)
    sol = Solution()
    results = []
    for call in calls:
        op = call.find('('); cp = call.rfind(')')
        if op == -1 or cp == -1: continue
        fn = call[:op].strip()
        if '=' in fn: fn = fn.split('=')[-1].strip()
        args = split_args(call[op+1:cp].strip())
        if fn == "configureChannel":
            results.append("true" if sol.configureChannel(strip_quotes(args[0]), strip_quotes(args[1])) else "false")
        elif fn == "sendNotification":
            results.append("true" if sol.sendNotification(strip_quotes(args[0]), strip_quotes(args[1]), strip_quotes(args[2])) else "false")
        elif fn == "getNotificationCount":
            results.append(str(sol.getNotificationCount(strip_quotes(args[0]))))
        elif fn == "getChannelProvider":
            results.append(f'"{sol.getChannelProvider(strip_quotes(args[0]))}"')
    print(", ".join(results))

if __name__ == '__main__':
    main()`;
    }

    if (lang === 'javascript') {
      return `// === USER SOLUTION ===

// === HIDDEN DRIVER ===
function stripQuotes(s) {
    const t = String(s).trim();
    if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) return t.slice(1, -1);
    return t;
}

function splitCalls(s) {
    const calls = [];
    let cur = '', pDepth = 0, inQuotes = false, qChar = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i === 0 || s[i-1] !== '\\\\')) inQuotes = false;
        } else {
            if (c === '"' || c === "'") { inQuotes = true; qChar = c; cur += c; }
            else if (c === '(') { pDepth++; cur += c; }
            else if (c === ')') { pDepth--; cur += c; }
            else if (c === ',' && pDepth === 0) {
                if (cur.trim()) calls.push(cur.trim());
                cur = '';
            } else { cur += c; }
        }
    }
    if (cur.trim()) calls.push(cur.trim());
    return calls;
}

function splitArgs(s) {
    const args = [];
    let cur = '', depth = 0, inQuotes = false, qChar = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i == 0 || s[i-1] !== '\\\\')) inQuotes = false;
        } else {
            if (c === '"' || c === "'") { inQuotes = true; qChar = c; cur += c; }
            else if (c === '(' || c === '[' || c === '{') { depth++; cur += c; }
            else if (c === ')' || c === ']' || c === '}') { depth--; cur += c; }
            else if (c === ',' && depth == 0) { args.push(cur.trim()); cur = ''; }
            else { cur += c; }
        }
    }
    if (cur.trim()) args.push(cur.trim());
    return args;
}

function main() {
    const raw = \`configureChannel("Email", "SendGrid"), configureChannel("SMS", "Twilio"), sendNotification("Email", "alice@test.com", "Welcome!"), sendNotification("SMS", "+123456", "Code: 4421"), getNotificationCount("Email"), getChannelProvider("Email")\`;
    const calls = splitCalls(raw);
    const sol = new Solution();
    const results = [];
    for (const call of calls) {
        const op = call.indexOf('('); const cp = call.lastIndexOf(')');
        if (op === -1 || cp === -1) continue;
        let fn = call.slice(0, op).trim();
        if (fn.includes('=')) fn = fn.split('=').pop().trim();
        const args = splitArgs(call.slice(op + 1, cp).trim());
        if (fn === 'configureChannel') {
            results.push(sol.configureChannel(stripQuotes(args[0]), stripQuotes(args[1])) ? 'true' : 'false');
        } else if (fn === 'sendNotification') {
            results.push(sol.sendNotification(stripQuotes(args[0]), stripQuotes(args[1]), stripQuotes(args[2])) ? 'true' : 'false');
        } else if (fn === 'getNotificationCount') {
            results.push(String(sol.getNotificationCount(stripQuotes(args[0]))));
        } else if (fn === 'getChannelProvider') {
            results.push(\`"\${sol.getChannelProvider(stripQuotes(args[0]))}"\`);
        }
    }
    console.log(results.join(', '));
}

main();`;
    }

    if (lang === 'java') {
      return `import java.util.*;

// === USER SOLUTION ===

// === HIDDEN DRIVER ===
public class Main {
    static String trim(String s) {
        return s == null ? "" : s.trim();
    }

    static String stripQuotes(String s) {
        String t = trim(s);
        if (t.length() >= 2 && ((t.startsWith("\"") && t.endsWith("\"")) || (t.startsWith("'") && t.endsWith("'")))) {
            return t.substring(1, t.length() - 1);
        }
        return t;
    }

    static List<String> splitCalls(String s) {
        List<String> calls = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int pDepth = 0;
        boolean inQuotes = false;
        char qChar = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (inQuotes) {
                cur.append(c);
                if (c == qChar && (i == 0 || s.charAt(i - 1) != '\\\\')) inQuotes = false;
            } else {
                if (c == '"' || c == '\'') { inQuotes = true; qChar = c; cur.append(c); }
                else if (c == '(') { pDepth++; cur.append(c); }
                else if (c == ')') { pDepth--; cur.append(c); }
                else if (c == ',' && pDepth == 0) {
                    if (cur.toString().trim().length() > 0) calls.add(cur.toString().trim());
                    cur = new StringBuilder();
                } else { cur.append(c); }
            }
        }
        if (cur.toString().trim().length() > 0) calls.add(cur.toString().trim());
        return calls;
    }

    static List<String> splitArgs(String s) {
        List<String> args = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int depth = 0;
        boolean inQuotes = false;
        char qChar = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (inQuotes) {
                cur.append(c);
                if (c == qChar && (i == 0 || s.charAt(i - 1) != '\\\\')) inQuotes = false;
            } else {
                if (c == '"' || c == '\'') { inQuotes = true; qChar = c; cur.append(c); }
                else if (c == '(' || c == '[' || c == '{') { depth++; cur.append(c); }
                else if (c == ')' || c == ']' || c == '}') { depth--; cur.append(c); }
                else if (c == ',' && depth == 0) {
                    args.add(cur.toString().trim());
                    cur = new StringBuilder();
                } else { cur.append(c); }
            }
        }
        if (cur.toString().trim().length() > 0) args.add(cur.toString().trim());
        return args;
    }

    public static void main(String[] args) {
        String raw = """configureChannel("Email", "SendGrid"), configureChannel("SMS", "Twilio"), sendNotification("Email", "alice@test.com", "Welcome!"), sendNotification("SMS", "+123456", "Code: 4421"), getNotificationCount("Email"), getChannelProvider("Email")""";
        List<String> calls = splitCalls(raw);
        Solution sol = new Solution();
        List<String> results = new ArrayList<>();

        for (String call : calls) {
            int op = call.indexOf('(');
            int cp = call.lastIndexOf(')');
            if (op == -1 || cp == -1 || cp <= op) continue;
            String fn = call.substring(0, op).trim();
            if (fn.contains("=")) fn = fn.substring(fn.lastIndexOf('=') + 1).trim();
            List<String> argList = splitArgs(call.substring(op + 1, cp).trim());

            if (fn.equals("configureChannel")) {
                results.add(sol.configureChannel(stripQuotes(argList.get(0)), stripQuotes(argList.get(1))) ? "true" : "false");
            } else if (fn.equals("sendNotification")) {
                results.add(sol.sendNotification(stripQuotes(argList.get(0)), stripQuotes(argList.get(1)), stripQuotes(argList.get(2))) ? "true" : "false");
            } else if (fn.equals("getNotificationCount")) {
                results.add(String.valueOf(sol.getNotificationCount(stripQuotes(argList.get(0)))));
            } else if (fn.equals("getChannelProvider")) {
                results.add("\\"" + sol.getChannelProvider(stripQuotes(argList.get(0))) + "\\"");
            }
        }
        System.out.println(String.join(", ", results));
    }
}`;
    }
  }

  return null;
}
