export interface LLDProblem {
  id: string;
  title: string;
  category: 'LLD' | 'HLD' | 'Design Patterns';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companies: string[];
  description: string;
  requirements: {
    functional: string[];
    nonFunctional: string[];
  };
  designPatternsUsed: string[];
  starterDiagram: string;
  diagramType: 'plantuml' | 'mermaid';
  starterCode: {
    java: string;
    cpp: string;
    python: string;
  };
  githubResourceUrl?: string;
  githubRepo?: string;
  githubPath?: string;
}

export const LLD_PROBLEMS: LLDProblem[] = [
  {
    id: 'lld-parking-lot',
    title: 'Design a Multi-Floor Parking Lot System',
    category: 'LLD',
    difficulty: 'Medium',
    companies: ['Google', 'Amazon', 'Microsoft', 'Uber', 'Swiggy'],
    description: 'Design a clean, object-oriented parking lot system capable of handling multiple vehicle types (Motorcycles, Cars, Trucks), dynamically allocating parking spots, generating tickets, and calculating hourly rates with extensible pricing strategies.',
    requirements: {
      functional: [
        'Multiple floors with different spot capacities and vehicle spot types (Compact, Large, Handicapped, Electric).',
        'Automatic nearest available spot allocation at the entrance gate.',
        'Ticket issuance with timestamp, assigned spot ID, and vehicle license number.',
        'Extensible pricing calculation upon exit (Hourly, Daily, Holiday Surcharge).'
      ],
      nonFunctional: [
        'Thread-safe spot assignment to prevent double-allocation under concurrent traffic.',
        'Adherence to SOLID principles and Factory / Strategy design patterns.'
      ]
    },
    designPatternsUsed: ['Factory Pattern', 'Strategy Pattern', 'Singleton Pattern'],
    diagramType: 'plantuml',
    starterDiagram: `@startuml
title Parking Lot System Architecture

enum VehicleType {
  MOTORCYCLE
  CAR
  TRUCK
}

abstract class Vehicle {
  - licenseNumber: String
  - type: VehicleType
  + getLicenseNumber(): String
}

class ParkingSpot {
  - id: int
  - spotType: VehicleType
  - isOccupied: boolean
  + assignVehicle(v: Vehicle): boolean
  + vacate(): void
}

class ParkingFloor {
  - floorNumber: int
  - spots: List
  + findAvailableSpot(type: VehicleType): ParkingSpot
}

interface PricingStrategy {
  + calculateFee(hours: double): double
}

class HourlyPricingStrategy implements PricingStrategy {
  + calculateFee(hours: double): double
}

class ParkingLot {
  - floors: List
  - pricingStrategy: PricingStrategy
  + parkVehicle(v: Vehicle): String
  + exitVehicle(ticketId: String): double
}

ParkingLot o-- ParkingFloor
ParkingFloor o-- ParkingSpot
@enduml`,
    starterCode: {
      java: `// Parking Lot System Starter Stub (Java)
import java.util.*;

enum VehicleType {
    MOTORCYCLE,
    CAR,
    TRUCK
}

abstract class Vehicle {
    private final String licensePlate;
    private final VehicleType type;

    public Vehicle(String licensePlate, VehicleType type) {
        this.licensePlate = licensePlate;
        this.type = type;
    }
    public String getLicensePlate() { return licensePlate; }
    public VehicleType getType() { return type; }
}

class ParkingSpot {
    private final int id;
    private final VehicleType spotType;
    private Vehicle vehicle;

    public ParkingSpot(int id, VehicleType spotType) {
        this.id = id;
        this.spotType = spotType;
    }

    public synchronized boolean isAvailable() {
        // TODO: Check if spot is unoccupied
        // TODO: Check if spot is vacant
        return false;
    }

    public synchronized boolean assign(Vehicle v) {
        // TODO: Validate spot type and assign vehicle thread-safely
        // TODO: Validate spot type and assign vehicle thread-safely
        return false;
    }

    public synchronized void vacate() {
        // TODO: Clear assigned vehicle
    }
}

interface PricingStrategy {
    double calculateFee(double hours);
}

class ParkingLot {
    private final List<ParkingSpot> spots = new ArrayList<>();
    private PricingStrategy pricingStrategy;

    public void setPricingStrategy(PricingStrategy strategy) {
        this.pricingStrategy = strategy;
    }

    public String parkVehicle(Vehicle v) {
        // TODO: Allocate available spot and return ticket ID
        return null;
    }
}`,
      cpp: `// Parking Lot System Starter Stub (C++)
#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <mutex>

enum class VehicleType { MOTORCYCLE, CAR, TRUCK };

class Vehicle {
protected:
    std::string license;
    VehicleType type;
public:
    Vehicle(std::string lic, VehicleType t) : license(lic), type(t) {}
    virtual ~Vehicle() = default;
    VehicleType getType() const { return type; }
};

class ParkingSpot {
private:
    int id;
    VehicleType spotType;
    std::shared_ptr<Vehicle> vehicle;
    std::mutex mtx;
public:
    ParkingSpot(int id, VehicleType t) : id(id), spotType(t) {}
    bool isAvailable() {
        // TODO: Check availability
        return vehicle == nullptr;
    }
    bool assign(std::shared_ptr<Vehicle> v) {
        // TODO: Assign vehicle thread-safely
        return false;
    }
};`,
      python: `# Parking Lot System Starter Stub (Python)
from enum import Enum
from typing import List, Optional

class VehicleType(Enum):
    MOTORCYCLE = 1
    CAR = 2
    TRUCK = 3

class Vehicle:
    def __init__(self, license_plate: str, v_type: VehicleType):
        self.license_plate = license_plate
        self.v_type = v_type

class ParkingSpot:
    def __init__(self, spot_id: int, spot_type: VehicleType):
        self.spot_id = spot_id
        self.spot_type = spot_type
        self.vehicle: Optional[Vehicle] = None

    def is_available(self) -> bool:
        # TODO: Return True if spot is vacant
        return self.vehicle is None

    def park(self, vehicle: Vehicle) -> bool:
        # TODO: Assign vehicle if spot type matches
        pass`
    }
  },

  {
    id: 'lld-rate-limiter',
    title: 'Design a Distributed Rate Limiter (Token Bucket / Sliding Window)',
    category: 'LLD',
    difficulty: 'Medium',
    companies: ['Meta', 'Stripe', 'Amazon', 'Cloudflare'],
    description: 'Design a thread-safe, high-throughput rate limiter middleware supporting Token Bucket and Sliding Window algorithms to protect microservices from burst traffic.',
    requirements: {
      functional: [
        'Allow configurable max requests per time window per Client ID / IP.',
        'Return HTTP 429 Too Many Requests when quota is exceeded.',
        'Support dynamic rate limit policy updates per tenant/tier.'
      ],
      nonFunctional: [
        'Sub-millisecond latency overhead for incoming API requests.',
        'Thread-safety and distributed lock-free atomic operations.'
      ]
    },
    designPatternsUsed: ['Strategy Pattern', 'Decorator Pattern', 'Singleton Pattern'],
    diagramType: 'plantuml',
    starterDiagram: `@startuml
title Rate Limiter Architecture

interface RateLimiterStrategy {
  + allowRequest(clientId: String): boolean
}

class TokenBucketRateLimiter implements RateLimiterStrategy {
  - capacity: long
  - refillRate: double
  - currentTokens: double
  + allowRequest(clientId: String): boolean
}

class SlidingWindowRateLimiter implements RateLimiterStrategy {
  - maxRequests: int
  - windowSizeMillis: long
  + allowRequest(clientId: String): boolean
}
@enduml`,
    starterCode: {
      java: `// Rate Limiter Starter Stub (Java)
import java.util.concurrent.ConcurrentHashMap;

interface RateLimiterStrategy {
    boolean allowRequest(String clientId);
}

public class TokenBucketRateLimiter implements RateLimiterStrategy {
    private final long capacity;
    private final double refillRate;
    private double currentTokens;
    private long lastRefillTimestamp;

    public TokenBucketRateLimiter(long capacity, double refillRate) {
        this.capacity = capacity;
        this.refillRate = refillRate;
        this.currentTokens = capacity;
        this.lastRefillTimestamp = System.currentTimeMillis();
    }

    @Override
    public synchronized boolean allowRequest(String clientId) {
        // TODO: Refill tokens based on elapsed time and consume 1 token if available
        return false;
    }
}`,
      cpp: `// Rate Limiter Starter Stub (C++)
#include <iostream>
#include <mutex>
#include <chrono>

class RateLimiter {
private:
    long capacity;
    double refillRate;
    std::mutex mtx;
public:
    RateLimiter(long cap, double rate) : capacity(cap), refillRate(rate) {}
    bool allowRequest(const std::string& clientId) {
        // TODO: Implement Token Bucket / Sliding Window logic
        return false;
    }
};`,
      python: `# Rate Limiter Starter Stub (Python)
import time
import threading

class TokenBucketRateLimiter:
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.refill_rate = refill_rate
        self.tokens = capacity
        self.last_refill = time.time()
        self.lock = threading.Lock()

    def allow_request(self, client_id: str) -> bool:
        # TODO: Implement thread-safe token refill & decrement
        pass`
    }
  },

  {
    id: 'lld-elevator-system',
    title: 'Design an Elevator Management System',
    category: 'LLD',
    difficulty: 'Hard',
    companies: ['Google', 'Microsoft', 'Goldman Sachs', 'Uber'],
    description: 'Design an optimal multi-car elevator control system in a skyscraper. Implement dispatching algorithms (LOOK/SCAN) to minimize passenger wait times and energy consumption.',
    requirements: {
      functional: [
        'Handle external hall calls (Up/Down) and internal floor button presses.',
        'Support multiple elevator cars operating concurrently.',
        'Emergency stop, door sensor safety, and weight threshold handling.'
      ],
      nonFunctional: [
        'Extensible dispatching strategy algorithm.',
        'High responsiveness and starvation prevention.'
      ]
    },
    designPatternsUsed: ['State Pattern', 'Strategy Pattern', 'Observer Pattern'],
    diagramType: 'plantuml',
    starterDiagram: `@startuml
title Elevator System Architecture

enum Direction {
  UP
  DOWN
  IDLE
}

class ElevatorCar {
  - id: int
  - currentFloor: int
  - direction: Direction
  + addDestination(floor: int): void
  + step(): void
}

interface DispatchStrategy {
  + selectCar(cars: List, floor: int, dir: Direction): ElevatorCar
}

class ElevatorController {
  - cars: List
  - strategy: DispatchStrategy
  + requestElevator(floor: int, dir: Direction): void
}

ElevatorController o-- ElevatorCar
ElevatorController --> DispatchStrategy
@enduml`,
    starterCode: {
      java: `// Elevator System Starter Stub (Java)
import java.util.*;

enum Direction {
    UP,
    DOWN,
    IDLE
}

class ElevatorCar {
    private final int id;
    private int currentFloor = 0;
    private Direction direction = Direction.IDLE;

    public ElevatorCar(int id) { this.id = id; }

    public synchronized void addDestination(int floor) {
        // TODO: Add destination floor to pending queue (SCAN / LOOK)
    }

    public synchronized void step() {
        // TODO: Transition to next floor based on current direction
    }
}

interface DispatchStrategy {
    ElevatorCar selectCar(List<ElevatorCar> cars, int floor, Direction dir);
}

class ElevatorController {
    private final List<ElevatorCar> cars = new ArrayList<>();
    private DispatchStrategy strategy;

    public void requestElevator(int floor, Direction dir) {
        // TODO: Dispatch nearest optimal elevator car
    }
}`,
      cpp: `// Elevator System Starter Stub (C++)
#include <iostream>
#include <vector>
#include <set>

enum class Direction { UP, DOWN, IDLE };

class ElevatorCar {
private:
    int id;
    int currentFloor = 0;
    Direction direction = Direction::IDLE;
public:
    ElevatorCar(int id) : id(id) {}
    void addDestination(int floor) {
        // TODO: Queue floor request
    }
};`,
      python: `# Elevator System Starter Stub (Python)
from enum import Enum
from typing import List

class Direction(Enum):
    UP = 1
    DOWN = 2
    IDLE = 3

class ElevatorCar:
    def __init__(self, car_id: int):
        self.car_id = car_id
        self.current_floor = 0
        self.direction = Direction.IDLE

    def add_destination(self, floor: int):
        # TODO: Append floor request
        pass`
    }
  },

  {
    id: 'lld-splitwise',
    title: 'Design Splitwise (Expense Sharing App)',
    category: 'LLD',
    difficulty: 'Medium',
    companies: ['Uber', 'Swiggy', 'PhonePe', 'Paytm', 'Amazon'],
    description: 'Design an expense-sharing application supporting equal, exact, and percentage splits among groups, with automated debt simplification algorithms.',
    requirements: {
      functional: [
        'Create users, groups, and add multi-currency expenses.',
        'Support Equal, Exact, and Percentage expense splits.',
        'View individual and group balances with settle-up capabilities.'
      ],
      nonFunctional: [
        'Debt simplification using min-cash flow graph optimization.',
        'Thread-safe balance ledger tracking.'
      ]
    },
    designPatternsUsed: ['Factory Pattern', 'Strategy Pattern', 'Observer Pattern'],
    diagramType: 'plantuml',
    starterDiagram: `@startuml
title Splitwise Architecture

enum SplitType {
  EQUAL
  EXACT
  PERCENT
}

class User {
  - id: String
  - name: String
}

abstract class Expense {
  - id: String
  - amount: double
  - paidBy: User
  + validate(): boolean
}

interface SplitStrategy {
  + calculateSplits(amount: double, users: List): List
}

Expense --> SplitStrategy
@enduml`,
    starterCode: {
      java: `// Splitwise Starter Stub (Java)
import java.util.*;

enum SplitType {
    EQUAL,
    EXACT,
    PERCENT
}

class User {
    private final String id;
    private final String name;
    public User(String id, String name) { this.id = id; this.name = name; }
    public String getId() { return id; }
    public String getName() { return name; }
}

interface SplitStrategy {
    void calculateSplits(double totalAmount, List<User> participants);
}

class ExpenseManager {
    private final Map<String, User> userMap = new HashMap<>();
    private final Map<String, Map<String, Double>> balanceSheet = new HashMap<>();

    public void addExpense(String paidByUserId, double amount, List<String> userIds, SplitType splitType) {
        // TODO: Execute split strategy and update balanceSheet
    }

    public void showBalances() {
        // TODO: Print balances
    }
}`,
      cpp: `// Splitwise Starter Stub (C++)
#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>

enum class SplitType { EQUAL, EXACT, PERCENT };

class User {
    std::string id;
    std::string name;
public:
    User(std::string id, std::string name) : id(id), name(name) {}
};

class ExpenseManager {
public:
    void addExpense(const std::string& paidBy, double amount, const std::vector<std::string>& users) {
        // TODO: Record split expense
    }
};`,
      python: `# Splitwise Starter Stub (Python)
from enum import Enum
from typing import List, Dict

class SplitType(Enum):
    EQUAL = 1
    EXACT = 2
    PERCENT = 3

class User:
    def __init__(self, user_id: str, name: str):
        self.user_id = user_id
        self.name = name

class ExpenseManager:
    def __init__(self):
        self.balances: Dict[str, Dict[str, float]] = {}

    def add_expense(self, paid_by: str, amount: float, users: List[str], split_type: SplitType):
        # TODO: Compute balances
        pass`
    }
  },

  {
    id: 'lld-lru-cache',
    title: 'Design an LRU & LFU In-Memory Cache',
    category: 'LLD',
    difficulty: 'Medium',
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'],
    description: 'Design a thread-safe in-memory cache supporting O(1) Get and Put operations with Least Recently Used (LRU) and Least Frequently Used (LFU) eviction policies.',
    requirements: {
      functional: [
        'O(1) get(key) and put(key, value) operations.',
        'Automatic eviction of oldest entries upon reaching capacity limit.',
        'TTL (Time-to-Live) key expiration support.'
      ],
      nonFunctional: [
        'Thread-safe read/write concurrency with fine-grained locking.',
        'Zero memory leak on key eviction.'
      ]
    },
    designPatternsUsed: ['Strategy Pattern', 'Proxy Pattern'],
    diagramType: 'plantuml',
    starterDiagram: `@startuml
title LRU Cache Class Diagram

class Node {
  - key: String
  - value: Object
  - prev: Node
  - next: Node
}

class LRUCache {
  - capacity: int
  - map: Map
  + get(key: String): Object
  + put(key: String, value: Object): void
}

LRUCache *-- Node
@enduml`,
    starterCode: {
      java: `// LRU Cache Starter Stub (Java)
import java.util.*;

public class LRUCache<K, V> {
    private static class Node<K, V> {
        K key;
        V val;
        Node<K, V> prev, next;
        Node(K k, V v) { this.key = k; this.val = v; }
    }

    private final int capacity;
    private final Map<K, Node<K, V>> map = new HashMap<>();
    private final Node<K, V> head = new Node<>(null, null);
    private final Node<K, V> tail = new Node<>(null, null);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public synchronized V get(K key) {
        // TODO: Return value and move accessed node to head in O(1)
        return null;
    }

    public synchronized void put(K key, V value) {
        // TODO: Insert/update node, move to head, evict LRU from tail if full
    }
}`,
      cpp: `// LRU Cache Starter Stub (C++)
#include <iostream>
#include <unordered_map>
#include <list>
#include <mutex>

template<typename K, typename V>
class LRUCache {
private:
    size_t capacity;
    std::list<std::pair<K, V>> items;
    std::unordered_map<K, typename std::list<std::pair<K, V>>::iterator> map;
    std::mutex mtx;
public:
    LRUCache(size_t cap) : capacity(cap) {}
    bool get(K key, V& val) {
        // TODO: O(1) fetch & update position
        return false;
    }
    void put(K key, V val) {
        // TODO: O(1) insert & eviction
    }
};`,
      python: `# LRU Cache Starter Stub (Python)
from collections import OrderedDict
import threading

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()
        self.lock = threading.Lock()

    def get(self, key: str):
        # TODO: O(1) fetch and update LRU order
        pass

    def put(self, key: str, value):
        # TODO: O(1) insert and evict if capacity exceeded
        pass`
    }
  }
,
{
  "id": "lld-bookmyshow",
  "title": "Design BookMyShow / Movie Ticket Booking System",
  "category": "LLD",
  "difficulty": "Hard",
  "companies": [
    "Amazon",
    "Flipkart",
    "MakeMyTrip",
    "BookMyShow",
    "Google"
  ],
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
  "designPatternsUsed": [
    "Strategy Pattern",
    "Observer Pattern",
    "Factory Pattern"
  ],
  "diagramType": "plantuml",
  "starterDiagram": "@startuml\ntitle BookMyShow System Architecture\n\nenum SeatStatus {\n  AVAILABLE\n  LOCKED\n  BOOKED\n}\n\nclass Seat {\n  - seatId: String\n  - row: int\n  - col: int\n  - price: double\n  - status: SeatStatus\n  + lock(): boolean\n  + book(): boolean\n  + release(): void\n}\n\nclass Show {\n  - showId: String\n  - movieTitle: String\n  - startTime: Date\n  - seats: Map<String, Seat>\n  + getAvailableSeats(): List<Seat>\n}\n\nclass CinemaHall {\n  - hallId: String\n  - name: String\n  - shows: List<Show>\n}\n\nclass BookingManager {\n  + createBooking(userId: String, showId: String, seatIds: List<String>): Booking\n  + confirmBooking(bookingId: String, paymentStrategy: PaymentStrategy): boolean\n}\n\nCinemaHall *-- Show\nShow *-- Seat\n@enduml",
  "starterCode": {
    "java": "// BookMyShow Starter Stub (Java)\nimport java.util.*;\nimport java.util.concurrent.ConcurrentHashMap;\n\nenum SeatStatus { AVAILABLE, LOCKED, BOOKED }\n\nclass Seat {\n    private final String id;\n    private final double price;\n    private SeatStatus status = SeatStatus.AVAILABLE;\n    private long lockExpiryTime = 0;\n\n    public Seat(String id, double price) { this.id = id; this.price = price; }\n    public synchronized boolean lockSeat(int lockDurationSec) {\n        if (status == SeatStatus.AVAILABLE || (status == SeatStatus.LOCKED && System.currentTimeMillis() > lockExpiryTime)) {\n            status = SeatStatus.LOCKED;\n            lockExpiryTime = System.currentTimeMillis() + (lockDurationSec * 1000);\n            return true;\n        }\n        return false;\n    }\n    public synchronized boolean bookSeat() {\n        if (status == SeatStatus.LOCKED && System.currentTimeMillis() <= lockExpiryTime) {\n            status = SeatStatus.BOOKED;\n            return true;\n        }\n        return false;\n    }\n}\n\nclass Show {\n    private final String showId;\n    private final String movieName;\n    private final Map<String, Seat> seats = new ConcurrentHashMap<>();\n\n    public Show(String showId, String movieName) {\n        this.showId = showId;\n        this.movieName = movieName;\n    }\n    public void addSeat(Seat seat) { seats.put(seat.toString(), seat); }\n}\n\npublic class BookMyShowService {\n    public static void main(String[] args) {\n        System.out.println(\"BookMyShow Service Initialized.\");\n    }\n}",
    "cpp": "// BookMyShow Starter Stub (C++)\n#include <iostream>\n#include <string>\n#include <vector>\n#include <unordered_map>\n#include <mutex>\n#include <chrono>\n\nenum class SeatStatus { AVAILABLE, LOCKED, BOOKED };\n\nclass Seat {\nprivate:\n    std::string id;\n    SeatStatus status;\n    std::mutex mtx;\npublic:\n    Seat(std::string id) : id(id), status(SeatStatus.AVAILABLE) {}\n};",
    "python": "# BookMyShow Starter Stub (Python)\nfrom enum import Enum\nimport time\nimport threading\n\nclass SeatStatus(Enum):\n    AVAILABLE = 1\n    LOCKED = 2\n    BOOKED = 3\n\nclass Seat:\n    def __init__(self, seat_id: str, price: float):\n        self.seat_id = seat_id\n        self.price = price\n        self.status = SeatStatus.AVAILABLE\n        self.lock = threading.Lock()\n        self.lock_expiry = 0"
  }
},
{
  "id": "lld-vending-machine",
  "title": "Design a Vending Machine (State Design Pattern)",
  "category": "LLD",
  "difficulty": "Medium",
  "companies": [
    "Amazon",
    "Microsoft",
    "Goldman Sachs",
    "Oracle"
  ],
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
  "designPatternsUsed": [
    "State Pattern",
    "Factory Pattern"
  ],
  "diagramType": "plantuml",
  "starterDiagram": "@startuml\ntitle Vending Machine State Pattern\n\ninterface State {\n  + insertMoney(amount: double): void\n  + selectItem(code: String): void\n  + dispense(): void\n  + cancelAndRefund(): void\n}\n\nclass IdleState implements State\nclass HasMoneyState implements State\nclass DispenseState implements State\n\nclass VendingMachine {\n  - currentState: State\n  - balance: double\n  - inventory: Map<String, Item>\n  + setState(s: State): void\n}\n\nVendingMachine o-- State\n@enduml",
  "starterCode": {
    "java": "// Vending Machine Starter Stub (Java)\nimport java.util.*;\n\ninterface VendingMachineState {\n    void insertCoin(VendingMachine vm, int amount);\n    void selectProduct(VendingMachine vm, String code);\n    void dispense(VendingMachine vm);\n    void refund(VendingMachine vm);\n}\n\nclass IdleState implements VendingMachineState {\n    public void insertCoin(VendingMachine vm, int amount) {\n        System.out.println(\"Coin inserted: \" + amount);\n    }\n    public void selectProduct(VendingMachine vm, String code) {\n        System.out.println(\"Please insert coin first.\");\n    }\n    public void dispense(VendingMachine vm) {}\n    public void refund(VendingMachine vm) {}\n}\n\nclass VendingMachine {\n    private VendingMachineState state = new IdleState();\n    private int balance = 0;\n    public void setState(VendingMachineState state) { this.state = state; }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Vending Machine System Ready.\");\n    }\n}",
    "cpp": "// Vending Machine Starter Stub (C++)\n#include <iostream>\n#include <memory>\n\nclass VendingMachine;\n\nclass State {\npublic:\n    virtual ~State() = default;\n    virtual void insertMoney(VendingMachine& vm, int amount) = 0;\n    virtual void selectProduct(VendingMachine& vm, std::string code) = 0;\n};",
    "python": "# Vending Machine Starter Stub (Python)\nfrom abc import ABC, abstractmethod\n\nclass VendingState(ABC):\n    @abstractmethod\n    def insert_money(self, vm, amount: int): pass\n    @abstractmethod\n    def select_product(self, vm, code: str): pass"
  }
},
{
  "id": "lld-snake-and-ladder",
  "title": "Design Snake and Ladder Board Game",
  "category": "LLD",
  "difficulty": "Easy",
  "companies": [
    "Amazon",
    "Adobe",
    "Swiggy",
    "Flipkart"
  ],
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
  "designPatternsUsed": [
    "Strategy Pattern",
    "Observer Pattern"
  ],
  "diagramType": "plantuml",
  "starterDiagram": "@startuml\ntitle Snake & Ladder Game\n\nclass Cell {\n  - position: int\n  - snakeTail: int\n  - ladderEnd: int\n}\n\nclass Board {\n  - size: int\n  - cells: List<Cell>\n  + getNextPosition(current: int, roll: int): int\n}\n\nclass Player {\n  - id: String\n  - position: int\n}\n\nclass GameEngine {\n  - players: Queue<Player>\n  - board: Board\n  + playTurn(): void\n}\n\nGameEngine o-- Board\nGameEngine o-- Player\n@enduml",
  "starterCode": {
    "java": "// Snake & Ladder Starter Stub (Java)\nimport java.util.*;\n\nclass Player {\n    private final String name;\n    private int position = 0;\n    public Player(String name) { this.name = name; }\n    public int getPosition() { return position; }\n    public void setPosition(int p) { this.position = p; }\n    public String getName() { return name; }\n}\n\nclass SnakeAndLadderGame {\n    private final Map<Integer, Integer> snakes = new HashMap<>();\n    private final Map<Integer, Integer> ladders = new HashMap<>();\n    private final Queue<Player> players = new LinkedList<>();\n\n    public void addSnake(int head, int tail) { snakes.put(head, tail); }\n    public void addLadder(int start, int end) { ladders.put(start, end); }\n    public void addPlayer(Player p) { players.offer(p); }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Snake and Ladder Game Engine Loaded.\");\n    }\n}",
    "cpp": "// Snake & Ladder Starter Stub (C++)\n#include <iostream>\n#include <unordered_map>\n#include <queue>\n#include <string>\n\nclass Player {\npublic:\n    std::string name;\n    int position = 0;\n    Player(std::string name) : name(name) {}\n};",
    "python": "# Snake & Ladder Starter Stub (Python)\nimport random\nfrom collections import deque\n\nclass Player:\n    def __init__(self, name: str):\n        self.name = name\n        self.position = 0"
  }
},
{
  "id": "lld-atm-machine",
  "title": "Design an ATM Machine (Chain of Responsibility & State)",
  "category": "LLD",
  "difficulty": "Hard",
  "companies": [
    "Goldman Sachs",
    "Morgan Stanley",
    "JPMorgan",
    "Amazon"
  ],
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
  "designPatternsUsed": [
    "Chain of Responsibility",
    "State Pattern",
    "Command Pattern"
  ],
  "diagramType": "plantuml",
  "starterDiagram": "@startuml\ntitle ATM Machine Architecture\n\nabstract class CashDispenser {\n  # nextDispenser: CashDispenser\n  + setNext(d: CashDispenser): void\n  + {abstract} dispense(amount: int): void\n}\n\nclass HundredDollarDispenser extends CashDispenser\nclass FiftyDollarDispenser extends CashDispenser\nclass TwentyDollarDispenser extends CashDispenser\n\nclass ATM {\n  - dispenserChain: CashDispenser\n  + withdraw(amount: int): void\n}\n\nATM o-- CashDispenser\n@enduml",
  "starterCode": {
    "java": "// ATM Machine Starter Stub (Java)\nimport java.util.*;\n\nabstract class CashDispenser {\n    protected CashDispenser next;\n    public void setNext(CashDispenser next) { this.next = next; }\n    public abstract void dispense(int amount);\n}\n\nclass HundredDollarDispenser extends CashDispenser {\n    public void dispense(int amount) {\n        if (amount >= 100) {\n            int count = amount / 100;\n            int rem = amount % 100;\n            System.out.println(\"Dispensing \" + count + \" x $100 notes\");\n            if (rem != 0 && next != null) next.dispense(rem);\n        } else if (next != null) {\n            next.dispense(amount);\n        }\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"ATM System Initialized.\");\n    }\n}",
    "cpp": "// ATM Machine Starter Stub (C++)\n#include <iostream>\n#include <memory>\n\nclass CashDispenser {\nprotected:\n    std::shared_ptr<CashDispenser> next;\npublic:\n    virtual ~CashDispenser() = default;\n    void setNext(std::shared_ptr<CashDispenser> n) { next = n; }\n    virtual void dispense(int amount) = 0;\n};",
    "python": "# ATM Machine Starter Stub (Python)\nfrom abc import ABC, abstractmethod\n\nclass CashDispenser(ABC):\n    def __init__(self):\n        self.next = None\n    def set_next(self, next_dispenser):\n        self.next = next_dispenser\n    @abstractmethod\n    def dispense(self, amount: int): pass"
  }
},
{
  "id": "lld-logging-framework",
  "title": "Design In-Memory Logging Framework (Log4j)",
  "category": "LLD",
  "difficulty": "Medium",
  "companies": [
    "Google",
    "Meta",
    "Microsoft",
    "Netflix"
  ],
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
  "designPatternsUsed": [
    "Chain of Responsibility",
    "Observer Pattern",
    "Singleton Pattern"
  ],
  "diagramType": "plantuml",
  "starterDiagram": "@startuml\ntitle Logging Framework Architecture\n\nenum LogLevel {\n  DEBUG\n  INFO\n  WARN\n  ERROR\n}\n\ninterface LogAppender {\n  + append(level: LogLevel, msg: String): void\n}\n\nclass ConsoleAppender implements LogAppender\nclass FileAppender implements LogAppender\n\nclass Logger {\n  - minLevel: LogLevel\n  - appenders: List<LogAppender>\n  + info(msg: String): void\n  + error(msg: String): void\n}\n\nLogger o-- LogAppender\n@enduml",
  "starterCode": {
    "java": "// Logger Starter Stub (Java)\nimport java.util.*;\n\nenum LogLevel { DEBUG, INFO, WARN, ERROR }\n\ninterface LogAppender {\n    void append(LogLevel level, String message);\n}\n\nclass ConsoleAppender implements LogAppender {\n    public void append(LogLevel level, String message) {\n        System.out.println(\"[\" + level + \"] \" + new Date() + \" - \" + message);\n    }\n}\n\nclass Logger {\n    private final LogLevel minLevel;\n    private final List<LogAppender> appenders = new ArrayList<>();\n\n    public Logger(LogLevel minLevel) { this.minLevel = minLevel; }\n    public void addAppender(LogAppender appender) { appenders.add(appender); }\n    public void info(String msg) { log(LogLevel.INFO, msg); }\n    public void error(String msg) { log(LogLevel.ERROR, msg); }\n    private void log(LogLevel level, String msg) {\n        if (level.ordinal() >= minLevel.ordinal()) {\n            for (LogAppender a : appenders) a.append(level, msg);\n        }\n    }\n}\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Logger Framework Ready.\");\n    }\n}",
    "cpp": "// Logger Starter Stub (C++)\n#include <iostream>\n#include <string>\n#include <vector>\n#include <memory>\n\nenum class LogLevel { DEBUG, INFO, WARN, ERROR };\n\nclass LogAppender {\npublic:\n    virtual ~LogAppender() = default;\n    virtual void append(LogLevel level, const std::string& msg) = 0;\n};",
    "python": "# Logger Starter Stub (Python)\nfrom enum import Enum\nimport datetime\n\nclass LogLevel(Enum):\n    DEBUG = 1\n    INFO = 2\n    WARN = 3\n    ERROR = 4"
  }
}
];
