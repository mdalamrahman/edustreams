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
title Parking Lot System — Class Diagram

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
      java: `// Parking Lot Implementation in Java (SOLID & Strategy Pattern)
import java.util.*;

enum VehicleType { MOTORCYCLE, CAR, TRUCK }

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

class Car extends Vehicle {
    public Car(String licensePlate) { super(licensePlate, VehicleType.CAR); }
}

class ParkingSpot {
    private final int id;
    private final VehicleType spotType;
    private Vehicle vehicle;

    public ParkingSpot(int id, VehicleType spotType) {
        this.id = id;
        this.spotType = spotType;
    }
    public synchronized boolean isAvailable() { return vehicle == null; }
    public synchronized boolean assign(Vehicle v) {
        if (!isAvailable() || v.getType() != spotType) return false;
        this.vehicle = v;
        return true;
    }
    public synchronized void vacate() { this.vehicle = null; }
    public int getId() { return id; }
}`,
      cpp: `// Parking Lot Implementation in C++
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
};`,
      python: `# Parking Lot Implementation in Python
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
        return self.vehicle is None

    def park(self, vehicle: Vehicle) -> bool:
        if not self.is_available() or vehicle.v_type != self.spot_type:
            return False
        self.vehicle = vehicle
        return True`
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
title Token Bucket Rate Limiter Architecture

interface RateLimiterStrategy {
  + allowRequest(clientId: String): boolean
}

class TokenBucketRateLimiter implements RateLimiterStrategy {
  - capacity: long
  - refillRate: double
  - currentTokens: double
  - lastRefillTimestamp: long
  + allowRequest(clientId: String): boolean
  - refill(): void
}

class SlidingWindowRateLimiter implements RateLimiterStrategy {
  - maxRequests: int
  - windowSizeMillis: long
  + allowRequest(clientId: String): boolean
}

class ApiGatewayFilter {
  - limiter: RateLimiterStrategy
  + handleRequest(clientId: String): boolean
}

ApiGatewayFilter --> RateLimiterStrategy
@enduml`,
    starterCode: {
      java: `// Sliding Window Rate Limiter in Java
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

public class SlidingWindowRateLimiter {
    private final int maxRequests;
    private final long windowSizeMillis;
    private final ConcurrentHashMap<String, ConcurrentLinkedQueue<Long>> clientRequestMap = new ConcurrentHashMap<>();

    public SlidingWindowRateLimiter(int maxRequests, long windowSizeMillis) {
        this.maxRequests = maxRequests;
        this.windowSizeMillis = windowSizeMillis;
    }

    public synchronized boolean allowRequest(String clientId) {
        long now = System.currentTimeMillis();
        clientRequestMap.putIfAbsent(clientId, new ConcurrentLinkedQueue<>());
        ConcurrentLinkedQueue<Long> timestamps = clientRequestMap.get(clientId);

        while (!timestamps.isEmpty() && (now - timestamps.peek() > windowSizeMillis)) {
            timestamps.poll();
        }

        if (timestamps.size() < maxRequests) {
            timestamps.add(now);
            return true;
        }
        return false;
    }
}`,
      cpp: `// Token Bucket Rate Limiter in C++
#include <iostream>
#include <chrono>
#include <mutex>
#include <algorithm>

class TokenBucket {
    long capacity;
    double refillRate;
    double tokens;
    std::chrono::steady_clock::time_point lastRefill;
    std::mutex mtx;
public:
    TokenBucket(long cap, double rate) : capacity(cap), refillRate(rate), tokens(cap), lastRefill(std::chrono::steady_clock::now()) {}
    bool allowRequest() {
        std::lock_guard<std::mutex> lock(mtx);
        auto now = std::chrono::steady_clock::now();
        std::chrono::duration<double> elapsed = now - lastRefill;
        tokens = std::min((double)capacity, tokens + elapsed.count() * refillRate);
        lastRefill = now;
        if (tokens >= 1.0) {
            tokens -= 1.0;
            return true;
        }
        return false;
    }
};`,
      python: `# Token Bucket in Python
import time
import threading

