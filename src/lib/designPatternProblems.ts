import { SupportedLanguage } from './compiler';
import type { ProblemTemplate } from './problemService';

export const DESIGN_PATTERN_PREDEFINED_PROBLEMS: Record<string, ProblemTemplate> = {
  '4-3-factory-method-': {
    name: '4.3 Factory Method - Multi-Channel Notification & Alert Dispatch Engine',
    category: 'Low Level Design',
    difficulty: 'Medium',
    description: `Design an extensible multi-channel notification and alert dispatch engine adhering strictly to the **Factory Method Pattern** (GoF Creational Design Pattern).

The **Factory Method Pattern** defines an interface for creating an object, but allows subclasses to decide which class to instantiate. It defers object instantiation to child subclasses, ensuring the client code is completely decoupled from concrete product implementations and adheres to the **Open-Closed Principle (OCP)**.

---

### System Architecture & Invariants:

1. **Abstract Product (\`Notification\`)**:
   - \`string getChannel()\`: Returns the notification channel identifier (e.g. \`"EMAIL"\`, \`"SMS"\`, \`"PUSH"\`).
   - \`bool validateRecipient(string recipient)\`: Validates channel-specific recipient rules.
   - \`string send(string recipient, string message)\`: Delivers the alert and returns formatted confirmation.

2. **Concrete Products**:
   - **\`EmailNotification\`**:
     - Recipient Validation: Must contain an \`'@'\` character and at least one period \`'.'\` *after* the \`'@'\`. The recipient must not be empty.
     - Delivery Format: \`"[EMAIL to <recipient>]: <message>"\`
   - **\`SMSNotification\`**:
     - Recipient Validation: May start with an optional \`'+'\`. All remaining characters must be digits (\`'0'-'9'\`). Total digit count must be between **7 and 15** (inclusive).
     - Message Invariant: If \`message\` length exceeds **160 characters**, it must be truncated to the first 160 characters followed by \`"..."\`.
     - Delivery Format: \`"[SMS to <recipient>]: <message>"\`
   - **\`PushNotification\`**:
     - Recipient Validation: Device token must be a non-empty alphanumeric string (only letters and numbers) with length **>= 6**.
     - Delivery Format: \`"[PUSH to <recipient>]: <message>"\`

3. **Abstract Creator (\`NotificationFactory\`)**:
   - Declares the factory method: \`Notification* createNotification()\` (or language-equivalent polymorphic instantiation).

4. **Concrete Creators**:
   - \`EmailNotificationFactory\`: Overrides the factory method to instantiate and return an \`EmailNotification\`.
   - \`SMSNotificationFactory\`: Overrides the factory method to instantiate and return an \`SMSNotification\`.
   - \`PushNotificationFactory\`: Overrides the factory method to instantiate and return a \`PushNotification\`.

5. **Client Facade (\`Solution\`)**:
   - \`bool registerChannel(string channelType)\`:
     - Registers the concrete factory for \`channelType\` (\`"EMAIL"\`, \`"SMS"\`, or \`"PUSH"\`).
     - Returns \`true\` if successfully registered.
     - Returns \`false\` if \`channelType\` is already registered or unsupported.
   - \`string sendAlert(string channelType, string recipient, string message)\`:
     - If \`channelType\` is not registered, returns \`"ERROR: UNSUPPORTED_CHANNEL"\`.
     - If \`message\` is empty, returns \`"ERROR: EMPTY_MESSAGE"\`.
     - Instantiates the product via the registered creator's factory method and validates \`recipient\`. If invalid, returns \`"ERROR: INVALID_RECIPIENT"\`.
     - Otherwise, invokes \`send(recipient, message)\` and returns the formatted delivery string.
   - \`int getActiveChannelCount()\`:
     - Returns the total count of currently active registered channels.
   - \`bool reset()\`:
     - Clears all registered channels back to empty. Returns \`true\`.

---

### Example 1:
\`\`\`
Input:
registerChannel("EMAIL"), registerChannel("SMS"), sendAlert("EMAIL", "devops@sdetube.com", "Server CPU > 90%"), sendAlert("SMS", "+14155552671", "Disk space critical"), getActiveChannelCount()

Output:
true, true, "[EMAIL to devops@sdetube.com]: Server CPU > 90%", "[SMS to +14155552671]: Disk space critical", 2
\`\`\`

### Example 2:
\`\`\`
Input:
registerChannel("PUSH"), sendAlert("PUSH", "deviceTok123", "New follower"), sendAlert("EMAIL", "dev@corp.com", "Build failed")

Output:
true, "[PUSH to deviceTok123]: New follower", "ERROR: UNSUPPORTED_CHANNEL"
\`\`\`

### Example 3:
\`\`\`
Input:
registerChannel("EMAIL"), sendAlert("EMAIL", "invalid-email", "Hello"), sendAlert("EMAIL", "user@test.org", ""), sendAlert("SMS", "+1234567890", "Ping")

Output:
true, "ERROR: INVALID_RECIPIENT", "ERROR: EMPTY_MESSAGE", "ERROR: UNSUPPORTED_CHANNEL"
\`\`\`

### Constraints:
- Supported channels: \`"EMAIL"\`, \`"SMS"\`, \`"PUSH"\`
- \`0 <= recipient.length, message.length <= 1000\`
- At most \`1000\` method calls across all operations.`,
    examples: [
      {
        input: 'registerChannel("EMAIL"), registerChannel("SMS"), sendAlert("EMAIL", "devops@sdetube.com", "Server CPU > 90%"), sendAlert("SMS", "+14155552671", "Disk space critical"), getActiveChannelCount()',
        output: 'true, true, "[EMAIL to devops@sdetube.com]: Server CPU > 90%", "[SMS to +14155552671]: Disk space critical", 2',
        explanation: 'Email and SMS factories are registered. Both alerts are validated and dispatched via concrete products created by the respective factory methods.'
      },
      {
        input: 'registerChannel("PUSH"), sendAlert("PUSH", "deviceTok123", "New follower"), sendAlert("EMAIL", "dev@corp.com", "Build failed")',
        output: 'true, "[PUSH to deviceTok123]: New follower", "ERROR: UNSUPPORTED_CHANNEL"',
        explanation: 'Push channel is registered and delivers alert. Email channel is not registered, returning ERROR: UNSUPPORTED_CHANNEL.'
      }
    ],
    constraints: [
      'Supported channels: "EMAIL", "SMS", "PUSH"',
      '0 <= recipient.length, message.length <= 1000',
      'At most 1000 method calls across all operations.'
    ],
    testCases: [
      'registerChannel("EMAIL"), registerChannel("SMS"), sendAlert("EMAIL", "devops@sdetube.com", "Server CPU > 90%"), sendAlert("SMS", "+14155552671", "Disk space critical"), getActiveChannelCount()',
      'registerChannel("PUSH"), sendAlert("PUSH", "deviceTok123", "New follower"), sendAlert("EMAIL", "dev@corp.com", "Build failed")',
      'registerChannel("EMAIL"), sendAlert("EMAIL", "invalid-email", "Hello"), sendAlert("EMAIL", "user@test.org", ""), sendAlert("SMS", "+1234567890", "Ping")',
      'registerChannel("SMS"), registerChannel("SMS"), sendAlert("SMS", "abc1234", "Hello"), sendAlert("SMS", "+919876543210", "OTP is 4589")',
      'registerChannel("EMAIL"), registerChannel("PUSH"), getActiveChannelCount(), reset(), getActiveChannelCount(), sendAlert("EMAIL", "admin@corp.com", "Test")',
      'registerChannel("PAGER_DUTY"), sendAlert("PAGER_DUTY", "pager123", "Alert")',
      'registerChannel("PUSH"), sendAlert("PUSH", "tok!", "Notification"), sendAlert("PUSH", "dev#99", "Alert")',
      'registerChannel("SMS"), sendAlert("SMS", "+12345678901", "This is an extremely long system notification message that exceeds the standard one hundred and sixty character threshold for standard telecom SMS delivery packets so it must be truncated!")',
      'registerChannel("EMAIL"), registerChannel("SMS"), registerChannel("PUSH"), getActiveChannelCount(), sendAlert("PUSH", "clientToken987", "App update ready")',
      'registerChannel("EMAIL"), sendAlert("EMAIL", "support@help.io", "Ticket resolved"), getActiveChannelCount()',
      'registerChannel("EMAIL"), sendAlert("EMAIL", "", "Ping")',
      'registerChannel("SMS"), sendAlert("SMS", "123456", "Too short"), sendAlert("SMS", "1234567", "Valid length")'
    ],
    expectedOutputs: [
      'true, true, "[EMAIL to devops@sdetube.com]: Server CPU > 90%", "[SMS to +14155552671]: Disk space critical", 2',
      'true, "[PUSH to deviceTok123]: New follower", "ERROR: UNSUPPORTED_CHANNEL"',
      'true, "ERROR: INVALID_RECIPIENT", "ERROR: EMPTY_MESSAGE", "ERROR: UNSUPPORTED_CHANNEL"',
      'true, false, "ERROR: INVALID_RECIPIENT", "[SMS to +919876543210]: OTP is 4589"',
      'true, true, 2, true, 0, "ERROR: UNSUPPORTED_CHANNEL"',
      'false, "ERROR: UNSUPPORTED_CHANNEL"',
      'true, "ERROR: INVALID_RECIPIENT", "ERROR: INVALID_RECIPIENT"',
      'true, "[SMS to +12345678901]: This is an extremely long system notification message that exceeds the standard one hundred and sixty character threshold for standard telecom SMS delivery pack..."',
      'true, true, true, 3, "[PUSH to clientToken987]: App update ready"',
      'true, "[EMAIL to support@help.io]: Ticket resolved", 1',
      'true, "ERROR: INVALID_RECIPIENT"',
      'true, "ERROR: INVALID_RECIPIENT", "[SMS to 1234567]: Valid length"'
    ],
    hints: [
      'The Factory Method pattern defines an interface for creating an object, but lets subclasses decide which class to instantiate.',
      'Separate the Notification product hierarchy (EmailNotification, SMSNotification, PushNotification) from the NotificationFactory creator hierarchy.',
      'In Solution::sendAlert, look up the registered factory by channelType, delegate creation to factory->createNotification(), validate, and dispatch.'
    ],
    approaches: [
      {
        id: 'factory_method',
        name: 'Factory Method Creational Pattern with Polymorphic Creators',
        timeComplexity: 'O(1) per registration and dispatch',
        spaceComplexity: 'O(1) auxiliary space (fixed supported channels)',
        description: 'Decouples alert dispatching logic from concrete notification types by delegating object instantiation to specialized subclasses of NotificationFactory.'
      }
    ],
    starters: {
      cpp: `#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <unordered_map>
#include <algorithm>
#include <cctype>

using namespace std;

// === 1. ABSTRACT PRODUCT INTERFACE ===
class Notification {
public:
    virtual ~Notification() = default;
    virtual string getChannel() const = 0;
    virtual bool validateRecipient(const string& recipient) const = 0;
    virtual string send(const string& recipient, const string& message) const = 0;
};

// === 2. CONCRETE PRODUCTS ===
class EmailNotification : public Notification {
public:
    string getChannel() const override { return "EMAIL"; }
    bool validateRecipient(const string& recipient) const override {
        // TODO: Validate email (contains '@' and '.' after '@')
        return false;
    }
    string send(const string& recipient, const string& message) const override {
        return "[EMAIL to " + recipient + "]: " + message;
    }
};

class SMSNotification : public Notification {
public:
    string getChannel() const override { return "SMS"; }
    bool validateRecipient(const string& recipient) const override {
        // TODO: Validate phone (optional '+' followed by 7-15 digits)
        return false;
    }
    string send(const string& recipient, const string& message) const override {
        // TODO: Truncate message to 160 chars + "..." if length > 160
        return "[SMS to " + recipient + "]: " + message;
    }
};

class PushNotification : public Notification {
public:
    string getChannel() const override { return "PUSH"; }
    bool validateRecipient(const string& recipient) const override {
        // TODO: Validate alphanumeric device token (length >= 6)
        return false;
    }
    string send(const string& recipient, const string& message) const override {
        return "[PUSH to " + recipient + "]: " + message;
    }
};

// === 3. ABSTRACT CREATOR (FACTORY METHOD) ===
class NotificationFactory {
public:
    virtual ~NotificationFactory() = default;
    virtual unique_ptr<Notification> createNotification() const = 0;
};

// === 4. CONCRETE CREATORS ===
class EmailNotificationFactory : public NotificationFactory {
public:
    unique_ptr<Notification> createNotification() const override {
        return make_unique<EmailNotification>();
    }
};

class SMSNotificationFactory : public NotificationFactory {
public:
    unique_ptr<Notification> createNotification() const override {
        return make_unique<SMSNotification>();
    }
};

class PushNotificationFactory : public NotificationFactory {
public:
    unique_ptr<Notification> createNotification() const override {
        return make_unique<PushNotification>();
    }
};

// === 5. CLIENT FACADE SOLUTION ===
class Solution {
public:
    bool registerChannel(const string& channelType) {
        // TODO: Register factory for "EMAIL", "SMS", or "PUSH"
        return false;
    }

    string sendAlert(const string& channelType, const string& recipient, const string& message) {
        // TODO: Instantiate via factory method, validate, and return delivery string
        return "";
    }

    int getActiveChannelCount() const {
        // TODO: Return count of active registered channels
        return 0;
    }

    bool reset() {
        // TODO: Clear all registered channels
        return true;
    }
};`,
      python: `import re

# === 1. ABSTRACT PRODUCT INTERFACE ===
class Notification:
    def get_channel(self) -> str:
        raise NotImplementedError
    def validate_recipient(self, recipient: str) -> bool:
        raise NotImplementedError
    def send(self, recipient: str, message: str) -> str:
        raise NotImplementedError

# === 2. CONCRETE PRODUCTS ===
class EmailNotification(Notification):
    def get_channel(self) -> str:
        return "EMAIL"
    def validate_recipient(self, recipient: str) -> bool:
        # TODO: Validate email (contains '@' and '.' after '@')
        return False
    def send(self, recipient: str, message: str) -> str:
        return f"[EMAIL to {recipient}]: {message}"

class SMSNotification(Notification):
    def get_channel(self) -> str:
        return "SMS"
    def validate_recipient(self, recipient: str) -> bool:
        # TODO: Validate phone (optional '+' followed by 7-15 digits)
        return False
    def send(self, recipient: str, message: str) -> str:
        # TODO: Truncate message to 160 chars + "..." if length > 160
        return f"[SMS to {recipient}]: {message}"

class PushNotification(Notification):
    def get_channel(self) -> str:
        return "PUSH"
    def validate_recipient(self, recipient: str) -> bool:
        # TODO: Validate alphanumeric device token (length >= 6)
        return False
    def send(self, recipient: str, message: str) -> str:
        return f"[PUSH to {recipient}]: {message}"

# === 3. ABSTRACT CREATOR (FACTORY METHOD) ===
class NotificationFactory:
    def create_notification(self) -> Notification:
        raise NotImplementedError

# === 4. CONCRETE CREATORS ===
class EmailNotificationFactory(NotificationFactory):
    def create_notification(self) -> Notification:
        return EmailNotification()

class SMSNotificationFactory(NotificationFactory):
    def create_notification(self) -> Notification:
        return SMSNotification()

class PushNotificationFactory(NotificationFactory):
    def create_notification(self) -> Notification:
        return PushNotification()

# === 5. CLIENT FACADE SOLUTION ===
class Solution:
    def __init__(self):
        self.factories = {}

    def registerChannel(self, channel_type: str) -> bool:
        # TODO: Register factory for "EMAIL", "SMS", or "PUSH"
        return False

    def sendAlert(self, channel_type: str, recipient: str, message: str) -> str:
        # TODO: Instantiate via factory method, validate, and return delivery string
        return ""

    def getActiveChannelCount(self) -> int:
        # TODO: Return count of active registered channels
        return 0

    def reset(self) -> bool:
        # TODO: Clear all registered channels
        return True`,
      java: `import java.util.*;

// === 1. ABSTRACT PRODUCT INTERFACE ===
interface Notification {
    String getChannel();
    boolean validateRecipient(String recipient);
    String send(String recipient, String message);
}

// === 2. CONCRETE PRODUCTS ===
class EmailNotification implements Notification {
    public String getChannel() { return "EMAIL"; }
    public boolean validateRecipient(String recipient) {
        // TODO: Validate email (contains '@' and '.' after '@')
        return false;
    }
    public String send(String recipient, String message) {
        return "[EMAIL to " + recipient + "]: " + message;
    }
}

class SMSNotification implements Notification {
    public String getChannel() { return "SMS"; }
    public boolean validateRecipient(String recipient) {
        // TODO: Validate phone (optional '+' followed by 7-15 digits)
        return false;
    }
    public String send(String recipient, String message) {
        // TODO: Truncate message to 160 chars + "..." if length > 160
        return "[SMS to " + recipient + "]: " + message;
    }
}

class PushNotification implements Notification {
    public String getChannel() { return "PUSH"; }
    public boolean validateRecipient(String recipient) {
        // TODO: Validate alphanumeric device token (length >= 6)
        return false;
    }
    public String send(String recipient, String message) {
        return "[PUSH to " + recipient + "]: " + message;
    }
}

// === 3. ABSTRACT CREATOR (FACTORY METHOD) ===
interface NotificationFactory {
    Notification createNotification();
}

// === 4. CONCRETE CREATORS ===
class EmailNotificationFactory implements NotificationFactory {
    public Notification createNotification() {
        return new EmailNotification();
    }
}

class SMSNotificationFactory implements NotificationFactory {
    public Notification createNotification() {
        return new SMSNotification();
    }
}

class PushNotificationFactory implements NotificationFactory {
    public Notification createNotification() {
        return new PushNotification();
    }
}

// === 5. CLIENT FACADE SOLUTION ===
class Solution {
    public boolean registerChannel(String channelType) {
        // TODO: Register factory for "EMAIL", "SMS", or "PUSH"
        return false;
    }

    public String sendAlert(String channelType, String recipient, String message) {
        // TODO: Instantiate via factory method, validate, and return delivery string
        return "";
    }

    public int getActiveChannelCount() {
        // TODO: Return count of active registered channels
        return 0;
    }

    public boolean reset() {
        // TODO: Clear all registered channels
        return true;
    }
}`,
      javascript: `// === 1. PRODUCT HIERARCHY ===
class EmailNotification {
    getChannel() { return 'EMAIL'; }
    validateRecipient(recipient) {
        // TODO: Validate email (contains '@' and '.' after '@')
        return false;
    }
    send(recipient, message) {
        return \`[EMAIL to \${recipient}]: \${message}\`;
    }
}

class SMSNotification {
    getChannel() { return 'SMS'; }
    validateRecipient(recipient) {
        // TODO: Validate phone (optional '+' followed by 7-15 digits)
        return false;
    }
    send(recipient, message) {
        // TODO: Truncate message to 160 chars + "..." if length > 160
        return \`[SMS to \${recipient}]: \${message}\`;
    }
}

class PushNotification {
    getChannel() { return 'PUSH'; }
    validateRecipient(recipient) {
        // TODO: Validate alphanumeric device token (length >= 6)
        return false;
    }
    send(recipient, message) {
        return \`[PUSH to \${recipient}]: \${message}\`;
    }
}

// === 2. FACTORY METHOD CREATORS ===
class EmailNotificationFactory {
    createNotification() { return new EmailNotification(); }
}

class SMSNotificationFactory {
    createNotification() { return new SMSNotification(); }
}

class PushNotificationFactory {
    createNotification() { return new PushNotification(); }
}

// === 3. CLIENT FACADE SOLUTION ===
class Solution {
    constructor() {
        this.factories = new Map();
    }

    registerChannel(channelType) {
        // TODO: Register factory for "EMAIL", "SMS", or "PUSH"
        return false;
    }

    sendAlert(channelType, recipient, message) {
        // TODO: Instantiate via factory method, validate, and return delivery string
        return "";
    }

    getActiveChannelCount() {
        // TODO: Return count of active registered channels
        return 0;
    }

    reset() {
        // TODO: Clear all registered channels
        return true;
    }
}`,
      go: `package main

type Solution struct {}

func (s *Solution) RegisterChannel(channelType string) bool {
    return false
}

func (s *Solution) SendAlert(channelType, recipient, message string) string {
    return ""
}

func (s *Solution) GetActiveChannelCount() int {
    return 0
}

func (s *Solution) Reset() bool {
    return true
}`,
      rust: `pub struct Solution {}

impl Solution {
    pub fn new() -> Self {
        Solution {}
    }
    pub fn register_channel(&mut self, channel_type: String) -> bool {
        false
    }
    pub fn send_alert(&self, channel_type: String, recipient: String, message: String) -> String {
        String::new()
    }
    pub fn get_active_channel_count(&self) -> i32 {
        0
    }
    pub fn reset(&mut self) -> bool {
        true
    }
}`
    },
    solutions: {
      cpp: `#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <unordered_map>
#include <algorithm>
#include <cctype>

using namespace std;

// === 1. ABSTRACT PRODUCT INTERFACE ===
class Notification {
public:
    virtual ~Notification() = default;
    virtual string getChannel() const = 0;
    virtual bool validateRecipient(const string& recipient) const = 0;
    virtual string send(const string& recipient, const string& message) const = 0;
};

// === 2. CONCRETE PRODUCTS ===
class EmailNotification : public Notification {
public:
    string getChannel() const override { return "EMAIL"; }

    bool validateRecipient(const string& recipient) const override {
        if (recipient.empty()) return false;
        size_t atPos = recipient.find('@');
        if (atPos == string::npos || atPos == 0) return false;
        size_t dotPos = recipient.find('.', atPos + 1);
        if (dotPos == string::npos || dotPos >= recipient.length() - 1) return false;
        return true;
    }

    string send(const string& recipient, const string& message) const override {
        return "[EMAIL to " + recipient + "]: " + message;
    }
};

class SMSNotification : public Notification {
public:
    string getChannel() const override { return "SMS"; }

    bool validateRecipient(const string& recipient) const override {
        if (recipient.empty()) return false;
        size_t start = (recipient[0] == '+') ? 1 : 0;
        int digitCount = 0;
        for (size_t i = start; i < recipient.length(); ++i) {
            if (!isdigit(static_cast<unsigned char>(recipient[i]))) return false;
            digitCount++;
        }
        return digitCount >= 7 && digitCount <= 15;
    }

    string send(const string& recipient, const string& message) const override {
        string msg = message;
        if (msg.length() > 160) {
            msg = msg.substr(0, 160) + "...";
        }
        return "[SMS to " + recipient + "]: " + msg;
    }
};

class PushNotification : public Notification {
public:
    string getChannel() const override { return "PUSH"; }

    bool validateRecipient(const string& recipient) const override {
        if (recipient.length() < 6) return false;
        for (char c : recipient) {
            if (!isalnum(static_cast<unsigned char>(c))) return false;
        }
        return true;
    }

    string send(const string& recipient, const string& message) const override {
        return "[PUSH to " + recipient + "]: " + message;
    }
};

// === 3. ABSTRACT CREATOR (FACTORY METHOD) ===
class NotificationFactory {
public:
    virtual ~NotificationFactory() = default;
    virtual unique_ptr<Notification> createNotification() const = 0;
};

// === 4. CONCRETE CREATORS ===
class EmailNotificationFactory : public NotificationFactory {
public:
    unique_ptr<Notification> createNotification() const override {
        return make_unique<EmailNotification>();
    }
};

class SMSNotificationFactory : public NotificationFactory {
public:
    unique_ptr<Notification> createNotification() const override {
        return make_unique<SMSNotification>();
    }
};

class PushNotificationFactory : public NotificationFactory {
public:
    unique_ptr<Notification> createNotification() const override {
        return make_unique<PushNotification>();
    }
};

// === 5. CLIENT FACADE SOLUTION ===
class Solution {
private:
    unordered_map<string, unique_ptr<NotificationFactory>> factories;

public:
    Solution() = default;

    bool registerChannel(const string& channelType) {
        if (factories.find(channelType) != factories.end()) {
            return false;
        }
        if (channelType == "EMAIL") {
            factories[channelType] = make_unique<EmailNotificationFactory>();
            return true;
        } else if (channelType == "SMS") {
            factories[channelType] = make_unique<SMSNotificationFactory>();
            return true;
        } else if (channelType == "PUSH") {
            factories[channelType] = make_unique<PushNotificationFactory>();
            return true;
        }
        return false;
    }

    string sendAlert(const string& channelType, const string& recipient, const string& message) {
        auto it = factories.find(channelType);
        if (it == factories.end()) {
            return "ERROR: UNSUPPORTED_CHANNEL";
        }
        if (message.empty()) {
            return "ERROR: EMPTY_MESSAGE";
        }
        unique_ptr<Notification> product = it->second->createNotification();
        if (!product->validateRecipient(recipient)) {
            return "ERROR: INVALID_RECIPIENT";
        }
        return product->send(recipient, message);
    }

    int getActiveChannelCount() const {
        return static_cast<int>(factories.size());
    }

    bool reset() {
        factories.clear();
        return true;
    }
};`,
      python: `import re

# === 1. ABSTRACT PRODUCT INTERFACE ===
class Notification:
    def get_channel(self) -> str:
        raise NotImplementedError
    def validate_recipient(self, recipient: str) -> bool:
        raise NotImplementedError
    def send(self, recipient: str, message: str) -> str:
        raise NotImplementedError

# === 2. CONCRETE PRODUCTS ===
class EmailNotification(Notification):
    def get_channel(self) -> str:
        return "EMAIL"

    def validate_recipient(self, recipient: str) -> bool:
        if not recipient or "@" not in recipient:
            return False
        parts = recipient.split("@", 1)
        if len(parts) != 2 or not parts[0]:
            return False
        domain = parts[1]
        return "." in domain and not domain.endswith(".")

    def send(self, recipient: str, message: str) -> str:
        return f"[EMAIL to {recipient}]: {message}"

class SMSNotification(Notification):
    def get_channel(self) -> str:
        return "SMS"

    def validate_recipient(self, recipient: str) -> bool:
        if not recipient:
            return False
        digits = recipient[1:] if recipient.startswith("+") else recipient
        return digits.isdigit() and 7 <= len(digits) <= 15

    def send(self, recipient: str, message: str) -> str:
        msg = message[:160] + "..." if len(message) > 160 else message
        return f"[SMS to {recipient}]: {msg}"

class PushNotification(Notification):
    def get_channel(self) -> str:
        return "PUSH"

    def validate_recipient(self, recipient: str) -> bool:
        return len(recipient) >= 6 and recipient.isalnum()

    def send(self, recipient: str, message: str) -> str:
        return f"[PUSH to {recipient}]: {message}"

# === 3. ABSTRACT CREATOR (FACTORY METHOD) ===
class NotificationFactory:
    def create_notification(self) -> Notification:
        raise NotImplementedError

# === 4. CONCRETE CREATORS ===
class EmailNotificationFactory(NotificationFactory):
    def create_notification(self) -> Notification:
        return EmailNotification()

class SMSNotificationFactory(NotificationFactory):
    def create_notification(self) -> Notification:
        return SMSNotification()

class PushNotificationFactory(NotificationFactory):
    def create_notification(self) -> Notification:
        return PushNotification()

# === 5. CLIENT FACADE SOLUTION ===
class Solution:
    def __init__(self):
        self.factories = {}

    def registerChannel(self, channel_type: str) -> bool:
        if channel_type in self.factories:
            return False
        if channel_type == "EMAIL":
            self.factories[channel_type] = EmailNotificationFactory()
            return True
        elif channel_type == "SMS":
            self.factories[channel_type] = SMSNotificationFactory()
            return True
        elif channel_type == "PUSH":
            self.factories[channel_type] = PushNotificationFactory()
            return True
        return False

    def sendAlert(self, channel_type: str, recipient: str, message: str) -> str:
        if channel_type not in self.factories:
            return "ERROR: UNSUPPORTED_CHANNEL"
        if not message:
            return "ERROR: EMPTY_MESSAGE"
        product = self.factories[channel_type].create_notification()
        if not product.validate_recipient(recipient):
            return "ERROR: INVALID_RECIPIENT"
        return product.send(recipient, message)

    def getActiveChannelCount(self) -> int:
        return len(self.factories)

    def reset(self) -> bool:
        self.factories.clear()
        return True`,
      java: `import java.util.*;

interface Notification {
    String getChannel();
    boolean validateRecipient(String recipient);
    String send(String recipient, String message);
}

class EmailNotification implements Notification {
    public String getChannel() { return "EMAIL"; }
    public boolean validateRecipient(String recipient) {
        if (recipient == null || recipient.isEmpty()) return false;
        int atPos = recipient.indexOf('@');
        if (atPos <= 0) return false;
        int dotPos = recipient.indexOf('.', atPos + 1);
        return dotPos > atPos && dotPos < recipient.length() - 1;
    }
    public String send(String recipient, String message) {
        return "[EMAIL to " + recipient + "]: " + message;
    }
}

class SMSNotification implements Notification {
    public String getChannel() { return "SMS"; }
    public boolean validateRecipient(String recipient) {
        if (recipient == null || recipient.isEmpty()) return false;
        int start = recipient.startsWith("+") ? 1 : 0;
        int digitCount = 0;
        for (int i = start; i < recipient.length(); i++) {
            if (!Character.isDigit(recipient.charAt(i))) return false;
            digitCount++;
        }
        return digitCount >= 7 && digitCount <= 15;
    }
    public String send(String recipient, String message) {
        String msg = message != null && message.length() > 160 ? message.substring(0, 160) + "..." : message;
        return "[SMS to " + recipient + "]: " + msg;
    }
}

class PushNotification implements Notification {
    public String getChannel() { return "PUSH"; }
    public boolean validateRecipient(String recipient) {
        if (recipient == null || recipient.length() < 6) return false;
        for (int i = 0; i < recipient.length(); i++) {
            if (!Character.isLetterOrDigit(recipient.charAt(i))) return false;
        }
        return true;
    }
    public String send(String recipient, String message) {
        return "[PUSH to " + recipient + "]: " + message;
    }
}

interface NotificationFactory {
    Notification createNotification();
}

class EmailNotificationFactory implements NotificationFactory {
    public Notification createNotification() { return new EmailNotification(); }
}

class SMSNotificationFactory implements NotificationFactory {
    public Notification createNotification() { return new SMSNotification(); }
}

class PushNotificationFactory implements NotificationFactory {
    public Notification createNotification() { return new PushNotification(); }
}

class Solution {
    private final Map<String, NotificationFactory> factories = new HashMap<>();

    public boolean registerChannel(String channelType) {
        if (factories.containsKey(channelType)) return false;
        if ("EMAIL".equals(channelType)) {
            factories.put(channelType, new EmailNotificationFactory());
            return true;
        } else if ("SMS".equals(channelType)) {
            factories.put(channelType, new SMSNotificationFactory());
            return true;
        } else if ("PUSH".equals(channelType)) {
            factories.put(channelType, new PushNotificationFactory());
            return true;
        }
        return false;
    }

    public String sendAlert(String channelType, String recipient, String message) {
        NotificationFactory factory = factories.get(channelType);
        if (factory == null) return "ERROR: UNSUPPORTED_CHANNEL";
        if (message == null || message.isEmpty()) return "ERROR: EMPTY_MESSAGE";
        Notification product = factory.createNotification();
        if (!product.validateRecipient(recipient)) return "ERROR: INVALID_RECIPIENT";
        return product.send(recipient, message);
    }

    public int getActiveChannelCount() {
        return factories.size();
    }

    public boolean reset() {
        factories.clear();
        return true;
    }
}`,
      javascript: `class EmailNotification {
    getChannel() { return 'EMAIL'; }
    validateRecipient(recipient) {
        if (!recipient) return false;
        const atPos = recipient.indexOf('@');
        if (atPos <= 0) return false;
        const dotPos = recipient.indexOf('.', atPos + 1);
        return dotPos > atPos && dotPos < recipient.length - 1;
    }
    send(recipient, message) {
        return \`[EMAIL to \${recipient}]: \${message}\`;
    }
}

class SMSNotification {
    getChannel() { return 'SMS'; }
    validateRecipient(recipient) {
        if (!recipient) return false;
        const digits = recipient.startsWith('+') ? recipient.slice(1) : recipient;
        return /^\\d{7,15}$/.test(digits);
    }
    send(recipient, message) {
        const msg = (message || '').length > 160 ? message.slice(0, 160) + '...' : message;
        return \`[SMS to \${recipient}]: \${msg}\`;
    }
}

class PushNotification {
    getChannel() { return 'PUSH'; }
    validateRecipient(recipient) {
        return !!recipient && recipient.length >= 6 && /^[a-zA-Z0-9]+$/.test(recipient);
    }
    send(recipient, message) {
        return \`[PUSH to \${recipient}]: \${message}\`;
    }
}

class EmailNotificationFactory {
    createNotification() { return new EmailNotification(); }
}

class SMSNotificationFactory {
    createNotification() { return new SMSNotification(); }
}

class PushNotificationFactory {
    createNotification() { return new PushNotification(); }
}

class Solution {
    constructor() {
        this.factories = new Map();
    }

    registerChannel(channelType) {
        if (this.factories.has(channelType)) return false;
        if (channelType === 'EMAIL') {
            this.factories.set(channelType, new EmailNotificationFactory());
            return true;
        } else if (channelType === 'SMS') {
            this.factories.set(channelType, new SMSNotificationFactory());
            return true;
        } else if (channelType === 'PUSH') {
            this.factories.set(channelType, new PushNotificationFactory());
            return true;
        }
        return false;
    }

    sendAlert(channelType, recipient, message) {
        const factory = this.factories.get(channelType);
        if (!factory) return 'ERROR: UNSUPPORTED_CHANNEL';
        if (!message) return 'ERROR: EMPTY_MESSAGE';
        const product = factory.createNotification();
        if (!product.validateRecipient(recipient)) return 'ERROR: INVALID_RECIPIENT';
        return product.send(recipient, message);
    }

    getActiveChannelCount() {
        return this.factories.size;
    }

    reset() {
        this.factories.clear();
        return true;
    }
}`
    }
  },

  '4-2-singleton-design-pattern-': {
    name: '4.2 Singleton Pattern - Distributed Configuration & Connection Pool Manager',
    category: 'Low Level Design',
    difficulty: 'Medium',
    description: `Design a global configuration and connection pool manager adhering strictly to the **Singleton Pattern** (GoF Creational Design Pattern).

The **Singleton Pattern** ensures that a class has only one single instance throughout the application lifecycle and provides a global access point to it.

---

### System Architecture & Invariants:
1. **Singleton Guarantees**: Exactly one instance exists. All operations operate on the identical state.
2. **Configuration Operations**:
   - \`bool setConfig(string key, string value)\`: Sets a configuration pair. Returns \`true\` if \`key\` is non-empty, \`false\` otherwise.
   - \`string getConfig(string key)\`: Retrieves the configuration value for \`key\`. If not found, returns \`"NOT_FOUND"\`.
3. **Connection Pool Management (Max Capacity = 5)**:
   - \`bool acquireConnection(string clientId)\`:
     - \`clientId\` must be non-empty. If empty, returns \`false\`.
     - If \`clientId\` already holds an active connection, returns \`false\` (cannot acquire duplicate).
     - If current active connections is less than **5**, allocates connection to \`clientId\` and returns \`true\`.
     - If pool is exhausted (all 5 connections in use), returns \`false\`.
   - \`bool releaseConnection(string clientId)\`:
     - If \`clientId\` holds an active connection, releases it back to pool and returns \`true\`.
     - Otherwise returns \`false\`.
   - \`int getActiveConnections()\`: Returns current number of active connections in the pool.
4. **Lifecycle**:
   - \`bool reset()\`: Clears all configurations and releases all connections back to pool. Returns \`true\`.

---

### Example:
\`\`\`
Input:
setConfig("app.env", "production"), setConfig("db.timeout", "3000"), getConfig("app.env"), getConfig("cache.ttl")

Output:
true, true, "production", "NOT_FOUND"
\`\`\`

### Constraints:
- Max connection pool capacity: 5
- \`0 <= key.length, value.length, clientId.length <= 100\`
- At most \`1000\` operations.`,
    examples: [
      {
        input: 'setConfig("app.env", "production"), setConfig("db.timeout", "3000"), getConfig("app.env"), getConfig("cache.ttl")',
        output: 'true, true, "production", "NOT_FOUND"',
        explanation: 'Configs are set on the singleton instance. app.env is retrieved successfully, while cache.ttl is not found.'
      }
    ],
    constraints: [
      'Max connection pool capacity: 5',
      '0 <= key.length, value.length, clientId.length <= 100',
      'At most 1000 operations.'
    ],
    testCases: [
      'setConfig("app.env", "production"), setConfig("db.timeout", "3000"), getConfig("app.env"), getConfig("cache.ttl")',
      'acquireConnection("client-1"), acquireConnection("client-2"), acquireConnection("client-3"), getActiveConnections(), releaseConnection("client-2"), getActiveConnections()',
      'acquireConnection("c1"), acquireConnection("c2"), acquireConnection("c3"), acquireConnection("c4"), acquireConnection("c5"), acquireConnection("c6"), acquireConnection("c1")',
      'setConfig("", "invalid"), setConfig("api.key", "xyz123"), reset(), getConfig("api.key"), getActiveConnections()',
      'releaseConnection("non-existent"), acquireConnection(""), getActiveConnections()',
      'setConfig("theme", "dark"), setConfig("theme", "light"), getConfig("theme")',
      'acquireConnection("worker-A"), releaseConnection("worker-A"), releaseConnection("worker-A")',
      'setConfig("port", "8080"), reset(), setConfig("port", "9090"), getConfig("port")',
      'acquireConnection("c1"), acquireConnection("c2"), reset(), acquireConnection("c1"), getActiveConnections()',
      'getConfig("missing.key"), setConfig("db.host", "localhost"), getConfig("db.host")'
    ],
    expectedOutputs: [
      'true, true, "production", "NOT_FOUND"',
      'true, true, true, 3, true, 2',
      'true, true, true, true, true, false, false',
      'false, true, true, "NOT_FOUND", 0',
      'false, false, 0',
      'true, true, "light"',
      'true, true, false',
      'true, true, true, "9090"',
      'true, true, true, true, 1',
      '"NOT_FOUND", true, "localhost"'
    ],
    hints: [
      'Use a private constructor, private static instance reference, and public static getInstance() method.',
      'Maintain an internal hash map for configurations and a set of active client IDs (capacity 5).'
    ],
    approaches: [
      {
        id: 'singleton',
        name: 'Thread-Safe Lazy Initialization Singleton Pattern',
        timeComplexity: 'O(1) per operation',
        spaceComplexity: 'O(N) for configurations and active clients',
        description: 'Encapsulates global connection pool state and system properties in a single instance.'
      }
    ],
    starters: {
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
#include <unordered_set>

using namespace std;

class Solution {
private:
    unordered_map<string, string> configs;
    unordered_set<string> activeConnections;
    static const int MAX_CONNECTIONS = 5;

public:
    Solution() = default;

    bool setConfig(const string& key, const string& value) {
        if (key.empty()) return false;
        configs[key] = value;
        return true;
    }

    string getConfig(const string& key) {
        auto it = configs.find(key);
        return it != configs.end() ? it->second : "NOT_FOUND";
    }

    bool acquireConnection(const string& clientId) {
        if (clientId.empty() || activeConnections.count(clientId)) return false;
        if (activeConnections.size() >= MAX_CONNECTIONS) return false;
        activeConnections.insert(clientId);
        return true;
    }

    bool releaseConnection(const string& clientId) {
        auto it = activeConnections.find(clientId);
        if (it == activeConnections.end()) return false;
        activeConnections.erase(it);
        return true;
    }

    int getActiveConnections() const {
        return static_cast<int>(activeConnections.size());
    }

    bool reset() {
        configs.clear();
        activeConnections.clear();
        return true;
    }
};`,
      python: `class Solution:
    MAX_CONNECTIONS = 5

    def __init__(self):
        self.configs = {}
        self.active_connections = set()

    def setConfig(self, key: str, value: str) -> bool:
        if not key:
            return False
        self.configs[key] = value
        return True

    def getConfig(self, key: str) -> str:
        return self.configs.get(key, "NOT_FOUND")

    def acquireConnection(self, client_id: str) -> bool:
        if not client_id or client_id in self.active_connections:
            return False
        if len(self.active_connections) >= self.MAX_CONNECTIONS:
            return False
        self.active_connections.add(client_id)
        return True

    def releaseConnection(self, client_id: str) -> bool:
        if client_id not in self.active_connections:
            return False
        self.active_connections.remove(client_id)
        return True

    def getActiveConnections(self) -> int:
        return len(self.active_connections)

    def reset(self) -> bool:
        self.configs.clear()
        self.active_connections.clear()
        return True`,
      java: `import java.util.*;

class Solution {
    private static final int MAX_CONNECTIONS = 5;
    private final Map<String, String> configs = new HashMap<>();
    private final Set<String> activeConnections = new HashSet<>();

    public boolean setConfig(String key, String value) {
        if (key == null || key.isEmpty()) return false;
        configs.put(key, value);
        return true;
    }

    public String getConfig(String key) {
        return configs.getOrDefault(key, "NOT_FOUND");
    }

    public boolean acquireConnection(String clientId) {
        if (clientId == null || clientId.isEmpty() || activeConnections.contains(clientId)) return false;
        if (activeConnections.size() >= MAX_CONNECTIONS) return false;
        activeConnections.add(clientId);
        return true;
    }

    public boolean releaseConnection(String clientId) {
        return activeConnections.remove(clientId);
    }

    public int getActiveConnections() {
        return activeConnections.size();
    }

    public boolean reset() {
        configs.clear();
        activeConnections.clear();
        return true;
    }
}`,
      javascript: `class Solution {
    constructor() {
        this.configs = new Map();
        this.activeConnections = new Set();
        this.MAX_CONNECTIONS = 5;
    }

    setConfig(key, value) {
        if (!key) return false;
        this.configs.set(key, value);
        return true;
    }

    getConfig(key) {
        return this.configs.has(key) ? this.configs.get(key) : 'NOT_FOUND';
    }

    acquireConnection(clientId) {
        if (!clientId || this.activeConnections.has(clientId)) return false;
        if (this.activeConnections.size >= this.MAX_CONNECTIONS) return false;
        this.activeConnections.add(clientId);
        return true;
    }

    releaseConnection(clientId) {
        return this.activeConnections.delete(clientId);
    }

    getActiveConnections() {
        return this.activeConnections.size;
    }

    reset() {
        this.configs.clear();
        this.activeConnections.clear();
        return true;
    }
}`
    },
    solutions: {
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
#include <unordered_set>

using namespace std;

class Solution {
private:
    unordered_map<string, string> configs;
    unordered_set<string> activeConnections;
    static const int MAX_CONNECTIONS = 5;

public:
    Solution() = default;

    bool setConfig(const string& key, const string& value) {
        if (key.empty()) return false;
        configs[key] = value;
        return true;
    }

    string getConfig(const string& key) {
        auto it = configs.find(key);
        return it != configs.end() ? it->second : "NOT_FOUND";
    }

    bool acquireConnection(const string& clientId) {
        if (clientId.empty() || activeConnections.count(clientId)) return false;
        if (activeConnections.size() >= MAX_CONNECTIONS) return false;
        activeConnections.insert(clientId);
        return true;
    }

    bool releaseConnection(const string& clientId) {
        auto it = activeConnections.find(clientId);
        if (it == activeConnections.end()) return false;
        activeConnections.erase(it);
        return true;
    }

    int getActiveConnections() const {
        return static_cast<int>(activeConnections.size());
    }

    bool reset() {
        configs.clear();
        activeConnections.clear();
        return true;
    }
};`,
      python: `class Solution:
    MAX_CONNECTIONS = 5

    def __init__(self):
        self.configs = {}
        self.active_connections = set()

    def setConfig(self, key: str, value: str) -> bool:
        if not key:
            return False
        self.configs[key] = value
        return True

    def getConfig(self, key: str) -> str:
        return self.configs.get(key, "NOT_FOUND")

    def acquireConnection(self, client_id: str) -> bool:
        if not client_id or client_id in self.active_connections:
            return False
        if len(self.active_connections) >= self.MAX_CONNECTIONS:
            return False
        self.active_connections.add(client_id)
        return True

    def releaseConnection(self, client_id: str) -> bool:
        if client_id not in self.active_connections:
            return False
        self.active_connections.remove(client_id)
        return True

    def getActiveConnections(self) -> int:
        return len(self.active_connections)

    def reset(self) -> bool:
        self.configs.clear()
        self.active_connections.clear()
        return True`,
      java: `import java.util.*;

class Solution {
    private static final int MAX_CONNECTIONS = 5;
    private final Map<String, String> configs = new HashMap<>();
    private final Set<String> activeConnections = new HashSet<>();

    public boolean setConfig(String key, String value) {
        if (key == null || key.isEmpty()) return false;
        configs.put(key, value);
        return true;
    }

    public String getConfig(String key) {
        return configs.getOrDefault(key, "NOT_FOUND");
    }

    public boolean acquireConnection(String clientId) {
        if (clientId == null || clientId.isEmpty() || activeConnections.contains(clientId)) return false;
        if (activeConnections.size() >= MAX_CONNECTIONS) return false;
        activeConnections.add(clientId);
        return true;
    }

    public boolean releaseConnection(String clientId) {
        return activeConnections.remove(clientId);
    }

    public int getActiveConnections() {
        return activeConnections.size();
    }

    public boolean reset() {
        configs.clear();
        activeConnections.clear();
        return true;
    }
}`,
      javascript: `class Solution {
    constructor() {
        this.configs = new Map();
        this.activeConnections = new Set();
        this.MAX_CONNECTIONS = 5;
    }

    setConfig(key, value) {
        if (!key) return false;
        this.configs.set(key, value);
        return true;
    }

    getConfig(key) {
        return this.configs.has(key) ? this.configs.get(key) : 'NOT_FOUND';
    }

    acquireConnection(clientId) {
        if (!clientId || this.activeConnections.has(clientId)) return false;
        if (this.activeConnections.size >= this.MAX_CONNECTIONS) return false;
        this.activeConnections.add(clientId);
        return true;
    }

    releaseConnection(clientId) {
        return this.activeConnections.delete(clientId);
    }

    getActiveConnections() {
        return this.activeConnections.size;
    }

    reset() {
        this.configs.clear();
        this.activeConnections.clear();
        return true;
    }
}`
    }
  },

  '6-3-strategy-pattern-': {
    name: '6.3 Strategy Pattern - Dynamic E-Commerce Shipping & Delivery Fee Calculator',
    category: 'Low Level Design',
    difficulty: 'Medium',
    description: `Design an extensible shipping cost calculator adhering strictly to the **Strategy Pattern** (GoF Behavioral Design Pattern).

The **Strategy Pattern** defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime. It lets the algorithm vary independently from clients that use it.

---

### System Architecture & Invariants:
1. **Shipping Strategies**:
   - **\`"STANDARD"\`**:
     - Base fee $5.00 + $1.50 per kg of weight.
     - **Free Shipping Threshold**: If \`orderTotal >= 100.0\`, shipping fee is **$0.0**.
     - Delivery time: \`"5 Days"\`.
   - **\`"EXPRESS"\`**:
     - Base fee $15.00 + $3.00 per kg of weight.
     - Delivery time: \`"2 Days"\`.
   - **\`"OVERNIGHT"\`**:
     - Base fee $30.00 + $5.00 per kg of weight + 10% premium on order total (\`0.10 * orderTotal\`).
     - Delivery time: \`"1 Day"\`.

2. **Client Facade (\`Solution\`)**:
   - \`bool registerStrategy(string strategyName)\`:
     - Registers \`strategyName\` (\`"STANDARD"\`, \`"EXPRESS"\`, \`"OVERNIGHT"\`).
     - Returns \`true\` if newly registered, \`false\` if already registered or unknown.
   - \`double calculateFee(string strategyName, double weightKg, double orderTotal)\`:
     - If \`strategyName\` is not registered, or \`weightKg <= 0.0\`, or \`orderTotal < 0.0\`, returns \`-1.0\`.
     - Returns fee rounded to 2 decimal places.
   - \`string getEstimatedDays(string strategyName)\`:
     - Returns \`"5 Days"\`, \`"2 Days"\`, \`"1 Day"\` if registered, or \`"UNKNOWN"\` if not registered.
   - \`bool reset()\`:
     - Clears all registered strategies. Returns \`true\`.

---

### Constraints:
- \`0.0 <= weightKg <= 10000.0\`
- \`0.0 <= orderTotal <= 1000000.0\`
- At most \`1000\` operations.`,
    examples: [
      {
        input: 'registerStrategy("STANDARD"), registerStrategy("EXPRESS"), calculateFee("STANDARD", 2.0, 50.0), calculateFee("STANDARD", 2.0, 150.0), calculateFee("EXPRESS", 2.0, 50.0), getEstimatedDays("STANDARD"), getEstimatedDays("OVERNIGHT")',
        output: 'true, true, 8.0, 0.0, 21.0, "5 Days", "UNKNOWN"',
        explanation: 'Standard shipping costs $5 + 2*1.5 = $8. When order is $150, free shipping applies ($0). Overnight is not registered.'
      }
    ],
    constraints: [
      '0.0 <= weightKg <= 10000.0',
      '0.0 <= orderTotal <= 1000000.0',
      'At most 1000 operations.'
    ],
    testCases: [
      'registerStrategy("STANDARD"), registerStrategy("EXPRESS"), calculateFee("STANDARD", 2.0, 50.0), calculateFee("STANDARD", 2.0, 150.0), calculateFee("EXPRESS", 2.0, 50.0), getEstimatedDays("STANDARD"), getEstimatedDays("OVERNIGHT")',
      'registerStrategy("OVERNIGHT"), calculateFee("OVERNIGHT", 4.0, 200.0), getEstimatedDays("OVERNIGHT")',
      'registerStrategy("SAME_DAY"), calculateFee("SAME_DAY", 1.0, 20.0)',
      'registerStrategy("STANDARD"), calculateFee("STANDARD", -1.0, 50.0), calculateFee("STANDARD", 5.0, -10.0)',
      'registerStrategy("STANDARD"), registerStrategy("STANDARD"), reset(), getEstimatedDays("STANDARD")',
      'registerStrategy("EXPRESS"), calculateFee("EXPRESS", 10.0, 500.0), calculateFee("STANDARD", 10.0, 500.0)',
      'registerStrategy("STANDARD"), calculateFee("STANDARD", 0.0, 50.0)',
      'registerStrategy("OVERNIGHT"), calculateFee("OVERNIGHT", 1.5, 85.0)',
      'registerStrategy("STANDARD"), calculateFee("STANDARD", 1.0, 99.99), calculateFee("STANDARD", 1.0, 100.0)',
      'registerStrategy("STANDARD"), registerStrategy("EXPRESS"), registerStrategy("OVERNIGHT"), getEstimatedDays("EXPRESS")'
    ],
    expectedOutputs: [
      'true, true, 8.0, 0.0, 21.0, "5 Days", "UNKNOWN"',
      'true, 70.0, "1 Day"',
      'false, -1.0',
      'true, -1.0, -1.0',
      'true, false, true, "UNKNOWN"',
      'true, 45.0, -1.0',
      'true, -1.0',
      'true, 46.0',
      'true, 6.5, 0.0',
      'true, true, true, "2 Days"'
    ],
    hints: [
      'Define an abstract ShippingStrategy interface with calculateFee(weightKg, orderTotal) and getEstimatedDays().',
      'Implement StandardStrategy, ExpressStrategy, and OvernightStrategy implementing the interface.',
      'Solution maintains a registry of active strategy instances.'
    ],
    approaches: [
      {
        id: 'strategy_pattern',
        name: 'Strategy Pattern with Polymorphic Algorithmic Encapsulation',
        timeComplexity: 'O(1) per calculation',
        spaceComplexity: 'O(1) auxiliary space',
        description: 'Enables interchangeable delivery calculations at runtime without modifying client classes.'
      }
    ],
    starters: {
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
#include <memory>
#include <cmath>

using namespace std;

class Solution {
public:
    bool registerStrategy(const string& strategyName) {
        return false;
    }

    double calculateFee(const string& strategyName, double weightKg, double orderTotal) {
        return -1.0;
    }

    string getEstimatedDays(const string& strategyName) {
        return "UNKNOWN";
    }

    bool reset() {
        return true;
    }
};`,
      python: `class Solution:
    def __init__(self):
        self.strategies = set()

    def registerStrategy(self, strategy_name: str) -> bool:
        return False

    def calculateFee(self, strategy_name: str, weight_kg: float, order_total: float) -> float:
        return -1.0

    def getEstimatedDays(self, strategy_name: str) -> str:
        return "UNKNOWN"

    def reset(self) -> bool:
        return True`,
      java: `import java.util.*;

class Solution {
    public boolean registerStrategy(String strategyName) {
        return false;
    }

    public double calculateFee(String strategyName, double weightKg, double orderTotal) {
        return -1.0;
    }

    public String getEstimatedDays(String strategyName) {
        return "UNKNOWN";
    }

    public boolean reset() {
        return true;
    }
}`,
      javascript: `class Solution {
    constructor() {
        this.strategies = new Set();
    }

    registerStrategy(strategyName) {
        return false;
    }

    calculateFee(strategyName, weightKg, orderTotal) {
        return -1.0;
    }

    getEstimatedDays(strategyName) {
        return "UNKNOWN";
    }

    reset() {
        return true;
    }
}`
    },
    solutions: {
      cpp: `#include <iostream>
#include <string>
#include <unordered_map>
#include <memory>
#include <cmath>

using namespace std;

class ShippingStrategy {
public:
    virtual ~ShippingStrategy() = default;
    virtual double calculate(double weightKg, double orderTotal) const = 0;
    virtual string getDays() const = 0;
};

class StandardStrategy : public ShippingStrategy {
public:
    double calculate(double weightKg, double orderTotal) const override {
        if (orderTotal >= 100.0) return 0.0;
        return round((5.00 + 1.50 * weightKg) * 100.0) / 100.0;
    }
    string getDays() const override { return "5 Days"; }
};

class ExpressStrategy : public ShippingStrategy {
public:
    double calculate(double weightKg, double orderTotal) const override {
        return round((15.00 + 3.00 * weightKg) * 100.0) / 100.0;
    }
    string getDays() const override { return "2 Days"; }
};

class OvernightStrategy : public ShippingStrategy {
public:
    double calculate(double weightKg, double orderTotal) const override {
        return round((30.00 + 5.00 * weightKg + 0.10 * orderTotal) * 100.0) / 100.0;
    }
    string getDays() const override { return "1 Day"; }
};

class Solution {
private:
    unordered_map<string, unique_ptr<ShippingStrategy>> strategies;

public:
    bool registerStrategy(const string& strategyName) {
        if (strategies.find(strategyName) != strategies.end()) return false;
        if (strategyName == "STANDARD") {
            strategies[strategyName] = make_unique<StandardStrategy>();
            return true;
        } else if (strategyName == "EXPRESS") {
            strategies[strategyName] = make_unique<ExpressStrategy>();
            return true;
        } else if (strategyName == "OVERNIGHT") {
            strategies[strategyName] = make_unique<OvernightStrategy>();
            return true;
        }
        return false;
    }

    double calculateFee(const string& strategyName, double weightKg, double orderTotal) {
        if (weightKg <= 0.0 || orderTotal < 0.0) return -1.0;
        auto it = strategies.find(strategyName);
        if (it == strategies.end()) return -1.0;
        return it->second->calculate(weightKg, orderTotal);
    }

    string getEstimatedDays(const string& strategyName) {
        auto it = strategies.find(strategyName);
        if (it == strategies.end()) return "UNKNOWN";
        return it->second->getDays();
    }

    bool reset() {
        strategies.clear();
        return true;
    }
};`,
      python: `class Solution:
    def __init__(self):
        self.strategies = set()

    def registerStrategy(self, strategy_name: str) -> bool:
        if strategy_name in self.strategies:
            return False
        if strategy_name in ("STANDARD", "EXPRESS", "OVERNIGHT"):
            self.strategies.add(strategy_name)
            return True
        return False

    def calculateFee(self, strategy_name: str, weight_kg: float, order_total: float) -> float:
        if strategy_name not in self.strategies or weight_kg <= 0.0 or order_total < 0.0:
            return -1.0
        if strategy_name == "STANDARD":
            if order_total >= 100.0:
                return 0.0
            return round(5.00 + 1.50 * weight_kg, 2)
        elif strategy_name == "EXPRESS":
            return round(15.00 + 3.00 * weight_kg, 2)
        elif strategy_name == "OVERNIGHT":
            return round(30.00 + 5.00 * weight_kg + 0.10 * order_total, 2)
        return -1.0

    def getEstimatedDays(self, strategy_name: str) -> str:
        if strategy_name not in self.strategies:
            return "UNKNOWN"
        mapping = {"STANDARD": "5 Days", "EXPRESS": "2 Days", "OVERNIGHT": "1 Day"}
        return mapping.get(strategy_name, "UNKNOWN")

    def reset(self) -> bool:
        self.strategies.clear()
        return True`,
      java: `import java.util.*;

class Solution {
    private final Set<String> strategies = new HashSet<>();

    public boolean registerStrategy(String strategyName) {
        if (strategies.contains(strategyName)) return false;
        if ("STANDARD".equals(strategyName) || "EXPRESS".equals(strategyName) || "OVERNIGHT".equals(strategyName)) {
            strategies.add(strategyName);
            return true;
        }
        return false;
    }

    public double calculateFee(String strategyName, double weightKg, double orderTotal) {
        if (!strategies.contains(strategyName) || weightKg <= 0.0 || orderTotal < 0.0) return -1.0;
        if ("STANDARD".equals(strategyName)) {
            if (orderTotal >= 100.0) return 0.0;
            return Math.round((5.00 + 1.50 * weightKg) * 100.0) / 100.0;
        } else if ("EXPRESS".equals(strategyName)) {
            return Math.round((15.00 + 3.00 * weightKg) * 100.0) / 100.0;
        } else if ("OVERNIGHT".equals(strategyName)) {
            return Math.round((30.00 + 5.00 * weightKg + 0.10 * orderTotal) * 100.0) / 100.0;
        }
        return -1.0;
    }

    public String getEstimatedDays(String strategyName) {
        if (!strategies.contains(strategyName)) return "UNKNOWN";
        if ("STANDARD".equals(strategyName)) return "5 Days";
        if ("EXPRESS".equals(strategyName)) return "2 Days";
        if ("OVERNIGHT".equals(strategyName)) return "1 Day";
        return "UNKNOWN";
    }

    public boolean reset() {
        strategies.clear();
        return true;
    }
}`,
      javascript: `class Solution {
    constructor() {
        this.strategies = new Set();
    }

    registerStrategy(strategyName) {
        if (this.strategies.has(strategyName)) return false;
        if (['STANDARD', 'EXPRESS', 'OVERNIGHT'].includes(strategyName)) {
            this.strategies.add(strategyName);
            return true;
        }
        return false;
    }

    calculateFee(strategyName, weightKg, orderTotal) {
        if (!this.strategies.has(strategyName) || weightKg <= 0 || orderTotal < 0) return -1.0;
        if (strategyName === 'STANDARD') {
            if (orderTotal >= 100.0) return 0.0;
            return Math.round((5.00 + 1.50 * weightKg) * 100) / 100;
        } else if (strategyName === 'EXPRESS') {
            return Math.round((15.00 + 3.00 * weightKg) * 100) / 100;
        } else if (strategyName === 'OVERNIGHT') {
            return Math.round((30.00 + 5.00 * weightKg + 0.10 * orderTotal) * 100) / 100;
        }
        return -1.0;
    }

    getEstimatedDays(strategyName) {
        if (!this.strategies.has(strategyName)) return 'UNKNOWN';
        const map = { STANDARD: '5 Days', EXPRESS: '2 Days', OVERNIGHT: '1 Day' };
        return map[strategyName] || 'UNKNOWN';
    }

    reset() {
        this.strategies.clear();
        return true;
    }
}`
    }
  }
};

// Aliases for slug lookups
DESIGN_PATTERN_PREDEFINED_PROBLEMS['4-3-factory-method'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['4-3-factory-method-'];
DESIGN_PATTERN_PREDEFINED_PROBLEMS['factory-method'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['4-3-factory-method-'];
DESIGN_PATTERN_PREDEFINED_PROBLEMS['factory-pattern'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['4-3-factory-method-'];
DESIGN_PATTERN_PREDEFINED_PROBLEMS['factory-design-pattern'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['4-3-factory-method-'];
DESIGN_PATTERN_PREDEFINED_PROBLEMS['system-design-lecture-43-4-3-factory-method'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['4-3-factory-method-'];

DESIGN_PATTERN_PREDEFINED_PROBLEMS['4-2-singleton-design-pattern'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['4-2-singleton-design-pattern-'];
DESIGN_PATTERN_PREDEFINED_PROBLEMS['singleton-pattern'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['4-2-singleton-design-pattern-'];
DESIGN_PATTERN_PREDEFINED_PROBLEMS['singleton-design-pattern'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['4-2-singleton-design-pattern-'];
DESIGN_PATTERN_PREDEFINED_PROBLEMS['4-2-singleton'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['4-2-singleton-design-pattern-'];
DESIGN_PATTERN_PREDEFINED_PROBLEMS['system-design-lecture-44-4-2-singleton-design-pattern'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['4-2-singleton-design-pattern-'];

DESIGN_PATTERN_PREDEFINED_PROBLEMS['6-3-strategy-pattern'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['6-3-strategy-pattern-'];
DESIGN_PATTERN_PREDEFINED_PROBLEMS['strategy-pattern'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['6-3-strategy-pattern-'];
DESIGN_PATTERN_PREDEFINED_PROBLEMS['strategy-design-pattern'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['6-3-strategy-pattern-'];
DESIGN_PATTERN_PREDEFINED_PROBLEMS['6-3-strategy'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['6-3-strategy-pattern-'];
DESIGN_PATTERN_PREDEFINED_PROBLEMS['system-design-lecture-29-6-3-strategy-pattern'] = DESIGN_PATTERN_PREDEFINED_PROBLEMS['6-3-strategy-pattern-'];

export function getDesignPatternDriver(slugOrTitle: string, language: SupportedLanguage): string | null {
  const slug = (slugOrTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const lang = (language || 'cpp').toLowerCase() as SupportedLanguage;

  const isFactory = slug.includes('factory') || slug.includes('43factory');
  const isSingleton = slug.includes('singleton') || slug.includes('42singleton');
  const isStrategy = slug.includes('strategy') || slug.includes('63strategy');

  if (isFactory) {
    if (lang === 'cpp') {
      return `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <cctype>

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
    int parenDepth = 0, bracketDepth = 0;
    bool inQuotes = false;
    char qChar = 0;
    for (size_t i = 0; i < input.size(); ++i) {
        char c = input[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i == 0 || input[i - 1] != '\\\\')) inQuotes = false;
        } else {
            if (c == '"' || c == 39) { inQuotes = true; qChar = c; cur += c; }
            else if (c == '(') { parenDepth++; cur += c; }
            else if (c == ')') { parenDepth--; cur += c; }
            else if (c == '[') { bracketDepth++; cur += c; }
            else if (c == ']') { bracketDepth--; cur += c; }
            else if (c == ',' && parenDepth == 0 && bracketDepth == 0) {
                string t = trim(cur);
                if (!t.empty()) calls.push_back(t);
                cur = "";
            } else { cur += c; }
        }
    }
    string t = trim(cur);
    if (!t.empty()) calls.push_back(t);
    return calls;
}

