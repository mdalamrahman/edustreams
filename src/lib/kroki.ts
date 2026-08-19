/**
 * Kroki API Client for unified UML, PlantUML, Mermaid, and Architecture Diagrams
 * Docs: https://kroki.io/
 */

export type DiagramType = 'plantuml' | 'mermaid' | 'c4plantuml' | 'structurizr' | 'd2' | 'graphviz' | 'erd';

export interface KrokiRenderResult {
  svg: string | null;
  error: string | null;
}

/**
 * Renders diagram markup (PlantUML, Mermaid, etc.) into SVG using Kroki API.
 */
export async function renderKrokiDiagram(source: string, diagramType: DiagramType = 'plantuml'): Promise<KrokiRenderResult> {
  const cleanSource = source.trim();
  if (!cleanSource) {
    return { svg: null, error: 'Diagram source is empty.' };
  }

  try {
    const endpoint = `https://kroki.io/${diagramType}/svg`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'image/svg+xml'
      },
      body: cleanSource
    });

    if (!response.ok) {
      return {
        svg: null,
        error: `Visual Architecture Syntax Error: Please verify your class and interface definitions.`
      };
    }

    const svgText = await response.text();
    return { svg: svgText, error: null };
  } catch (err: any) {
    return {
      svg: null,
      error: 'Visual diagram rendering service temporarily unavailable.'
    };
  }
}

/**
 * Pre-built PlantUML and Mermaid templates for famous LLD / System Design & SOLID interview questions.
 */