class TokenBucket:
    def __init__(self, capacity: int, refill_rate: float):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate
        self.last_refill = time.time()
        self.lock = threading.Lock()

    def allow_request(self) -> bool:
        with self.lock:
            now = time.time()
            elapsed = now - self.last_refill
            self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
            self.last_refill = now
            if self.tokens >= 1:
                self.tokens -= 1
                return True
            return False`
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
      java: `// Elevator System in Java (State Pattern)
import java.util.*;

enum Direction {
    UP,
    DOWN,
    IDLE
}

class ElevatorCar {
    private int id;
    private int currentFloor = 0;
    private Direction direction = Direction.IDLE;
    private final TreeSet<Integer> upRequests = new TreeSet<>();
    private final TreeSet<Integer> downRequests = new TreeSet<>(Collections.reverseOrder());

    public ElevatorCar(int id) { this.id = id; }
    public synchronized void addDestination(int floor) {
        if (floor > currentFloor) upRequests.add(floor);
        else downRequests.add(floor);
    }
}`,
      cpp: `// Elevator in C++
#include <iostream>
#include <set>

enum class Direction { UP, DOWN, IDLE };

class ElevatorCar {
    int id;
    int currentFloor = 0;
    Direction dir = Direction::IDLE;
public:
    ElevatorCar(int id) : id(id) {}
    void addFloor(int floor) {
        std::cout << "Floor added: " << floor << std::endl;
    }
};`,
      python: `# Elevator in Python
from enum import Enum

class Direction(Enum):
    UP = 1
    DOWN = 2
    IDLE = 3

class ElevatorCar:
    def __init__(self, car_id: int):
        self.car_id = car_id
        self.current_floor = 0
        self.direction = Direction.IDLE
        self.destinations = set()

    def add_destination(self, floor: int):
        self.destinations.add(floor)`
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
  - email: String
}

abstract class Expense {
  - id: String
  - amount: double
  - paidBy: User
  - splits: List
  + validate(): boolean
}

interface SplitStrategy {
  + calculateSplits(amount: double, users: List): List
}

class EqualSplitStrategy implements SplitStrategy {
  + calculateSplits(amount: double, users: List): List
}

Expense --> SplitStrategy
@enduml`,
    starterCode: {
      java: `// Splitwise in Java (Strategy & Factory Pattern)
import java.util.*;

enum SplitType { EQUAL, EXACT, PERCENT }

class User {
    private String id;
    private String name;
    public User(String id, String name) { this.id = id; this.name = name; }
    public String getId() { return id; }
    public String getName() { return name; }
}

abstract class Split {
    private User user;
    protected double amount;
    public Split(User user) { this.user = user; }
    public User getUser() { return user; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
}`,
      cpp: `// Splitwise in C++
#include <iostream>
#include <string>
#include <vector>
#include <memory>

enum class SplitType { EQUAL, EXACT, PERCENT };

class User {
    std::string id;
    std::string name;
public:
    User(std::string id, std::string name) : id(id), name(name) {}
    std::string getId() const { return id; }
};`,
      python: `# Splitwise in Python
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

class Expense:
    def __init__(self, expense_id: str, amount: float, paid_by: User):
        self.expense_id = expense_id
        self.amount = amount
        self.paid_by = paid_by`
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

class DoublyLinkedList {
  - head: Node
  - tail: Node
  + addFirst(node: Node): void
  + remove(node: Node): void
  + removeLast(): Node
}

class LRUCache {
  - capacity: int
  - map: Map
  - list: DoublyLinkedList
  + get(key: String): Object
  + put(key: String, value: Object): void
}

LRUCache o-- DoublyLinkedList
DoublyLinkedList *-- Node
@enduml`,
    starterCode: {
      java: `// LRU Cache in Java (O(1) HashMap + DoublyLinkedList)
import java.util.*;

public class LRUCache<K, V> {
    private class Node {
        K key;
        V val;
        Node prev, next;
        Node(K k, V v) { this.key = k; this.val = v; }
    }

    private final int capacity;
    private final Map<K, Node> map = new HashMap<>();
    private final Node head = new Node(null, null);
    private final Node tail = new Node(null, null);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public synchronized V get(K key) {
        Node node = map.get(key);
        if (node == null) return null;
        moveToHead(node);
        return node.val;
    }

    private void moveToHead(Node node) {
        remove(node);
        addFirst(node);
    }
    private void addFirst(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }
    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }
}`,
      cpp: `// LRU Cache in C++