static vector<string> splitArgs(const string& argsStr) {
    vector<string> args;
    string cur = "";
    int depth = 0;
    bool inQuotes = false;
    char qChar = 0;
    for (size_t i = 0; i < argsStr.size(); ++i) {
        char c = argsStr[i];
        if (inQuotes) {
            cur += c;
            if (c == qChar && (i == 0 || argsStr[i - 1] != '\\\\')) inQuotes = false;
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
    cin.tie(NULL);

    string raw_input = R"RAW(registerChannel("EMAIL"), registerChannel("SMS"), sendAlert("EMAIL", "devops@sdetube.com", "Server CPU > 90%"), sendAlert("SMS", "+14155552671", "Disk space critical"), getActiveChannelCount())RAW";

    vector<string> calls = splitCalls(raw_input);
    Solution sol;
    vector<string> results;

    for (const string& call : calls) {
        size_t openP = call.find('(');
        size_t closeP = call.rfind(')');
        if (openP == string::npos || closeP == string::npos || closeP <= openP) continue;

        string fnName = trim(call.substr(0, openP));
        if (fnName.rfind('=') != string::npos) fnName = trim(fnName.substr(fnName.rfind('=') + 1));
        string argsStr = call.substr(openP + 1, closeP - openP - 1);
        vector<string> args = splitArgs(argsStr);

        if (fnName == "registerChannel") {
            string ch = args.size() > 0 ? stripQuotes(args[0]) : "";
            results.push_back(sol.registerChannel(ch) ? "true" : "false");
        } else if (fnName == "sendAlert") {
            string ch = args.size() > 0 ? stripQuotes(args[0]) : "";
            string rec = args.size() > 1 ? stripQuotes(args[1]) : "";
            string msg = args.size() > 2 ? stripQuotes(args[2]) : "";
            string res = sol.sendAlert(ch, rec, msg);
            results.push_back("\\"" + res + "\\"");
        } else if (fnName == "getActiveChannelCount") {
            results.push_back(to_string(sol.getActiveChannelCount()));
        } else if (fnName == "reset") {
            results.push_back(sol.reset() ? "true" : "false");
        }
    }

    for (size_t i = 0; i < results.size(); ++i) {
        cout << results[i];
        if (i + 1 < results.size()) cout << ", ";
    }
    cout << "\\n";
    return 0;
}`;
    }

    if (lang === 'python') {
      return `import sys
import re

# === USER SOLUTION ===

# === HIDDEN DRIVER ===
def strip_quotes(s: str) -> str:
    s = s.strip()
    if len(s) >= 2 and ((s[0] == '"' and s[-1] == '"') or (s[0] == "'" and s[-1] == "'")):
        return s[1:-1]
    return s

def split_calls(s: str):
    calls, cur = [], []
    p_depth = b_depth = 0
    in_q = False
    q_char = ''
    for i, c in enumerate(s):
        if in_q:
            cur.append(c)
            if c == q_char and (i == 0 or s[i - 1] != '\\\\'): in_q = False
        else:
            if c in ('"', "'"): in_q, q_char = True, c; cur.append(c)
            elif c == '(': p_depth += 1; cur.append(c)
            elif c == ')': p_depth -= 1; cur.append(c)
            elif c == '[': b_depth += 1; cur.append(c)
            elif c == ']': b_depth -= 1; cur.append(c)
            elif c == ',' and p_depth == 0 and b_depth == 0:
                t = ''.join(cur).strip()
                if t: calls.append(t)
                cur = []
            else: cur.append(c)
    t = ''.join(cur).strip()
    if t: calls.append(t)
    return calls

def split_args(s: str):
    args, cur = [], []
    depth = 0
    in_q = False
    q_char = ''
    for i, c in enumerate(s):
        if in_q:
            cur.append(c)
            if c == q_char and (i == 0 or s[i - 1] != '\\\\'): in_q = False
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

def main():
    raw_input = """registerChannel("EMAIL"), registerChannel("SMS"), sendAlert("EMAIL", "devops@sdetube.com", "Server CPU > 90%"), sendAlert("SMS", "+14155552671", "Disk space critical"), getActiveChannelCount()"""
    calls = split_calls(raw_input)
    sol = Solution()
    results = []

    for call in calls:
        op = call.find('(')
        cp = call.rfind(')')
        if op == -1 or cp == -1 or cp <= op: continue
        fn = call[:op].strip()
        if '=' in fn: fn = fn.split('=')[-1].strip()
        args = split_args(call[op + 1:cp].strip())

        if fn == "registerChannel":
            ch = strip_quotes(args[0]) if len(args) > 0 else ""
            results.append("true" if sol.registerChannel(ch) else "false")
        elif fn == "sendAlert":
            ch = strip_quotes(args[0]) if len(args) > 0 else ""
            rec = strip_quotes(args[1]) if len(args) > 1 else ""
            msg = strip_quotes(args[2]) if len(args) > 2 else ""
            res = sol.sendAlert(ch, rec, msg)
            results.append(f'"{res}"')
        elif fn == "getActiveChannelCount":
            results.append(str(sol.getActiveChannelCount()))
        elif fn == "reset":
            results.append("true" if sol.reset() else "false")

    print(", ".join(results))

if __name__ == '__main__':
    main()`;
    }

    if (lang === 'java') {
      return `import java.util.*;

// === USER SOLUTION ===

// === HIDDEN DRIVER ===
public class Main {
    private static String trim(String s) { return s == null ? "" : s.trim(); }
    private static String stripQuotes(String s) {
        String t = trim(s);
        if (t.length() >= 2 && ((t.startsWith("\\"") && t.endsWith("\\"")) || (t.startsWith("'") && t.endsWith("'")))) {
            return t.substring(1, t.length() - 1);
        }
        return t;
    }

    private static List<String> splitCalls(String s) {
        List<String> calls = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int p = 0, b = 0;
        boolean inQ = false;
        char q = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (inQ) {
                cur.append(c);
                if (c == q && (i == 0 || s.charAt(i - 1) != '\\\\')) inQ = false;
            } else {
                if (c == '"' || c == 39) { inQ = true; q = c; cur.append(c); }
                else if (c == '(') { p++; cur.append(c); }
                else if (c == ')') { p--; cur.append(c); }
                else if (c == '[') { b++; cur.append(c); }
                else if (c == ']') { b--; cur.append(c); }
                else if (c == ',' && p == 0 && b == 0) {
                    String t = cur.toString().trim();
                    if (!t.isEmpty()) calls.add(t);
                    cur = new StringBuilder();
                } else cur.append(c);
            }
        }
        String t = cur.toString().trim();
        if (!t.isEmpty()) calls.add(t);
        return calls;
    }

    private static List<String> splitArgs(String s) {
        List<String> args = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        int depth = 0;
        boolean inQ = false;
        char q = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (inQ) {
                cur.append(c);
                if (c == q && (i == 0 || s.charAt(i - 1) != '\\\\')) inQ = false;
            } else {
                if (c == '"' || c == 39) { inQ = true; q = c; cur.append(c); }
                else if (c == '(' || c == '[' || c == '{') { depth++; cur.append(c); }
                else if (c == ')' || c == ']' || c == '}') { depth--; cur.append(c); }
                else if (c == ',' && depth == 0) {
                    args.add(cur.toString().trim());
                    cur = new StringBuilder();
                } else cur.append(c);
            }
        }
        String t = cur.toString().trim();
        if (!t.isEmpty()) args.add(t);
        return args;
    }

    public static void main(String[] args) {
        String raw = "registerChannel(\\"EMAIL\\"), registerChannel(\\"SMS\\"), sendAlert(\\"EMAIL\\", \\"devops@sdetube.com\\", \\"Server CPU > 90%\\"), sendAlert(\\"SMS\\", \\"+14155552671\\", \\"Disk space critical\\"), getActiveChannelCount()";
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

            if (fn.equals("registerChannel")) {
                String ch = argList.size() > 0 ? stripQuotes(argList.get(0)) : "";
                results.add(sol.registerChannel(ch) ? "true" : "false");
            } else if (fn.equals("sendAlert")) {
                String ch = argList.size() > 0 ? stripQuotes(argList.get(0)) : "";
                String rec = argList.size() > 1 ? stripQuotes(argList.get(1)) : "";
                String msg = argList.size() > 2 ? stripQuotes(argList.get(2)) : "";
                results.add("\\"" + sol.sendAlert(ch, rec, msg) + "\\"");
            } else if (fn.equals("getActiveChannelCount")) {
                results.add(String.valueOf(sol.getActiveChannelCount()));
            } else if (fn.equals("reset")) {
                results.add(sol.reset() ? "true" : "false");
            }
        }
        System.out.println(String.join(", ", results));
    }
}`;
    }

    if (lang === 'javascript') {
      return `// === USER SOLUTION ===