export const LLD_DIAGRAM_TEMPLATES: Record<string, { type: DiagramType; title: string; code: string }> = {
  // 1. SOLID: Single Responsibility Principle (SRP)
  'srp': {
    type: 'plantuml',
    title: 'Single Responsibility Principle (SRP) — Refactored Architecture',
    code: `@startuml
skinparam style strictuml
skinparam classAttributeIconSize 0
skinparam backgroundColor #0f172a
skinparam defaultFontColor #e2e8f0
skinparam classBackgroundColor #1e293b
skinparam classBorderColor #6366f1
skinparam classHeaderBackgroundColor #312e81
skinparam arrowColor #38bdf8

title Single Responsibility Principle (SRP) — Decoupled Architecture

package "1. Core Domain Entity (Business Logic)" {
  class Invoice {
    - id: int
    - amount: double
    - taxRate: double
    + Invoice(id: int, amount: double)
    + calculateTotal(): double
    + getId(): int
    + getAmount(): double
  }
}

package "2. Persistence Layer (Storage Responsibility)" {
  interface InvoiceRepository {
    + save(invoice: Invoice): void
    + findById(id: int): Invoice
  }

  class SqlInvoiceRepository implements InvoiceRepository {
    + save(invoice: Invoice): void
    + findById(id: int): Invoice
  }
}

package "3. Notification / Output Layer (Communication Responsibility)" {
  interface InvoiceNotifier {
    + sendInvoiceNotification(invoice: Invoice, recipient: String): void
  }

  class EmailInvoiceNotifier implements InvoiceNotifier {
    + sendInvoiceNotification(invoice: Invoice, recipient: String): void
  }

  class InvoicePrinter {
    + printReceipt(invoice: Invoice): void
  }
}

InvoiceRepository ..> Invoice : persists
InvoiceNotifier ..> Invoice : notifies
InvoicePrinter ..> Invoice : formats
@enduml`
  },

  // 2. SOLID: Open-Closed Principle (OCP)
  'ocp': {
    type: 'plantuml',
    title: 'Open-Closed Principle (OCP) — Strategy & Extension Architecture',
    code: `@startuml
skinparam style strictuml
skinparam backgroundColor #0f172a
skinparam defaultFontColor #e2e8f0
skinparam classBackgroundColor #1e293b
skinparam classBorderColor #10b981
skinparam classHeaderBackgroundColor #064e3b
skinparam arrowColor #34d399

title Open-Closed Principle (OCP) — Extensible Storage Strategy

class Invoice {
  - id: int
  - amount: double
  + calculateTotal(): double
}

interface InvoicePersistence {
  + save(invoice: Invoice): void
}

class DatabasePersistence implements InvoicePersistence {
  + save(invoice: Invoice): void
}

class FilePersistence implements InvoicePersistence {
  + save(invoice: Invoice): void
}

class CloudS3Persistence implements InvoicePersistence {
  + save(invoice: Invoice): void
}

class InvoiceService {
  - persistenceStrategy: InvoicePersistence
  + InvoiceService(strategy: InvoicePersistence)
  + executeSave(invoice: Invoice): void
}

InvoiceService o--> InvoicePersistence : executes
InvoicePersistence ..> Invoice : saves
@enduml`
  },

  // 3. SOLID: Liskov Substitution Principle (LSP)
  'lsp': {
    type: 'plantuml',
    title: 'Liskov Substitution Principle (LSP) — Proper Inheritance Hierarchy',
    code: `@startuml
skinparam style strictuml
skinparam backgroundColor #0f172a
skinparam defaultFontColor #e2e8f0
skinparam classBackgroundColor #1e293b
skinparam classBorderColor #f59e0b
skinparam classHeaderBackgroundColor #78350f
skinparam arrowColor #fbbf24

title Liskov Substitution Principle (LSP) — Behavioral Subtyping

abstract class GenericFile {
  - filename: String
  + getFilename(): String
  + readData(): byte[]
}

interface Writable {
  + writeData(data: byte[]): void
}

class ReadOnlyFile extends GenericFile {
  + readData(): byte[]
}

class WritableFile extends GenericFile implements Writable {
  + readData(): byte[]
  + writeData(data: byte[]): void
}

class FileManager {
  + parseFile(file: GenericFile): void
  + saveFile(file: Writable, data: byte[]): void
}

FileManager ..> GenericFile
FileManager ..> Writable
@enduml`
  },

  // 4. SOLID: Interface Segregation Principle (ISP)
  'isp': {
    type: 'plantuml',
    title: 'Interface Segregation Principle (ISP) — Role-Based Interfaces',
    code: `@startuml
skinparam style strictuml
skinparam backgroundColor #0f172a
skinparam defaultFontColor #e2e8f0
skinparam classBackgroundColor #1e293b
skinparam classBorderColor #ec4899
skinparam classHeaderBackgroundColor #831843
skinparam arrowColor #f472b6

title Interface Segregation Principle (ISP) — Lean Interfaces

interface Printable {
  + print(doc: Document): void
}

interface Scannable {
  + scan(): Document
}

interface Faxable {
  + fax(doc: Document): void
}

class SimpleLaserPrinter implements Printable {
  + print(doc: Document): void
}

class MultiFunctionOfficeMachine implements Printable, Scannable, Faxable {
  + print(doc: Document): void
  + scan(): Document
  + fax(doc: Document): void
}
@enduml`
  },

  // 5. SOLID: Dependency Inversion Principle (DIP)
  'dip': {
    type: 'plantuml',
    title: 'Dependency Inversion Principle (DIP) — Inverted Abstraction Flow',
    code: `@startuml
skinparam style strictuml
skinparam backgroundColor #0f172a
skinparam defaultFontColor #e2e8f0
skinparam classBackgroundColor #1e293b
skinparam classBorderColor #8b5cf6
skinparam classHeaderBackgroundColor #4c1d95
skinparam arrowColor #a78bfa

title Dependency Inversion Principle (DIP) — High Level depends on Abstraction

class CheckoutService {
  - paymentProcessor: PaymentProcessor
  + CheckoutService(processor: PaymentProcessor)
  + processOrder(orderId: String, amount: double): boolean
}

interface PaymentProcessor {
  + charge(amount: double): boolean
  + refund(txId: String): boolean
}

class StripePaymentGateway implements PaymentProcessor {
  + charge(amount: double): boolean
  + refund(txId: String): boolean
}

class PayPalPaymentGateway implements PaymentProcessor {
  + charge(amount: double): boolean
  + refund(txId: String): boolean
}

class RazorpayPaymentGateway implements PaymentProcessor {
  + charge(amount: double): boolean
  + refund(txId: String): boolean
}

CheckoutService o--> PaymentProcessor : depends on abstraction
@enduml`
  },

  // 6. Classic: Parking Lot
  'parking-lot': {
    type: 'plantuml',
    title: 'Parking Lot — Class Diagram (SOLID & Factory Pattern)',
    code: `@startuml
skinparam style strictuml
skinparam backgroundColor #0f172a
skinparam defaultFontColor #e2e8f0
skinparam classBackgroundColor #1e293b
skinparam classBorderColor #6366f1
skinparam classHeaderBackgroundColor #312e81
skinparam arrowColor #38bdf8

title Parking Lot System — Low Level Design

enum VehicleType {
  MOTORCYCLE
  CAR
  TRUCK
}

enum SpotStatus {
  AVAILABLE
  OCCUPIED
  RESERVED
}

abstract class Vehicle {
  - licenseNumber: String
  - vehicleType: VehicleType
  + getLicenseNumber(): String
  + getType(): VehicleType
}

class Car extends Vehicle
class Motorcycle extends Vehicle
class Truck extends Vehicle

class ParkingSpot {
  - spotId: int
  - spotType: VehicleType
  - status: SpotStatus
  - currentVehicle: Vehicle
  + isAvailable(): boolean
  + assignVehicle(v: Vehicle): boolean
  + vacate(): void
}

class ParkingFloor {
  - floorId: int
  - spots: List<ParkingSpot>
  + findAvailableSpot(type: VehicleType): ParkingSpot
  + getVacantSpotCount(): int
}

class ParkingTicket {
  - ticketId: String
  - vehicleNumber: String
  - entryTime: LocalDateTime
  - assignedSpotId: int
}

interface PricingStrategy {
  + calculateFee(ticket: ParkingTicket, exitTime: LocalDateTime): double
}

class HourlyPricingStrategy implements PricingStrategy {
  + calculateFee(ticket: ParkingTicket, exitTime: LocalDateTime): double
}

class ParkingLotManager {
  - floors: List<ParkingFloor>
  - activeTickets: Map<String, ParkingTicket>
  - pricingStrategy: PricingStrategy
  + parkVehicle(v: Vehicle): ParkingTicket
  + exitVehicle(ticketId: String): double
}

ParkingLotManager o-- ParkingFloor
ParkingLotManager --> PricingStrategy
ParkingFloor o-- ParkingSpot
ParkingSpot --> Vehicle
@enduml`
  },

  // 7. Classic: Rate Limiter
  'rate-limiter': {
    type: 'plantuml',
    title: 'Rate Limiter — Sliding Window Sequence Diagram',
    code: `@startuml
skinparam backgroundColor #0f172a
skinparam defaultFontColor #e2e8f0
skinparam sequenceArrowColor #38bdf8
skinparam sequenceLifeLineBorderColor #6366f1
skinparam sequenceParticipantBackgroundColor #1e293b
skinparam sequenceParticipantBorderColor #818cf8

autonumber
title Sliding Window Log Rate Limiter — Sequence Diagram

actor Client
participant "API Gateway" as Gateway
participant "RateLimiter Middleware" as Limiter
participant "Redis Cache (Sliding Log)" as Redis
participant "Backend Service" as Backend

Client -> Gateway: HTTP Request (API Key / IP)
Gateway -> Limiter: checkRateLimit(clientId)
Limiter -> Redis: ZREMRANGEBYSCORE(key, 0, now - windowSize)
Redis --> Limiter: removedCount
Limiter -> Redis: ZCARD(key)
Redis --> Limiter: currentRequestCount

alt currentRequestCount < maxRequests
    Limiter -> Redis: ZADD(key, now, now)
    Redis --> Limiter: OK
    Limiter --> Gateway: ALLOW (Proceed)
    Gateway -> Backend: Forward Request
    Backend --> Gateway: 200 OK (Response Payload)
    Gateway --> Client: 200 OK (X-RateLimit-Remaining: X)
else currentRequestCount >= maxRequests
    Limiter --> Gateway: REJECT (Limit Exceeded)
    Gateway --> Client: 429 Too Many Requests (Retry-After: Y)
end
@enduml`
  },

  // 8. Classic: Elevator System
  'elevator-system': {
    type: 'plantuml',
    title: 'Elevator Dispatcher — State Pattern & Controller',
    code: `@startuml
skinparam style strictuml
skinparam backgroundColor #0f172a
skinparam defaultFontColor #e2e8f0
skinparam classBackgroundColor #1e293b
skinparam classBorderColor #10b981
skinparam classHeaderBackgroundColor #064e3b
skinparam arrowColor #34d399

title Elevator System — State Pattern & Dispatcher

enum Direction {
  UP
  DOWN
  IDLE
}

enum ElevatorState {
  MOVING
  STOPPED
  DOORS_OPEN
  MAINTENANCE
}

class ElevatorCar {
  - id: int
  - currentFloor: int
  - direction: Direction
  - state: ElevatorState
  - requestedFloors: Set<int>
  + moveNext(): void
  + addFloorRequest(floor: int): void
  + openDoors(): void
  + closeDoors(): void
}

interface DispatchStrategy {
  + selectElevator(elevators: List<ElevatorCar>, requestFloor: int, dir: Direction): ElevatorCar
}

class ScanAlgorithmStrategy implements DispatchStrategy {
  + selectElevator(elevators: List<ElevatorCar>, requestFloor: int, dir: Direction): ElevatorCar
}

class ElevatorController {
  - elevators: List<ElevatorCar>
  - strategy: DispatchStrategy
  + requestElevator(floor: int, dir: Direction): void
  + stepSimulation(): void
}

ElevatorController o-- ElevatorCar
ElevatorController --> DispatchStrategy
@enduml`
  },

  // 9. Classic: Splitwise
  'splitwise': {
    type: 'plantuml',
    title: 'Splitwise — Expense Settlement & Strategy Pattern',
    code: `@startuml
skinparam style strictuml
skinparam backgroundColor #0f172a
skinparam defaultFontColor #e2e8f0
skinparam classBackgroundColor #1e293b
skinparam classBorderColor #f59e0b
skinparam classHeaderBackgroundColor #78350f
skinparam arrowColor #fbbf24

title Splitwise System — Low Level Design

enum SplitType {
  EQUAL
  EXACT
  PERCENTAGE
}

class User {
  - userId: String
  - name: String
  - email: String
  + getUserId(): String
}

class Split {
  - user: User
  - amount: double
}

abstract class Expense {
  - expenseId: String
  - amount: double
  - paidBy: User
  - splits: List<Split>
  - splitType: SplitType
  + validate(): boolean
}

class EqualExpense extends Expense
class ExactExpense extends Expense
class PercentExpense extends Expense

class BalanceSheetController {
  - userBalances: Map<String, Map<String, Double>>
  + addExpense(expense: Expense): void
  + showUserBalance(userId: String): void
  + simplifyDebts(): void
}

BalanceSheetController --> Expense
Expense o-- Split
Split --> User
@enduml`
  },

  // 10. Classic: LRU Cache
  'lru-cache': {
    type: 'plantuml',
    title: 'LRU Cache — Doubly Linked List & Hash Map Architecture',
    code: `@startuml
skinparam style strictuml
skinparam backgroundColor #0f172a
skinparam defaultFontColor #e2e8f0
skinparam classBackgroundColor #1e293b
skinparam classBorderColor #6366f1
skinparam classHeaderBackgroundColor #312e81
skinparam arrowColor #38bdf8

title LRU Cache (Least Recently Used) — O(1) Get and Put Design

class Node {
  + key: int
  + value: int
  + prev: Node
  + next: Node
  + Node(key: int, value: int)
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
  - size: int
  - map: Map<int, Node>
  - dll: DoublyLinkedList
  + LRUCache(capacity: int)
  + get(key: int): int
  + put(key: int, value: int): void
  - moveToHead(node: Node): void
  - evictLeastRecent(): void
}

LRUCache o-- DoublyLinkedList
LRUCache o-- Node
DoublyLinkedList o-- Node
@enduml`
  },

  // 11. Classic: Tic Tac Toe
  'tic-tac-toe': {
    type: 'plantuml',
    title: 'Tic-Tac-Toe — Game Engine & Board Model',
    code: `@startuml
skinparam style strictuml
skinparam backgroundColor #0f172a
skinparam defaultFontColor #e2e8f0
skinparam classBackgroundColor #1e293b
skinparam classBorderColor #ec4899
skinparam classHeaderBackgroundColor #831843
skinparam arrowColor #f472b6

title Tic-Tac-Toe Game — Object Oriented Design

enum PieceType {
  X
  O
}

class PlayingPiece {
  - pieceType: PieceType
  + getType(): PieceType
}

class PlayingPieceX extends PlayingPiece
class PlayingPieceO extends PlayingPiece

class Player {
  - name: String
  - playingPiece: PlayingPiece
  + getName(): String
  + getPiece(): PlayingPiece
}

class Board {
  - size: int
  - board: PlayingPiece[][]
  + addPiece(row: int, col: int, piece: PlayingPiece): boolean
  + getFreeCells(): List<Pair>
  + printBoard(): void
}

class TicTacToeGame {
  - board: Board
  - players: Deque<Player>
  + startGame(): String
  - checkWinner(row: int, col: int, piece: PlayingPiece): boolean
}

TicTacToeGame o-- Board
TicTacToeGame o-- Player
Player o-- PlayingPiece
Board o-- PlayingPiece
@enduml`
  }
};