#include <iostream>
#include <unordered_map>
#include <list>
#include <mutex>

template<typename K, typename V>
class LRUCache {
    size_t capacity;
    std::list<std::pair<K, V>> items;
    std::unordered_map<K, typename std::list<std::pair<K, V>>::iterator> cache;
    std::mutex mtx;
public:
    LRUCache(size_t cap) : capacity(cap) {}
    bool get(K key, V& val) {
        std::lock_guard<std::mutex> lock(mtx);
        auto it = cache.find(key);
        if (it == cache.end()) return false;
        items.splice(items.begin(), items, it->second);
        val = it->second->second;
        return true;
    }
};`,
      python: `# LRU Cache in Python
from collections import OrderedDict
import threading

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()
        self.lock = threading.Lock()

    def get(self, key: str):
        with self.lock:
            if key not in self.cache:
                return None
            self.cache.move_to_end(key)
            return self.cache[key]

    def put(self, key: str, value):
        with self.lock:
            if key in self.cache:
                self.cache.move_to_end(key)
            self.cache[key] = value
            if len(self.cache) > self.capacity:
                self.cache.popitem(last=False)`
    }
  },

  {
    id: 'lld-snake-ladder',
    title: 'Design Snake and Ladder Multiplayer Game',
    category: 'LLD',
    difficulty: 'Easy',
    companies: ['Amazon', 'Flipkart', 'Swiggy', 'Zomato'],
    description: 'Design a configurable multiplayer Snake & Ladder board game with custom board sizes, dynamic snakes/ladders positions, and crooked dice mechanics.',
    requirements: {
      functional: [
        'Dynamic board creation with customizable number of snakes, ladders, and players.',
        'Turn-based dice rolling and collision detection for snakes and ladders.',
        'Declare winner when a player reaches the exact 100th square.'
      ],
      nonFunctional: [
        'Extensible for special power-ups and multiplayer rules.',
        'Clean separation of Game, Board, Dice, and Player entities.'
      ]
    },
    designPatternsUsed: ['State Pattern', 'Observer Pattern', 'Factory Pattern'],
    diagramType: 'plantuml',
    starterDiagram: `@startuml
title Snake and Ladder Game

class Player {
  - id: String
  - name: String
  - currentPosition: int
  + moveTo(pos: int): void
}

class Board {
  - size: int
  - snakes: Map
  - ladders: Map
  + getFinalPosition(startPos: int, roll: int): int
}

class Dice {
  - count: int
  + roll(): int
}

class Game {
  - board: Board
  - players: Queue
  - dice: Dice
  - winner: Player
  + play(): void
}

Game o-- Board
Game o-- Player
Game o-- Dice
@enduml`,
    starterCode: {
      java: `// Snake and Ladder in Java
import java.util.*;

class Player {
    private String name;
    private int position = 0;
    public Player(String name) { this.name = name; }
    public String getName() { return name; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
}

class Board {
    private final int size;
    private final Map<Integer, Integer> snakes = new HashMap<>();
    private final Map<Integer, Integer> ladders = new HashMap<>();

    public Board(int size) { this.size = size; }
    public void addSnake(int head, int tail) { snakes.put(head, tail); }
    public void addLadder(int start, int end) { ladders.put(start, end); }
    public int calculateNewPosition(int current, int diceRoll) {
        int next = current + diceRoll;
        if (next > size) return current;
        if (snakes.containsKey(next)) return snakes.get(next);
        if (ladders.containsKey(next)) return ladders.get(next);
        return next;
    }
}`,
      cpp: `// Snake and Ladder in C++
#include <iostream>
#include <unordered_map>
#include <queue>
#include <string>

class Player {
    std::string name;
    int pos = 0;
public:
    Player(std::string n) : name(n) {}
    int getPos() const { return pos; }
    void setPos(int p) { pos = p; }
};`,
      python: `# Snake & Ladder in Python
import random

class Player:
    def __init__(self, name: str):
        self.name = name
        self.pos = 0

class Board:
    def __init__(self, size: int = 100):
        self.size = size
        self.snakes = {}
        self.ladders = {}

