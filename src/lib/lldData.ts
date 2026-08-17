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
  - spots: List<ParkingSpot>
  + findAvailableSpot(type: VehicleType): ParkingSpot
}

interface PricingStrategy {
  + calculateFee(hours: double): double
}

class HourlyPricingStrategy implements PricingStrategy {
  + calculateFee(hours: double): double
}

class ParkingLot {
  - floors: List<ParkingFloor>
  - pricingStrategy: PricingStrategy
  + parkVehicle(v: Vehicle): ParkingTicket
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
    protected String licensePlate;
    protected VehicleType type;
    public Vehicle(String licensePlate, VehicleType type) {
        this.licensePlate = licensePlate;
        this.type = type;
    }
    public VehicleType getType() { return type; }
    public String getLicensePlate() { return licensePlate; }
}

class Car extends Vehicle {
    public Car(String licensePlate) { super(licensePlate, VehicleType.CAR); }
}

class ParkingSpot {
    private int spotId;
    private VehicleType spotType;
    private Vehicle currentVehicle;

    public ParkingSpot(int spotId, VehicleType spotType) {
        this.spotId = spotId;
        this.spotType = spotType;
    }

    public synchronized boolean isAvailable() { return currentVehicle == null; }
    public synchronized boolean park(Vehicle v) {
        if (!isAvailable() || v.getType() != this.spotType) return false;
        this.currentVehicle = v;
        return true;
    }
    public synchronized void vacate() { this.currentVehicle = null; }
}

public class ParkingLotMain {
    public static void main(String[] args) {
        System.out.println("Parking Lot Initialized.");
    }
}`,
      cpp: `// Parking Lot Implementation in C++
#include <iostream>
#include <vector>
#include <string>
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

