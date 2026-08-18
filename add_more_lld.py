import json

new_lld_problems = [
  {
    "id": "lld-bookmyshow",
    "title": "Design BookMyShow / Movie Ticket Booking System",
    "category": "LLD",
    "difficulty": "Hard",
    "companies": ["Amazon", "Flipkart", "MakeMyTrip", "BookMyShow", "Google"],
    "description": "Design a highly concurrent movie ticket booking system capable of managing multiple cinema halls, shows, seat layouts (VIP, Regular), locking seats during checkout to prevent double-booking, and processing payments.",
    "requirements": {
      "functional": [
        "Cities have multiple Cinema Theatres with multiple Screens/Halls.",
        "Each Screen runs multiple Shows of Movies with a Seat Map grid.",
        "Seat Reservation Lock: When a user selects seats, lock them for 10 minutes.",
        "Payment integration with Strategy pattern and ticket booking confirmation."
      ],
      "nonFunctional": [
        "Thread-safe seat locking mechanism under high flash sale concurrency.",
        "Auto-release locked seats after timeout if payment is not completed."
      ]
    },
    "designPatternsUsed": ["Strategy Pattern", "Observer Pattern", "Factory Pattern"],
    "diagramType": "plantuml",
    "starterDiagram": """@startuml
title BookMyShow System Architecture

enum SeatStatus {
  AVAILABLE
  LOCKED
  BOOKED
}

class Seat {
  - seatId: String
  - row: int
  - col: int
  - price: double
  - status: SeatStatus
  + lock(): boolean
  + book(): boolean
  + release(): void
}

class Show {
  - showId: String
  - movieTitle: String
  - startTime: Date
  - seats: Map<String, Seat>
  + getAvailableSeats(): List<Seat>
}

class CinemaHall {
  - hallId: String
  - name: String
  - shows: List<Show>
}

class BookingManager {
  + createBooking(userId: String, showId: String, seatIds: List<String>): Booking
  + confirmBooking(bookingId: String, paymentStrategy: PaymentStrategy): boolean
}

CinemaHall *-- Show
Show *-- Seat
@enduml""",
    "starterCode": {
      "java": """// BookMyShow Starter Stub (Java)
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

enum SeatStatus { AVAILABLE, LOCKED, BOOKED }

class Seat {
    private final String id;
    private final double price;
    private SeatStatus status = SeatStatus.AVAILABLE;
    private long lockExpiryTime = 0;

    public Seat(String id, double price) { this.id = id; this.price = price; }
    public synchronized boolean lockSeat(int lockDurationSec) {
        if (status == SeatStatus.AVAILABLE || (status == SeatStatus.LOCKED && System.currentTimeMillis() > lockExpiryTime)) {
            status = SeatStatus.LOCKED;
            lockExpiryTime = System.currentTimeMillis() + (lockDurationSec * 1000);
            return true;
        }
        return false;
    }
    public synchronized boolean bookSeat() {
        if (status == SeatStatus.LOCKED && System.currentTimeMillis() <= lockExpiryTime) {
            status = SeatStatus.BOOKED;
            return true;
        }
        return false;
    }
}

class Show {
    private final String showId;
    private final String movieName;
    private final Map<String, Seat> seats = new ConcurrentHashMap<>();

    public Show(String showId, String movieName) {
        this.showId = showId;
        this.movieName = movieName;
    }
    public void addSeat(Seat seat) { seats.put(seat.toString(), seat); }
}

public class BookMyShowService {
    public static void main(String[] args) {
        System.out.println("BookMyShow Service Initialized.");
    }
}""",
      "cpp": """// BookMyShow Starter Stub (C++)
#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <mutex>
#include <chrono>

enum class SeatStatus { AVAILABLE, LOCKED, BOOKED };

class Seat {
private:
    std::string id;
    SeatStatus status;
    std::mutex mtx;
public:
    Seat(std::string id) : id(id), status(SeatStatus.AVAILABLE) {}
};""",
      "python": """# BookMyShow Starter Stub (Python)
from enum import Enum
import time
import threading

class SeatStatus(Enum):
    AVAILABLE = 1
    LOCKED = 2
    BOOKED = 3

class Seat:
    def __init__(self, seat_id: str, price: float):
        self.seat_id = seat_id
        self.price = price
        self.status = SeatStatus.AVAILABLE
        self.lock = threading.Lock()
        self.lock_expiry = 0"""
    }
  },
  {
    "id": "lld-vending-machine",
    "title": "Design a Vending Machine (State Design Pattern)",
    "category": "LLD",
    "difficulty": "Medium",
    "companies": ["Amazon", "Microsoft", "Goldman Sachs", "Oracle"],
    "description": "Design an extensible Vending Machine following the State Pattern with states (NoMoneyState, HasMoneyState, DispensingState, SoldOutState) handling inventory, currency denominations, and change return.",
    "requirements": {
      "functional": [
        "Insert coins/cash of supported denominations (1, 5, 10, 20).",
        "Select an item, check product inventory, and deduct cost.",
        "Dispense item and calculate exact change return.",
        "Refund button to return inserted money at any point before dispensing."
      ],
      "nonFunctional": [
        "Clean State Pattern transitions without massive if-else ladders.",
        "Zero money loss on failure or power interruption."
      ]
    },
    "designPatternsUsed": ["State Pattern", "Factory Pattern"],
    "diagramType": "plantuml",
    "starterDiagram": """@startuml
title Vending Machine State Pattern

interface State {
  + insertMoney(amount: double): void
  + selectItem(code: String): void
  + dispense(): void
  + cancelAndRefund(): void
}

class IdleState implements State
class HasMoneyState implements State
class DispenseState implements State

class VendingMachine {
  - currentState: State
  - balance: double
  - inventory: Map<String, Item>
  + setState(s: State): void
}

VendingMachine o-- State
@enduml""",
    "starterCode": {
      "java": """// Vending Machine Starter Stub (Java)
import java.util.*;

interface VendingMachineState {
    void insertCoin(VendingMachine vm, int amount);
    void selectProduct(VendingMachine vm, String code);
    void dispense(VendingMachine vm);
    void refund(VendingMachine vm);
}

class IdleState implements VendingMachineState {
    public void insertCoin(VendingMachine vm, int amount) {
        System.out.println("Coin inserted: " + amount);
    }
    public void selectProduct(VendingMachine vm, String code) {
        System.out.println("Please insert coin first.");
    }
    public void dispense(VendingMachine vm) {}
    public void refund(VendingMachine vm) {}
}

class VendingMachine {
    private VendingMachineState state = new IdleState();
    private int balance = 0;
    public void setState(VendingMachineState state) { this.state = state; }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("Vending Machine System Ready.");
    }
}""",
      "cpp": """// Vending Machine Starter Stub (C++)
#include <iostream>
#include <memory>

class VendingMachine;

class State {
public:
    virtual ~State() = default;
    virtual void insertMoney(VendingMachine& vm, int amount) = 0;
    virtual void selectProduct(VendingMachine& vm, std::string code) = 0;
};""",
      "python": """# Vending Machine Starter Stub (Python)
from abc import ABC, abstractmethod

class VendingState(ABC):
    @abstractmethod
    def insert_money(self, vm, amount: int): pass
    @abstractmethod
    def select_product(self, vm, code: str): pass"""
    }
  },
  {
    "id": "lld-snake-and-ladder",
    "title": "Design Snake and Ladder Board Game",
    "category": "LLD",
    "difficulty": "Easy",
    "companies": ["Amazon", "Adobe", "Swiggy", "Flipkart"],
    "description": "Design an object-oriented Snake and Ladder game for N players with customizable board size (100 cells), customizable snakes and ladders, and a fair N-sided dice.",
    "requirements": {
      "functional": [
        "Board of customizable dimension (standard: 1 to 100).",
        "Configurable snakes (head > tail) and ladders (start < end).",
        "Queue-based turn-by-turn rolling of Dice (1-6).",
        "Winning condition: First player to land exactly on square 100."
      ],
      "nonFunctional": [
        "Clean Separation of Concerns between Dice, Board, Player, and GameEngine."
      ]
    },
    "designPatternsUsed": ["Strategy Pattern", "Observer Pattern"],
    "diagramType": "plantuml",
    "starterDiagram": """@startuml
title Snake & Ladder Game

class Cell {
  - position: int
  - snakeTail: int
  - ladderEnd: int
}

class Board {
  - size: int
  - cells: List<Cell>
  + getNextPosition(current: int, roll: int): int
}

class Player {
  - id: String
  - position: int
}

class GameEngine {
  - players: Queue<Player>
  - board: Board
  + playTurn(): void
}

GameEngine o-- Board
GameEngine o-- Player
@enduml""",
    "starterCode": {
      "java": """// Snake & Ladder Starter Stub (Java)
import java.util.*;

class Player {
    private final String name;
    private int position = 0;
    public Player(String name) { this.name = name; }
    public int getPosition() { return position; }
    public void setPosition(int p) { this.position = p; }
    public String getName() { return name; }
}

class SnakeAndLadderGame {
    private final Map<Integer, Integer> snakes = new HashMap<>();
    private final Map<Integer, Integer> ladders = new HashMap<>();
    private final Queue<Player> players = new LinkedList<>();

    public void addSnake(int head, int tail) { snakes.put(head, tail); }
    public void addLadder(int start, int end) { ladders.put(start, end); }
    public void addPlayer(Player p) { players.offer(p); }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("Snake and Ladder Game Engine Loaded.");
    }
}""",
      "cpp": """// Snake & Ladder Starter Stub (C++)
#include <iostream>
#include <unordered_map>
#include <queue>
#include <string>

class Player {
public:
    std::string name;
    int position = 0;
    Player(std::string name) : name(name) {}
};""",
      "python": """# Snake & Ladder Starter Stub (Python)
import random
from collections import deque

class Player:
    def __init__(self, name: str):
        self.name = name
        self.position = 0"""
    }
  },
  {
    "id": "lld-atm-machine",
    "title": "Design an ATM Machine (Chain of Responsibility & State)",
    "category": "LLD",
    "difficulty": "Hard",
    "companies": ["Goldman Sachs", "Morgan Stanley", "JPMorgan", "Amazon"],
    "description": "Design an Automated Teller Machine (ATM) with authentication, transaction handling (Withdrawal, Deposit, Balance Inquiry), and a Cash Dispenser using Chain of Responsibility ($100, $50, $20, $10 notes).",
    "requirements": {
      "functional": [
        "Insert Card, Authenticate PIN with Bank Account.",
        "Cash Withdrawal with optimal note denomination dispensing.",
        "Transaction rollback on hardware cash jam or insufficient ATM cash."
      ],
      "nonFunctional": [
        "ACID transaction compliance with bank balance.",
        "Extensible cash dispenser hierarchy via Chain of Responsibility."
      ]
    },
    "designPatternsUsed": ["Chain of Responsibility", "State Pattern", "Command Pattern"],
    "diagramType": "plantuml",
    "starterDiagram": """@startuml
title ATM Machine Architecture

abstract class CashDispenser {
  # nextDispenser: CashDispenser
  + setNext(d: CashDispenser): void
  + {abstract} dispense(amount: int): void
}

class HundredDollarDispenser extends CashDispenser
class FiftyDollarDispenser extends CashDispenser
class TwentyDollarDispenser extends CashDispenser

class ATM {
  - dispenserChain: CashDispenser
  + withdraw(amount: int): void
}

ATM o-- CashDispenser
@enduml""",
    "starterCode": {
      "java": """// ATM Machine Starter Stub (Java)
import java.util.*;

abstract class CashDispenser {
    protected CashDispenser next;
    public void setNext(CashDispenser next) { this.next = next; }
    public abstract void dispense(int amount);
}

class HundredDollarDispenser extends CashDispenser {
    public void dispense(int amount) {
        if (amount >= 100) {
            int count = amount / 100;
            int rem = amount % 100;
            System.out.println("Dispensing " + count + " x $100 notes");
            if (rem != 0 && next != null) next.dispense(rem);
        } else if (next != null) {
            next.dispense(amount);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("ATM System Initialized.");
    }
}""",
      "cpp": """// ATM Machine Starter Stub (C++)
#include <iostream>
#include <memory>

class CashDispenser {
protected:
    std::shared_ptr<CashDispenser> next;
public:
    virtual ~CashDispenser() = default;
    void setNext(std::shared_ptr<CashDispenser> n) { next = n; }
    virtual void dispense(int amount) = 0;
};""",
      "python": """# ATM Machine Starter Stub (Python)
from abc import ABC, abstractmethod

class CashDispenser(ABC):
    def __init__(self):
        self.next = None
    def set_next(self, next_dispenser):
        self.next = next_dispenser
    @abstractmethod
    def dispense(self, amount: int): pass"""
    }
  },
  {
    "id": "lld-logging-framework",
    "title": "Design In-Memory Logging Framework (Log4j)",
    "category": "LLD",
    "difficulty": "Medium",
    "companies": ["Google", "Meta", "Microsoft", "Netflix"],
    "description": "Design an extensible logging library supporting log levels (DEBUG, INFO, WARN, ERROR), sink appenders (ConsoleAppender, FileAppender, DatabaseAppender), and asynchronous logging.",
    "requirements": {
      "functional": [
        "Hierarchical logging levels (DEBUG < INFO < WARN < ERROR).",
        "Multiple sink appenders per logger configuration.",
        "Custom message formatters (timestamp, thread name, log level, message)."
      ],
      "nonFunctional": [
        "Asynchronous non-blocking log ingestion via ring buffer / queue.",
        "Thread-safe writes to log sinks."
      ]
    },
    "designPatternsUsed": ["Chain of Responsibility", "Observer Pattern", "Singleton Pattern"],
    "diagramType": "plantuml",
    "starterDiagram": """@startuml
title Logging Framework Architecture

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
}

interface LogAppender {
  + append(level: LogLevel, msg: String): void
}

class ConsoleAppender implements LogAppender
class FileAppender implements LogAppender

class Logger {
  - minLevel: LogLevel
  - appenders: List<LogAppender>
  + info(msg: String): void
  + error(msg: String): void
}

Logger o-- LogAppender
@enduml""",
    "starterCode": {
      "java": """// Logger Starter Stub (Java)
import java.util.*;

enum LogLevel { DEBUG, INFO, WARN, ERROR }

interface LogAppender {
    void append(LogLevel level, String message);
}

class ConsoleAppender implements LogAppender {
    public void append(LogLevel level, String message) {
        System.out.println("[" + level + "] " + new Date() + " - " + message);
    }
}

class Logger {
    private final LogLevel minLevel;
    private final List<LogAppender> appenders = new ArrayList<>();

    public Logger(LogLevel minLevel) { this.minLevel = minLevel; }
    public void addAppender(LogAppender appender) { appenders.add(appender); }
    public void info(String msg) { log(LogLevel.INFO, msg); }
    public void error(String msg) { log(LogLevel.ERROR, msg); }
    private void log(LogLevel level, String msg) {
        if (level.ordinal() >= minLevel.ordinal()) {
            for (LogAppender a : appenders) a.append(level, msg);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("Logger Framework Ready.");
    }
}""",
      "cpp": """// Logger Starter Stub (C++)
#include <iostream>
#include <string>
#include <vector>
#include <memory>

enum class LogLevel { DEBUG, INFO, WARN, ERROR };

class LogAppender {
public:
    virtual ~LogAppender() = default;
    virtual void append(LogLevel level, const std::string& msg) = 0;
};""",
      "python": """# Logger Starter Stub (Python)
from enum import Enum
import datetime

class LogLevel(Enum):
    DEBUG = 1
    INFO = 2
    WARN = 3
    ERROR = 4"""
    }
  }
]

with open("src/lib/lldData.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Append to LLD_PROBLEMS if not present
if "lld-bookmyshow" not in content:
    idx = content.rfind("];")
    if idx != -1:
        new_problems_str = ",\n" + ",\n".join(json.dumps(p, indent=2) for p in new_lld_problems) + "\n"
        new_content = content[:idx] + new_problems_str + content[idx:]
        with open("src/lib/lldData.ts", "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Successfully added {len(new_lld_problems)} new LLD problems to src/lib/lldData.ts!")
    else:
        print("Error: Could not find closing bracket of LLD_PROBLEMS")
else:
    print("New LLD problems already present in src/lib/lldData.ts")