    def next_pos(self, current: int, roll: int) -> int:
        target = current + roll
        if target > self.size:
            return current
        if target in self.snakes:
            return self.snakes[target]
        if target in self.ladders:
            return self.ladders[target]
        return target`
    }
  },

  {
    id: 'lld-bookmyshow',
    title: 'Design BookMyShow (Movie Ticket Booking Engine)',
    category: 'LLD',
    difficulty: 'Hard',
    companies: ['BookMyShow', 'Amazon', 'MakeMyTrip', 'Flipkart'],
    description: 'Design a concurrent movie ticket booking system capable of handling high-volume seat selections, temporary seat lockouts, payment gateways, and cinema screen inventories.',
    requirements: {
      functional: [
        'Browse theatres, movies, shows, and real-time seat layouts (VIP, Premium, Normal).',
        'Temporary seat hold for 5 minutes during payment checkout.',
        'Automatic seat release upon timeout or payment failure.'
      ],
      nonFunctional: [
        'Strict zero-double-booking guarantee under extreme concurrency.',
        'Distributed lock (Redis Redlock or Optimistic DB versioning).'
      ]
    },
    designPatternsUsed: ['State Pattern', 'Factory Pattern', 'Observer Pattern'],
    diagramType: 'plantuml',
    starterDiagram: `@startuml
title BookMyShow Architecture

enum SeatStatus {
  AVAILABLE
  LOCKED
  BOOKED
}

class Seat {
  - id: String
  - row: int
  - col: int
  - price: double
  - status: SeatStatus
  + lock(userId: String): boolean
  + book(): boolean
  + unlock(): void
}

class Show {
  - id: String
  - movieTitle: String
  - startTime: long
  - seats: List
  + getAvailableSeats(): List
}

class BookingController {
  + holdSeats(showId: String, seatIds: List, userId: String): boolean
  + confirmBooking(bookingId: String): boolean
}

BookingController --> Show
Show o-- Seat
@enduml`,
    starterCode: {
      java: `// BookMyShow in Java (Thread-Safe Seat Locking)
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

enum SeatStatus { AVAILABLE, LOCKED, BOOKED }

class Seat {
    private String id;
    private double price;
    private SeatStatus status = SeatStatus.AVAILABLE;
    private String lockedBy;
    private long lockExpiryTime;

    public synchronized boolean lockSeat(String userId, long durationMillis) {
        long now = System.currentTimeMillis();
        if (status == SeatStatus.AVAILABLE || (status == SeatStatus.LOCKED && now > lockExpiryTime)) {
            status = SeatStatus.LOCKED;
            lockedBy = userId;
            lockExpiryTime = now + durationMillis;
            return true;
        }
        return false;
    }
}`,
      cpp: `// BookMyShow in C++
#include <iostream>
#include <mutex>
#include <string>

enum class SeatStatus { AVAILABLE, LOCKED, BOOKED };

class Seat {
    std::string id;
    SeatStatus status = SeatStatus::AVAILABLE;
    std::mutex mtx;
public:
    bool lockSeat(const std::string& userId) {
        std::lock_guard<std::mutex> lock(mtx);
        if (status == SeatStatus::AVAILABLE) {
            status = SeatStatus::LOCKED;
            return true;
        }
        return false;
    }
};`,
      python: `# BookMyShow in Python
import time
import threading

class Seat:
    def __init__(self, seat_id: str):
        self.seat_id = seat_id
        self.status = "AVAILABLE"
        self.locked_by = None
        self.lock_expiry = 0
        self.lock = threading.Lock()