int main() {
    std::cout << "Parking Lot Engine ready.\n";
    return 0;
}`,
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
        return True
`
    },
    githubRepo: 'ashishps1/awesome-low-level-design',
    githubPath: 'solutions/parking-lot.md'
  },

  {
    id: 'lld-rate-limiter',
    title: 'Design a Distributed Rate Limiter (Token Bucket / Sliding Window)',
    category: 'LLD',
    difficulty: 'Medium',
    companies: ['Meta', 'Stripe', 'Amazon', 'Cloudflare'],
    description: 'Design a thread-safe, high-throughput rate limiter middleware for an API gateway supporting Token Bucket and Sliding Window algorithms to protect microservices from burst traffic.',
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
title Token Bucket Rate Limiter — Sequence

actor Client
participant "Gateway" as GW
participant "TokenBucketRateLimiter" as Limiter
database "Redis In-Memory Store" as Redis

Client -> GW: GET /api/v1/payments
GW -> Limiter: allowRequest(clientId)
Limiter -> Redis: evaluateTokenBucket(key, capacity, refillRate)
Redis --> Limiter: {allowed: true, remaining: 14}
alt Allowed
    Limiter --> GW: Permit
    GW --> Client: 200 OK (Processed)
else Denied
    Limiter --> GW: Reject
    GW --> Client: 429 Too Many Requests (Retry-After: 5s)
end
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

        while (!timestamps.isEmpty() && (now - timestamps.peek()) > windowSizeMillis) {
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
#include <chrono>
#include <mutex>

class TokenBucket {
    double capacity;
    double tokens;
    double refillRatePerSec;
    std::chrono::steady_clock::time_point lastRefill;
    std::mutex mtx;
public:
    TokenBucket(double cap, double rate) : capacity(cap), tokens(cap), refillRatePerSec(rate), lastRefill(std::chrono::steady_clock::now()) {}

    bool allowRequest(double tokensNeeded = 1.0) {
        std::lock_guard<std::mutex> lock(mtx);
        auto now = std::chrono::steady_clock::now();
        double elapsed = std::chrono::duration<double>(now - lastRefill).count();
        tokens = std::min(capacity, tokens + elapsed * refillRatePerSec);
        lastRefill = now;

        if (tokens >= tokensNeeded) {
            tokens -= tokensNeeded;
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
    },
    githubRepo: 'ashishps1/awesome-low-level-design',
    githubPath: 'solutions/rate-limiter.md'
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

enum Direction { UP, DOWN, IDLE }

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

class Elevator {
    int id;
    int currentFloor{0};
    Direction dir{Direction::IDLE};
public:
    Elevator(int carId) : id(carId) {}
};`,
      python: `# Elevator in Python
class ElevatorCar:
    def __init__(self, car_id: int):
        self.car_id = car_id
        self.current_floor = 0
        self.direction = "IDLE"
        self.requests = set()`
    },
    githubRepo: 'ashishps1/awesome-low-level-design',
    githubPath: 'solutions/elevator-system.md'
  },

  {
    id: 'lld-splitwise',
    title: 'Design Splitwise (Expense Sharing & Debt Simplification)',
    category: 'LLD',
    difficulty: 'Medium',
    companies: ['Flipkart', 'PhonePe', 'Uber', 'Amazon', 'CRED'],
    description: 'Design an expense-sharing application like Splitwise supporting Equal, Exact, and Percentage splits, user balance sheets, and a graph-based debt simplification algorithm.',
    requirements: {
      functional: [
        'Add expenses shared between multiple group members.',
        'Support EQUAL, EXACT, and PERCENTAGE split models.',
        'Query individual balances (Who owes whom how much).',
        'Debt simplification to minimize total number of transactions.'
      ],
      nonFunctional: [
        'Accuracy in fractional amounts without rounding loss.',
        'Clean separation of expense models and user balance records.'
      ]
    },
    designPatternsUsed: ['Strategy Pattern', 'Factory Pattern'],
    diagramType: 'plantuml',
    starterDiagram: `@startuml
title Splitwise Class Diagram

enum SplitType { EQUAL, EXACT, PERCENT }

class User {
  - id: String
  - name: String
}

abstract class Expense {
  - id: String
  - amount: double
  - paidBy: User
  - splits: List<Split>
  + validate(): boolean
}

class SplitwiseManager {
  - balanceSheet: Map<String, Map<String, Double>>
  + addExpense(e: Expense)
  + simplifyDebts()
}
@enduml`,
    starterCode: {
      java: `// Splitwise Java Engine
import java.util.*;

enum SplitType { EQUAL, EXACT, PERCENT }

class User {
    private String id;
    private String name;
    public User(String id, String name) { this.id = id; this.name = name; }
    public String getId() { return id; }
}`,
      cpp: `// Splitwise C++
#include <string>
#include <unordered_map>

class User {
    std::string id;
    std::string name;
public:
    User(std::string i, std::string n) : id(i), name(n) {}
};`,
      python: `# Splitwise Python
class User:
    def __init__(self, user_id: str, name: str):
        self.user_id = user_id
        self.name = name`
    },
    githubRepo: 'ashishps1/awesome-low-level-design',
    githubPath: 'solutions/splitwise.md'
  },

  {
    id: 'hld-url-shortener',
    title: 'Design a Scalable URL Shortener (TinyURL / Bitly)',
    category: 'HLD',
    difficulty: 'Easy',
    companies: ['Google', 'Amazon', 'Microsoft', 'Twitter'],
    description: 'Design a distributed, highly available URL shortening service capable of handling 100M new URLs per month with low-latency redirection, custom aliases, and Base62 encoding.',
    requirements: {
      functional: [
        'Generate unique short URL (e.g. sde.tube/xY7a) given a long URL.',
        'Redirect short URL to original destination with HTTP 301/302.',
        'Support optional custom alias and expiration time.'
      ],
      nonFunctional: [
        'High availability (99.99%) and ultra-low read redirection latency (<20ms).',
        'Zero URL collision across distributed database nodes.'
      ]
    },
    designPatternsUsed: ['Distributed ID Generator', 'Cache-Aside Pattern'],
    diagramType: 'plantuml',
    starterDiagram: `@startuml
title TinyURL High Level Architecture

actor User
participant "CDN / Cloudflare" as CDN
participant "Load Balancer" as LB
participant "URL Service Pods" as App
database "Redis Cache (LRU)" as Cache
database "PostgreSQL / MongoDB" as DB
participant "Key Generation Service (KGS)" as KGS

User -> CDN: GET /xY7a
CDN -> LB: Forward Cache Miss
LB -> App: Route
App -> Cache: Query "xY7a"
alt Cache Hit
    Cache --> App: Original Long URL
else Cache Miss
    App -> DB: Query by short_key
    DB --> App: Original Long URL
    App -> Cache: Set "xY7a" = LongURL (TTL 7d)
end
App --> User: HTTP 302 Found (Location: https://...)
@enduml`,
    starterCode: {
      java: `// Base62 URL Encoder in Java
public class Base62Encoder {
    private static final String BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    public static String encode(long num) {
        StringBuilder sb = new StringBuilder();
        while (num > 0) {
            sb.append(BASE62.charAt((int)(num % 62)));
            num /= 62;
        }
        return sb.reverse().toString();
    }
}`,
      cpp: `// Base62 C++
#include <string>
#include <algorithm>

std::string encodeBase62(uint64_t num) {
    const std::string chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    std::string result;
    while (num > 0) {
        result += chars[num % 62];
        num /= 62;
    }
    std::reverse(result.begin(), result.end());
    return result;
}`,
      python: `# Base62 Python
BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

def encode_base62(num: int) -> str:
    if num == 0: return "0"
    res = []
    while num > 0:
        res.append(BASE62[num % 62])
        num //= 62
    return "".join(reversed(res))`
    },
    githubRepo: 'donnemartin/system-design-primer',
    githubPath: 'solutions/system_design/pastebin/README.md'
  }
];