// === HIDDEN DRIVER ===
function stripQuotes(s) {
    s = (s || '').trim();
    if (s.length >= 2 && ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))) {
        return s.slice(1, -1);
    }
    return s;
}

function splitCalls(s) {
    const calls = [];
    let cur = '', p = 0, b = 0, inQ = false, q = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inQ) {
            cur += c;
            if (c === q && (i === 0 || s[i - 1] !== '\\\\')) inQ = false;
        } else {
            if (c === '"' || c === "'") { inQ = true; q = c; cur += c; }
            else if (c === '(') { p++; cur += c; }
            else if (c === ')') { p--; cur += c; }
            else if (c === '[') { b++; cur += c; }
            else if (c === ']') { b--; cur += c; }
            else if (c === ',' && p === 0 && b === 0) {
                if (cur.trim()) calls.push(cur.trim());
                cur = '';
            } else cur += c;
        }
    }
    if (cur.trim()) calls.push(cur.trim());
    return calls;
}

function splitArgs(s) {
    const args = [];
    let cur = '', depth = 0, inQ = false, q = '';
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (inQ) {
            cur += c;
            if (c === q && (i === 0 || s[i - 1] !== '\\\\')) inQ = false;
        } else {
            if (c === '"' || c === "'") { inQ = true; q = c; cur += c; }
            else if (c === '(' || c === '[' || c === '{') { depth++; cur += c; }
            else if (c === ')' || c === ']' || c === '}') { depth--; cur += c; }
            else if (c === ',' && depth === 0) {
                args.push(cur.trim());
                cur = '';
            } else cur += c;
        }
    }
    if (cur.trim()) args.push(cur.trim());
    return args;
}