    def lock_seat(self, user_id: str, duration_sec: int = 300) -> bool:
        with self.lock:
            now = time.time()
            if self.status == "AVAILABLE" or (self.status == "LOCKED" and now > self.lock_expiry):
                self.status = "LOCKED"
                self.locked_by = user_id
                self.lock_expiry = now + duration_sec
                return True
            return False`
    }
  },

  {
    id: 'lld-cricbuzz',
    title: 'Design Cricbuzz (Live Cricket Commentary & Scoring Engine)',
    category: 'LLD',
    difficulty: 'Hard',
    companies: ['Hotstar', 'Dream11', 'JioCinema', 'Amazon'],
    description: 'Design a real-time ball-by-ball cricket scoring and live commentary broadcast engine with event-driven observers and extensible scorecard calculation strategies.',
    requirements: {
      functional: [
        'Ball-by-ball updates (Runs, Wickets, Extras, Over completion).',
        'Push real-time commentary and state to thousands of observer subscribers.',
        'Extensible scorecard metrics (Strike rate, Economy, Partnerships).'
      ],
      nonFunctional: [
        'Pub/Sub event streaming architecture.',
        'Thread-safe match score mutations.'
      ]
    },
    designPatternsUsed: ['Observer Pattern', 'Strategy Pattern', 'State Pattern'],
    diagramType: 'plantuml',
    starterDiagram: `@startuml
title Cricbuzz Live Scoring Architecture

interface ScoreObserver {
  + onBallBowled(ballEvent: BallEvent): void
}

class Match {
  - matchId: String
  - teamA: String
  - teamB: String
  - observers: List
  + subscribe(observer: ScoreObserver): void
  + recordBall(event: BallEvent): void
}

class CommentaryService implements ScoreObserver {
  + onBallBowled(ballEvent: BallEvent): void
}

class ScorecardService implements ScoreObserver {
  + onBallBowled(ballEvent: BallEvent): void
}

Match o-- ScoreObserver
@enduml`,
    starterCode: {
      java: `// Cricbuzz in Java (Observer Pattern)
import java.util.*;

class BallEvent {
    public int runs;
    public boolean isWicket;
    public String batsman;
    public String bowler;
    public BallEvent(int runs, boolean isWicket, String bat, String bowl) {
        this.runs = runs; this.isWicket = isWicket; this.batsman = bat; this.bowler = bowl;
    }
}

interface MatchObserver {
    void onBallUpdated(BallEvent event);
}

class Match {
    private final List<MatchObserver> observers = new ArrayList<>();
    public void register(MatchObserver obs) { observers.add(obs); }
    public void notifyBall(BallEvent event) {
        for (MatchObserver obs : observers) obs.onBallUpdated(event);
    }
}`,
      cpp: `// Cricbuzz in C++
#include <iostream>
#include <vector>
#include <memory>

struct BallEvent {
    int runs;
    bool isWicket;
};

class Observer {
public:
    virtual void onBall(const BallEvent& e) = 0;
    virtual ~Observer() = default;
};`,
      python: `# Cricbuzz in Python
class MatchSubject:
    def __init__(self):
        self._observers = []

    def attach(self, observer):
        self._observers.append(observer)

    def notify(self, ball_event):
        for obs in self._observers:
            obs.update(ball_event)`
    }
  },

  {
    id: 'lld-tinyurl',
    title: 'Design a Scalable URL Shortener (TinyURL)',
    category: 'HLD',
    difficulty: 'Medium',
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Twitter'],
    description: 'Design a high-throughput URL shortening service capable of handling billions of redirects, custom aliases, Base62 encoding, and distributed unique ID generation.',
    requirements: {
      functional: [
        'Given a long URL, generate a unique 7-character short URL.',
        'Redirect short URLs to original URLs with 301/302 HTTP status.',
        'Custom alias support and click analytics tracking.'
      ],
      nonFunctional: [
        '100:1 Read to Write ratio optimization with distributed cache.',
        'Sub-10ms redirect latency and high availability.'
      ]
    },
    designPatternsUsed: ['Factory Pattern', 'Singleton Pattern'],
    diagramType: 'plantuml',
    starterDiagram: `@startuml
title URL Shortener Architecture

class Base62Codec {
  - CHARACTERS: String
  + encode(id: long): String
  + decode(shortUrl: String): long
}

class UrlService {
  - cache: Map
  + shortenUrl(longUrl: String): String
  + getOriginalUrl(shortCode: String): String
}

UrlService --> Base62Codec
@enduml`,
    starterCode: {
      java: `// Base62 URL Shortener in Java
public class Base62Shortener {
    private static final String ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int BASE = ALPHABET.length();

