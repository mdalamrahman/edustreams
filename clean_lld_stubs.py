import re

with open("src/lib/lldData.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Let's inspect each starterCode and ensure no solutions are prefilled
# 1. Parking lot
content = content.replace(
    'return vehicle == null;',
    '// TODO: Check if spot is vacant\n        return false;'
).replace(
    'return false;\n    }\n\n    public synchronized void vacate() {\n        // TODO: Clear assigned vehicle\n    }',
    '// TODO: Validate spot type and assign vehicle thread-safely\n        return false;\n    }\n\n    public synchronized void vacate() {\n        // TODO: Clear assigned vehicle\n    }'
)

# 2. BookMyShow
content = content.replace(
    'if (status == SeatStatus.AVAILABLE || (status == SeatStatus.LOCKED && System.currentTimeMillis() > lockExpiryTime)) {\n            status = SeatStatus.LOCKED;\n            lockExpiryTime = System.currentTimeMillis() + (lockDurationSec * 1000);\n            return true;\n        }\n        return false;',
    '// TODO: Implement thread-safe seat locking with expiry timestamp\n        return false;'
).replace(
    'if (status == SeatStatus.LOCKED && System.currentTimeMillis() <= lockExpiryTime) {\n            status = SeatStatus.BOOKED;\n            return true;\n        }\n        return false;',
    '// TODO: Transition from LOCKED to BOOKED if not expired\n        return false;'
)

# 3. ATM
content = content.replace(
    'if (amount >= 100) {\n            int count = amount / 100;\n            int rem = amount % 100;\n            System.out.println("Dispensing " + count + " x $100 notes");\n            if (rem != 0 && next != null) next.dispense(rem);\n        } else if (next != null) {\n            next.dispense(amount);\n        }',
    '// TODO: Calculate count of $100 notes and pass remainder to next dispenser in chain'
)

# 4. Logger
content = content.replace(
    'if (level.ordinal() >= minLevel.ordinal()) {\n            for (LogAppender a : appenders) a.append(level, msg);\n        }',
    '// TODO: Dispatch log message to registered appenders if log level is sufficient'
)

# 5. Snake and Ladder
content = content.replace(
    'public void addSnake(int head, int tail) { snakes.put(head, tail); }\n    public void addLadder(int start, int end) { ladders.put(start, end); }\n    public void addPlayer(Player p) { players.offer(p); }',
    'public void addSnake(int head, int tail) {\n        // TODO: Validate head > tail and store snake\n    }\n    public void addLadder(int start, int end) {\n        // TODO: Validate start < end and store ladder\n    }\n    public void addPlayer(Player p) {\n        // TODO: Add player to turn queue\n    }\n    public boolean playTurn(int diceRoll) {\n        // TODO: Move current player, check snakes/ladders, and verify if player won\n        return false;\n    }'
)

with open("src/lib/lldData.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated src/lib/lldData.ts successfully!")