function main() {
    const raw = \`registerChannel("EMAIL"), registerChannel("SMS"), sendAlert("EMAIL", "devops@sdetube.com", "Server CPU > 90%"), sendAlert("SMS", "+14155552671", "Disk space critical"), getActiveChannelCount()\`;
    const calls = splitCalls(raw);
    const sol = new Solution();
    const results = [];

    for (const call of calls) {
        const op = call.indexOf('(');
        const cp = call.lastIndexOf(')');
        if (op === -1 || cp === -1 || cp <= op) continue;
        let fn = call.slice(0, op).trim();
        if (fn.includes('=')) fn = fn.slice(fn.lastIndexOf('=') + 1).trim();
        const args = splitArgs(call.slice(op + 1, cp).trim());

        if (fn === 'registerChannel') {
            results.push(sol.registerChannel(stripQuotes(args[0])) ? 'true' : 'false');
        } else if (fn === 'sendAlert') {
            results.push(\`"\${sol.sendAlert(stripQuotes(args[0]), stripQuotes(args[1]), stripQuotes(args[2]))}"\`);
        } else if (fn === 'getActiveChannelCount') {
            results.push(String(sol.getActiveChannelCount()));
        } else if (fn === 'reset') {
            results.push(sol.reset() ? 'true' : 'false');
        }
    }
    console.log(results.join(', '));
}

main();`;
    }
  }

  if (isSingleton) {
    if (lang === 'cpp') {
      return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

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
    int p = 0, b = 0;
    bool inQ = false; char q = 0;
    for (size_t i = 0; i < input.size(); ++i) {
        char c = input[i];
        if (inQ) {
            cur += c;
            if (c == q && (i == 0 || input[i - 1] != '\\\\')) inQ = false;
        } else {
            if (c == '"' || c == 39) { inQ = true; q = c; cur += c; }
            else if (c == '(') { p++; cur += c; }
            else if (c == ')') { p--; cur += c; }
            else if (c == '[') { b++; cur += c; }
            else if (c == ']') { b--; cur += c; }
            else if (c == ',' && p == 0 && b == 0) {
                string t = trim(cur);
                if (!t.empty()) calls.push_back(t);
                cur = "";
            } else { cur += c; }
        }
    }
    string t = trim(cur);
    if (!t.empty()) calls.push_back(t);
    return calls;
}

static vector<string> splitArgs(const string& argsStr) {
    vector<string> args;
    string cur = "";
    int depth = 0;
    bool inQ = false; char q = 0;
    for (size_t i = 0; i < argsStr.size(); ++i) {
        char c = argsStr[i];
        if (inQ) {
            cur += c;
            if (c == q && (i == 0 || argsStr[i - 1] != '\\\\')) inQ = false;
        } else {
            if (c == '"' || c == 39) { inQ = true; q = c; cur += c; }
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
    cin.tie(NULL);

    string raw_input = R"RAW(setConfig("app.env", "production"), setConfig("db.timeout", "3000"), getConfig("app.env"), getConfig("cache.ttl"))RAW";
    vector<string> calls = splitCalls(raw_input);
    Solution sol;
    vector<string> results;

    for (const string& call : calls) {
        size_t openP = call.find('(');
        size_t closeP = call.rfind(')');
        if (openP == string::npos || closeP == string::npos || closeP <= openP) continue;

        string fnName = trim(call.substr(0, openP));
        if (fnName.rfind('=') != string::npos) fnName = trim(fnName.substr(fnName.rfind('=') + 1));
        vector<string> args = splitArgs(call.substr(openP + 1, closeP - openP - 1));

        if (fnName == "setConfig") {
            results.push_back(sol.setConfig(args.size() > 0 ? stripQuotes(args[0]) : "", args.size() > 1 ? stripQuotes(args[1]) : "") ? "true" : "false");
        } else if (fnName == "getConfig") {
            results.push_back("\\"" + sol.getConfig(args.size() > 0 ? stripQuotes(args[0]) : "") + "\\"");
        } else if (fnName == "acquireConnection") {
            results.push_back(sol.acquireConnection(args.size() > 0 ? stripQuotes(args[0]) : "") ? "true" : "false");
        } else if (fnName == "releaseConnection") {
            results.push_back(sol.releaseConnection(args.size() > 0 ? stripQuotes(args[0]) : "") ? "true" : "false");
        } else if (fnName == "getActiveConnections") {
            results.push_back(to_string(sol.getActiveConnections()));
        } else if (fnName == "reset") {
            results.push_back(sol.reset() ? "true" : "false");
        }
    }

    for (size_t i = 0; i < results.size(); ++i) {
        cout << results[i];
        if (i + 1 < results.size()) cout << ", ";
    }
    cout << "\\n";
    return 0;
}`;
    }

    if (lang === 'python') {
      return `import sys

# === USER SOLUTION ===

# === HIDDEN DRIVER ===
def strip_quotes(s: str) -> str:
    s = s.strip()
    if len(s) >= 2 and ((s[0] == '"' and s[-1] == '"') or (s[0] == "'" and s[-1] == "'")):
        return s[1:-1]
    return s

def split_calls(s: str):
    calls, cur = [], []
    p = b = 0
    in_q, q = False, ''
    for i, c in enumerate(s):
        if in_q:
            cur.append(c)
            if c == q and (i == 0 or s[i - 1] != '\\\\'): in_q = False
        else:
            if c in ('"', "'"): in_q, q = True, c; cur.append(c)
            elif c == '(': p += 1; cur.append(c)
            elif c == ')': p -= 1; cur.append(c)
            elif c == '[': b += 1; cur.append(c)
            elif c == ']': b -= 1; cur.append(c)
            elif c == ',' and p == 0 and b == 0:
                t = ''.join(cur).strip()
                if t: calls.append(t)
                cur = []
            else: cur.append(c)
    t = ''.join(cur).strip()
    if t: calls.append(t)
    return calls

def split_args(s: str):
    args, cur = [], []
    depth = 0
    in_q, q = False, ''
    for i, c in enumerate(s):
        if in_q:
            cur.append(c)
            if c == q and (i == 0 or s[i - 1] != '\\\\'): in_q = False
        else:
            if c in ('"', "'"): in_q, q = True, c; cur.append(c)
            elif c in ('(', '[', '{'): depth += 1; cur.append(c)
            elif c in (')', ']', '}'): depth -= 1; cur.append(c)
            elif c == ',' and depth == 0:
                args.append(''.join(cur).strip())
                cur = []
            else: cur.append(c)
    t = ''.join(cur).strip()
    if t: args.append(t)
    return args

def main():
    raw_input = """setConfig("app.env", "production"), setConfig("db.timeout", "3000"), getConfig("app.env"), getConfig("cache.ttl")"""
    calls = split_calls(raw_input)
    sol = Solution()
    results = []

    for call in calls:
        op = call.find('(')
        cp = call.rfind(')')
        if op == -1 or cp == -1 or cp <= op: continue
        fn = call[:op].strip()
        if '=' in fn: fn = fn.split('=')[-1].strip()
        args = split_args(call[op + 1:cp].strip())

        if fn == "setConfig":
            results.append("true" if sol.setConfig(strip_quotes(args[0]) if len(args) > 0 else "", strip_quotes(args[1]) if len(args) > 1 else "") else "false")
        elif fn == "getConfig":
            results.append(f'"{sol.getConfig(strip_quotes(args[0]) if len(args) > 0 else "")}"')
        elif fn == "acquireConnection":
            results.append("true" if sol.acquireConnection(strip_quotes(args[0]) if len(args) > 0 else "") else "false")
        elif fn == "releaseConnection":
            results.append("true" if sol.releaseConnection(strip_quotes(args[0]) if len(args) > 0 else "") else "false")
        elif fn == "getActiveConnections":
            results.append(str(sol.getActiveConnections()))
        elif fn == "reset":
            results.append("true" if sol.reset() else "false")

    print(", ".join(results))

if __name__ == '__main__':
    main()`;
    }
  }

  if (isStrategy) {
    if (lang === 'cpp') {
      return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

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
    int p = 0, b = 0;
    bool inQ = false; char q = 0;
    for (size_t i = 0; i < input.size(); ++i) {
        char c = input[i];
        if (inQ) {
            cur += c;
            if (c == q && (i == 0 || input[i - 1] != '\\\\')) inQ = false;
        } else {
            if (c == '"' || c == 39) { inQ = true; q = c; cur += c; }
            else if (c == '(') { p++; cur += c; }
            else if (c == ')') { p--; cur += c; }
            else if (c == '[') { b++; cur += c; }
            else if (c == ']') { b--; cur += c; }
            else if (c == ',' && p == 0 && b == 0) {
                string t = trim(cur);
                if (!t.empty()) calls.push_back(t);
                cur = "";
            } else { cur += c; }
        }
    }
    string t = trim(cur);
    if (!t.empty()) calls.push_back(t);
    return calls;
}

static vector<string> splitArgs(const string& argsStr) {
    vector<string> args;
    string cur = "";
    int depth = 0;
    bool inQ = false; char q = 0;
    for (size_t i = 0; i < argsStr.size(); ++i) {
        char c = argsStr[i];
        if (inQ) {
            cur += c;
            if (c == q && (i == 0 || argsStr[i - 1] != '\\\\')) inQ = false;
        } else {
            if (c == '"' || c == 39) { inQ = true; q = c; cur += c; }
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
    cin.tie(NULL);

    string raw_input = R"RAW(registerStrategy("STANDARD"), registerStrategy("EXPRESS"), calculateFee("STANDARD", 2.0, 50.0), calculateFee("STANDARD", 2.0, 150.0), calculateFee("EXPRESS", 2.0, 50.0), getEstimatedDays("STANDARD"), getEstimatedDays("OVERNIGHT"))RAW";
    vector<string> calls = splitCalls(raw_input);
    Solution sol;
    vector<string> results;

    for (const string& call : calls) {
        size_t openP = call.find('(');
        size_t closeP = call.rfind(')');
        if (openP == string::npos || closeP == string::npos || closeP <= openP) continue;

        string fnName = trim(call.substr(0, openP));
        if (fnName.rfind('=') != string::npos) fnName = trim(fnName.substr(fnName.rfind('=') + 1));
        vector<string> args = splitArgs(call.substr(openP + 1, closeP - openP - 1));

        if (fnName == "registerStrategy") {
            results.push_back(sol.registerStrategy(args.size() > 0 ? stripQuotes(args[0]) : "") ? "true" : "false");
        } else if (fnName == "calculateFee") {
            string sName = args.size() > 0 ? stripQuotes(args[0]) : "";
            double w = args.size() > 1 ? stod(args[1]) : 0.0;
            double t = args.size() > 2 ? stod(args[2]) : 0.0;
            double fee = sol.calculateFee(sName, w, t);
            if (fee == floor(fee)) {
                results.push_back(to_string((long long)fee) + ".0");
            } else {
                string fs = to_string(fee);
                size_t dot = fs.find('.');
                results.push_back(fs.substr(0, dot + 3));
            }
        } else if (fnName == "getEstimatedDays") {
            results.push_back("\\"" + sol.getEstimatedDays(args.size() > 0 ? stripQuotes(args[0]) : "") + "\\"");
        } else if (fnName == "reset") {
            results.push_back(sol.reset() ? "true" : "false");
        }
    }

    for (size_t i = 0; i < results.size(); ++i) {
        cout << results[i];
        if (i + 1 < results.size()) cout << ", ";
    }
    cout << "\\n";
    return 0;
}`;
    }

    if (lang === 'python') {
      return `import sys

# === USER SOLUTION ===

# === HIDDEN DRIVER ===
def strip_quotes(s: str) -> str:
    s = s.strip()
    if len(s) >= 2 and ((s[0] == '"' and s[-1] == '"') or (s[0] == "'" and s[-1] == "'")):
        return s[1:-1]
    return s

def split_calls(s: str):
    calls, cur = [], []
    p = b = 0
    in_q, q = False, ''
    for i, c in enumerate(s):
        if in_q:
            cur.append(c)
            if c == q and (i == 0 or s[i - 1] != '\\\\'): in_q = False
        else:
            if c in ('"', "'"): in_q, q = True, c; cur.append(c)
            elif c == '(': p += 1; cur.append(c)
            elif c == ')': p -= 1; cur.append(c)
            elif c == '[': b += 1; cur.append(c)
            elif c == ']': b -= 1; cur.append(c)
            elif c == ',' and p == 0 and b == 0:
                t = ''.join(cur).strip()
                if t: calls.append(t)
                cur = []
            else: cur.append(c)
    t = ''.join(cur).strip()
    if t: calls.append(t)
    return calls

def split_args(s: str):
    args, cur = [], []
    depth = 0
    in_q, q = False, ''
    for i, c in enumerate(s):
        if in_q:
            cur.append(c)
            if c == q and (i == 0 or s[i - 1] != '\\\\'): in_q = False
        else:
            if c in ('"', "'"): in_q, q = True, c; cur.append(c)
            elif c in ('(', '[', '{'): depth += 1; cur.append(c)
            elif c in (')', ']', '}'): depth -= 1; cur.append(c)
            elif c == ',' and depth == 0:
                args.append(''.join(cur).strip())
                cur = []
            else: cur.append(c)
    t = ''.join(cur).strip()
    if t: args.append(t)
    return args

def main():
    raw_input = """registerStrategy("STANDARD"), registerStrategy("EXPRESS"), calculateFee("STANDARD", 2.0, 50.0), calculateFee("STANDARD", 2.0, 150.0), calculateFee("EXPRESS", 2.0, 50.0), getEstimatedDays("STANDARD"), getEstimatedDays("OVERNIGHT")"""
    calls = split_calls(raw_input)
    sol = Solution()
    results = []

    for call in calls:
        op = call.find('(')
        cp = call.rfind(')')
        if op == -1 or cp == -1 or cp <= op: continue
        fn = call[:op].strip()
        if '=' in fn: fn = fn.split('=')[-1].strip()
        args = split_args(call[op + 1:cp].strip())

        if fn == "registerStrategy":
            results.append("true" if sol.registerStrategy(strip_quotes(args[0]) if len(args) > 0 else "") else "false")
        elif fn == "calculateFee":
            s_name = strip_quotes(args[0]) if len(args) > 0 else ""
            w = float(args[1]) if len(args) > 1 else 0.0
            t = float(args[2]) if len(args) > 2 else 0.0
            fee = sol.calculateFee(s_name, w, t)
            results.append(str(fee))
        elif fn == "getEstimatedDays":
            results.append(f'"{sol.getEstimatedDays(strip_quotes(args[0]) if len(args) > 0 else "")}"')
        elif fn == "reset":
            results.append("true" if sol.reset() else "false")

    print(", ".join(results))

if __name__ == '__main__':
    main()`;
    }
  }

  return null;
}