    public static String encode(long num) {
        StringBuilder sb = new StringBuilder();
        while (num > 0) {
            sb.append(ALPHABET.charAt((int) (num % BASE)));
            num /= BASE;
        }
        return sb.reverse().toString();
    }

    public static long decode(String str) {
        long num = 0;
        for (char c : str.toCharArray()) {
            num = num * BASE + ALPHABET.indexOf(c);
        }
        return num;
    }
}`,
      cpp: `// Base62 Shortener in C++
#include <iostream>
#include <string>
#include <algorithm>

const std::string ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

std::string encode(long long num) {
    std::string res = "";
    while (num > 0) {
        res += ALPHABET[num % 62];
        num /= 62;
    }
    std::reverse(res.begin(), res.end());
    return res;
}`,
      python: `# Base62 Shortener in Python
ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
BASE = len(ALPHABET)

def encode(num: int) -> str:
    if num == 0: return ALPHABET[0]
    arr = []
    while num:
        num, rem = divmod(num, BASE)
        arr.append(ALPHABET[rem])
    arr.reverse()
    return "".join(arr)`
    }
  },

  {
    id: 'lld-task-scheduler',
    title: 'Design a Distributed Task Scheduler & Job Queue',
    category: 'LLD',
    difficulty: 'Hard',
    companies: ['Uber', 'Google', 'Meta', 'Amazon'],
    description: 'Design a distributed recurring task scheduler supporting cron expressions, worker pool execution, priority execution, and retry mechanisms on failure.',
    requirements: {
      functional: [
        'Schedule tasks for immediate, one-time delayed, or recurring execution.',
        'Worker thread pool dispatching jobs without worker starvation.',
        'Automatic retry with exponential backoff on transient errors.'
      ],
      nonFunctional: [
        'Thread-safe priority queue execution.',
        'Accurate millisecond scheduling precision.'
      ]
    },
    designPatternsUsed: ['Command Pattern', 'Producer-Consumer Pattern', 'Strategy Pattern'],
    diagramType: 'plantuml',
    starterDiagram: `@startuml
title Task Scheduler Architecture

interface Task {
  + execute(): void
}

class ScheduledJob {
  - taskId: String
  - task: Task
  - executeAt: long
  - intervalMillis: long
}

class TaskScheduler {
  - queue: PriorityQueue
  - threadPool: ExecutorService
  + schedule(task: Task, delayMillis: long): void
  + start(): void
}

TaskScheduler o-- ScheduledJob
ScheduledJob --> Task
@enduml`,
    starterCode: {
      java: `// Task Scheduler in Java (PriorityQueue + ThreadPool)
import java.util.concurrent.*;
import java.util.*;

public class SimpleTaskScheduler {
    private final PriorityBlockingQueue<ScheduledTask> taskQueue = new PriorityBlockingQueue<>();
    private final ExecutorService workerPool = Executors.newFixedThreadPool(4);

    public static class ScheduledTask implements Comparable<ScheduledTask> {
        public final Runnable action;
        public final long executionTime;

        public ScheduledTask(Runnable action, long executionTime) {
            this.action = action;
            this.executionTime = executionTime;
        }

        @Override
        public int compareTo(ScheduledTask o) {
            return Long.compare(this.executionTime, o.executionTime);
        }
    }

    public void schedule(Runnable action, long delayMillis) {
        taskQueue.add(new ScheduledTask(action, System.currentTimeMillis() + delayMillis));
    }
}`,
      cpp: `// Task Scheduler in C++
#include <iostream>
#include <queue>
#include <thread>
#include <mutex>
#include <chrono>

struct Job {
    std::chrono::steady_clock::time_point execTime;
    bool operator>(const Job& other) const {
        return execTime > other.execTime;
    }
};`,
      python: `# Task Scheduler in Python
import heapq
import time
import threading

class TaskScheduler:
    def __init__(self):
        self.queue = []
        self.lock = threading.Lock()

    def schedule(self, action, delay_sec: float):
        with self.lock:
            heapq.heappush(self.queue, (time.time() + delay_sec, action))`
    }
  }
];