/**
 * Searches and returns the best matching Kroki LLD Diagram template or dynamically derives one.
 */
export function getLldDiagramForProblem(slugOrTitle: string, category?: string): { type: DiagramType; title: string; code: string } {
  const norm = (slugOrTitle || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
  
  // Direct Key Match
  if (LLD_DIAGRAM_TEMPLATES[slugOrTitle]) {
    return LLD_DIAGRAM_TEMPLATES[slugOrTitle];
  }

  // 1. Check SOLID keywords
  if (norm.includes('single responsibility') || norm.includes('srp')) {
    return LLD_DIAGRAM_TEMPLATES['srp'];
  }
  if (norm.includes('open closed') || norm.includes('ocp')) {
    return LLD_DIAGRAM_TEMPLATES['ocp'];
  }
  if (norm.includes('liskov') || norm.includes('lsp')) {
    return LLD_DIAGRAM_TEMPLATES['lsp'];
  }
  if (norm.includes('interface segregation') || norm.includes('isp')) {
    return LLD_DIAGRAM_TEMPLATES['isp'];
  }
  if (norm.includes('dependency inversion') || norm.includes('dip')) {
    return LLD_DIAGRAM_TEMPLATES['dip'];
  }

  // 2. Check Classic LLD Systems
  if (norm.includes('parking')) {
    return LLD_DIAGRAM_TEMPLATES['parking-lot'];
  }
  if (norm.includes('rate limit') || norm.includes('limiter')) {
    return LLD_DIAGRAM_TEMPLATES['rate-limiter'];
  }
  if (norm.includes('elevator')) {
    return LLD_DIAGRAM_TEMPLATES['elevator-system'];
  }
  if (norm.includes('splitwise') || norm.includes('expense')) {
    return LLD_DIAGRAM_TEMPLATES['splitwise'];
  }
  if (norm.includes('lru') || norm.includes('cache')) {
    return LLD_DIAGRAM_TEMPLATES['lru-cache'];
  }
  if (norm.includes('tic tac') || norm.includes('tictactoe')) {
    return LLD_DIAGRAM_TEMPLATES['tic-tac-toe'];
  }

  // 3. Dynamic High-Quality PlantUML Architecture for any problem
  const cleanPascal = (slugOrTitle || 'Problem').replace(/[^a-zA-Z0-9]/g, ' ').split(' ')
    .filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');

  return {
    type: 'plantuml',
    title: `${slugOrTitle || 'Algorithmic'} — Visual Architecture & Invariant Flow`,
    code: `@startuml
skinparam style strictuml
skinparam backgroundColor #0f172a
skinparam defaultFontColor #e2e8f0
skinparam classBackgroundColor #1e293b
skinparam classBorderColor #6366f1
skinparam classHeaderBackgroundColor #312e81
skinparam arrowColor #38bdf8

title ${slugOrTitle || 'Problem Engine'} — High-Performance Component Diagram

package "1. Core State & Data Invariants" {
  class ${cleanPascal || 'SolutionEngine'} {
    - stateVector: List<int>
    - memoryWindow: Map<String, Object>
    + executePipeline(inputData: Object): Object
    + validateInvariants(): boolean
  }
}

package "2. Strategy & Transformation Layer" {
  interface OptimizationStrategy {
    + computeOptimal(data: Object): Object
  }

  class FastTwoPointerStrategy implements OptimizationStrategy {
    + computeOptimal(data: Object): Object
  }

  class MemoizedStateStrategy implements OptimizationStrategy {
    + computeOptimal(data: Object): Object
  }
}

${cleanPascal || 'SolutionEngine'} o--> OptimizationStrategy : executes
@enduml`
  };
}
